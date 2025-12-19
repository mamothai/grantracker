import { useState, useEffect, useRef } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);
  
  // Website paths for navigation
  const websitePaths = {
    home: { path: '/', label: 'Home', icon: '🏠' },
    about: { path: '/about', label: 'About', icon: 'ℹ️' },
    dashboard: { path: '/chart', label: 'Dashboard', icon: '📊' },
    benefits: { path: '/benefits', label: 'Benefits', icon: '🏛️' },
    suggestions: { path: '/suggestions', label: 'Suggestions', icon: '💬' },
    creator: { path: '/creator-login', label: 'Creator Portal', icon: '✍️' },
    government: { path: '/gov-login', label: 'Government', icon: '🏛️' },
    create: { path: '/create-grant', label: 'Create Grant', icon: '📝' },
    view: { path: '/view', label: 'Public View', icon: '👁️' }
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: "Hello! I'm your grant discovery assistant. I can help you find funding opportunities, navigate the platform, and answer questions about grants. How can I assist you today?",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Simple intent recognition
  const analyzeIntent = (text) => {
    const query = text.toLowerCase();
    
    // Navigation intents
    if (/(home|main page|start)/i.test(query)) {
      return { intent: 'navigate', target: 'home' };
    }
    if (/(about|team|company)/i.test(query)) {
      return { intent: 'navigate', target: 'about' };
    }
    if (/(dashboard|chart|analytics)/i.test(query)) {
      return { intent: 'navigate', target: 'dashboard' };
    }
    if (/(benefits|schemes|government)/i.test(query)) {
      return { intent: 'navigate', target: 'benefits' };
    }
    if (/(suggestions|feedback)/i.test(query)) {
      return { intent: 'navigate', target: 'suggestions' };
    }
    if (/(creator|login|apply)/i.test(query)) {
      return { intent: 'navigate', target: 'creator' };
    }
    if (/(government|official)/i.test(query)) {
      return { intent: 'navigate', target: 'government' };
    }
    if (/(create|new grant)/i.test(query)) {
      return { intent: 'navigate', target: 'create' };
    }
    if (/(view|browse|explore)/i.test(query)) {
      return { intent: 'navigate', target: 'view' };
    }
    
    // Grant-related intents
    if (/(grant|funding|money|opportunity)/i.test(query)) {
      return { intent: 'grant_info' };
    }
    if (/(eligible|qualify|requirements)/i.test(query)) {
      return { intent: 'eligibility' };
    }
    if (/(apply|application|submit)/i.test(query)) {
      return { intent: 'application' };
    }
    if (/(deadline|due date)/i.test(query)) {
      return { intent: 'deadline' };
    }
    if (/(how much|amount|funding)/i.test(query)) {
      return { intent: 'amount' };
    }
    
    // General intents
    if (/(help|support)/i.test(query)) {
      return { intent: 'help' };
    }
    if (/(hello|hi|hey)/i.test(query)) {
      return { intent: 'greeting' };
    }
    if (/(thank|thanks)/i.test(query)) {
      return { intent: 'gratitude' };
    }
    if (/(show|navigate|go to|take me)/i.test(query)) {
      return { intent: 'show_actions' };
    }
    
    return { intent: 'unknown' };
  };

  // Generate response based on intent
  const generateResponse = (query, intent) => {
    const responses = {
      greeting: "Hello! I'm here to help you with grants and navigation. What would you like to know?",
      gratitude: "You're welcome! I'm here to help with any other questions about grants.",
      help: "I can help you with:\n\n• Finding grants and funding opportunities\n• Checking eligibility requirements\n• Understanding application processes\n• Navigating to different sections\n• Information about deadlines and amounts\n\nWhat specific area interests you?",
      
      grant_info: "I can help you find grants! Here's what I know:\n\n• Use the Creator Portal to apply for grants\n• Check the Public View to browse available opportunities\n• Visit Benefits for government schemes\n• Look at the Dashboard for analytics\n\nWhat type of grants are you looking for?",
      
      eligibility: "Grant eligibility varies by program. Generally, you'll need to:\n\n• Be an eligible organization type (nonprofit, business, etc.)\n• Meet specific criteria for each grant\n• Have a qualifying project or purpose\n• Submit required documentation\n\nWould you like me to help you check specific programs?",
      
      application: "Here's how to apply for grants:\n\n1. Visit the Creator Portal\n2. Create an account or log in\n3. Browse available grants\n4. Complete the application form\n5. Upload required documents\n6. Submit before the deadline\n\nNeed help with any specific step?",
      
      deadline: "Grant deadlines vary by program:\n\n• Some have specific deadlines (quarterly, annual)\n• Others accept rolling applications\n• Check individual grant listings for dates\n• Start applications early to avoid rushing\n\nWould you like me to show you specific deadlines?",
      
      amount: "Grant amounts vary widely:\n\n• Small grants: $1,000 - $25,000\n• Medium grants: $25,000 - $250,000\n• Large grants: $250,000+\n• Some programs offer millions\n\nThe amount depends on the program and project scope.",
      
      show_actions: "I can take you directly to these sections:",
      
      unknown: "I'm here to help with grants and platform navigation. You can ask me about:\n\n• Finding grants and funding\n• Application processes\n• Eligibility requirements\n• Platform navigation\n\nOr try asking me to 'show navigation options' for direct links!"
    };

    return responses[intent.intent] || responses.unknown;
  };

  // Handle navigation
  const handleNavigation = (target) => {
    const pathInfo = websitePaths[target];
    if (pathInfo) {
      // In a real app, you'd use React Router here
      // For now, we'll just show a message
      return `I can help you navigate to ${pathInfo.label}. In this demo, you would be taken to: ${pathInfo.path}`;
    }
    return "I'm not sure where that is. Try asking me to show navigation options!";
  };

  // Handle user message
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const intent = analyzeIntent(userMessage.text);
      let responseText = '';

      if (intent.intent === 'navigate') {
        responseText = handleNavigation(intent.target);
      } else {
        responseText = generateResponse(userMessage.text, intent);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        intent: intent.intent
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: "I apologize, but I encountered an error. Please try again.",
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  // Handle keyboard events
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle quick actions
  const handleQuickAction = (action) => {
    setInputValue(action);
    setTimeout(() => handleSendMessage(), 100);
  };

  // Render message content
  const renderMessageContent = (message) => {
    if (message.isError) {
      return (
        <div className="chatbot-error">
          <span>⚠️</span>
          <span>{message.text}</span>
        </div>
      );
    }

    return (
      <div className="chatbot-message-content">
        {message.text.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
    );
  };

  // Quick action suggestions
  const quickActions = [
    "Find grants for my business",
    "Check eligibility requirements",
    "Show me navigation options",
    "How do I apply for grants?"
  ];

  return (
    <div className="chatbot-container">
      {/* Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        {isOpen ? '×' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-labelledby="chatbot-title">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <span>🤖</span>
              </div>
              <div className="chatbot-header-info">
                <h3 id="chatbot-title">Grant Assistant</h3>
                <div className="chatbot-status">
                  <span className="status-indicator"></span>
                  <span>Online</span>
                </div>
              </div>
            </div>
            <div className="chatbot-header-controls">
              <button
                className="chatbot-close"
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
              >
                ×
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages" role="log" aria-live="polite">
            {messages.length === 0 && (
              <div className="chatbot-empty-state">
                <div className="chatbot-empty-icon">🤖</div>
                <h4>Welcome to Grant Assistant</h4>
                <p>I'm here to help you discover grants and navigate the platform. What would you like to explore?</p>
              </div>
            )}

            {messages.map((message) => (
              <div
                key={message.id}
                className={`chatbot-message ${message.sender}`}
                role="article"
                aria-label={`${message.sender === 'user' ? 'Your message' : 'Assistant response'}`}
              >
                <div className="chatbot-avatar">
                  {message.sender === 'user' ? '👤' : '🤖'}
                </div>
                <div className="chatbot-message-bubble">
                  {renderMessageContent(message)}
                  <div className="chatbot-message-time">
                    {new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {(isLoading || isTyping) && (
              <div className="chatbot-message bot" role="status" aria-live="polite">
                <div className="chatbot-avatar">🤖</div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <div className="typing-text">Thinking...</div>
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
                onKeyPress={handleKeyPress}
                placeholder="Ask about grants or navigation..."
                disabled={isLoading}
                className="chatbot-input"
                aria-label="Chat input"
                maxLength={500}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="chatbot-send-button"
                aria-label="Send message"
              >
                {isLoading ? '⏳' : '➤'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="chatbot-quick-actions" role="group" aria-label="Quick actions">
              <div className="quick-actions-label">Try asking:</div>
              <div className="quick-actions-list">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-button"
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    aria-label={`Ask: ${action}`}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;