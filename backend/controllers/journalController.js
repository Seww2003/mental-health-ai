import Journal from '../models/Journal.js';

// Simple emotion detection (can be enhanced with ML)
const detectEmotion = (text) => {
  const text_lower = text.toLowerCase();
  
  const emotions = {
    happy: ['happy', 'great', 'wonderful', 'good', 'excited', 'joy', 'love', 'amazing'],
    sad: ['sad', 'depressed', 'lonely', 'heartbroken', 'grief', 'crying', 'hurt'],
    anxious: ['anxious', 'worry', 'nervous', 'scared', 'panic', 'fear', 'overwhelmed'],
    angry: ['angry', 'mad', 'frustrated', 'annoyed', 'rage', 'hate', 'upset'],
    stressed: ['stress', 'pressure', 'deadline', 'exams', 'work', 'tired', 'exhausted'],
    calm: ['calm', 'peace', 'relaxed', 'quiet', 'serene', 'mindful']
  };
  
  for (const [emotion, keywords] of Object.entries(emotions)) {
    for (const keyword of keywords) {
      if (text_lower.includes(keyword)) {
        return emotion;
      }
    }
  }
  return 'neutral';
};

const extractKeywords = (text) => {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'so', 'for', 'nor', 'of', 'to', 'in', 'on', 'at', 'with', 'without', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'];
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const filtered = words.filter(w => !stopWords.includes(w) && w.length > 3);
  return [...new Set(filtered)].slice(0, 10);
};

// Make sure these are exported properly
export const createJournal = async (req, res) => {
  try {
    const { text, mood, moodScore, stressLevel } = req.body;
    
    const detectedEmotion = detectEmotion(text);
    const keywords = extractKeywords(text);
    
    const journal = new Journal({
      userId: req.userId,
      text,
      mood: mood || detectedEmotion,
      moodScore: moodScore || 5,
      stressLevel: stressLevel || 5,
      detectedEmotion,
      keywords
    });
    
    await journal.save();
    res.status(201).json(journal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserJournals = async (req, res) => {
  try {
    const journals = await Journal.find({ userId: req.userId })
      .sort({ date: -1 })
      .limit(30);
    res.json(journals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getMoodTrends = async (req, res) => {
  try {
    const journals = await Journal.find({ 
      userId: req.userId,
      date: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const moodScores = {
      happy: 9, calm: 8, neutral: 6, sad: 3, stressed: 4, anxious: 3, angry: 2
    };
    
    const trends = journals.map(j => ({
      date: j.date,
      score: moodScores[j.mood] || 5,
      mood: j.mood,
      stressLevel: j.stressLevel
    }));
    
    const avgMood = trends.length ? trends.reduce((a, b) => a + b.score, 0) / trends.length : 5;
    const avgStress = journals.length ? journals.reduce((a, b) => a + b.stressLevel, 0) / journals.length : 5;
    
    res.json({ trends, avgMood, avgStress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};