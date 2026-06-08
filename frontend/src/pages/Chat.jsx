import SimpleChatbot from '../components/SimpleChatbot';

const Chat = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Companion 🤖</h1>
        <p className="text-gray-600">Your safe space to talk about anything. I'm here to listen and support you.</p>
      </div>
      
      <SimpleChatbot />
      
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-400">
          💙 Remember: Everything you share is confidential. Take care of yourself.
        </p>
      </div>
    </div>
  );
};

export default Chat;