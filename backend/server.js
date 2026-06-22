import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

// Parse JSON request bodies
app.use(express.json());

// Enable CORS for frontend applications
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://mental-health-ai-lilac.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

/* ---------------- ROUTES ---------------- */

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', aiRoutes);

/* ---------------- HEALTH CHECK ---------------- */

app.get('/', (req, res) => {
  res.send('Mental Health AI API is running');
});

/* ---------------- DATABASE ---------------- */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});