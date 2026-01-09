import { useState, useEffect, useRef } from 'react';
import { chatAPI, askOpenAI } from '../services/apiService.js';
// Santa image removed
import './ChatBot.css';

import { useNavigate } from 'react-router-dom';

// Ultimate ChatBot with all advanced features
const ChatBot = () => {
  // Navigation hook
  const navigate = useNavigate();
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
  const [language, setLanguage] = useState('en');
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [particles, setParticles] = useState([]);
  const [confetti, setConfetti] = useState([]);
  // Shooting star state
  const [shootingStar, setShootingStar] = useState({
    key: 0,
    active: false,
    left: 0,
    top: 0,
    angle: 0
  });
  // Shooting star effect for holiday mode
  useEffect(() => {
    let timeoutId;
    function launchShootingStar() {
      // Randomize start/end positions and angle
      const left = Math.random() * 60 + 20; // 20vw to 80vw
      const top = Math.random() * 20 + 5; // 5vh to 25vh
      const angle = Math.random() * 30 - 15; // -15deg to +15deg
      setShootingStar({
        key: Date.now(),
        active: true,
        left,
        top,
        angle
      });
      // Hide after animation duration
      setTimeout(() => setShootingStar(s => ({ ...s, active: false })), 1800);
      // Schedule next shooting star
      timeoutId = setTimeout(launchShootingStar, 3500 + Math.random() * 4000);
    }
    if (isHolidayMode) {
      launchShootingStar();
    } else {
      setShootingStar(s => ({ ...s, active: false }));
    }
    return () => clearTimeout(timeoutId);
  }, [isHolidayMode]);
  // Shooting star state
  const [shootingStar, setShootingStar] = useState({
    key: 0,
    active: false,
    left: 0,
    top: 0,
    angle: 0
  });
    // Shooting star effect for holiday mode
    useEffect(() => {
      let timeoutId;
      function launchShootingStar() {
        // Randomize start/end positions and angle
        const left = Math.random() * 60 + 20; // 20vw to 80vw
        const top = Math.random() * 20 + 5; // 5vh to 25vh
        const angle = Math.random() * 30 - 15; // -15deg to +15deg
        setShootingStar({
          key: Date.now(),
          active: true,
          left,
          top,
          angle
        });
        // Hide after animation duration
        setTimeout(() => setShootingStar(s => ({ ...s, active: false })), 1800);
        // Schedule next shooting star
        timeoutId = setTimeout(launchShootingStar, 3500 + Math.random() * 4000);
      }
      if (isHolidayMode) {
        launchShootingStar();
      } else {
        setShootingStar(s => ({ ...s, active: false }));
      }
      return () => clearTimeout(timeoutId);
    }, [isHolidayMode]);
  const particleIntervalRef = useRef(null);
  const confettiIntervalRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  // Multi-language support
  const translations = {
    en: {
      welcome: "Hello! I'm your advanced grant discovery assistant. I can help you find grants, check eligibility, understand requirements, and navigate the platform. What would you like to explore?",
      help: "I can help you with:\n\n• Finding grants and funding opportunities\n• Checking eligibility requirements\n• Understanding application processes\n• Navigating to different sections\n• Information about deadlines and amounts\n\nWhat specific area interests you?",
      greeting: "Hello! I'm your advanced grant discovery assistant. I can help you find grants, check eligibility, understand requirements, and navigate the platform. What would you like to explore?",
      analytics: "Analytics",
      history: "History", 
      settings: "Settings",
      holidayMode: "Holiday Mode"
    },
    es: {
      welcome: "¡Hola! Soy tu asistente avanzado de descubrimiento de subvenciones. Puedo ayudarte a encontrar subvenciones, verificar elegibilidad, entender requisitos y navegar por la plataforma. ¿Qué te gustaría explorar?",
      help: "Puedo ayudarte con:\n\n• Encontrar subvenciones y oportunidades de financiación\n• Verificar requisitos de elegibilidad\n• Entender procesos de aplicación\n• Navegar por diferentes secciones\n• Información sobre fechas límite y cantidades\n\n¿Qué área específica te interesa?",
      greeting: "¡Hola! Soy tu asistente avanzado de descubrimiento de subvenciones. ¿En qué puedo ayudarte hoy?",
      analytics: "Analíticas",
      history: "Historial",
      settings: "Configuración", 
      holidayMode: "Modo Festivo"
    },
    fr: {
      welcome: "Bonjour! Je suis votre assistant avancé de découverte de subventions. Je peux vous aider à trouver des subventions, vérifier l'éligibilité, comprendre les exigences et naviguer sur la plateforme. Que souhaitez-vous explorer?",
      help: "Je peux vous aider avec:\n\n• Trouver des subventions et opportunités de financement\n• Vérifier les critères d'éligibilité\n• Comprendre les processus de candidature\n• Naviguer vers différentes sections\n• Informations sur les délais et les montants\n\nQuel domaine spécifique vous intéresse?",
      greeting: "Bonjour! Je suis votre assistant avancé de découverte de subvenciones. Comment puis-je vous aider aujourd'hui?",
      analytics: "Analytique",
      history: "Historique",
      settings: "Paramètres",
      holidayMode: "Mode Vacances"
    }
  };
  
  // Simple conversation manager
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
      
      return {
        totalConversations,
        totalMessages,
        averageMessagesPerConversation: averageMessages,
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

  // Enhanced intent recognition with improved patterns
  const analyzeIntent = (text) => {
    const query = text.toLowerCase();
    
    // Holiday mode detection first
    if (/(santa|christmas|holiday|festive)/i.test(query)) {
      return { intent: 'holiday_mode', confidence: 0.98 };
    }
    
    // Special "Ho" handling for progressive typing
    if (/^ho\b/i.test(query.trim())) {
      return { intent: 'ho_greeting', confidence: 0.98 };
    }
    
    // Enhanced greeting detection
    if (/(hello|hi|hey|hola|bonjour|good morning|good afternoon|good evening|howdy|whats up)/i.test(query)) {
      if (query.includes('hola')) {
        return { intent: 'greeting_spanish', confidence: 0.95 };
      }
      if (query.includes('bonjour')) {
        return { intent: 'greeting_french', confidence: 0.95 };
      }
      if (query.includes('morning')) {
        return { intent: 'greeting_morning', confidence: 0.95 };
      }
      if (query.includes('afternoon')) {
        return { intent: 'greeting_afternoon', confidence: 0.95 };
      }
      if (query.includes('evening')) {
        return { intent: 'greeting_evening', confidence: 0.95 };
      }
      return { intent: 'greeting', confidence: 0.95 };
    }
    
    // Enhanced occupation detection with more patterns
    const occupations = detectOccupation(query);
    if (occupations.length > 0) {
      return { intent: 'occupation_grants', occupations, confidence: 0.9 };
    }
    
    // "I am" / "I'm" / "I work as" patterns
    if (/(i am|i'm|i work as|my profession|my job|doing|farmer|doctor|teacher|engineer|student)/i.test(query)) {
      const occupations = detectOccupation(query);
      if (occupations.length > 0) {
        return { intent: 'occupation_grants', occupations, confidence: 0.92 };
      }
      return { intent: 'occupation_inquiry', confidence: 0.8 };
    }
    
    // Grant search intent
    if (/(find|search|look for|browse|show me|what.*grant|which.*grant)/i.test(query)) {
      return { intent: 'grant_search', confidence: 0.9 };
    }
    
    // Amount/Funding specific queries
    if (/(how much|money|cost|funding|financial|budget|investment)/i.test(query)) {
      return { intent: 'funding_amount', confidence: 0.85 };
    }
    
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
    
    // Language switching
    if (/(english|en)/i.test(query)) {
      return { intent: 'switch_language', lang: 'en', confidence: 0.9 };
    }
    if (/(spanish|espanol|es)/i.test(query)) {
      return { intent: 'switch_language', lang: 'es', confidence: 0.9 };
    }
    if (/(french|francais|fr)/i.test(query)) {
      return { intent: 'switch_language', lang: 'fr', confidence: 0.9 };
    }
    
    // General intents
    if (/(help|support)/i.test(query)) {
      return { intent: 'help', confidence: 0.9 };
    }
    if (/(thank|thanks)/i.test(query)) {
      return { intent: 'gratitude', confidence: 0.9 };
    }
    if (/(show|navigate|go to|take me)/i.test(query)) {
      return { intent: 'navigation', confidence: 0.8 };
    }
    
    // Website info intents
    if (/(website|app|what is|contact|support)/i.test(query)) {
      return { intent: 'website_info', confidence: 0.8 };
    }

    return { intent: 'unknown', confidence: 0.1 };
  };

  // Enhanced response generation with intelligent, contextual responses
  const generateResponse = (query, intent) => {
    const t = translations[language] || translations.en;
    const currentHour = new Date().getHours();
    
    const responses = {
      greeting: () => {
        let timeGreeting = "Hello!";
        if (currentHour < 12) timeGreeting = "Good morning!";
        else if (currentHour < 17) timeGreeting = "Good afternoon!";
        else if (currentHour < 22) timeGreeting = "Good evening!";
        return `${timeGreeting} I'm your intelligent grant discovery assistant!`;
      },
      greeting_morning: "Good morning! ☀️ I'm here to help you discover grant opportunities.",
      greeting_afternoon: "Good afternoon! 🌟 How can I assist you with grants today?",
      greeting_evening: "Good evening! 🌙 What grants are you interested in?",
      greeting_spanish: "¡Hola! Soy tu asistente de subvenciones. ¿En qué puedo ayudarte?",
      greeting_french: "Bonjour! Je suis votre assistant de subventions. Comment puis-je vous aider?",
      ho_greeting: "🎅 Ho ho ho! Santa here to help you find grants! 🎄",
      holiday_mode: "🎅 Ho ho ho! Santa here to help you find grants! 🎄",
      gratitude: "You're welcome!",
      help: "I can help you find grants, check eligibility, and navigate the platform.",
      grant_info: "Grants are funding opportunities from government and private sources.",
      occupation_grants: (intentData) => `Found grants for your occupation!`,
      occupation_inquiry: "What field do you work in? I can find relevant grants.",
      grant_search: "What type of grants are you looking for?",
      funding_amount: "Grant amounts vary widely - from $1,000 to $1M+.",
      eligibility: "Eligibility depends on the specific grant requirements.",
      navigation: "I can help you navigate to different sections.",
      website_info: "GranTracker helps you find government grants.",
      show_actions: "Here are some actions you can take:",
      unknown: "I'm not sure what you mean. Try asking about grants!"
    };
    
    const response = responses[intent.intent];
    return typeof response === 'function' ? response(intent) : response || responses.unknown;
  };

  // --- Main send handler: uses OpenAI if enabled, else local logic ---
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
      let welcomeText;
      
      // Check if it's holiday season or use language-specific greeting
      if (isHolidayMode) {
        welcomeText = "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄";
      } else {
        const t = translations[language] || translations.en;
        welcomeText = t.welcome;
      }
      
      const welcomeMessage = {
        id: 1,
        text: welcomeText,
        sender: 'bot',
        timestamp: new Date(),
        intent: 'greeting'
      };
      
      conversationManager.addMessage(welcomeMessage, false);
      setMessages([welcomeMessage]);
    }
  }, [language, isHolidayMode]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [isOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
      
      // Handle different intents - Updated to use intelligent responses
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
      } else if (intent.intent === 'switch_language') {
        setLanguage(intent.lang);
        responseText = `Language switched to ${intent.lang}. ${generateResponse(currentMessage, { intent: 'greeting' })}`;
      } else if (intent.intent === 'holiday_mode') {
        setIsHolidayMode(true);
        responseText = "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄";
      } else if (intent.intent === 'ho_greeting') {
        setIsHolidayMode(true);
        responseText = "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄";
      } else if (intent.intent === 'greeting_morning') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_afternoon') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_evening') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_spanish') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_french') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'occupation_grants') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'occupation_inquiry') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'grant_search') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'funding_amount') {
        responseText = generateResponse(currentMessage, intent);
      } else {
        responseText = response.response || generateResponse(currentMessage, intent);
      }

      // Handle navigation from response
      if (response.navigationPath) {
        setTimeout(() => {
          navigate(response.navigationPath);
        }, 1500);
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
      } else if (intent.intent === 'navigation') {
        if (currentMessage.toLowerCase().includes('home')) {
           responseText = "Navigating you to the Home page.";
           setTimeout(() => navigate('/'), 1500);
        } else if (currentMessage.toLowerCase().includes('about')) {
           responseText = "Taking you to the About Us page.";
           setTimeout(() => navigate('/about'), 1500);
        } else if (currentMessage.toLowerCase().includes('creator') || currentMessage.toLowerCase().includes('login')) {
           responseText = "Redirecting you to the Creator Login page.";
           setTimeout(() => navigate('/creator-login'), 1500);
        } else if (currentMessage.toLowerCase().includes('gov') || currentMessage.toLowerCase().includes('dashboard')) {
           responseText = "Taking you to the Government Dashboard login.";
           setTimeout(() => navigate('/gov-login'), 1500);
        } else if (currentMessage.toLowerCase().includes('suggestion')) {
           responseText = "Opening the Suggestion Box for you.";
           setTimeout(() => navigate('/suggestion-box'), 1500);
        } else if (currentMessage.toLowerCase().includes('public') || currentMessage.toLowerCase().includes('view')) {
           responseText = "Taking you to the Public View where you can see all grants.";
           setTimeout(() => navigate('/public-view'), 1500);
        } else {
           responseText = generateResponse(currentMessage, intent);
        }
      } else if (intent.intent === 'switch_language') {
        setLanguage(intent.lang);
        responseText = `Language switched to ${intent.lang}. ${generateResponse(currentMessage, { intent: 'greeting' })}`;
      } else if (intent.intent === 'holiday_mode') {
        setIsHolidayMode(true);
        responseText = "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄";
      } else if (intent.intent === 'ho_greeting') {
        setIsHolidayMode(true);
        responseText = "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄";
      } else if (intent.intent === 'greeting_morning') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_afternoon') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_evening') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_spanish') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'greeting_french') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'occupation_grants') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'occupation_inquiry') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'grant_search') {
        responseText = generateResponse(currentMessage, intent);
      } else if (intent.intent === 'funding_amount') {
        responseText = generateResponse(currentMessage, intent);
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

  // Enhanced occupation-based grant suggestions with more occupations and detailed grants
  const occupationGrants = {
    // Healthcare & Medical
    'doctor': ['NIH SBIR Grants', 'Healthcare Innovation Grants', 'Medical Research Grants', 'WHO Health Grants', 'CDC Public Health Grants'],
    'nurse': ['Healthcare Workforce Grants', 'Nursing Education Grants', 'Public Health Grants', 'Hospital Innovation Grants'],
    'researcher': ['NSF Research Grants', 'NIH Research Grants', 'University Research Grants', 'Scientific Collaboration Grants'],
    'scientist': ['NSF Grants', 'DOE Research Grants', 'Scientific Research Grants', 'Lab Equipment Grants'],
    'dentist': ['Dental Health Grants', 'Oral Health Research Grants', 'Community Health Grants'],
    'pharmacist': ['Pharmaceutical Research Grants', 'Healthcare Innovation Grants', 'Public Health Grants'],
    'psychologist': ['Mental Health Grants', 'Behavioral Research Grants', 'Healthcare Innovation Grants'],
    
    // Technology & Engineering
    'engineer': ['SBIR Technology Grants', 'Innovation Grants', 'STEM Education Grants', 'Technology Transfer Grants'],
    'programmer': ['Tech Startup Grants', 'Software Development Grants', 'Digital Innovation Grants', 'AI Development Grants'],
    'developer': ['Technology Grants', 'App Development Grants', 'Tech Innovation Grants', 'Platform Development Grants'],
    'entrepreneur': ['Small Business Grants', 'Startup Funding', 'Business Innovation Grants', 'Angel Investment Grants'],
    'architect': ['Design Innovation Grants', 'Sustainable Architecture Grants', 'Urban Planning Grants'],
    'data scientist': ['Data Analytics Grants', 'AI Research Grants', 'Machine Learning Innovation Grants'],
    
    // Education
    'teacher': ['Education Grants', 'STEM Education Grants', 'Teacher Professional Development', 'Classroom Innovation Grants'],
    'professor': ['Academic Research Grants', 'University Grants', 'Faculty Development Grants', 'Research Collaboration Grants'],
    'student': ['Student Grants', 'Graduate Research Grants', 'Educational Scholarships', 'Study Abroad Grants'],
    'educator': ['Educational Innovation Grants', 'Curriculum Development Grants', 'Teaching Excellence Grants'],
    'librarian': ['Digital Library Grants', 'Community Education Grants', 'Information Access Grants'],
    
    // Arts & Creative
    'artist': ['Arts Grants', 'Creative Projects Grants', 'Cultural Funding', 'Individual Artist Grants'],
    'musician': ['Arts Grants', 'Music Production Grants', 'Cultural Grants', 'Performance Grants'],
    'writer': ['Literature Grants', 'Writing Fellowships', 'Creative Writing Grants', 'Publishing Support Grants'],
    'designer': ['Design Grants', 'Creative Industry Grants', 'Innovation Design Grants', 'UX/UI Development Grants'],
    'photographer': ['Visual Arts Grants', 'Cultural Documentation Grants', 'Artistic Innovation Grants'],
    'filmmaker': ['Film Production Grants', 'Documentary Grants', 'Media Arts Grants'],
    
    // Business & Finance
    'consultant': ['Business Development Grants', 'Consulting Grants', 'Professional Services Grants', 'Strategy Innovation Grants'],
    'manager': ['Leadership Grants', 'Management Development Grants', 'Business Training Grants', 'Executive Education Grants'],
    'analyst': ['Data Analytics Grants', 'Research Grants', 'Financial Research Grants', 'Market Analysis Grants'],
    'accountant': ['Accounting Technology Grants', 'Financial Education Grants', 'Business Process Grants'],
    'marketing': ['Digital Marketing Grants', 'Brand Development Grants', 'Market Research Grants'],
    'sales': ['Sales Training Grants', 'Customer Experience Grants', 'Business Development Grants'],
    
    // Environment & Energy
    'environmentalist': ['Environmental Grants', 'Sustainability Grants', 'Green Technology Grants', 'Climate Research Grants'],
    'farmer': ['Agricultural Grants', 'Farm Innovation Grants', 'Sustainable Farming Grants', 'Rural Development Grants'],
    'agriculturist': ['Agriculture Research Grants', 'Food Security Grants', 'Rural Innovation Grants'],
    'biologist': ['Wildlife Conservation Grants', 'Ecology Research Grants', 'Biodiversity Grants'],
    'geologist': ['Earth Science Grants', 'Mining Research Grants', 'Environmental Monitoring Grants'],
    
    // Social Services & Non-Profit
    'social worker': ['Social Services Grants', 'Community Development Grants', 'Human Services Grants'],
    'counselor': ['Mental Health Grants', 'Community Support Grants', ''],
    'nonprofit': ['FoundationTherapeutic Program Grants Grants', 'Community Development Grants', 'Social Impact Grants'],
    'volunteer': ['Community Service Grants', 'Volunteer Program Grants', 'Social Innovation Grants'],
    
    // Legal & Government
    'lawyer': ['Legal Aid Grants', 'Justice System Grants', 'Public Interest Law Grants'],
    'judge': ['Court Innovation Grants', 'Justice Technology Grants', 'Legal System Improvement Grants'],
    
    // Trades & Manufacturing
    'mechanic': ['Automotive Technology Grants', 'Skills Development Grants', 'Trade Innovation Grants'],
    'electrician': ['Energy Efficiency Grants', 'Smart Grid Technology Grants', 'Electrical Safety Grants'],
    'plumber': ['Water Conservation Grants', 'Infrastructure Grants', 'Green Building Grants'],
    'carpenter': ['Construction Innovation Grants', 'Sustainable Building Grants', 'Housing Development Grants']
  };

  // Enhanced occupation detection with more patterns
  const detectOccupation = (text) => {
    const lowerText = text.toLowerCase();
    const detectedOccupations = [];
    
    // Direct occupation matches
    for (const [occupation, grants] of Object.entries(occupationGrants)) {
      if (lowerText.includes(occupation)) {
        detectedOccupations.push({ occupation, grants });
      }
    }
    
    // Pattern-based detection
    const occupationPatterns = {
      'doctor': [/medical doctor|physician|md|general practitioner|gp/i],
      'nurse': [/registered nurse|rn|nursing|healthcare worker/i],
      'teacher': [/educator|instructor|professor|lecturer|academician/i],
      'student': [/undergraduate|graduate student|phd candidate|research student/i],
      'engineer': [/software engineer|mechanical engineer|civil engineer|electrical engineer/i],
      'programmer': [/coder|software developer|software engineer|web developer/i],
      'farmer': [/agriculture|farming|rancher|crop|livestock/i],
      'artist': [/painter|sculptor|visual artist|creative professional/i],
      'musician': [/composer|performer|music producer|singer/i],
      'writer': [/author|novelist|journalist|content writer/i],
      'lawyer': [/attorney|legal counsel|law professional|legal advisor/i],
      'consultant': [/business consultant|advisor|specialist|expert/i]
    };
    
    for (const [occupation, patterns] of Object.entries(occupationPatterns)) {
      if (patterns.some(pattern => pattern.test(lowerText)) && !detectedOccupations.find(o => o.occupation === occupation)) {
        detectedOccupations.push({ occupation, grants: occupationGrants[occupation] });
      }
    }
    
    return detectedOccupations;
  };

  // Particle System for Holiday Mode
  const createParticle = () => {
    const holidayEmojis = ['🎄', '⭐', '✨', '🎅', '🎁', '❄️', '🔔', '🕯️'];
    return {
      id: Date.now() + Math.random(),
      emoji: holidayEmojis[Math.floor(Math.random() * holidayEmojis.length)],
      x: Math.random() * window.innerWidth,
      y: -10,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.7 + 0.3
    };
  };

  const createConfetti = () => {
    const colors = ['#dc2626', '#f59e0b', '#16a34a', '#3b82f6', '#8b5cf6', '#ec4899'];
    return {
      id: Date.now() + Math.random(),
      x: Math.random() * window.innerWidth,
      y: -10,
      color: colors[Math.floor(Math.random() * colors.length)],
      size: Math.random() * 8 + 4,
      speed: Math.random() * 3 + 2,
      rotation: Math.random() * 360
    };
  };

  const startParticleSystem = () => {
    if (particleIntervalRef.current) clearInterval(particleIntervalRef.current);
    
    particleIntervalRef.current = setInterval(() => {
      setParticles(prev => {
        const newParticles = [...prev, createParticle()];
        // Keep only last 50 particles
        return newParticles.slice(-50);
      });
    }, 300);
  };

  const startConfettiSystem = () => {
    if (confettiIntervalRef.current) clearInterval(confettiIntervalRef.current);
    
    confettiIntervalRef.current = setInterval(() => {
      setConfetti(prev => {
        const newConfetti = [...prev, createConfetti()];
        // Keep only last 30 confetti pieces
        return newConfetti.slice(-30);
      });
    }, 200);
  };

  const stopParticleSystem = () => {
    if (particleIntervalRef.current) {
      clearInterval(particleIntervalRef.current);
      particleIntervalRef.current = null;
    }
    setParticles([]);
  };

  const stopConfettiSystem = () => {
    if (confettiIntervalRef.current) {
      clearInterval(confettiIntervalRef.current);
      confettiIntervalRef.current = null;
    }
    setConfetti([]);
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopParticleSystem();
      stopConfettiSystem();
    };
  }, []);

  // Handle holiday mode toggle effects
  useEffect(() => {
    if (isHolidayMode) {
      startParticleSystem();
      // Add confetti burst when entering holiday mode
      setConfetti(Array.from({ length: 20 }, () => createConfetti()));
      setTimeout(() => stopConfettiSystem(), 3000);
      
      // Add visual celebration effect
      setTimeout(() => {
        const celebrationElements = document.querySelectorAll('.chatbot-container');
        celebrationElements.forEach(el => {
          el.style.animation = 'holidayCelebration 1s ease-in-out';
          setTimeout(() => {
            el.style.animation = '';
          }, 1000);
        });
      }, 100);
    } else {
      stopParticleSystem();
      stopConfettiSystem();
    }
  }, [isHolidayMode]);

  // Progressive typing effect
  const [typingText, setTypingText] = useState('');
  const [isTypingEffect, setIsTypingEffect] = useState(false);

  const typeText = (text, delay = 50) => {
    setIsTypingEffect(true);
    setTypingText('');
    
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < text.length) {
        setTypingText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        setIsTypingEffect(false);
      }
    }, delay);
  };

  // Quick action suggestions
  const quickActions = [
    "Find grants",
    "Check eligibility", 
    "Show navigation"
  ];

  return (
    <div className={`chatbot-container ${isHolidayMode ? 'holiday-mode' : ''}`}>
      {/* Realistic Shooting Star Animation */}
      {isHolidayMode && shootingStar.active && (
        <div
          key={shootingStar.key}
          className="shooting-star-real"
          style={{
            left: `${shootingStar.left}vw`,
            top: `${shootingStar.top}vh`,
            '--angle': `${shootingStar.angle}deg`
          }}
        />
      )}
      {/* Holiday Mode Overlay */}
      {isHolidayMode && (
        <div className="holiday-overlay">
          <div className="santa-image">🎅</div>
          <div className="snow-animation">
            <div className="snow-layer-1"></div>
          </div>
          {/* Shooting Star */}
          {shootingStar.active && (
            <div
              key={shootingStar.key}
              className="shooting-star-real"
              style={{
                left: `${shootingStar.left}vw`,
                top: `${shootingStar.top}vh`,
                transform: `rotate(${shootingStar.angle}deg)`
              }}
            />
          )}
          {/* Particle System */}
          <div className="particle-system">
            {particles.map(particle => (
              <div
                key={particle.id}
                className="particle"
                style={{
                  left: `${particle.x}px`,
                  animationDuration: `${6 + Math.random() * 4}s`,
                  opacity: particle.opacity
                }}
              >
                {particle.emoji}
              </div>
            ))}
          </div>
          {/* Confetti System */}
          <div className="confetti-container">
            {confetti.map(piece => (
              <div
                key={piece.id}
                className="confetti"
                style={{
                  left: `${piece.x}px`,
                  backgroundColor: piece.color,
                  width: `${piece.size}px`,
                  height: `${piece.size}px`,
                  animationDuration: `${3 + Math.random() * 2}s`,
                  transform: `rotate(${piece.rotation}deg)`
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <button
        className={`chatbot-toggle ${isHolidayMode ? 'holiday-toggle' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        title={isOpen ? 'Close chat (Ctrl+K)' : 'Open chat (Ctrl+K)'}
      >
        {isOpen ? '×' : isHolidayMode ? '🎅' : '💬'}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window" role="dialog" aria-labelledby="chatbot-title">
          {/* Header */}
          <div className="chatbot-header">
            <div className="chatbot-header-content">
              <div className="chatbot-avatar">
                <span>{isHolidayMode ? '🎅' : '🤖'}</span>
              </div>
              <div className="chatbot-header-info">
                <h3 id="chatbot-title">
                  {isHolidayMode ? 'Santa Grant Helper 🎄' : 'Grant Assistant Pro'}
                </h3>
                <div className="chatbot-status">
                  <span className="status-indicator"></span>
                  <span>{isHolidayMode ? '🎅 Online - Ho Ho Ho!' : 'Online'}</span>
                  <span className="pro-badge">{isHolidayMode ? '🎄 Pro' : 'Pro'}</span>
                  {isHolidayMode && <span className="holiday-badge">🎁 Festive</span>}
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
                <div className="chatbot-empty-icon">
                  {isHolidayMode ? '🎅' : '🤖'}
                </div>
                <h4>
                  {isHolidayMode ? 'Welcome to Santa Grant Helper 🎄' : 'Welcome to Grant Assistant Pro'}
                </h4>
                <p>
                  {isHolidayMode 
                    ? 'Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover?' 
                    : 'Your intelligent grant discovery companion. I\'m here to help you find funding opportunities, understand requirements, and navigate the platform with ease.'
                  }
                </p>
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
                  {message.sender === 'user' ? '👤' : isHolidayMode ? '🎅' : '🤖'}
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

            {/* Enhanced Typing Indicator */}
            {(isLoading || isTyping) && (
              <div className="chatbot-message bot" role="status" aria-live="polite">
                <div className="chatbot-avatar">
                  {isHolidayMode ? (
                    <div style={{ position: 'relative' }}>
                      🎅
                      {isHolidayMode && (
                        <div style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          fontSize: '8px',
                          animation: 'sparkle 1s ease-in-out infinite alternate'
                        }}>
                          ✨
                        </div>
                      )}
                    </div>
                  ) : '🤖'}
                </div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-typing-indicator">
                    {isHolidayMode ? (
                      <>
                        <span className="typing-dot" style={{ background: '#dc2626' }}>🎄</span>
                        <span className="typing-dot" style={{ background: '#f59e0b' }}>✨</span>
                        <span className="typing-dot" style={{ background: '#16a34a' }}>🎅</span>
                      </>
                    ) : (
                      <>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                        <span className="typing-dot"></span>
                      </>
                    )}
                  </div>
                  <div className="typing-text">
                    {isHolidayMode ? (
                      <span style={{ 
                        color: '#dc2626',
                        fontWeight: '600',
                        textShadow: '0 0 5px rgba(220, 38, 38, 0.3)'
                      }}>
                        🎄 Ho ho ho, thinking of perfect grants... 🎁
                      </span>
                    ) : 'Thinking...'}
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
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                placeholder={isHolidayMode 
                  ? "Ho ho ho! What grant are you looking for? 🎄"
                  : "Ask about grants or navigation..."
                }
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
                {isLoading ? '⏳' : isHolidayMode ? '🎅' : '➤'}
              </button>
            </div>

            {/* Quick Actions */}
            <div className="chatbot-quick-actions" role="group" aria-label="Quick actions">
              <div className="quick-actions-label">
                {isHolidayMode ? '🎄 Santa\'s Suggestions:' : 'Try asking:'}
              </div>
              <div className="quick-actions-list">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-button"
                    onClick={(e) => {
                      // Add visual feedback for holiday mode
                      if (isHolidayMode) {
                        e.target.style.transform = 'scale(0.95)';
                        e.target.style.boxShadow = '0 0 20px rgba(220, 38, 38, 0.6)';
                        setTimeout(() => {
                          e.target.style.transform = 'scale(1)';
                          e.target.style.boxShadow = '';
                        }, 200);
                      }
                      handleQuickAction(action);
                    }}
                    disabled={isLoading}
                    aria-label={`Ask: ${action}`}
                  >
                    {isHolidayMode ? (
                      <>
                        <span style={{ 
                          marginRight: '4px',
                          animation: 'sparkle 1.5s ease-in-out infinite alternate'
                        }}>
                          {index === 0 ? '🎄' : index === 1 ? '✨' : '🎅'}
                        </span>
                        {action}
                      </>
                    ) : action}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Analytics Panel */}
            {showAnalytics && (
              <div className="chatbot-analytics-panel">
                <div className="analytics-header">
                  <h4>📊 Analytics</h4>
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
                  <h4>📋 History</h4>
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
                  <h4>⚙️ Settings</h4>
                  <button onClick={() => setShowSettings(false)}>×</button>
                </div>
                <div className="settings-content">
                  <div className="setting-group">
                    <label>Language:</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="settings-language-select"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </select>
                  </div>
                  <div className="setting-group">
                    <label>Holiday Mode:</label>
                    <input
                      type="checkbox"
                      checked={isHolidayMode}
                      onChange={(e) => setIsHolidayMode(e.target.checked)}
                    />
                    <span className="setting-description">
                      {isHolidayMode ? '🎄 Ho ho ho! Santa is here!' : '🎅 Enable festive mode'}
                    </span>
                  </div>
                  <div className="setting-group">
                    <label>Conversation ID:</label>
                    <span className="conversation-id-display">{conversationId}</span>
                  </div>
                  <div className="setting-group">
                    <label>Total Conversations:</label>
                    <span className="stats-display">{conversationManager.conversations.length}</span>
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