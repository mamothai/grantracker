import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/apiService.js';
import './ChatBot.css';

// Advanced ChatBot without role complexity - Enterprise Quality UX
const ChatBot = () => {
  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // Simple conversation manager (no complex roles)
  const [conversationManager] = useState(() => ({
    conversations: JSON.parse(localStorage.getItem('chatbot_conversations') || '[]'),
    currentConversation: null,
    
    createNewConversation() {
      const conversation = {
        id: conversationId,
        title: 'New Chat',
        createdAt: new Date().toISOString(),
        messages: [],
        stats: { totalMessages: 0, satisfaction: null }
      };
      this.conversations.unshift(conversation);
      this.currentConversation = conversation;
      this.saveConversations();
      return conversation;
    },
    
    addMessage(message, isFromUser = true) {
      if (!this.currentConversation) {
        this.createNewConversation();
      }
      
      const messageWithMetadata = {
        id: Date.now().toString(),
        text: message.text,
        sender: message.sender,
        timestamp: new Date().toISOString(),
        intent: message.intent || null,
        metadata: message.metadata || {}
      };
      
      this.currentConversation.messages.push(messageWithMetadata);
      this.currentConversation.stats.totalMessages = this.currentConversation.messages.length;
      this.saveConversations();
      return messageWithMetadata;
    },
    
    getAnalytics() {
      const totalConversations = this.conversations.length;
      const totalMessages = this.conversations.reduce((sum, conv) => sum + conv.stats.totalMessages, 0);
      const averageMessages = totalConversations > 0 ? Math.round(totalMessages / totalConversations) : 0;
      
      // Intent distribution
      const intentDistribution = {};
      this.conversations.forEach(conv => {
        conv.messages.forEach(msg => {
          if (msg.intent) {
            intentDistribution[msg.intent] = (intentDistribution[msg.intent] || 0) + 1;
          }
        });
      });
      
      return {
        totalConversations,
        totalMessages,
        averageMessagesPerConversation: averageMessages,
        intentDistribution,
        recentActivity: this.conversations.slice(0, 5)
      };
    },
    
    searchConversations(query) {
      if (!query) return [];
      return this.conversations.filter(conv => 
        conv.title.toLowerCase().includes(query.toLowerCase()) ||
        conv.messages.some(msg => msg.text.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 5);
    },
    
    saveConversations() {
      try {
        localStorage.setItem('chatbot_conversations', JSON.stringify(this.conversations));
      } catch (error) {
        console.warn('Failed to save conversations:', error);
      }
    }
  }));

  // Enhanced intent recognition
  const analyzeIntent = (text) => {
    const query = text.toLowerCase();
    
    // Grant-specific intents
    if (/(analytics|stats|reports|data)/i.test(query)) {
      return { intent: 'show_analytics', confidence: 0.9 };
    }
    if (/(history|conversations|past chats)/i.test(query)) {
      return { intent: 'show_history', confidence: 0.9 };
    }
    if (/(settings|preferences|config)/i.test(query)) {
      return { intent: 'show_settings', confidence: 0.9 };
    }
    
    // Navigation intents
    if (/(home|main page|start)/i.test(query)) {
      return { intent: 'navigate', target: 'home', confidence: 0.9 };
    }
    if (/(about|team|company)/i.test(query)) {
      return { intent: 'navigate', target: 'about', confidence: 0.9 };
    }
    if (/(dashboard|chart)/i.test(query)) {
      return { intent: 'navigate', target: 'dashboard', confidence: 0.9 };
    }
    if (/(benefits|schemes|government)/i.test(query)) {
      return { intent: 'navigate', target: 'benefits', confidence: 0.9 };
    }
    if (/(suggestions|feedback)/i.test(query)) {
      return { intent: 'navigate', target: 'suggestions', confidence: 0.9 };
    }
    if (/(creator|login|apply)/i.test(query)) {
      return { intent: 'navigate', target: 'creator', confidence: 0.9 };
    }
    if (/(government|official)/i.test(query)) {
      return { intent: 'navigate', target: 'government', confidence: 0.9 };
    }
    if (/(create|new grant)/i.test(query)) {
      return { intent: 'navigate', target: 'create', confidence: 0.9 };
    }
    if (/(view|browse|explore)/i.test(query)) {
      return { intent: 'navigate', target: 'view', confidence: 0.9 };
    }
    
    // Grant-related intents
    if (/(grant|funding|money|opportunity)/i.test(query)) {
      return { intent: 'grant_info', confidence: 0.8 };
    }
    if (/(eligible|qualify|requirements)/i.test(query)) {
      return { intent: 'eligibility', confidence: 0.8 };
    }
    if (/(apply|application|submit)/i.test(query)) {
      return { intent: 'application', confidence: 0.8 };
    }
    if (/(deadline|due date)/i.test(query)) {
      return { intent: 'deadline', confidence: 0.8 };
    }
    if (/(how much|amount|funding)/i.test(query)) {
      return { intent: 'amount', confidence: 0.8 };
    }
    
    // General intents
    if (/(help|support)/i.test(query)) {
      return { intent: 'help', confidence: 0.9 };
    }
    if (/(hello|hi|hey)/i.test(query)) {
      return { intent: 'greeting', confidence: 0.9 };
    }
    if (/(thank|thanks)/i.test(query)) {
      return { intent: 'gratitude', confidence: 0.9 };
    }
    if (/(show|navigate|go to|take me)/i.test(query)) {
      return { intent: 'show_actions', confidence: 0.8 };
    }
    
    return { intent: 'unknown', confidence: 0.1 };
  };

  // Generate response based on intent
  const generateResponse = (query, intent) => {
    const responses = {
      greeting: "Hello! I'm your advanced grant discovery assistant. I can help you find grants, check eligibility, understand requirements, and navigate the platform. What would you like to explore?",
      gratitude: "You're welcome! I'm here to help with any other questions about grants and platform navigation.",
      help: "I can help you with:\n\n• Finding grants and funding opportunities\n• Checking eligibility requirements\n• Understanding application processes\n• Navigating to different sections\n• Information about deadlines and amounts\n• Viewing analytics and conversation history\n\nWhat specific area interests you?",
      
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

  // Handle navigation
  const handleNavigation = (target) => {
    const pathInfo = websitePaths[target];
    if (pathInfo) {
      return `I can help you navigate to ${pathInfo.label}. In this demo, you would be taken to: ${pathInfo.path}`;
    }
    return "I'm not sure where that is. Try asking me to show navigation options!";
  };

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage = {
        id: 1,
        text: "Hello! I'm your advanced grant discovery assistant. I can help you find grants, check eligibility, understand requirements, and navigate the platform. What would you like to explore?",
        sender: 'bot',
        timestamp: new Date(),
        intent: 'greeting'
      };
      
      conversationManager.addMessage(welcomeMessage, false);
      setMessages([welcomeMessage]);
    }
  }, []);
  
  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + K to toggle chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle user message with advanced features
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    // Add user message to display
    setMessages(prev => [...prev, userMessage]);
    
    // Add to conversation manager
    conversationManager.addMessage(userMessage, true);
    
    const currentMessage = inputValue.trim();
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Use the API service for intelligent responses
      const response = await chatAPI.advancedQuery(currentMessage);
      const intent = analyzeIntent(currentMessage);
      
      let responseText = '';
      
      // Handle different intents
      if (intent.intent === 'show_analytics') {
        setShowAnalytics(true);
        responseText = 'Opening analytics dashboard...';
      } else if (intent.intent === 'show_history') {
        setShowHistory(true);
        responseText = 'Opening conversation history...';
      } else if (intent.intent === 'show_settings') {
        setShowSettings(true);
        responseText = 'Opening settings...';
      } else if (intent.intent === 'navigate') {
        responseText = handleNavigation(intent.target);
      } else {
        responseText = response.response || generateResponse(currentMessage, intent);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        intent: intent.intent,
        confidence: intent.confidence || 0.8,
        metadata: response.metadata
      };

      // Add bot message to display
      setMessages(prev => [...prev, botMessage]);
      
      // Add to conversation manager
      conversationManager.addMessage(botMessage, false);
      
    } catch (error) {
      console.error('Chat API error:', error);
      
      // Fallback to local response generation
      const intent = analyzeIntent(currentMessage);
      let responseText = '';
      
      if (intent.intent === 'show_analytics') {
        setShowAnalytics(true);
        responseText = 'Opening analytics dashboard...';
      } else if (intent.intent === 'show_history') {
        setShowHistory(true);
        responseText = 'Opening conversation history...';
      } else if (intent.intent === 'show_settings') {
        setShowSettings(true);
        responseText = 'Opening settings...';
      } else if (intent.intent === 'navigate') {
        responseText = handleNavigation(intent.target);
      } else {
        responseText = generateResponse(currentMessage, intent);
      }

      const botMessage = {
        id: Date.now() + 1,
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
        intent: intent.intent,
        confidence: intent.confidence || 0.8
      };
      
      setMessages(prev => [...prev, botMessage]);
      conversationManager.addMessage(botMessage, false);
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

  // Export conversation
  const exportConversation = (conversationId) => {
    const conversation = conversationManager.conversations.find(c => c.id === conversationId);
    if (conversation) {
      const dataStr = JSON.stringify(conversation, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `conversation_${conversationId}.json`;
      link.click();
      URL.revokeObjectURL(url);
    }
  };

  // Get analytics data
  const getAnalyticsData = () => {
    return conversationManager.getAnalytics();
  };

  // Search conversations
  const handleConversationSearch = (query) => {
    const results = conversationManager.searchConversations(query);
    setSearchResults(results);
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

  // Quick action suggestions (more concise)
  const quickActions = [
    "Find grants",
    "Check eligibility",
    "Show navigation"
  ];
  
  const advancedActions = [
    { key: 'analytics', label: 'Analytics', icon: '📊' },
    { key: 'history', label: 'History', icon: '📋' },
    { key: 'settings', label: 'Settings', icon: '⚙️' }
  ];

  return (
    <div className="chatbot-container">
      {/* Toggle Button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        title={isOpen ? 'Close chat (Ctrl+K)' : 'Open chat (Ctrl+K)'}
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
                <h3 id="chatbot-title">Grant Assistant Pro</h3>
                <div className="chatbot-status">
                  <span className="status-indicator"></span>
                  <span>Online</span>
                  <span className="pro-badge">Pro</span>
                </div>
              </div>
            </div>
            <div className="chatbot-header-controls">
              <button
                className="enterprise-control-btn"
                onClick={() => setShowAnalytics(!showAnalytics)}
                aria-label="Analytics"
                title="Analytics Dashboard"
              >
                📊
              </button>
              <button
                className="enterprise-control-btn"
                onClick={() => setShowHistory(!showHistory)}
                aria-label="Conversation History"
                title="Conversation History"
              >
                📋
              </button>
              <button
                className="enterprise-control-btn"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
                title="Settings"
              >
                ⚙️
              </button>
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
                <h4>Welcome to Grant Assistant Pro</h4>
                <p>Your intelligent grant discovery companion. I'm here to help you find funding opportunities, understand requirements, and navigate the platform with ease.</p>
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
                    {message.confidence && (
                      <span className="confidence-indicator">
                        {Math.round(message.confidence * 100)}%
                      </span>
                    )}
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
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about grants or navigation..."
                disabled={isLoading}
                className="chatbot-input"
                aria-label="Chat input"
                maxLength={500}
                autoComplete="off"
                spellCheck="true"
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
            
            {/* Advanced Controls */}
            <div className="enterprise-controls">
              <div className="enterprise-controls-label">Advanced:</div>
              <div className="enterprise-controls-list">
                {advancedActions.map((action) => (
                  <button
                    key={action.key}
                    className="enterprise-action-button"
                    onClick={() => {
                      const command = `Show ${action.label.toLowerCase()}`;
                      setInputValue(command);
                      setTimeout(() => handleSendMessage(), 100);
                    }}
                    disabled={isLoading}
                    aria-label={`Advanced: ${action.label}`}
                    title={action.label}
                  >
                    <span className="enterprise-action-icon">{action.icon}</span>
                    <span className="enterprise-action-label">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            {/* Analytics Panel */}
            {showAnalytics && (
              <div className="chatbot-analytics-panel">
                <div className="analytics-header">
                  <h4>Analytics</h4>
                  <button onClick={() => setShowAnalytics(false)}>×</button>
                </div>
                <div className="analytics-content">
                  {(() => {
                    const analytics = getAnalyticsData();
                    return (
                      <div className="analytics-metrics">
                        <div className="metric">
                          <span className="metric-label">Total Conversations:</span>
                          <span className="metric-value">{analytics.totalConversations}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Total Messages:</span>
                          <span className="metric-value">{analytics.totalMessages}</span>
                        </div>
                        <div className="metric">
                          <span className="metric-label">Avg Messages/Conversation:</span>
                          <span className="metric-value">{analytics.averageMessagesPerConversation}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            )}
            
            {/* History Panel */}
            {showHistory && (
              <div className="chatbot-history-panel">
                <div className="history-header">
                  <h4>History</h4>
                  <button onClick={() => setShowHistory(false)}>×</button>
                </div>
                <div className="history-content">
                  <div className="history-search">
                    <input
                      type="text"
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        handleConversationSearch(e.target.value);
                      }}
                      className="history-search-input"
                    />
                  </div>
                  <div className="history-list">
                    {conversationManager.conversations.slice(0, 5).map(conv => (
                      <div key={conv.id} className="history-item">
                        <div className="history-item-info">
                          <span className="history-item-title">{conv.title}</span>
                          <span className="history-item-date">
                            {new Date(conv.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <button
                          onClick={() => exportConversation(conv.id)}
                          className="history-export-btn"
                          aria-label="Export conversation"
                        >
                          📥
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {/* Settings Panel */}
            {showSettings && (
              <div className="chatbot-settings-panel">
                <div className="settings-header">
                  <h4>Settings</h4>
                  <button onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div className="settings-content">
                  <div className="setting-group">
                    <label>Conversation ID:</label>
                    <span className="conversation-id-display">{conversationId}</span>
                  </div>
                  <div className="setting-group">
                    <label>Total Conversations:</label>
                    <span className="stats-display">{conversationManager.conversations.length}</span>
                  </div>
                  <div className="setting-group">
                    <label>Auto-scroll:</label>
                    <input
                      type="checkbox"
                      defaultChecked={true}
                      onChange={(e) => {
                        // Auto-scroll is always enabled in this implementation
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;