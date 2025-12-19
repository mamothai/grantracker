import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import santaIcon from '../assets/santa.svg';

// Enhanced ChatBot Component - Direct Navigation Focus
const ChatBot = ({ 
  apiEndpoint = '/api/chat', 
  maxMessages = 100, 
  sessionTimeout = 30 * 60 * 1000, // 30 minutes
  languages = ['en', 'es', 'fr', 'de', 'hi'],
  defaultLanguage = 'en'
}) => {

  // State management
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(defaultLanguage);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [snowflakeCount] = useState(15); // For Christmas snowflakes

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const typingTimeoutRef = useRef(null);

  // Website navigation paths
  const websitePaths = {
    home: { path: '/', label: 'Home', icon: '🏠' },
    about: { path: '/about', label: 'About GrantTracker', icon: 'ℹ️' },
    dashboard: { path: '/chart', label: 'Analytics Dashboard', icon: '📊' },
    benefits: { path: '/benefits', label: 'Government Benefits', icon: '🏛️' },
    suggestions: { path: '/suggestions', label: 'Public Suggestions', icon: '💬' },
    creator: { path: '/creator-login', label: 'Creator Portal', icon: '✍️' },
    government: { path: '/gov-login', label: 'Government Dashboard', icon: '🏛️' },
    create: { path: '/create-grant', label: 'Create Grant', icon: '📝' },
    view: { path: '/view', label: 'Public View', icon: '👁️' }
  };

  // Initialize session
  useEffect(() => {
    const storedSession = localStorage.getItem('chatbot_session');
    if (storedSession) {
      try {
        const { sessionId: storedId, language: storedLang } = JSON.parse(storedSession);
        setSessionId(storedId);
        setLanguage(storedLang || defaultLanguage);
      } catch (e) {
        console.error('Error restoring session:', e);
      }
    } else {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setSessionId(newSessionId);
      localStorage.setItem('chatbot_session', JSON.stringify({
        sessionId: newSessionId,
        language: defaultLanguage,
        createdAt: Date.now()
      }));
    }

    // Load conversation history
    const history = localStorage.getItem(`chatbot_history_${sessionId}`);
    if (history) {
      try {
        const parsedHistory = JSON.parse(history);
        setMessages(parsedHistory);
      } catch (e) {
        console.error('Error loading conversation history:', e);
      }
    }
  }, [sessionId, defaultLanguage]);

  // Accessibility improvements
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setAccessibilityMode(true);
    }
  }, []);

  // Enhanced Natural Language Processing for Direct Navigation
  const analyzeIntent = useCallback((text) => {
    const normalized = text.toLowerCase().trim();
    const cleaned = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    
    // Direct navigation patterns
    if (/(home|landing|main page|start here|go home)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'home', confidence: 0.95 };
    }
    if (/(about|team|company|who are you|what is granttracker)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'about', confidence: 0.95 };
    }
    if (/(dashboard|analytics|chart|statistics|reports)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'dashboard', confidence: 0.9 };
    }
    if (/(benefits|schemes|government schemes|welfare)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'benefits', confidence: 0.9 };
    }
    if (/(suggestions|feedback|public|comment)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'suggestions', confidence: 0.9 };
    }
    if (/(creator|login|register|apply)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'creator', confidence: 0.85 };
    }
    if (/(government|official|admin|ministry)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'government', confidence: 0.85 };
    }
    if (/(create|new|submit)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'create', confidence: 0.85 };
    }
    if (/(view|public|see)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'view', confidence: 0.85 };
    }
    
    // Quick action patterns
    if (/(show me|navigate|go to|take me)/i.test(cleaned)) {
      return { intent: 'show_actions', confidence: 0.8 };
    }
    
    // Greetings
    if (/^(hello|hi|hey|greetings|good [morning|afternoon|evening]|howdy|yo|hey there|what's up|hi there)/i.test(cleaned)) {
      return { intent: 'greeting', confidence: 0.95 };
    }
    
    // Help
    if (/(help|support|assistance|trouble|issue|problem|how to|guide|walk me through|explain|need help)/i.test(cleaned)) {
      return { intent: 'help', confidence: 0.8 };
    }
    
    // Thank you
    if (/(thank|thanks|appreciate|great help|thank you|thanks a lot|much appreciated|you're helpful)/i.test(cleaned)) {
      return { intent: 'gratitude', confidence: 0.95 };
    }
    
    // Clear conversation
    if (/(clear|reset|start over|new conversation|empty|delete|remove)/i.test(cleaned)) {
      return { intent: 'clear', confidence: 0.9 };
    }
    
    return { intent: 'unknown', confidence: 0.1 };
  }, []);

  // Direct navigation handler
  const handleDirectNavigation = useCallback((target) => {
    const pathInfo = websitePaths[target];
    if (pathInfo) {
      navigate(pathInfo.path);
      
      // Add confirmation message
      const navMessage = {
        text: `Navigating to ${pathInfo.label}...`,
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      
      setMessages(prev => [...prev, navMessage]);
      
      // Close chat after navigation
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
      
      return true;
    }
    return false;
  }, [navigate, websitePaths]);

  // Generate response based on intent
  const generateResponse = useCallback(async (message, intent) => {
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      
      let response = '';
      
      switch (intent.intent) {
        case 'navigate':
          const navigationSuccess = handleDirectNavigation(intent.target);
          if (navigationSuccess) {
            response = `Taking you to ${websitePaths[intent.target].label}!`;
          } else {
            response = 'I couldn\'t find that section. Let me show you what\'s available.';
          }
          break;
          
        case 'show_actions':
          response = getQuickActionsResponse();
          setShowQuickActions(true);
          break;
          
        case 'greeting':
          response = getGreetingResponse(language);
          break;
          
        case 'help':
          response = getHelpResponse(language);
          break;
          
        case 'gratitude':
          response = getGratitudeResponse(language);
          break;
          
        case 'clear':
          setMessages([]);
          localStorage.removeItem(`chatbot_history_${sessionId}`);
          response = 'Conversation cleared! How can I help you navigate?';
          break;
          
        default:
          response = getFallbackResponse(language);
      }
      
      return {
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        metadata: {
          intent: intent.intent,
          confidence: intent.confidence
        }
      };
    } catch (err) {
      console.error('Error generating response:', err);
      return {
        text: getErrorResponse(language),
        sender: 'bot',
        timestamp: new Date().toISOString(),
        isError: true
      };
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [language, sessionId, handleDirectNavigation]);

  // Response generators
  const getQuickActionsResponse = () => {
    return `Here's what you can navigate to directly:\n\n${Object.values(websitePaths).map(path => 
      `${path.icon} **${path.label}**`
    ).join('\n\n')}\n\nJust tell me where you'd like to go!`;
  };

  const getGreetingResponse = (lang) => {
    const greetings = {
      en: 'Hello! 👋 I can help you navigate directly to any section of GrantTracker. Where would you like to go?',
      es: '¡Hola! 👋 Puedo ayudarte a navegar directamente a cualquier sección de GrantTracker. ¿A dónde te gustaría ir?',
      fr: 'Bonjour ! 👋 Je peux vous aider à naviguer directement vers n\'importe quelle section de GrantTracker. Où aimeriez-vous aller ?',
      de: 'Hallo! 👋 Ich kann Ihnen helfen, direkt zu jedem Bereich von GrantTracker zu navigieren. Wohin möchten Sie gehen?',
      hi: 'नमस्ते! 👋 मैं आपको GrantTracker के किसी भी अनुभाग पर सीधे नेविगेट करने में मदद कर सकता हूँ। आप कहाँ जाना चाहेंगे?'
    };
    return greetings[lang] || greetings.en;
  };

  const getHelpResponse = (lang) => {
    const responses = {
      en: 'I\'m your direct navigation assistant! Tell me where you want to go:\n\n🏠 **Home** - Main page\n📊 **Dashboard** - Analytics\n🏛️ **Benefits** - Government schemes\n💬 **Suggestions** - Public feedback\n✍️ **Creator** - Apply for grants\n🏛️ **Government** - Official portal\n\nJust say "show me" to see all options!',
      es: '¡Soy tu asistente de navegación directa! Dime a dónde quieres ir:\n\n🏠 **Inicio** - Página principal\n📊 **Panel** - Análisis\n🏛️ **Beneficios** - Esquemas gubernamentales\n💬 **Sugerencias** - Comentarios públicos\n✍️ **Creador** - Solicitar subvenciones\n🏛️ **Gobierno** - Portal oficial\n\n¡Solo di "muéstrame" para ver todas las opciones!'
    };
    return responses[lang] || responses.en;
  };

  const getGratitudeResponse = (lang) => {
    const responses = {
      en: 'You\'re welcome! 😊 Feel free to ask me to navigate anywhere on the site.',
      es: '¡De nada! 😊 No dudes en pedirme que navegue a cualquier lugar del sitio.',
      fr: 'Avec plaisir ! 😊 N\'hésitez pas à me demander de naviguer n\'importe où sur le site.',
      de: 'Gern geschehen! 😊 Fühlen Sie sich frei, mich zu bitten, irgendwo auf der Website zu navigieren.',
      hi: 'स्वागत है! 😊 बेझिझक साइट पर कहीं भी नेविगेट करने के लिए मुझसे कहें।'
    };
    return responses[lang] || responses.en;
  };

  const getFallbackResponse = (lang) => {
    const responses = {
      en: 'I didn\'t quite catch that. I can help you navigate to any section of GrantTracker. Try saying "show me" to see all available sections!',
      es: 'No entendí bien eso. Puedo ayudarte a navegar a cualquier sección de GrantTracker. ¡Intenta decir "muéstrame" para ver todas las secciones disponibles!',
      fr: 'Je n\'ai pas bien compris cela. Je peux vous aider à naviguer vers n\'importe quelle section de GrantTracker. Essayez de dire "montrez-moi" pour voir toutes les sections disponibles!',
      de: 'Das habe ich nicht ganz verstanden. Ich kann Ihnen helfen, zu jedem Bereich von GrantTracker zu navigieren. Versuchen Sie "zeigen Sie mir" zu sagen, um alle verfügbaren Bereiche zu sehen!',
      hi: 'मुझे वो बात समझ नहीं आई। मैं आपको GrantTracker के किसी भी सेक्शन पर नेविगेट करने में मदद कर सकता हूँ। सभी उपलब्ध सेक्शन देखने के लिए "दिखाओ" कहने की कोशिश करें!'
    };
    return responses[lang] || responses.en;
  };

  const getErrorResponse = (lang) => {
    const responses = {
      en: 'Sorry, I encountered an error. Please try again.',
      es: 'Lo siento, ocurrió un error. Por favor, inténtalo de nuevo.',
      fr: 'Désolé, une erreur s\'est produite. Veuillez réessayer.',
      de: 'Entschuldigung, ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      hi: 'माफ कीजिए, एक त्रुटि हुई। कृपया पुन: प्रयास करें।'
    };
    return responses[lang] || responses.en;
  };

  // Handle user message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    setError(null);
    
    // Analyze intent and generate response
    const intent = analyzeIntent(userMessage.text);
    const botResponse = await generateResponse(userMessage.text, intent);
    
    setMessages(prev => [...prev, botResponse]);
    
    // Store in localStorage
    try {
      localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify([...updatedMessages, botResponse]));
    } catch (e) {
      console.error('Storage error:', e);
    }
  }, [inputValue, messages, isLoading, sessionId, analyzeIntent, generateResponse]);

  // Handle language change
  const handleLanguageChange = useCallback((lang) => {
    setLanguage(lang);
    localStorage.setItem('chatbot_session', JSON.stringify({
      sessionId,
      language: lang,
      createdAt: Date.now()
    }));
  }, [sessionId]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: accessibilityMode ? 'auto' : 'smooth' });
    }
  }, [messages, isLoading, isTyping, accessibilityMode]);

  // Handle quick action clicks
  const handleQuickAction = useCallback((target) => {
    handleDirectNavigation(target);
    setShowQuickActions(false);
  }, [handleDirectNavigation]);

  // Render message content
  const renderMessageContent = (message) => {
    if (message.isError) {
      return (
        <div className="chatbot-message-error">
          <span className="chatbot-icon">⚠️</span>
          <span>{message.text}</span>
        </div>
      );
    }
    
    return (
      <div className="chatbot-message-content">
        {message.text.split('\n').map((line, i) => {
          // Handle bold text formatting
          if (line.includes('**')) {
            const parts = line.split('**');
            return (
              <p key={i}>
                {parts.map((part, j) => 
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            );
          }
          return <p key={i}>{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'chatbot-open' : ''} ${accessibilityMode ? 'accessibility-mode' : ''}`}>

      {/* Enhanced Chat Toggle Button with Improved Santa Icon */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        role="button"
      >
        <div className="chatbot-toggle-santa-container">
          <img 
            src={santaIcon} 
            alt="Chat Assistant" 
            className="chatbot-toggle-santa-icon"
            width="24" 
            height="24"
          />
          <div className="chatbot-toggle-sparkles">
            <span className="sparkle sparkle-1">✨</span>
            <span className="sparkle sparkle-2">⭐</span>
            <span className="sparkle sparkle-3">✨</span>
          </div>
        </div>
        <span className="chatbot-toggle-text">{isOpen ? 'Close' : 'Chat'}</span>
      </button>

      {/* Enhanced Chat Window */}
      <div className="chatbot-window" ref={chatContainerRef}>

        {/* Christmas-themed Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <div className="chatbot-header-santa-container">
              <img 
                src={santaIcon} 
                alt="GrantTracker Assistant" 
                className="chatbot-header-santa-icon"
                width="28" 
                height="28"
              />
              <div className="chatbot-header-lights">
                <span className="light light-1">🎄</span>
                <span className="light light-2">✨</span>
                <span className="light light-3">🎁</span>
              </div>
            </div>
            <h3>🎅 GrantTracker Assistant</h3>
          </div>
          <div className="chatbot-header-controls">
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="chatbot-language-selector"
              aria-label="Select language"
            >
              {languages.map(lang => (
                <option key={lang} value={lang}>{getLanguageName(lang)}</option>
              ))}
            </select>
            <button
              onClick={() => setIsOpen(false)}
              className="chatbot-close"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>


        {/* Christmas Snowflakes Animation */}
        <div className="chatbot-snowflakes">
          {Array.from({ length: snowflakeCount }, (_, i) => (
            <div
              key={i}
              className={`snowflake snowflake-${i + 1}`}
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            >
              ❄
            </div>
          ))}
        </div>

        {/* Messages Container */}
        <div className="chatbot-messages">
          {messages.length === 0 && !isLoading && (
            <div className="chatbot-empty-state">
              <img 
                src={santaIcon} 
                alt="Welcome" 
                className="chatbot-empty-icon"
                width="56" 
                height="56"
              />
              <h4>🎄 Welcome to GrantTracker Assistant</h4>
              <p>Ho ho ho! I'm here to help you navigate directly to any section!</p>
              <div className="chatbot-empty-message">
                Just type where you'd like to go, like "show me dashboard" or "take me to benefits"
              </div>
            </div>
          )}

          {messages.map((message, index) => (
            <div
              key={index}
              className={`chatbot-message ${message.sender}`}
              data-sender={message.sender}
            >

              <div className="chatbot-avatar">
                {message.sender === 'user' ? (
                  <div className="user-avatar">👤</div>
                ) : (
                  <div className="santa-avatar">
                    <img src={santaIcon} alt="Santa Bot" width="24" height="24" />
                    <div className="santa-hat">🎅</div>
                  </div>
                )}
              </div>
              <div className="chatbot-message-bubble">
                {renderMessageContent(message)}
              </div>
              <div className="chatbot-message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}


          {(isLoading || isTyping) && (
            <div className="chatbot-message bot">
              <div className="chatbot-avatar">
                <div className="santa-avatar">
                  <img src={santaIcon} alt="Santa typing" width="24" height="24" />
                  <div className="santa-hat">🎅</div>
                </div>
              </div>
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

        {/* Quick Actions Panel */}
        {showQuickActions && (
          <div className="chatbot-quick-actions-panel">
            <div className="chatbot-quick-actions-header">
              <span>Quick Navigation</span>
              <button 
                onClick={() => setShowQuickActions(false)}
                className="chatbot-close-quick"
              >
                ×
              </button>
            </div>
            <div className="chatbot-quick-actions-grid">
              {Object.entries(websitePaths).map(([key, path]) => (
                <button
                  key={key}
                  className="chatbot-quick-action-grid-item"
                  onClick={() => handleQuickAction(key)}
                >
                  <span className="chatbot-quick-action-icon">{path.icon}</span>
                  <span className="chatbot-quick-action-label">{path.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="chatbot-input-area">
          {error && (
            <div className="chatbot-error-message" role="alert">
              {error}
              <button onClick={() => setError(null)} className="chatbot-error-close" aria-label="Close error">×</button>
            </div>
          )}

          <div className="chatbot-input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Where would you like to go? (e.g., 'show me dashboard')"
              disabled={isLoading}
              aria-label="Chat input"
              className="chatbot-input"
              maxLength={500}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="chatbot-send-button"
              aria-label="Send message"
            >
              {isLoading ? '...' : 'Go'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function for language names
const getLanguageName = (code) => {
  const names = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    hi: 'हिन्दी'
  };
  return names[code] || code;
};

// Prop types
ChatBot.propTypes = {
  apiEndpoint: PropTypes.string,
  maxMessages: PropTypes.number,
  sessionTimeout: PropTypes.number,
  languages: PropTypes.arrayOf(PropTypes.string),
  defaultLanguage: PropTypes.string
};

// Default props
ChatBot.defaultProps = {
  apiEndpoint: '/api/chat',
  maxMessages: 100,
  sessionTimeout: 30 * 60 * 1000,
  languages: ['en', 'es', 'fr', 'de', 'hi'],
  defaultLanguage: 'en'
};

export default ChatBot;