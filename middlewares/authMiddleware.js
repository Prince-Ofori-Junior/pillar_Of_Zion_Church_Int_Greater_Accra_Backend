// backend/middlewares/authMiddleware.js
import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

export const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: No token provided' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB
        const { data: user, error } = await supabase
            .from('users')
            .select('id, name, email, role')
            .eq('id', decoded.id)
            .single();

        if (error || !user) return res.status(401).json({ error: 'Unauthorized: User not found' });

        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }
};
