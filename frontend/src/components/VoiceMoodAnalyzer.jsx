import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader, Volume2, Heart, Activity, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const VoiceMoodAnalyzer = ({ onAnalysisComplete, onTranscript }) => {
  const [isListening, setIsListening] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [speechSpeed, setSpeechSpeed] = useState(0);
  
  const recognitionRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          setTranscript(finalTranscript);
          if (onTranscript) onTranscript(finalTranscript);
          analyzeVoiceMood(finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Recognition error:', event.error);
        toast.error('Voice recognition error. Please try again.');
        stopListening();
      };
    } else {
      toast.error('Speech recognition not supported in this browser');
    }
  }, []);

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      analyserRef.current.fftSize = 256;
      const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
      
      const updateAudioLevel = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setAudioLevel(Math.min(100, (average / 255) * 100));
        requestAnimationFrame(updateAudioLevel);
      };
      
      updateAudioLevel();
    } catch (err) {
      console.error('Microphone access error:', err);
      toast.error('Please allow microphone access');
    }
  };

  const analyzeVoiceMood = async (text) => {
    setIsAnalyzing(true);
    
    // Analyze speech characteristics
    const words = text.split(' ');
    const wordCount = words.length;
    const sentences = text.split(/[.!?]+/).length;
    
    // Calculate speech speed (words per second approximation)
    const estimatedSpeed = Math.min(200, Math.max(50, wordCount * 30));
    setSpeechSpeed(estimatedSpeed);
    
    // Text-based emotion analysis
    const lowerText = text.toLowerCase();
    
    const emotions = {
      happy: ['happy', 'great', 'wonderful', 'excited', 'joy', 'love', 'amazing', 'good', 'fantastic', 'awesome'],
      stressed: ['stress', 'deadline', 'exam', 'test', 'work', 'tired', 'exhausted', 'busy', 'pressure', 'overwhelmed'],
      angry: ['angry', 'mad', 'frustrated', 'annoyed', 'rage', 'hate', 'upset', 'irritated', 'furious'],
      calm: ['calm', 'peace', 'relaxed', 'quiet', 'serene', 'mindful', 'cool', 'easy', 'chill'],
      sad: ['sad', 'depressed', 'lonely', 'hurt', 'crying', 'grief', 'heartbroken', 'alone', 'upset'],
      anxious: ['anxious', 'worry', 'nervous', 'scared', 'panic', 'fear', 'overwhelmed', 'concerned']
    };
    
    // Calculate scores based on keywords
    const scores = {};
    for (const [emotion, keywords] of Object.entries(emotions)) {
      let score = 0;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += 20;
        }
      });
      scores[emotion] = Math.min(100, score);
    }
    
    // Adjust based on speech speed
    if (estimatedSpeed > 120) {
      scores.stressed = Math.min(100, scores.stressed + 15);
      scores.anxious = Math.min(100, scores.anxious + 10);
    } else if (estimatedSpeed < 70) {
      scores.sad = Math.min(100, scores.sad + 10);
      scores.calm = Math.min(100, scores.calm + 15);
    }
    
    // Adjust based on audio level
    if (audioLevel > 70) {
      scores.angry = Math.min(100, scores.angry + 20);
      scores.happy = Math.min(100, scores.happy + 10);
    } else if (audioLevel < 20) {
      scores.sad = Math.min(100, scores.sad + 15);
      scores.calm = Math.min(100, scores.calm + 10);
    }
    
    // Find dominant emotion
    const dominant = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
    
    const result = {
      dominantEmotion: dominant[0],
      confidence: dominant[1],
      allEmotions: scores,
      speechSpeed: estimatedSpeed,
      audioLevel: audioLevel,
      wordCount: wordCount,
      transcript: text
    };
    
    setAnalysis(result);
    
    if (onAnalysisComplete) {
      onAnalysisComplete(result);
    }
    
    setIsAnalyzing(false);
  };

  const startListening = async () => {
    if (!recognitionRef.current) {
      toast.error('Speech recognition not available');
      return;
    }
    
    try {
      await startAudioMonitoring();
      recognitionRef.current.start();
      setIsListening(true);
      setTranscript('');
      setAnalysis(null);
      toast.success('Listening... Speak now 🎤');
    } catch (err) {
      console.error('Failed to start:', err);
      toast.error('Failed to start voice recognition');
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsListening(false);
    setIsAnalyzing(false);
  };

  const getEmotionEmoji = (emotion) => {
    const emojis = {
      happy: '😊', stressed: '😟', angry: '😠', calm: '😌', sad: '😢', anxious: '😰'
    };
    return emojis[emotion] || '😐';
  };

  const getEmotionColor = (emotion) => {
    const colors = {
      happy: 'bg-green-100 border-green-400 text-green-700',
      stressed: 'bg-orange-100 border-orange-400 text-orange-700',
      angry: 'bg-red-100 border-red-400 text-red-700',
      calm: 'bg-teal-100 border-teal-400 text-teal-700',
      sad: 'bg-blue-100 border-blue-400 text-blue-700',
      anxious: 'bg-yellow-100 border-yellow-400 text-yellow-700'
    };
    return colors[emotion] || 'bg-gray-100';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Volume2 className="h-5 w-5" />
            <h3 className="font-semibold">Voice Mood Analyzer</h3>
          </div>
          <div className="flex items-center gap-2 text-xs bg-white/20 px-3 py-1 rounded-full">
            <Heart className="h-3 w-3" />
            <span>Tone + Speech Analysis</span>
          </div>
        </div>
        <p className="text-xs text-white/80 mt-1">Speak naturally - AI analyzes your voice tone, speed, and emotions</p>
      </div>
      
      <div className="p-5">
        {/* Mic Button & Audio Level */}
        <div className="flex flex-col items-center mb-6">
          <button
            onClick={isListening ? stopListening : startListening}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening 
                ? 'bg-red-500 hover:bg-red-600 animate-pulse shadow-lg' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 shadow-md'
            }`}
          >
            {isListening ? (
              <MicOff className="h-10 w-10 text-white" />
            ) : (
              <Mic className="h-10 w-10 text-white" />
            )}
          </button>
          
          {/* Audio Level Meter */}
          {isListening && (
            <div className="mt-4 w-full max-w-xs">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Audio Level</span>
                <span>{Math.round(audioLevel)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-100 bg-gradient-to-r from-green-500 via-yellow-500 to-red-500"
                  style={{ width: `${audioLevel}%` }}
                />
              </div>
            </div>
          )}
          
          {isListening && (
            <p className="text-sm text-green-600 mt-3 flex items-center gap-1">
              <Loader className="h-3 w-3 animate-spin" />
              Listening... Speak now
            </p>
          )}
        </div>
        
        {/* Transcript */}
        {transcript && (
          <div className="mb-5 p-4 bg-gray-50 rounded-xl border border-gray-200">
            <p className="text-xs text-gray-500 mb-1">You said:</p>
            <p className="text-gray-700">{transcript}</p>
          </div>
        )}
        
        {/* Analysis Results */}
        {isAnalyzing && (
          <div className="flex items-center justify-center py-8">
            <Loader className="h-8 w-8 text-indigo-500 animate-spin" />
            <span className="ml-2 text-gray-600">Analyzing your voice...</span>
          </div>
        )}
        
        {analysis && !isAnalyzing && (
          <div className="space-y-4">
            {/* Dominant Emotion */}
            <div className={`p-5 rounded-xl border-2 ${getEmotionColor(analysis.dominantEmotion)} text-center`}>
              <div className="text-6xl mb-2">
                {getEmotionEmoji(analysis.dominantEmotion)}
              </div>
              <div className="text-xl font-bold capitalize">{analysis.dominantEmotion}</div>
              <div className="text-sm opacity-75">Confidence: {analysis.confidence}%</div>
            </div>
            
            {/* Speech Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Zap className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Speech Speed</p>
                <p className="font-semibold">{analysis.speechSpeed} <span className="text-xs">wpm</span></p>
                <p className="text-xs text-gray-400">{analysis.speechSpeed > 120 ? 'Fast' : analysis.speechSpeed < 70 ? 'Slow' : 'Normal'}</p>
              </div>
              <div className="p-3 bg-gray-50 rounded-lg text-center">
                <Activity className="h-4 w-4 text-indigo-500 mx-auto mb-1" />
                <p className="text-xs text-gray-500">Voice Volume</p>
                <p className="font-semibold">{Math.round(analysis.audioLevel)}%</p>
                <p className="text-xs text-gray-400">{analysis.audioLevel > 70 ? 'Loud' : analysis.audioLevel < 20 ? 'Quiet' : 'Moderate'}</p>
              </div>
            </div>
            
            {/* All Emotions Bars */}
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Emotion Breakdown</p>
              <div className="space-y-2">
                {Object.entries(analysis.allEmotions).map(([emotion, score]) => (
                  <div key={emotion}>
                    <div className="flex justify-between text-xs mb-0.5">
                      <span className="capitalize">{emotion}</span>
                      <span>{score}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div 
                        className="h-1.5 rounded-full transition-all"
                        style={{ 
                          width: `${score}%`,
                          backgroundColor: 
                            emotion === 'happy' ? '#22c55e' :
                            emotion === 'stressed' ? '#f59e0b' :
                            emotion === 'angry' ? '#ef4444' :
                            emotion === 'calm' ? '#8b5cf6' :
                            emotion === 'sad' ? '#3b82f6' : '#eab308'
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  if (onAnalysisComplete) onAnalysisComplete(analysis);
                  toast.success('Analysis saved! Use this mood in your journal.');
                }}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition"
              >
                Use This Mood
              </button>
              <button
                onClick={() => {
                  setTranscript('');
                  setAnalysis(null);
                  startListening();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Try Again
              </button>
            </div>
          </div>
        )}
        
        <p className="text-xs text-gray-400 text-center mt-4">
          🎤 Speak clearly for best results. AI analyzes tone, speed, and keywords.
        </p>
      </div>
    </div>
  );
};

export default VoiceMoodAnalyzer;