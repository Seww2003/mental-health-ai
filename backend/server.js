import dotenv from 'dotenv';
dotenv.config(); // මේක අනිවාර්යයෙන්ම උඩින්ම තියෙන්න ඕනේ

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

import authRoutes from './routes/authRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

const app = express(); // app එක මෙතන හදන්න

/* ---------------- MIDDLEWARE ---------------- */
app.use(express.json());
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