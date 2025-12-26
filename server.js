import express from 'express';
import http from 'http';
import WebSocket, { WebSocketServer } from 'ws';
import url from 'url';
import { supabase } from './config/db.js';
import app from './app.js'; // your existing Express app

// 1️⃣ Create HTTP server from Express
const server = http.createServer(app);

// 2️⃣ Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server, path: '/ws/comments' });

// sermonId => Set<WebSocket>
const commentClients = new Map();

wss.on('connection', (ws, req) => {
  const { query } = url.parse(req.url, true);
  const sermonId = query.sermonId;

  if (!sermonId) {
    ws.close(1008, 'sermonId required');
    return;
  }

  if (!commentClients.has(sermonId)) {
    commentClients.set(sermonId, new Set());
  }

  commentClients.get(sermonId).add(ws);

  ws.on('message', async (raw) => {
    const payload = JSON.parse(raw.toString());

    // -------------------------------
    // ADD COMMENT
    // -------------------------------
    if (payload.type === 'NEW_COMMENT') {
      const { content, user_name, parent_id } = payload;

      const { data, error } = await supabase
        .from('sermon_comments')
        .insert([{
          sermon_id: sermonId,
          content,
          user_name,
          parent_id: parent_id || null
        }])
        .select()
        .single();

      if (error) return;

      broadcast(sermonId, {
        type: 'COMMENT_ADDED',
        comment: data
      });
    }

    // -------------------------------
    // LIKE COMMENT
    // -------------------------------
    if (payload.type === 'LIKE_COMMENT') {
      const { commentId } = payload;

      const { data: comment } = await supabase
        .from('sermon_comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      const updatedLikes = (comment.likes || 0) + 1;

      const { data: updated } = await supabase
        .from('sermon_comments')
        .update({ likes: updatedLikes })
        .eq('id', commentId)
        .select()
        .single();

      broadcast(sermonId, {
        type: 'COMMENT_LIKED',
        commentId,
        likes: updated.likes
      });
    }
  });

  ws.on('close', () => {
    commentClients.get(sermonId)?.delete(ws);
  });
});

function broadcast(sermonId, message) {
  commentClients.get(sermonId)?.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}

// 3️⃣ Start server
const PORT = process.env.PORT || 7000;
server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
