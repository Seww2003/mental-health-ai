import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import MoodChart from '../components/MoodChart';
import MoodCalendar from '../components/MoodCalendar';
import { Activity, TrendingUp, Calendar, Sparkles, Heart } from 'lucide-react';

const Dashboard = () => {
  const { token } = useAuth();
  const [journals, setJournals] = useState([]);
  const [trends, setTrends] = useState({ trends: [], avgMood: 5, avgStress: 5 });
  const [loading, setLoading] = useState(true);
  const [suggestion, setSuggestion] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [journalsRes, trendsRes] = await Promise.all([
        axios.get('/api/journal'),
        axios.get('/api/journal/trends')
      ]);
      setJournals(journalsRes.data);
      setTrends(trendsRes.data);
      
      if (journalsRes.data.length > 0) {
        const lastMood = journalsRes.data[0]?.mood;
        const suggestionRes = await axios.get(`/api/ai/suggestion?mood=${lastMood}`);
        setSuggestion(suggestionRes.data.suggestion);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: 'Average Mood', value: trends.avgMood.toFixed(1), icon: Heart, color: 'text-rose-500', bg: 'bg-rose-50' },
    { label: 'Average Stress', value: trends.avgStress.toFixed(1), icon: Activity, color: 'text-orange-500', bg: 'bg-orange-50' },
    { label: 'Total Entries', value: journals.length, icon: Calendar, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    { label: 'Streak', value: '7 days', icon: TrendingUp, color: 'text-green-500', bg: 'bg-green-50' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back! 👋</h1>
        <p className="text-gray-600">Here's how you've been feeling lately</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="card hover:shadow-2xl transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-xl ${stat.bg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
            <p className="text-gray-600 text-sm">{stat.label}</p>
          </div>
        ))}
      </div>
      
      {/* Suggestion Card */}
      {suggestion && (
        <div className="card bg-gradient-to-r from-indigo-50 to-purple-50 mb-8 border border-indigo-100">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-6 w-6 text-indigo-500 mt-0.5" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Today's Suggestion</h3>
              <p className="text-gray-700">{suggestion}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Mood & Stress Trends</h3>
          {trends.trends.length > 0 ? (
            <MoodChart data={trends.trends} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Activity className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>No journal entries yet</p>
              <p className="text-sm">Start writing to see your trends!</p>
            </div>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Mood Calendar</h3>
          {journals.length > 0 ? (
            <MoodCalendar journals={journals} />
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
              <p>Your mood calendar will appear here</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Recent Entries */}
      <div className="card">
        <h3 className="text-lg font-semibold mb-4">Recent Journal Entries</h3>
        {journals.length > 0 ? (
          <div className="space-y-4">
            {journals.slice(0, 5).map((journal) => (
              <div key={journal._id} className="border-b border-gray-100 pb-4 last:border-0">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">
                      {journal.mood === 'happy' && '😊'}
                      {journal.mood === 'sad' && '😢'}
                      {journal.mood === 'anxious' && '😰'}
                      {journal.mood === 'angry' && '😤'}
                      {journal.mood === 'stressed' && '😫'}
                      {journal.mood === 'calm' && '😌'}
                      {journal.mood === 'neutral' && '😐'}
                    </span>
                    <span className="font-medium capitalize">{journal.mood}</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(journal.date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 line-clamp-2">{journal.text}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No journal entries yet</p>
            <p className="text-sm mt-2">Go to Journal page to start writing</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;