import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/apiService.js';
import santaImage from '../assets/santa.svg';
import './ChatBot.css';

// Ultimate ChatBot with all advanced features
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
  const [language, setLanguage] = useState('en');
  const [isHolidayMode, setIsHolidayMode] = useState(false);
  const [conversationId] = useState(() => `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  
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

  // Enhanced intent recognition
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
    
    // Greeting intents
    if (/(hello|hi|hey|hola|bonjour)/i.test(query)) {
      if (query.includes('hola')) {
        return { intent: 'greeting_spanish', confidence: 0.95 };
      }
      if (query.includes('bonjour')) {
        return { intent: 'greeting_french', confidence: 0.95 };
      }
      return { intent: 'greeting', confidence: 0.95 };
    }
    
    // Occupation detection
    const occupations = detectOccupation(query);
    if (occupations.length > 0) {
      return { intent: 'occupation_grants', occupations, confidence: 0.9 };
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
      return { intent: 'show_actions', confidence: 0.8 };
    }
    
    return { intent: 'unknown', confidence: 0.1 };
  };

  // Generate response based on intent
  const generateResponse = (query, intent) => {
    const t = translations[language] || translations.en;
    
    const responses = {
      greeting: t.greeting,
      greeting_spanish: "¡Hola! Soy tu asistente avanzado de descubrimiento de subvenciones. ¿En qué puedo ayudarte hoy?",
      greeting_french: "Bonjour! Je suis votre assistant avancé de découverte de subventions. Comment puis-je vous aider aujourd'hui?",
      ho_greeting: "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄",
      holiday_mode: "🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄",
      gratitude: language === 'es' ? "¡De nada! Estoy aquí para ayudar con cualquier otra pregunta sobre subvenciones." :
                  language === 'fr' ? "De rien! Je suis là pour vous aider avec toute autre question sur les subventions." :
                  "You're welcome! I'm here to help with any other questions about grants.",
      help: t.help,
      
      grant_info: language === 'es' ? "¡Puedo ayudarte a encontrar subvenciones! Aquí está lo que sé:\n\n• Usa el Portal del Creador para solicitar subvenciones\n• Consulta la Vista Pública para navegar oportunidades disponibles\n• Visita Beneficios para esquemas gubernamentales\n• Mira el Panel para análisis\n\n¿Qué tipo de subvenciones buscas?" :
                language === 'fr' ? "Je peux vous aider à trouver des subventions! Voici ce que je sais:\n\n• Utilisez le Portail Créateur pour demander des subventions\n• Consultez la Vue Publique pour parcourir les opportunités disponibles\n• Visitez Avantages pour les régimes gouvernementaux\n• Regardez le Tableau de bord pour l'analyse\n\nQuel type de subventions recherchez-vous?" :
                "I can help you find grants! Here's what I know:\n\n• Use the Creator Portal to apply for grants\n• Check the Public View to browse available opportunities\n• Visit Benefits for government schemes\n• Look at the Dashboard for analytics\n\nWhat type of grants are you looking for?",
      
      eligibility: language === 'es' ? "La elegibilidad de las subvenciones varía según el programa. Generalmente, necesitarás:\n\n• Ser un tipo de organización elegible (sin fines de lucro, negocio, etc.)\n• Cumplir criterios específicos para cada subvención\n• Tener un proyecto o propósito calificado\n• Enviar documentación requerida\n\n¿Te gustaría que te ayude a verificar programas específicos?" :
                    language === 'fr' ? "L'éligibilité des subventions varie selon le programme. Généralement, vous aurez besoin de:\n\n• Être un type d'organisation éligible (à but non lucratif, entreprise, etc.)\n• Respecter des critères spécifiques pour chaque subvention\n• Avoir un projet ou un objectif qualifié\n• Soumettre la documentation requise\n\n'aimeriez-vous que je vous aide à vérifier des programmes spécifiques?" :
                    "Grant eligibility varies by program. Generally, you'll need to:\n\n• Be an eligible organization type (nonprofit, business, etc.)\n• Meet specific criteria for each grant\n• Have a qualifying project or purpose\n• Submit required documentation\n\nWould you like me to help you check specific programs?",
      
      show_actions: "I can take you directly to these sections:",
      
      unknown: language === 'es' ? "Estoy aquí para ayudar con subvenciones y navegación de la plataforma. Puedes preguntarme sobre:\n\n• Encontrar subvenciones y financiación\n• Procesos de aplicación\n• Requisitos de elegibilidad\n• Navegación de la plataforma\n\n¡O intenta preguntarme para 'mostrar opciones de navegación' para enlaces directos!" :
               language === 'fr' ? "Je suis ici pour vous aider avec les subventions et la navigation de la plateforme. Vous pouvez me demander:\n\n• Trouver des subventions et financement\n• Processus de candidature\n• Critères d'éligibilité\n• Navigation de la plateforme\n\nOu essayez de me demander de 'afficher les options de navigation' pour des liens directs!" :
               "I'm here to help with grants and platform navigation. You can ask me about:\n\n• Finding grants and funding\n• Application processes\n• Eligibility requirements\n• Platform navigation\n\nOr try asking me to 'show navigation options' for direct links!"
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
      } else if (intent.intent === 'switch_language') {
        setLanguage(intent.lang);
        responseText = `Language switched to ${intent.lang}. ${generateResponse(currentMessage, { intent: 'greeting' })}`;
      } else if (intent.intent === 'holiday_mode') {
        setIsHolidayMode(true);
        responseText = responses.holiday_mode;
      } else if (intent.intent === 'ho_greeting') {
        setIsHolidayMode(true);
        responseText = responses.ho_greeting;
      } else if (intent.intent === 'greeting_spanish') {
        responseText = responses.greeting_spanish;
      } else if (intent.intent === 'greeting_french') {
        responseText = responses.greeting_french;
      } else if (intent.intent === 'occupation_grants') {
        responseText = `Based on your occupation${intent.occupations.length > 1 ? 's' : ''}, here are relevant grants:\n\n`;
        intent.occupations.forEach(occ => {
          responseText += `**${occ.occupation.charAt(0).toUpperCase() + occ.occupation.slice(1)}** grants:\n`;
          responseText += occ.grants.map(grant => `• ${grant}`).join('\n') + '\n\n';
        });
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
      } else if (intent.intent === 'switch_language') {
        setLanguage(intent.lang);
        const t = translations[intent.lang] || translations.en;
        responseText = `Language switched to ${intent.lang}. ${t.greeting}`;
      } else if (intent.intent === 'holiday_mode') {
        setIsHolidayMode(true);
        responseText = responses.holiday_mode;
      } else if (intent.intent === 'ho_greeting') {
        setIsHolidayMode(true);
        responseText = responses.ho_greeting;
      } else if (intent.intent === 'greeting_spanish') {
        responseText = responses.greeting_spanish;
      } else if (intent.intent === 'greeting_french') {
        responseText = responses.greeting_french;
      } else if (intent.intent === 'occupation_grants') {
        responseText = `Based on your occupation${intent.occupations.length > 1 ? 's' : ''}, here are relevant grants:\n\n`;
        intent.occupations.forEach(occ => {
          responseText += `**${occ.occupation.charAt(0).toUpperCase() + occ.occupation.slice(1)}** grants:\n`;
          responseText += occ.grants.map(grant => `• ${grant}`).join('\n') + '\n\n';
        });
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

  // Occupation-based grant suggestions
  const occupationGrants = {
    // Healthcare
    'doctor': ['NIH SBIR', 'Healthcare Innovation Grants', 'Medical Research Grants'],
    'nurse': ['Healthcare Workforce Grants', 'Nursing Education Grants', 'Public Health Grants'],
    'researcher': ['NSF Research Grants', 'NIH Research Grants', 'University Research Grants'],
    'scientist': ['NSF Grants', 'DOE Research Grants', 'Scientific Research Grants'],
    
    // Technology
    'engineer': ['SBIR Technology Grants', 'Innovation Grants', 'STEM Education Grants'],
    'programmer': ['Tech Startup Grants', 'Software Development Grants', 'Digital Innovation Grants'],
    'developer': ['Technology Grants', 'App Development Grants', 'Tech Innovation Grants'],
    'entrepreneur': ['Small Business Grants', 'Startup Funding', 'Business Innovation Grants'],
    
    // Education
    'teacher': ['Education Grants', 'STEM Education Grants', 'Teacher Professional Development'],
    'professor': ['Academic Research Grants', 'University Grants', 'Faculty Development Grants'],
    'student': ['Student Grants', 'Graduate Research Grants', 'Educational Scholarships'],
    
    // Arts & Creative
    'artist': ['Arts Grants', 'Creative Projects Grants', 'Cultural Funding'],
    'musician': ['Arts Grants', 'Music Production Grants', 'Cultural Grants'],
    'writer': ['Literature Grants', 'Writing Fellowships', 'Creative Writing Grants'],
    'designer': ['Design Grants', 'Creative Industry Grants', 'Innovation Design Grants'],
    
    // Business & Finance
    'consultant': ['Business Development Grants', 'Consulting Grants', 'Professional Services Grants'],
    'manager': ['Leadership Grants', 'Management Development Grants', 'Business Training Grants'],
    'analyst': ['Data Analytics Grants', 'Research Grants', 'Financial Research Grants'],
    
    // Environment & Energy
    'environmentalist': ['Environmental Grants', 'Sustainability Grants', 'Green Technology Grants']
  };

  // Detect occupation from message
  const detectOccupation = (text) => {
    const lowerText = text.toLowerCase();
    const detectedOccupations = [];
    
    for (const [occupation, grants] of Object.entries(occupationGrants)) {
      if (lowerText.includes(occupation)) {
        detectedOccupations.push({ occupation, grants });
      }
    }
    
    return detectedOccupations;
  };

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
      {/* Holiday Mode Overlay */}
      {isHolidayMode && (
        <div className="holiday-overlay">
          <div className="santa-image">🎅</div>
          <div className="snow-animation">❄️❄️❄️</div>
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
        {isHolidayMode ? (
          <div className="santa-button-content">
            <img src={santaImage} alt="Santa" className="santa-image-icon" />
            <span className="santa-sparkle">✨</span>
          </div>
        ) : isOpen ? '×' : '💬'}
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
                  <span>Online</span>
                  <span className="pro-badge">Pro</span>
                  {isHolidayMode && <span className="holiday-badge">🎄</span>}
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

            {/* Typing Indicator */}
            {(isLoading || isTyping) && (
              <div className="chatbot-message bot" role="status" aria-live="polite">
                <div className="chatbot-avatar">
                  {isHolidayMode ? '🎅' : '🤖'}
                </div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <div className="typing-text">
                    {isHolidayMode ? 'Ho ho ho, thinking...' : 'Thinking...'}
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
                onKeyPress={handleKeyPress}
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
                    onClick={() => handleQuickAction(action)}
                    disabled={isLoading}
                    aria-label={`Ask: ${action}`}
                  >
                    {isHolidayMode ? `🎄 ${action}` : action}
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