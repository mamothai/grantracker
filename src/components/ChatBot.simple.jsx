import { useState, useRef } from 'react';
import { chatAPI } from '../services/apiService.js';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your grant discovery assistant. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Use the API service to get a response
      const response = await chatAPI.advancedQuery(currentMessage);
      
      const botResponse = {
        id: Date.now() + 1,
        text: response.response || generateResponse(currentMessage),
        sender: 'bot',
        timestamp: new Date(),
        metadata: response.metadata
      };
      
      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Chat API error:', error);
      // Fallback to local response generation
      const botResponse = {
        id: Date.now() + 1,
        text: generateResponse(currentMessage),
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botResponse]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateResponse = (query) => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('grant') || lowerQuery.includes('funding')) {
      return "I can help you find grants! Try visiting the Creator Portal to apply for grants or check the Public View to browse available opportunities.";
    }
    
    if (lowerQuery.includes('navigate') || lowerQuery.includes('show')) {
      return "I can help you navigate to different sections of the website. What would you like to see?";
    }
    
    if (lowerQuery.includes('help')) {
      return "I'm here to help you with grants, funding opportunities, and navigating the website. What specific area interests you?";
    }
    
    return "I understand you're asking about grants and navigation. Could you be more specific about what you'd like to know?";
  };

  return (
    <div className="chatbot-container">
      {/* Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <span>🤖</span>
              </div>
              <div className="chatbot-header-info">
                <h3>Grant Assistant</h3>
                <div className="chatbot-status">
                  <span className="status-indicator"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <button
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
            >
              ×
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender}`}
              >
                <div className="chatbot-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-message-content">
                    <p>{message.text}</p>
                  </div>
                  <div className="chatbot-message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="chatbot-message bot">
                <div className="chatbot-avatar">🤖</div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chatbot-input-area">
            <div className="chatbot-input-wrapper">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask about grants or navigation..."
                disabled={isLoading}
                className="chatbot-input"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="chatbot-send-button"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;