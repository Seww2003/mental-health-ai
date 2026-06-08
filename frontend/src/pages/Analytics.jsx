import { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Brain, Target, Award } from 'lucide-react';

const Analytics = () => {
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchJournals();
  }, []);
  
  const fetchJournals = async () => {
    try {
      const res = await axios.get('/api/journal');
      setJournals(res.data);
    } catch (error) {
      console.error('Error fetching journals:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Calculate mood distribution
  const moodDistribution = {};
  journals.forEach(j => {
    moodDistribution[j.mood] = (moodDistribution[j.mood] || 0) + 1;
  });
  
  const pieData = Object.entries(moodDistribution).map(([name, value]) => ({ name, value }));
  const COLORS = ['#10b981', '#14b8a6', '#6b7280', '#3b82f6', '#eab308', '#f97316', '#ef4444'];
  
  // Calculate average scores by day of week
  const dayScores = {
    Sunday: { mood: 0, stress: 0, count: 0 },
    Monday: { mood: 0, stress: 0, count: 0 },
    Tuesday: { mood: 0, stress: 0, count: 0 },
    Wednesday: { mood: 0, stress: 0, count: 0 },
    Thursday: { mood: 0, stress: 0, count: 0 },
    Friday: { mood: 0, stress: 0, count: 0 },
    Saturday: { mood: 0, stress: 0, count: 0 },
  };
  
  journals.forEach(j => {
    const day = new Date(j.date).toLocaleDateString('en-US', { weekday: 'long' });
    dayScores[day].mood += j.moodScore;
    dayScores[day].stress += j.stressLevel;
    dayScores[day].count += 1;
  });
  
  const barData = Object.entries(dayScores).map(([day, data]) => ({
    day,
    mood: data.count ? (data.mood / data.count).toFixed(1) : 0,
    stress: data.count ? (data.stress / data.count).toFixed(1) : 0,
  }));
  
  // Find best and worst days
  const bestDay = [...barData].sort((a, b) => b.mood - a.mood)[0];
  const worstDay = [...barData].sort((a, b) => a.mood - b.mood)[0];
  
  // Common keywords
  const keywords = {};
  journals.forEach(j => {
    j.keywords?.forEach(k => {
      keywords[k] = (keywords[k] || 0) + 1;
    });
  });
  
  const topKeywords = Object.entries(keywords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics 📊</h1>
        <p className="text-gray-600">Understand your emotional patterns over time</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-green-50 rounded-xl">
              <TrendingUp className="h-6 w-6 text-green-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{journals.length}</h3>
          <p className="text-gray-600 text-sm">Total Journal Entries</p>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-indigo-50 rounded-xl">
              <Brain className="h-6 w-6 text-indigo-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 capitalize">{bestDay?.day || 'N/A'}</h3>
          <p className="text-gray-600 text-sm">Best Mood Day</p>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-orange-50 rounded-xl">
              <Target className="h-6 w-6 text-orange-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 capitalize">{worstDay?.day || 'N/A'}</h3>
          <p className="text-gray-600 text-sm">Most Challenging Day</p>
        </div>
        
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="p-3 bg-purple-50 rounded-xl">
              <Award className="h-6 w-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{topKeywords[0]?.[0] || 'N/A'}</h3>
          <p className="text-gray-600 text-sm">Most Common Theme</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Mood Distribution</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
        
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Mood & Stress by Day of Week</h3>
          {barData.some(d => d.mood > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="mood" fill="#6366f1" name="Mood Score" />
                <Bar dataKey="stress" fill="#f59e0b" name="Stress Level" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-12 text-gray-500">No data available</div>
          )}
        </div>
      </div>
      
      {/* Common Keywords */}
      {topKeywords.length > 0 && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Common Themes in Your Journal</h3>
          <div className="flex flex-wrap gap-2">
            {topKeywords.map(([keyword, count]) => (
              <span
                key={keyword}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-full text-sm font-medium"
              >
                {keyword} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
      
      {/* Insights */}
      <div className="card mt-8 bg-gradient-to-r from-indigo-50 to-purple-50">
        <h3 className="text-lg font-semibold mb-3">💡 Personal Insights</h3>
        <ul className="space-y-2 text-gray-700">
          {barData.length > 0 && (
            <li>• Your mood tends to be best on {bestDay?.day}s and most challenging on {worstDay?.day}s</li>
          )}
          {topKeywords.length > 0 && (
            <li>• You frequently mention "{topKeywords[0]?.[0]}" - this might be an important area to focus on</li>
          )}
          <li>• Keep writing! Each journal entry helps you understand yourself better</li>
          <li>• Remember: Progress isn't always linear, and that's completely okay</li>
        </ul>
      </div>
    </div>
  );
};

export default Analytics;