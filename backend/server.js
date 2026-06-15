import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();

/* ---------------- MIDDLEWARE ---------------- */

// JSON parser
app.use(express.json());

// CORS (IMPORTANT FIX FOR DEPLOYMENT)
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://mental-health-ai-lilac.vercel.app"
  ],
  credentials: true
}));

/* ---------------- ROUTES ---------------- */

app.use('/api/auth', authRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/ai', aiRoutes);

/* ---------------- HEALTH CHECK ---------------- */

app.get('/', (req, res) => {
  res.send('Mental Health AI API is running ✅');
});

/* ---------------- DATABASE ---------------- */

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

/* ---------------- SERVER ---------------- */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});