import { useState, useEffect } from 'react';
import { Activity, TrendingUp, AlertCircle } from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
);

const RealtimeEmotionDetector = ({ text, onEmotionDetected }) => {
  const [emotions, setEmotions] = useState({
    anxiety: 0,
    stress: 0,
    sadness: 0,
    happiness: 0,
    anger: 0,
    calm: 0
  });
  const [animationProgress, setAnimationProgress] = useState(0);
  const [history, setHistory] = useState([]);

  // Analyze text in real-time
  useEffect(() => {
    if (!text || text.length < 5) {
      setEmotions({
        anxiety: 0,
        stress: 0,
        sadness: 0,
        happiness: 0,
        anger: 0,
        calm: 0
      });
      return;
    }

    const lowerText = text.toLowerCase();
    
    // Keywords for each emotion
    const keywords = {
      anxiety: ['anxious', 'worry', 'nervous', 'scared', 'panic', 'fear', 'overwhelmed', 'stress', 'pressure'],
      stress: ['stress', 'deadline', 'exam', 'test', 'work', 'tired', 'exhausted', 'busy', 'overloaded'],
      sadness: ['sad', 'depressed', 'lonely', 'hurt', 'crying', 'grief', 'heartbroken', 'alone'],
      happiness: ['happy', 'great', 'wonderful', 'excited', 'joy', 'love', 'amazing', 'good', 'fantastic'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed', 'rage', 'hate', 'upset', 'irritated'],
      calm: ['calm', 'peace', 'relaxed', 'quiet', 'serene', 'mindful', 'cool', 'easy']
    };

    // Calculate scores
    const scores = {};
    for (const [emotion, words] of Object.entries(keywords)) {
      let score = 0;
      words.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const matches = lowerText.match(regex);
        if (matches) {
          score += matches.length * 15;
        }
      });
      // Also check for partial matches
      words.forEach(word => {
        if (lowerText.includes(word)) {
          score += 5;
        }
      });
      scores[emotion] = Math.min(100, score);
    }

    // Normalize scores
    const maxScore = Math.max(...Object.values(scores));
    if (maxScore > 0) {
      for (const emotion in scores) {
        scores[emotion] = Math.round((scores[emotion] / maxScore) * 100);
      }
    }

    // Add some randomness for natural feel (5% variation)
    for (const emotion in scores) {
      const variation = Math.floor(Math.random() * 10) - 5;
      scores[emotion] = Math.min(100, Math.max(0, scores[emotion] + variation));
    }

    // Animate the change
    setAnimationProgress(0);
    const interval = setInterval(() => {
      setAnimationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 50);

    setEmotions(scores);

    // Add to history
    setHistory(prev => {
      const newHistory = [...prev, { ...scores, timestamp: Date.now() }];
      return newHistory.slice(-20); // Keep last 20 entries
    });

    // Send to parent
    if (onEmotionDetected) {
      const dominantEmotion = Object.entries(scores).reduce((a, b) => 
        a[1] > b[1] ? a : b
      );
      onEmotionDetected({
        emotion: dominantEmotion[0],
        confidence: dominantEmotion[1],
        allEmotions: scores
      });
    }

    return () => clearInterval(interval);
  }, [text]);

  // Line chart data for emotion trends
  const lineChartData = {
    labels: history.map((_, i) => `-${history.length - i}s`),
    datasets: [
      {
        label: 'Anxiety',
        data: history.map(h => h.anxiety),
        borderColor: 'rgb(245, 158, 11)',
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Stress',
        data: history.map(h => h.stress),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.4,
        fill: true
      },
      {
        label: 'Happiness',
        data: history.map(h => h.happiness),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.4,
        fill: true
      }
    ]
  };

  // Doughnut chart data
  const doughnutData = {
    labels: ['Anxiety', 'Stress', 'Sadness', 'Happiness', 'Anger', 'Calm'],
    datasets: [{
      data: [emotions.anxiety, emotions.stress, emotions.sadness, emotions.happiness, emotions.anger, emotions.calm],
      backgroundColor: [
        '#f59e0b', // anxiety - orange
        '#ef4444', // stress - red
        '#3b82f6', // sadness - blue
        '#22c55e', // happiness - green
        '#dc2626', // anger - dark red
        '#8b5cf6'  // calm - purple
      ],
      borderWidth: 0,
      cutout: '60%'
    }]
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: { font: { size: 10 } }
      },
      tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw}%` } }
    }
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      y: { min: 0, max: 100, title: { display: true, text: 'Intensity (%)' } }
    }
  };

  const getEmotionColor = (emotion, score) => {
    if (score > 70) return 'text-red-600 bg-red-100';
    if (score > 40) return 'text-orange-600 bg-orange-100';
    return 'text-green-600 bg-green-100';
  };

  const getEmotionMessage = () => {
    const highEmotions = Object.entries(emotions).filter(([_, score]) => score > 60);
    if (highEmotions.length === 0) return "You seem balanced right now. 🌿";
    const [topEmotion, score] = highEmotions[0];
    const messages = {
      anxiety: `😰 You seem anxious (${score}%). Try taking deep breaths.`,
      stress: `😫 High stress detected (${score}%). Take a short break!`,
      sadness: `😢 I notice you're feeling down (${score}%). Want to talk?`,
      happiness: `😊 Great to see you happy (${score}%)! Keep it up!`,
      anger: `😤 You seem frustrated (${score}%). Try writing it down.`,
      calm: `🧘 You're feeling calm (${score}%). This is great for your mind!`
    };
    return messages[topEmotion] || "Keep expressing yourself. I'm here to listen. 💙";
  };

  if (!text || text.length < 5) {
    return (
      <div className="text-center py-8 text-gray-400">
        <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Start typing to see real-time emotion analysis...</p>
        <p className="text-xs mt-1">Try: "I'm worried about my exams"</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-500 animate-pulse" />
          <h3 className="font-semibold text-gray-800">Real-Time Emotion Analysis</h3>
        </div>
        <div className="text-xs text-gray-400">Live analysis as you type</div>
      </div>

      {/* Emotion Bars */}
      <div className="space-y-3">
        {Object.entries(emotions).map(([emotion, score]) => (
          <div key={emotion}>
            <div className="flex justify-between text-sm mb-1">
              <span className="capitalize font-medium flex items-center gap-1">
                {emotion === 'anxiety' && '😰'}
                {emotion === 'stress' && '😫'}
                {emotion === 'sadness' && '😢'}
                {emotion === 'happiness' && '😊'}
                {emotion === 'anger' && '😤'}
                {emotion === 'calm' && '😌'}
                {emotion}
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEmotionColor(emotion, score)}`}>
                {score}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${score * (animationProgress / 100)}%`,
                  backgroundColor: 
                    emotion === 'anxiety' ? '#f59e0b' :
                    emotion === 'stress' ? '#ef4444' :
                    emotion === 'sadness' ? '#3b82f6' :
                    emotion === 'happiness' ? '#22c55e' :
                    emotion === 'anger' ? '#dc2626' : '#8b5cf6'
                }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* AI Message */}
      <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-indigo-500 mt-0.5" />
          <p className="text-sm text-indigo-800">{getEmotionMessage()}</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4">
        {/* Doughnut Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Emotion Distribution</h4>
          <div className="h-64">
            <Doughnut data={doughnutData} options={doughnutOptions} />
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Emotion Trends (Last 20 changes)</h4>
          <div className="h-64">
            <Line data={lineChartData} options={lineOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeEmotionDetector;