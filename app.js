import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

// Routes
import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import prayerRoutes from './routes/prayerRoutes.js';
import publicSermonRoutes from './routes/publicSermonRoutes.js';
import adminSermonRoutes from './routes/adminSermonRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js'; // ✅ ADDED
import galleryRoutes from './routes/galleryRoutes.js'; // ✅ GALLERY


import { errorHandler } from './middlewares/errorHandler.js';

dotenv.config();

const app = express();

/* ======================
   CORS
====================== */
const allowedOrigins = [
  'https://pillar-of-zion-church-int-greater-a.vercel.app',
  'http://localhost:3000',
  'http://localhost:3001'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  })
);

/* ======================
   Middlewares
====================== */
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

/* ======================
   Routes
====================== */
app.use('/api/auth', authRoutes);

app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/prayers', prayerRoutes);

// Sermons
app.use('/api/sermons', publicSermonRoutes);
app.use('/api/admin/sermons', adminSermonRoutes);

// Events (admin)
app.use('/api/admin/events', eventRoutes);

// ✅ Announcements (PUBLIC + ADMIN)
app.use('/api/announcements', announcementRoutes);

// ✅ Gallery (PUBLIC + ADMIN)
app.use('/api/gallery', galleryRoutes);


/* ======================
   Health Check 
====================== */
app.get('/', (req, res) => {
  res.send('Church Management System API is running!');
});

/* ======================
   Error Handler
====================== */
app.use(errorHandler);

export default app;
