import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import santaIcon from '../assets/santa.svg';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Website navigation paths with comprehensive information
  const websitePaths = {
    home: { 
      path: '/', 
      label: 'Home', 
      icon: '🏠',
      description: 'Main landing page with overview of GrantTracker',
      features: ['Grant overview', 'Quick access to all features', 'Hero section with key stats']
    },
    about: { 
      path: '/about', 
      label: 'About GrantTracker', 
      icon: 'ℹ️',
      description: 'Learn about our mission, team, and platform',
      features: ['Company information', 'Team details', 'Platform history', 'Mission statement']
    },
    dashboard: { 
      path: '/chart', 
      label: 'Analytics Dashboard', 
      icon: '📊',
      description: 'Interactive charts and grant analytics',
      features: ['Grant distribution charts', 'Sector-wise analysis', 'Statistical insights', 'Data visualization']
    },
    benefits: { 
      path: '/benefits', 
      label: 'Government Benefits', 
      icon: '🏛️',
      description: 'Comprehensive list of government schemes and benefits',
      features: ['Searchable benefit database', 'Category filtering', 'Detailed scheme information', 'Application guidance']
    },
    suggestions: { 
      path: '/suggestions', 
      label: 'Public Suggestions', 
      icon: '💬',
      description: 'Submit and view public feedback and suggestions',
      features: ['Submit suggestions', 'View community feedback', 'Vote on ideas', 'Community discussion']
    },
    creator: { 
      path: '/creator-login', 
      label: 'Creator Portal', 
      icon: '✍️',
      description: 'Login portal for grant creators and applicants',
      features: ['User authentication', 'Grant application', 'Creator dashboard', 'Application tracking']
    },
    government: { 
      path: '/gov-login', 
      label: 'Government Dashboard', 
      icon: '🏛️',
      description: 'Official government access portal',
      features: ['Government authentication', 'Official dashboard', 'Grant management', 'Administrative tools']
    },
    create: { 
      path: '/create-grant', 
      label: 'Create Grant', 
      icon: '📝',
      description: 'Form to create and submit new grant proposals',
      features: ['Grant proposal form', 'Document upload', 'Submission process', 'Draft saving']
    },
    view: { 
      path: '/view', 
      label: 'Public View', 
      icon: '👁️',
      description: 'Browse and view public grant information',
      features: ['Public grant browsing', 'Detailed grant views', 'Search functionality', 'Public access']
    }
  };

  // Languages supported
  const languages = {
    en: 'English',
    es: 'Español',
    fr: 'Français',
    de: 'Deutsch',
    hi: 'हिन्दी'
  };

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: getGreetingResponse('en'),
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Enhanced Natural Language Processing for Comprehensive Website Assistance
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
    if (/(benefits|schemes|government schemes|welfare|government benefits)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'benefits', confidence: 0.9 };
    }
    if (/(suggestions|feedback|public|comment)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'suggestions', confidence: 0.9 };
    }
    if (/(creator|login|register|apply|grant application)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'creator', confidence: 0.85 };
    }
    if (/(government|official|admin|ministry|government portal)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'government', confidence: 0.85 };
    }
    if (/(create|new|submit|make a grant|grant creation)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'create', confidence: 0.85 };
    }
    if (/(view|public|see|browse grants)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'view', confidence: 0.85 };
    }
    
    // Feature explanations
    if (/(what is|explain|tell me about|how does|features|functionality|capabilities)/i.test(cleaned)) {
      if (/(dashboard|analytics|chart)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'dashboard', confidence: 0.9 };
      }
      if (/(benefits|schemes|welfare)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'benefits', confidence: 0.9 };
      }
      if (/(suggestions|feedback)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'suggestions', confidence: 0.9 };
      }
      if (/(grant|creation|create)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'create', confidence: 0.9 };
      }
      return { intent: 'feature_info', target: 'general', confidence: 0.7 };
    }
    
    // How-to questions
    if (/(how to|how do i|guide me|walk me through|steps|instructions)/i.test(cleaned)) {
      if (/(apply|application|submit)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'application', confidence: 0.9 };
      }
      if (/(create|make|new grant)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'create_grant', confidence: 0.9 };
      }
      if (/(find|search|discover|browse)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'find_grants', confidence: 0.9 };
      }
      return { intent: 'how_to', target: 'general', confidence: 0.7 };
    }
    
    // Troubleshooting
    if (/(troubleshoot|error|problem|issue|not working|broken|fix|debug)/i.test(cleaned)) {
      return { intent: 'troubleshoot', confidence: 0.85 };
    }
    
    // Content discovery
    if (/(find|search|discover|show me|browse|look for|what grants)/i.test(cleaned)) {
      return { intent: 'content_discovery', confidence: 0.8 };
    }
    
    // Technical support
    if (/(technical|support|help|contact|assistance|customer service)/i.test(cleaned)) {
      return { intent: 'technical_support', confidence: 0.8 };
    }
    
    // Website information
    if (/(what is granttracker|about this site|platform info|site information)/i.test(cleaned)) {
      return { intent: 'website_info', confidence: 0.9 };
    }
    
    // Quick action patterns
    if (/(show me|navigate|go to|take me|list all|all options)/i.test(cleaned)) {
      return { intent: 'show_actions', confidence: 0.8 };
    }
    
    // Greetings
    if (/^(hello|hi|hey|greetings|good [morning|afternoon|evening]|howdy|yo|hey there|what's up|hi there)/i.test(cleaned)) {
      return { intent: 'greeting', confidence: 0.95 };
    }
    
    // Help
    if (/(help|support|assistance|guide|explain|need help)/i.test(cleaned)) {
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
        id: Date.now(),
        text: `Navigating to ${pathInfo.label}...`,
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, navMessage]);
      
      // Close chat after navigation
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
      
      return true;
    }
    return false;
  }, [navigate]);

  // Generate comprehensive response based on intent
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
          
        case 'feature_info':
          response = getFeatureInfoResponse(intent.target);
          break;
          
        case 'how_to':
          response = getHowToResponse(intent.target);
          break;
          
        case 'troubleshoot':
          response = getTroubleshootResponse();
          break;
          
        case 'content_discovery':
          response = getContentDiscoveryResponse();
          break;
          
        case 'technical_support':
          response = getTechnicalSupportResponse();
          break;
          
        case 'website_info':
          response = getWebsiteInfoResponse();
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
          response = 'Conversation cleared! How can I help you navigate?';
          break;
          
        default:
          response = getFallbackResponse(language);
      }
      
      return {
        id: Date.now(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          intent: intent.intent,
          confidence: intent.confidence
        }
      };
    } catch (err) {
      console.error('Error generating response:', err);
      return {
        id: Date.now(),
        text: getErrorResponse(language),
        sender: 'bot',
        timestamp: new Date(),
        isError: true
      };
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [language, handleDirectNavigation]);

  // Response generators
  const getQuickActionsResponse = () => {
    return `Here's what you can navigate to directly:\n\n${Object.values(websitePaths).map(path => 
      `${path.icon} **${path.label}**`
    ).join('\n\n')}\n\nJust tell me where you'd like to go!`;
  };

  const getFeatureInfoResponse = (target) => {
    if (target === 'general') {
      return `GrantTracker is a comprehensive platform for grant management and discovery. Here are our key features:\n\n🎯 **Grant Discovery** - Browse and search through available grants\n📊 **Analytics Dashboard** - Visual insights into grant data\n🏛️ **Government Benefits** - Comprehensive benefit schemes database\n💬 **Community Suggestions** - Public feedback and idea sharing\n✍️ **Creator Portal** - Apply for grants and track applications\n🏛️ **Government Dashboard** - Official government access portal\n📝 **Grant Creation** - Submit new grant proposals\n\nWhich feature would you like to learn more about?`;
    }
    
    const pathInfo = websitePaths[target];
    if (pathInfo) {
      return `**${pathInfo.label}** - ${pathInfo.description}\n\n**Key Features:**\n${pathInfo.features.map(feature => `• ${feature}`).join('\n')}\n\nWould you like me to take you there or explain any specific aspect?`;
    }
    
    return "I'd be happy to explain our features! Could you be more specific about which feature you're interested in?";
  };

  const getHowToResponse = (target) => {
    switch (target) {
      case 'application':
        return `Here's how to apply for grants:\n\n1. **Visit Creator Portal** - Go to the Creator Login page\n2. **Create Account** - Sign up or log in to your account\n3. **Browse Grants** - Explore available grant opportunities\n4. **Select Grant** - Choose the grant that fits your project\n5. **Fill Application** - Complete the application form with project details\n6. **Upload Documents** - Submit required documentation\n7. **Submit Application** - Review and submit your application\n8. **Track Status** - Monitor your application progress\n\nNeed help with any of these steps? Just ask!`;
      
      case 'create_grant':
        return `Here's how to create a new grant:\n\n1. **Access Grant Creation** - Navigate to Create Grant page\n2. **Fill Basic Info** - Enter grant title, description, and category\n3. **Set Criteria** - Define eligibility requirements\n4. **Add Details** - Specify funding amount, deadline, and contact info\n5. **Upload Documentation** - Add supporting documents\n6. **Review & Submit** - Double-check all information\n7. **Publish** - Make the grant live for applicants\n\nWould you like me to guide you through any specific step?`;
      
      case 'find_grants':
        return `Here's how to find grants that match your needs:\n\n1. **Browse Public View** - Check the Public View section\n2. **Use Search** - Search by keywords, category, or sector\n3. **Filter Results** - Narrow down by funding amount, deadline, etc.\n4. **View Details** - Click on grants for complete information\n5. **Check Eligibility** - Review requirements before applying\n6. **Save Favorites** - Bookmark interesting opportunities\n\nYou can also check the Benefits section for government schemes!`;
      
      default:
        return `I'm here to help guide you through any process! What specific task would you like assistance with? I can help with:\n\n• Grant applications\n• Creating new grants\n• Finding grant opportunities\n• Using the dashboard\n• Navigating the platform\n\nJust let me know what you need help with!`;
    }
  };

  const getTroubleshootResponse = () => {
    return `I'm here to help troubleshoot any issues you're experiencing! Here are solutions to common problems:\n\n🔧 **Login Issues**\n• Check your username and password\n• Try clearing browser cache\n• Ensure you're using the correct portal (Creator vs Government)\n\n📄 **Form Submission Problems**\n• Check required fields are filled\n• Ensure documents are in supported formats\n• Verify internet connection is stable\n\n📊 **Dashboard Not Loading**\n• Refresh the page\n• Check your internet connection\n• Try a different browser\n\n🔍 **Search Issues**\n• Try different keywords\n• Clear search filters\n• Check spelling\n\nStill having trouble? Describe your specific issue and I'll provide targeted help!`;
  };

  const getContentDiscoveryResponse = () => {
    return `I can help you discover content across GrantTracker! Here's how to find what you're looking for:\n\n🔍 **Search Methods:**\n• Use the search bar on relevant pages\n• Browse by category or sector\n• Filter by funding amount, deadline, or location\n\n📋 **Content Types Available:**\n• **Grants** - Various funding opportunities\n• **Government Benefits** - Official welfare schemes\n• **Public Suggestions** - Community ideas and feedback\n• **Analytics Data** - Charts and statistics\n\n💡 **Discovery Tips:**\n• Try broad terms first, then narrow down\n• Use multiple search terms\n• Check different sections of the site\n\nWhat type of content are you looking for? I can guide you to the right section!`;
  };

  const getTechnicalSupportResponse = () => {
    return `I'm your technical support assistant! Here's how I can help:\n\n🛠️ **Common Technical Issues:**\n• Page loading problems\n• Form submission errors\n• Login difficulties\n• Browser compatibility\n• Mobile responsiveness\n\n📱 **Device-Specific Help:**\n• Desktop optimization\n• Mobile navigation\n• Tablet compatibility\n\n🌐 **Browser Support:**\n• Chrome (recommended)\n• Firefox\n• Safari\n• Edge\n\n💡 **General Tips:**\n• Keep browser updated\n• Clear cache regularly\n• Check internet connection\n• Disable browser extensions if needed\n\nDescribe your specific technical issue and I'll provide detailed assistance!`;
  };

  const getWebsiteInfoResponse = () => {
    return `**Welcome to GrantTracker!** 🎅\n\nGrantTracker is a comprehensive platform designed to connect grant seekers with funding opportunities and streamline the grant management process.\n\n🚀 **What We Do:**\n• **Grant Discovery** - Help you find relevant funding opportunities\n• **Application Management** - Streamline the application process\n• **Data Analytics** - Provide insights into grant trends and success rates\n• **Community Engagement** - Foster collaboration between seekers and funders\n\n🎯 **Our Mission:**\nTo make grant funding accessible, transparent, and efficient for everyone.\n\n🌟 **Key Benefits:**\n• Save time with intelligent matching\n• Access to comprehensive databases\n• Real-time application tracking\n• Community-driven suggestions\n• Government-verified information\n\nReady to explore? Just tell me where you'd like to start!`;
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
      en: 'I\'m your comprehensive GrantTracker assistant! I can help you with:\n\n🧭 **Navigation** - "Take me to dashboard"\n🔍 **Feature Info** - "What is the benefits section?"\n📋 **How-To Guides** - "How do I apply for grants?"\n🔧 **Troubleshooting** - "I\'m having login issues"\n📖 **Content Discovery** - "Show me available grants"\n🛠️ **Technical Support** - "Page not loading properly"\nℹ️ **Website Info** - "What is GrantTracker?"\n\n💡 **Example Questions:**\n• "How do I create a new grant?"\n• "What features does the dashboard have?"\n• "I need help finding funding opportunities"\n• "The form won\'t submit, can you help?"\n\nJust ask me anything about the platform!',
      es: '¡Soy tu asistente completo de GrantTracker! Puedo ayudarte con:\n\n🧭 **Navegación** - "Llévame al panel"\n🔍 **Información de funciones** - "¿Qué es la sección de beneficios?"\n📋 **Guías prácticas** - "¿Cómo solicito subvenciones?"\n🔧 **Solución de problemas** - "Tengo problemas de inicio de sesión"\n📖 **Descubrimiento de contenido** - "Muéstrame las subvenciones disponibles"\n🛠️ **Soporte técnico** - "La página no carga correctamente"\nℹ️ **Información del sitio web** - "¿Qué es GrantTracker?"\n\n💡 **Preguntas de ejemplo:**\n• "¿Cómo creo una nueva subvención?"\n• "¿Qué funciones tiene el panel?"\n• "Necesito ayuda para encontrar oportunidades de financiación"\n• "El formulario no se envía, ¿puedes ayudar?"\n\n¡Solo pregúntame cualquier cosa sobre la plataforma!'
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
      en: 'I didn\'t quite catch that, but I\'m here to help! I can assist you with:\n\n🧭 **Navigation** - "Take me to [section]"\n🔍 **Information** - "What is [feature]?"\n📋 **Guidance** - "How do I [task]?"\n🔧 **Support** - "I have a problem with..."\n\nTry asking:\n• "What features does GrantTracker have?"\n• "How do I apply for grants?"\n• "Show me the dashboard"\n• "I need help with..."\n\nOr just say "show me all options" to see what I can do!',
      es: 'No entendí bien eso, ¡pero estoy aquí para ayudar! Puedo asistirte con:\n\n🧭 **Navegación** - "Llévame a [sección]"\n🔍 **Información** - "¿Qué es [función]?"\n📋 **Orientación** - "¿Cómo hago [tarea]?"\n🔧 **Soporte** - "Tengo un problema con..."\n\nIntenta preguntar:\n• "¿Qué funciones tiene GrantTracker?"\n• "¿Cómo solicito subvenciones?"\n• "Muéstrame el panel"\n• "Necesito ayuda con..."\n\n¡O simplemente di "muéstrame todas las opciones" para ver qué puedo hacer!'
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
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };
    
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInputValue('');
    
    // Analyze intent and generate response
    const intent = analyzeIntent(userMessage.text);
    const botResponse = await generateResponse(userMessage.text, intent);
    
    setMessages(prev => [...prev, botResponse]);
  }, [inputValue, messages, isLoading, analyzeIntent, generateResponse]);

  // Handle quick action clicks
  const handleQuickAction = useCallback((target) => {
    handleDirectNavigation(target);
    setShowQuickActions(false);
  }, [handleDirectNavigation]);

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

  // Render message content with basic formatting
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
    <div className="chatbot-container">
      {/* Enhanced Chat Toggle Button with Santa Icon */}
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

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
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
                onChange={(e) => setLanguage(e.target.value)}
                className="chatbot-language-selector"
                aria-label="Select language"
              >
                {Object.entries(languages).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
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
            {Array.from({ length: 9 }, (_, i) => (
              <div
                key={i}
                className={`snowflake snowflake-${i + 1}`}
                style={{
                  left: `${10 + i * 10}%`,
                  animationDelay: `${i * 0.5}s`,
                  animationDuration: `${3 + Math.random() * 2}s`
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
                <p>Ho ho ho! I'm your comprehensive website assistant!</p>
                <div className="chatbot-empty-message">
                  Ask me anything! Try "What features does GrantTracker have?" or "How do I apply for grants?"
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
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
      )}
    </div>
  );
};

export default ChatBot;