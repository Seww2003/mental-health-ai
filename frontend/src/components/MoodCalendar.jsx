import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addDays } from 'date-fns';

const moodColors = {
  happy: 'bg-green-100 text-green-700 border-green-200',
  calm: 'bg-teal-100 text-teal-700 border-teal-200',
  neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  sad: 'bg-blue-100 text-blue-700 border-blue-200',
  anxious: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  stressed: 'bg-orange-100 text-orange-700 border-orange-200',
  angry: 'bg-red-100 text-red-700 border-red-200'
};

const moodEmojis = {
  happy: '😊',
  calm: '😌',
  neutral: '😐',
  sad: '😢',
  anxious: '😰',
  stressed: '😫',
  angry: '😤'
};

const MoodCalendar = ({ journals }) => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  
  const days = eachDayOfInterval({ start, end });
  
  const journalMap = {};
  journals.forEach(j => {
    const dateKey = format(new Date(j.date), 'yyyy-MM-dd');
    journalMap[dateKey] = j;
  });
  
  const startDayOfWeek = getDay(start);
  const emptyDays = Array(startDayOfWeek).fill(null);
  
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        {format(today, 'MMMM yyyy')}
      </h3>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {emptyDays.map((_, i) => (
          <div key={`empty-${i}`} className="aspect-square bg-gray-50 rounded-lg"></div>
        ))}
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const journal = journalMap[dateKey];
          const isToday = format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
          
          return (
            <div
              key={dateKey}
              className={`aspect-square rounded-lg border transition-all duration-200 ${
                journal 
                  ? moodColors[journal.mood] || 'bg-gray-100'
                  : 'bg-white border-gray-200'
              } ${isToday ? 'ring-2 ring-indigo-400 ring-offset-2' : ''} hover:scale-105 cursor-pointer`}
            >
              <div className="h-full flex flex-col items-center justify-center p-1">
                <span className={`text-sm font-medium ${isToday ? 'text-indigo-600' : ''}`}>
                  {format(day, 'd')}
                </span>
                {journal && (
                  <span className="text-lg mt-1">
                    {moodEmojis[journal.mood]}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MoodCalendar;