import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Save, Sparkles, Camera, Smile, X, Mic, Activity, TrendingUp } from 'lucide-react';
import FaceEmotionDetector from '../components/FaceEmotionDetector';
import RealtimeEmotionDetector from '../components/RealtimeEmotionDetector';
import VoiceMoodAnalyzer from '../components/VoiceMoodAnalyzer';

const moods = [
  { value: 'happy', label: 'Happy', emoji: '😊', color: 'bg-green-100 border-green-300' },
  { value: 'calm', label: 'Calm', emoji: '😌', color: 'bg-teal-100 border-teal-300' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: 'bg-gray-100 border-gray-300' },
  { value: 'sad', label: 'Sad', emoji: '😢', color: 'bg-blue-100 border-blue-300' },
  { value: 'anxious', label: 'Anxious', emoji: '😰', color: 'bg-yellow-100 border-yellow-300' },
  { value: 'stressed', label: 'Stressed', emoji: '😫', color: 'bg-orange-100 border-orange-300' },
  { value: 'angry', label: 'Angry', emoji: '😤', color: 'bg-red-100 border-red-300' },
];

const Journal = () => {
  const [text, setText] = useState('');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [moodScore, setMoodScore] = useState(5);
  const [stressLevel, setStressLevel] = useState(5);
  const [recentJournals, setRecentJournals] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [aiInsight, setAiInsight] = useState('');
  const [showFaceDetector, setShowFaceDetector] = useState(false);
  const [showVoiceAnalyzer, setShowVoiceAnalyzer] = useState(false);
  const [lastDetectedEmotion, setLastDetectedEmotion] = useState(null);
  const [activeTab, setActiveTab] = useState('text'); // text, face, voice
  const [realtimeEmotions, setRealtimeEmotions] = useState(null);

  useEffect(() => {
    fetchJournals();
  }, []);

  const fetchJournals = async () => {
    try {
      const res = await axios.get('/api/journal');
      setRecentJournals(res.data.slice(0, 10));
    } catch (error) {
      console.error('Error fetching journals:', error);
    }
  };

  const analyzeText = () => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('exam') || lowerText.includes('test') || lowerText.includes('deadline')) {
      setAiInsight("I notice you mentioned exams/deadlines. Remember to take short breaks and practice deep breathing! 📚✨");
    } else if (lowerText.includes('tired') || lowerText.includes('exhausted')) {
      setAiInsight("It sounds like you might need rest. Your well-being comes first! Consider taking a short nap or going to bed early tonight. 💤");
    } else if (lowerText.includes('friend') || lowerText.includes('family')) {
      setAiInsight("It's great that you're thinking about your relationships. Social connections are so important for mental health! 💕");
    } else if (lowerText.includes('happy') || lowerText.includes('great') || lowerText.includes('wonderful')) {
      setAiInsight("That's wonderful to hear! Celebrate these positive moments - they're important for your mental well-being! 🌟");
    } else if (lowerText.length > 50) {
      setAiInsight("Thank you for sharing so openly. Writing things down can really help process emotions. You're doing great! 💙");
    } else {
      setAiInsight("");
    }
  };

  const handleRealtimeEmotion = (emotionData) => {
    setRealtimeEmotions(emotionData);
    // Auto-update mood if confidence is high
    if (emotionData.confidence > 65) {
      setSelectedMood(emotionData.emotion);
      
      // Update mood score based on emotion
      let score = 5;
      if (emotionData.emotion === 'happy') score = 8;
      else if (emotionData.emotion === 'calm') score = 7;
      else if (emotionData.emotion === 'neutral') score = 5;
      else if (emotionData.emotion === 'sad') score = 3;
      else if (emotionData.emotion === 'anxious') score = 3;
      else if (emotionData.emotion === 'stressed') score = 4;
      else if (emotionData.emotion === 'angry') score = 2;
      setMoodScore(score);
      
      // Update stress level
      let stress = 5;
      if (emotionData.emotion === 'stressed') stress = 8;
      else if (emotionData.emotion === 'anxious') stress = 7;
      else if (emotionData.emotion === 'angry') stress = 7;
      else if (emotionData.emotion === 'sad') stress = 6;
      else if (emotionData.emotion === 'happy') stress = 3;
      else if (emotionData.emotion === 'calm') stress = 2;
      setStressLevel(stress);
    }
  };

  const handleFaceEmotionDetected = (detection) => {
    console.log('Face Emotion detected:', detection);
    
    setSelectedMood(detection.mood);
    
    let score = 5;
    if (detection.mood === 'happy') score = Math.min(10, Math.floor(detection.confidence / 10) + 5);
    else if (detection.mood === 'calm') score = 7;
    else if (detection.mood === 'neutral') score = 5;
    else if (detection.mood === 'sad') score = 3;
    else if (detection.mood === 'anxious') score = 3;
    else if (detection.mood === 'stressed') score = 4;
    else if (detection.mood === 'angry') score = 2;
    setMoodScore(score);
    
    let stress = 5;
    if (detection.mood === 'stressed') stress = 8;
    else if (detection.mood === 'anxious') stress = 7;
    else if (detection.mood === 'angry') stress = 7;
    else if (detection.mood === 'sad') stress = 6;
    else if (detection.mood === 'happy') stress = 3;
    else if (detection.mood === 'calm') stress = 2;
    setStressLevel(stress);
    
    setLastDetectedEmotion(detection);
    
    toast.success(`Face detected: ${detection.emotion} 😊 | Mood updated!`, {
      duration: 3000,
      icon: '🎯'
    });
  };

  const handleVoiceAnalysis = (analysis) => {
    console.log('Voice analysis:', analysis);
    setSelectedMood(analysis.dominantEmotion);
    setMoodScore(Math.min(10, Math.max(1, Math.floor(analysis.confidence / 10))));
    
    let stress = 5;
    if (analysis.dominantEmotion === 'stressed') stress = 8;
    else if (analysis.dominantEmotion === 'anxious') stress = 7;
    else if (analysis.dominantEmotion === 'angry') stress = 7;
    else if (analysis.dominantEmotion === 'sad') stress = 6;
    else if (analysis.dominantEmotion === 'happy') stress = 3;
    else if (analysis.dominantEmotion === 'calm') stress = 2;
    setStressLevel(stress);
    
    toast.success(`Voice analysis: ${analysis.dominantEmotion} ${getEmotionEmoji(analysis.dominantEmotion)}`, {
      duration: 3000,
      icon: '🎤'
    });
  };

  const handleVoiceTranscript = (transcript) => {
    setText(prev => prev + (prev ? ' ' : '') + transcript);
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊', stressed: '😟', angry: '😠', calm: '😌', sad: '😢', anxious: '😰', neutral: '😐'
    };
    return emojis[emotion] || '😐';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) {
      toast.error('Please write or speak something about your day');
      return;
    }
    
    setSubmitting(true);
    try {
      await axios.post('/api/journal', {
        text: text.trim(),
        mood: selectedMood,
        moodScore,
        stressLevel
      });
      
      toast.success('Journal saved! 💙');
      setText('');
      setSelectedMood('neutral');
      setMoodScore(5);
      setStressLevel(5);
      setLastDetectedEmotion(null);
      setRealtimeEmotions(null);
      fetchJournals();
    } catch (error) {
      toast.error('Failed to save journal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Daily Journal 📝</h1>
        <p className="text-gray-600">Express yourself freely. This is your safe space.</p>
      </div>
      
      {/* Tab Navigation */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-2">
        <button
          onClick={() => setActiveTab('text')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'text' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          ✍️ Write
        </button>
        <button
          onClick={() => setActiveTab('realtime')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'realtime' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Activity className="h-4 w-4" />
          Live Analysis
        </button>
        <button
          onClick={() => setActiveTab('face')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'face' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Camera className="h-4 w-4" />
          Face Detect
        </button>
        <button
          onClick={() => setActiveTab('voice')}
          className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === 'voice' 
              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md' 
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <Mic className="h-4 w-4" />
          Voice Analysis
        </button>
      </div>
      
      {/* Text Input Tab */}
      {activeTab === 'text' && (
        <div className="card mb-8">
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                How are you feeling today?
              </label>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    type="button"
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                      selectedMood === mood.value
                        ? `${mood.color} border-indigo-500 ring-2 ring-indigo-200`
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{mood.emoji}</div>
                    <div className="text-xs font-medium">{mood.label}</div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mood Score (1-10)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-indigo-600 text-white text-xs px-2 py-0.5 rounded-full">
                    {moodScore}/10
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>😢 Very Low</span>
                  <span>😐 Neutral</span>
                  <span>😊 Excellent</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stress Level (1-10)
                </label>
                <div className="relative">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={stressLevel}
                    onChange={(e) => setStressLevel(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                  />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stressLevel}/10
                  </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 mt-2">
                  <span>🧘 Calm</span>
                  <span>😐 Moderate</span>
                  <span>😫 Overwhelmed</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                What's on your mind?
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                onBlur={analyzeText}
                rows={6}
                className="input-field"
                placeholder="Write about your day, your feelings, or anything you'd like to express... (e.g., 'I'm feeling stressed about my exams tomorrow')"
              />
            </div>
            
            {aiInsight && (
              <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 animate-in fade-in duration-300">
                <div className="flex items-start space-x-2">
                  <Sparkles className="h-5 w-5 text-indigo-500 mt-0.5 animate-pulse" />
                  <p className="text-sm text-indigo-800">{aiInsight}</p>
                </div>
              </div>
            )}
            
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full flex items-center justify-center space-x-2 group"
            >
              <Save className="h-5 w-5 group-hover:scale-110 transition-transform" />
              <span>{submitting ? 'Saving...' : 'Save Journal Entry'}</span>
            </button>
          </form>
        </div>
      )}
      
      {/* Real-Time Emotion Detection Tab */}
      {activeTab === 'realtime' && (
        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="h-5 w-5 text-indigo-500" />
              <h3 className="font-semibold text-gray-800">Real-Time Emotion Analysis</h3>
            </div>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={4}
              className="input-field mb-4"
              placeholder="Start typing and watch the emotions update in real-time... (e.g., 'I'm worried about my exams')"
            />
            <RealtimeEmotionDetector 
              text={text} 
              onEmotionDetected={handleRealtimeEmotion}
            />
          </div>
          
          {text && (
            <div className="flex justify-end">
              <button
                onClick={() => {
                  if (realtimeEmotions) {
                    toast.success(`Mood updated to: ${realtimeEmotions.emotion} based on your text!`);
                  }
                }}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                Apply Detected Mood
              </button>
            </div>
          )}
        </div>
      )}
      
      {/* Face Detection Tab */}
      {activeTab === 'face' && (
        <div className="space-y-6">
          <FaceEmotionDetector onEmotionDetected={handleFaceEmotionDetected} />
          
          {/* Last Detected Emotion Badge */}
          {lastDetectedEmotion && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">
                    {lastDetectedEmotion.emotion === 'happy' && '😊'}
                    {lastDetectedEmotion.emotion === 'sad' && '😢'}
                    {lastDetectedEmotion.emotion === 'angry' && '😠'}
                    {lastDetectedEmotion.emotion === 'fearful' && '😨'}
                    {lastDetectedEmotion.emotion === 'neutral' && '😐'}
                    {lastDetectedEmotion.emotion === 'surprised' && '😲'}
                  </span>
                  <div>
                    <p className="font-medium text-green-800 capitalize">
                      {lastDetectedEmotion.emotion}
                    </p>
                    <p className="text-xs text-green-600">
                      Confidence: {lastDetectedEmotion.confidence}%
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMood(lastDetectedEmotion.mood);
                    toast.success(`Mood set to: ${lastDetectedEmotion.emotion}`);
                  }}
                  className="px-3 py-1 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
                >
                  Use This Mood
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Voice Analysis Tab */}
      {activeTab === 'voice' && (
        <div className="space-y-6">
          <VoiceMoodAnalyzer 
            onAnalysisComplete={handleVoiceAnalysis}
            onTranscript={handleVoiceTranscript}
          />
          
          {text && (
            <div className="card">
              <h3 className="font-medium text-gray-700 mb-2">Your Journal Entry</h3>
              <p className="text-gray-600 text-sm">{text}</p>
            </div>
          )}
        </div>
      )}
      
      {/* Recent Entries */}
      {recentJournals.length > 0 && (
        <div className="card mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
            <span className="text-xs text-gray-500">{recentJournals.length} entries</span>
          </div>
          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {recentJournals.map((journal) => (
              <div 
                key={journal._id} 
                className="border-b border-gray-100 pb-4 last:border-0 hover:bg-gray-50/50 p-3 rounded-xl transition-all duration-200"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xl">
                      {journal.mood === 'happy' && '😊'}
                      {journal.mood === 'sad' && '😢'}
                      {journal.mood === 'anxious' && '😰'}
                      {journal.mood === 'angry' && '😤'}
                      {journal.mood === 'stressed' && '😫'}
                      {journal.mood === 'calm' && '😌'}
                      {journal.mood === 'neutral' && '😐'}
                    </span>
                    <span className="font-medium capitalize text-gray-800">{journal.mood}</span>
                    <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                      Mood: {journal.moodScore}/10
                    </span>
                    <span className="text-xs bg-orange-100 px-2 py-0.5 rounded-full">
                      Stress: {journal.stressLevel}/10
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(journal.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <p className="text-gray-600 text-sm line-clamp-2">{journal.text.slice(0, 120)}...</p>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Empty State */}
      {recentJournals.length === 0 && (
        <div className="card text-center py-12 mt-8">
          <div className="text-6xl mb-4">📔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Journal Entries Yet</h3>
          <p className="text-gray-500 text-sm">
            Start writing your first journal entry above. This is your safe space! 💙
          </p>
        </div>
      )}
    </div>
  );
};

export default Journal;