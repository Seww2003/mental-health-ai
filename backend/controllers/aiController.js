import Chat from '../models/Chat.js';

// Get coping suggestion based on mood
export const getCopingSuggestion = (mood) => {
  const suggestions = {
    stressed: "🌿 Try this: Close your eyes, take 5 deep breaths. In through your nose, out through your mouth. You've got this.",
    sad: "💙 You matter. Try writing down one small thing you're grateful for today, no matter how tiny.",
    anxious: "🧘 Ground yourself: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.",
    angry: "📝 Write down what's bothering you, then rip the paper up. Physical release can help process anger.",
    happy: "✨ Enjoy this moment! Consider journaling about what made you happy so you can revisit it later.",
    neutral: "🌱 How about setting one small, kind intention for today? Even 'drink a glass of water' counts.",
    calm: "🧘‍♀️ Hold onto this peaceful feeling. Maybe try a 2-minute meditation to extend it."
  };
  return suggestions[mood] || suggestions.neutral;
};

// Fallback responses (works even without complex AI)
const getAIResponse = (message) => {
  const msg = message.toLowerCase();
  
  // Crisis detection
  if (msg.includes('suicide') || msg.includes('kill myself') || msg.includes('end my life') || msg.includes('want to die')) {
    return { 
      response: "💙 I'm really concerned about what you're sharing. Please reach out to a mental health professional or a crisis helpline right away.\n\n📞 **Emergency Helplines:**\n• 988 - Suicide & Crisis Lifeline (US)\n• 111 - Mental Health Helpline (UK)\n• 112 - Emergency (Global)\n\nYou are not alone, and help is available 24/7. Please stay safe. 💙", 
      isCrisis: true 
    };
  }
  
  // Sadness responses
  if (msg.includes('sad') || msg.includes('depressed') || msg.includes('lonely') || msg.includes('down')) {
    return { 
      response: "I hear that you're feeling down. 😔 It's completely okay to feel this way. Would you like to talk about what's making you feel sad? Sometimes sharing can help lighten the load. Remember, this feeling won't last forever. 💙", 
      isCrisis: false 
    };
  }
  
  // Anxiety responses
  if (msg.includes('anxious') || msg.includes('worry') || msg.includes('nervous') || msg.includes('scared') || msg.includes('fear')) {
    return { 
      response: "Anxiety can be really tough to deal with. 😰 Let's try a quick breathing exercise together:\n\n🌬️ Breathe in for 4 seconds\n🫁 Hold for 4 seconds\n🌬️ Breathe out for 4 seconds\n🫁 Hold for 4 seconds\n\nRepeat 3 times. How do you feel now? You're doing great just by acknowledging your feelings. 🌿", 
      isCrisis: false 
    };
  }
  
  // Stress responses
  if (msg.includes('stress') || msg.includes('overwhelmed') || msg.includes('too much') || msg.includes('pressure')) {
    return { 
      response: "It sounds like you're carrying a lot right now. 😫 Remember to be kind to yourself. Here's what might help:\n\n• Take a 5-minute break\n• Drink some water\n• Step outside for fresh air\n• Write down ONE small task at a time\n\nWould you like to talk more about what's stressing you? I'm here to listen. 💪", 
      isCrisis: false 
    };
  }
  
  // Anger responses
  if (msg.includes('angry') || msg.includes('mad') || msg.includes('frustrated') || msg.includes('annoyed')) {
    return { 
      response: "I can feel your frustration. 😤 It's okay to be angry. Would writing down exactly what's bothering you help? Sometimes getting it all out on paper can be really releasing. You could also try:\n\n• Taking 5 deep breaths\n• Going for a quick walk\n• Squeezing a stress ball\n\nI'm here for you. 🖊️", 
      isCrisis: false 
    };
  }
  
  // Happy responses
  if (msg.includes('happy') || msg.includes('great') || msg.includes('good') || msg.includes('wonderful') || msg.includes('awesome')) {
    return { 
      response: "That's wonderful to hear! 😊 I'm genuinely happy for you. What made today special? Celebrating the good moments is just as important as working through the tough ones. Keep that positive energy going! 🌟", 
      isCrisis: false 
    };
  }
  
  // Help/Advice
  if (msg.includes('help') || msg.includes('advice') || msg.includes('what should i do') || msg.includes('suggestion')) {
    return { 
      response: "I'm here to support you. Here are a few things that might help right now:\n\n🧘 Take 3 deep breaths\n🚶 Go for a short walk\n📝 Write down 3 things you're grateful for\n💬 Reach out to a friend\n🎵 Listen to calming music\n\nWhat feels right for you right now? Let me know and we can explore together! 💙", 
      isCrisis: false 
    };
  }
  
  // Thanks/Gratitude
  if (msg.includes('thank') || msg.includes('thanks') || msg.includes('appreciate')) {
    return { 
      response: "You're very welcome! 🤗 It means a lot that you trust me. Remember, I'm always here whenever you need someone to talk to. Take care of yourself today - you deserve it! 💙", 
      isCrisis: false 
    };
  }
  
  // Greetings
  if (msg.includes('hi') || msg.includes('hello') || msg.includes('hey') || msg.includes('good morning') || msg.includes('good evening')) {
    return { 
      response: "Hello! 👋 How are you feeling today? I'm here to listen, support, and help in any way I can. Feel free to share whatever's on your mind - no judgment here. 💙", 
      isCrisis: false 
    };
  }
  
  // Default supportive response
  return { 
    response: "Thank you for sharing that with me. 💙 I'm here to listen and support you. Could you tell me a bit more about how you're feeling? Or would you like some suggestions for feeling better? Whatever you need, I'm here for you. 🌈", 
    isCrisis: false 
  };
};

// Send message to AI
export const sendMessage = async (req, res) => {
  try {
    const { message, chatId } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }
    
    // Get or create chat session
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId: req.userId });
    }
    
    if (!chat) {
      chat = new Chat({ 
        userId: req.userId, 
        messages: [],
        sessionStart: new Date()
      });
    }
    
    // Add user message
    chat.messages.push({ 
      role: 'user', 
      content: message,
      timestamp: new Date()
    });
    
    // Get AI response
    const aiResponse = getAIResponse(message);
    
    // Add AI response
    chat.messages.push({ 
      role: 'assistant', 
      content: aiResponse.response,
      timestamp: new Date()
    });
    
    await chat.save();
    
    res.json({ 
      response: aiResponse.response, 
      chatId: chat._id,
      isCrisis: aiResponse.isCrisis 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get chat history
export const getChatHistory = async (req, res) => {
  try {
    const chats = await Chat.find({ userId: req.userId })
      .sort({ sessionStart: -1 })
      .limit(10);
    res.json(chats);
  } catch (error) {
    console.error('Get chat history error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get coping suggestion based on mood
export const getSuggestion = async (req, res) => {
  try {
    const { mood } = req.query;
    const suggestion = getCopingSuggestion(mood);
    res.json({ suggestion });
  } catch (error) {
    console.error('Get suggestion error:', error);
    res.status(500).json({ error: error.message });
  }
};