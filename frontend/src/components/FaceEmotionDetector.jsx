import { useEffect, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import { Camera, Loader, Smile, AlertCircle } from 'lucide-react';

const FaceEmotionDetector = ({ onEmotionDetected }) => {
  const webcamRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [faceApi, setFaceApi] = useState(null);

  // Load face-api.js dynamically
  useEffect(() => {
    const loadFaceApi = async () => {
      try {
        setLoading(true);
        // Dynamically import face-api.js
        const faceapi = await import('face-api.js');
        setFaceApi(faceapi);
        
        // Load models from CDN (since local files might not exist)
        await faceapi.nets.tinyFaceDetector.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('https://justadudewhohacks.github.io/face-api.js/models');
        
        setModelsLoaded(true);
        setError(null);
      } catch (err) {
        console.error('Error loading face-api models:', err);
        setError('Failed to load AI models. Please check your internet connection.');
      } finally {
        setLoading(false);
      }
    };
    
    loadFaceApi();
  }, []);

  const detectEmotion = async () => {
    if (!webcamRef.current || !modelsLoaded || !faceApi) {
      setError('Camera or AI models not ready');
      return;
    }
    
    setDetecting(true);
    setError(null);
    
    try {
      const video = webcamRef.current.video;
      if (video && video.readyState === 4) {
        const detections = await faceApi.detectSingleFace(
          video, 
          new faceApi.TinyFaceDetectorOptions()
        ).withFaceLandmarks().withFaceExpressions();
        
        if (detections) {
          const expressions = detections.expressions;
          
          // Get dominant emotion
          let dominantEmotion = 'neutral';
          let highestScore = 0;
          
          Object.entries(expressions).forEach(([emotion, score]) => {
            if (score > highestScore) {
              highestScore = score;
              dominantEmotion = emotion;
            }
          });
          
          const confidenceScore = Math.round(highestScore * 100);
          
          // Map to app moods
          const moodMap = {
            happy: 'happy',
            sad: 'sad',
            angry: 'angry',
            fearful: 'anxious',
            surprised: 'happy',
            neutral: 'neutral',
            disgusted: 'neutral'
          };
          
          if (onEmotionDetected) {
            onEmotionDetected({
              mood: moodMap[dominantEmotion] || 'neutral',
              emotion: dominantEmotion,
              confidence: confidenceScore,
              allEmotions: expressions
            });
          }
        } else {
          setError('No face detected. Please look into the camera.');
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
      setError('Detection failed. Please try again.');
    } finally {
      setDetecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
        <Loader className="h-10 w-10 text-indigo-500 animate-spin mb-3" />
        <p className="text-gray-700 font-medium">Loading AI Models...</p>
        <p className="text-xs text-gray-400 mt-1">This may take 5-10 seconds on first load</p>
      </div>
    );
  }

  if (error && !modelsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-xl">
        <AlertCircle className="h-10 w-10 text-red-500 mb-3" />
        <p className="text-red-700 font-medium text-center">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
      <div className="p-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
        <div className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          <h3 className="font-semibold">AI Face Emotion Detector</h3>
        </div>
        <p className="text-xs text-white/80 mt-1">
          Let AI analyze your current emotion from your face
        </p>
      </div>
      
      <div className="p-4">
        <div className="relative rounded-lg overflow-hidden bg-gray-900">
          <Webcam
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: 400,
              height: 300,
              facingMode: "user"
            }}
            className="w-full rounded-lg"
            mirrored={true}
          />
          {detecting && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
              <div className="text-center">
                <Loader className="h-8 w-8 text-white animate-spin mx-auto mb-2" />
                <p className="text-white text-sm">Analyzing your face...</p>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={detectEmotion}
          disabled={detecting || !modelsLoaded}
          className="mt-4 w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
        >
          <Smile className="h-5 w-5" />
          {detecting ? 'Analyzing...' : 'Detect My Emotion'}
        </button>
        
        {error && !detecting && (
          <div className="mt-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700 text-center">{error}</p>
          </div>
        )}
        
        <p className="text-xs text-gray-400 text-center mt-3">
          🔒 Your privacy is important - images are not stored anywhere
        </p>
      </div>
    </div>
  );
};

export default FaceEmotionDetector;