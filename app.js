// backend/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import donationRoutes from './routes/donationRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import prayerRoutes from './routes/prayerRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import publicSermonRoutes from './routes/publicSermonRoutes.js';
import adminSermonRoutes from './routes/adminSermonRoutes.js';

 

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/prayers', prayerRoutes);
app.use('/api/sermons', publicSermonRoutes);
app.use('/api/admin/sermons', adminSermonRoutes);
app.use('/api/admin/events', eventRoutes);



// Health check
app.get('/', (req, res) => {
  res.send('Church Management System API is running!');
});

// Error handler
app.use(errorHandler);

export default app;
