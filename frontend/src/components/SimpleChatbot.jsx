import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Bot, User, AlertCircle, Sparkles, Heart } from 'lucide-react';
import toast from 'react-hot-toast';

const SimpleChatbot = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi there! 👋 I'm your mental health companion. How are you feeling today? Remember, I'm here to listen and support you. 💙"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatId, setChatId] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Send message to backend
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message to chat
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        'http://localhost:5000/api/ai/chat',
        { message: userMessage, chatId: chatId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = response.data;
      setChatId(data.chatId);
      
      // Add AI response
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      
      // Show crisis alert if needed
      if (data.isCrisis) {
        toast.error(
          '⚠️ If you need immediate help, please contact a mental health professional or call emergency services.',
          { duration: 10000 }
        );
      }
    } catch (error) {
      console.error('Chat error:', error);
      
      // Fallback responses if backend fails
      let fallbackResponse = getFallbackResponse(userMessage);
      setMessages(prev => [...prev, { role: 'assistant', content: fallbackResponse }]);
      
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Connection issue. Using offline responses.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Fallback responses (works even without backend!)
  const getFallbackResponse = (message) => {
    const msg = message.toLowerCase();
    
    // Crisis detection
    if (msg.includes('suicide') || msg.includes('kill myself') || msg.includes('end my life')) {
      return "💙 I'm really concerned about what you're sharing. Please reach out to a mental health professional or a crisis helpline right away. In the US/Canada, call or text **988** for the Suicide and Crisis Lifeline. You are not alone, and help is available 24/7. Please stay safe. 💙";
    }
    
    // Sadness
    if (msg.includes('sad') || msg.includes('depressed') || msg.includes('lonely') || msg.includes('down')) {
      return "I hear that you're feeling down. 😔 It's completely okay to feel this way. Would you like to talk about what's making you feel sad? Sometimes sharing can help lighten the load. Remember, this feeling won't last forever. 💙";
    }
    
    // Anxiety/Worry
    if (msg.includes('anxious') || msg.includes('worry') || msg.includes('nervous') || msg.includes('scared') || msg.includes('fear')) {
      return "Anxiety can be really tough to deal with. 😰 Let's try a quick breathing exercise together:\n\n🌬️ Breathe in for 4 seconds\n🫁 Hold for 4 seconds\n🌬️ Breathe out for 4 seconds\n🫁 Hold for 4 seconds\n\nRepeat 3 times. How do you feel now? You're doing great just by acknowledging your feelings. 🌿";
    }
    
    // Stress
    if (msg.includes('stress') || msg.includes('overwhelmed') || msg.includes('too much') || msg.includes('pressure')) {
      return "It sounds like you're carrying a lot right now. 😫 Remember to be kind to yourself. Here's what might help:\n\n• Take a 5-minute break\n• Drink some water\n• Step outside for fresh air\n• Write down ONE small task at a time\n\nWould you like to talk more about what's stressing you? I'm here to listen. 💪";
    }
    
    // Anger/Frustration
    if (msg.includes('angry') || msg.includes('mad') || msg.includes('frustrated') || msg.includes('annoyed')) {
      return "I can feel your frustration. 😤 It's okay to be angry. Would writing down exactly what's bothering you help? Sometimes getting it all out on paper can be really releasing. You could also try:\n\n• Taking 5 deep breaths\n• Going for a quick walk\n• Squeezing a stress ball\n\nI'm here for you. 🖊️";
    }
    
    // Happy/Good
    if (msg.includes('happy') || msg.includes('great') || msg.includes('good') || msg.includes('wonderful') || msg.includes('awesome')) {
      return "That's wonderful to hear! 😊 I'm genuinely happy for you. What made today special? Celebrating the good moments is just as important as working through the tough ones. Keep that positive energy going! 🌟";
    }
    
    // Help/Advice
    if (msg.includes('help') || msg.includes('advice') || msg.includes('what should i do') || msg.includes('suggestion')) {
      return "I'm here to support you. Here are a few things that might help right now:\n\n🧘 Take 3 deep breaths\n🚶 Go for a short walk\n📝 Write down 3 things you're grateful for\n💬 Reach out to a friend\n🎵 Listen to calming music\n\nWhat feels right for you right now? Let me know and we can explore together! 💙";
    }
    
    // Thanks/Gratitude
    if (msg.includes('thank') || msg.includes('thanks') || msg.includes('appreciate')) {
      return "You're very welcome! 🤗 It means a lot that you trust me. Remember, I'm always here whenever you need someone to talk to. Take care of yourself today - you deserve it! 💙";
    }
    
    // Greetings
    if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey')) {
      return "Hello! 👋 How are you feeling today? I'm here to listen, support, and help in any way I can. Feel free to share whatever's on your mind - no judgment here. 💙";
    }
    
    // Default supportive response
    return "Thank you for sharing that with me. 💙 I'm here to listen and support you. Could you tell me a bit more about how you're feeling? Or would you like some suggestions for feeling better? Whatever you need, I'm here for you. 🌈";
  };

  // Quick reply suggestions
  const quickReplies = [
    "I'm feeling stressed 😫",
    "I feel sad today 😢",
    "I'm anxious about something 😰",
    "I need motivation 💪",
    "Give me a coping tip 🌿",
    "I'm feeling great! 😊"
  ];

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-xl shadow-xl overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Heart className="h-5 w-5" fill="white" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">MindMate AI Companion</h2>
            <p className="text-xs text-white/80">Here to listen and support you 24/7</p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50 to-white">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              </div>
            )}
            
            <div
              className={`max-w-[80%] px-4 py-3 rounded-2xl ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm'
                  : 'bg-gray-100 text-gray-800 rounded-bl-sm'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
            </div>
            
            {msg.role === 'user' && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-600" />
                </div>
              </div>
            )}
          </div>
        ))}
        
        {loading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Replies */}
      <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickReplies.map((reply, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInput(reply);
                // Auto-send after a short delay
                setTimeout(() => {
                  const fakeEvent = { preventDefault: () => {} };
                  sendMessage(fakeEvent);
                }, 100);
              }}
              className="flex-shrink-0 px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-600 transition-all"
            >
              {reply}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here... (e.g., 'I'm feeling stressed')"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>

      {/* Disclaimer */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 text-center">
        <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
          <AlertCircle className="h-3 w-3" />
          MindMate is a wellness support tool, not a medical device. If you're in crisis, please seek professional help.
        </p>
      </div>
    </div>
  );
};

export default SimpleChatbot;