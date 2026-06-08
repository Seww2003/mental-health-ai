import mongoose from 'mongoose';

const journalSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  mood: {
    type: String,
    enum: ['happy', 'sad', 'anxious', 'angry', 'neutral', 'stressed', 'calm'],
    required: true
  },
  moodScore: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10,
    default: 5
  },
  detectedEmotion: {
    type: String,
    default: ''
  },
  keywords: [String],
  date: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Journal', journalSchema);