import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

// ChatBot Component - Best-in-Class Implementation
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
  const [suggestions, setSuggestions] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [analytics, setAnalytics] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    avgResponseTime: 0,
    satisfactionScore: 0
  });

  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const location = useLocation();
  const typingTimeoutRef = useRef(null);
  const conversationHistoryRef = useRef([]);

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
        conversationHistoryRef.current = parsedHistory;
        setMessages(parsedHistory);
      } catch (e) {
        console.error('Error loading conversation history:', e);
      }
    }

    // Set up periodic cleanup
    const cleanupInterval = setInterval(() => {
      const sessions = JSON.parse(localStorage.getItem('chatbot_sessions') || '[]');
      const now = Date.now();
      const activeSessions = sessions.filter(s => now - s.createdAt < sessionTimeout);
      if (activeSessions.length !== sessions.length) {
        localStorage.setItem('chatbot_sessions', JSON.stringify(activeSessions));
      }
    }, 60 * 60 * 1000); // Every hour

    return () => clearInterval(cleanupInterval);
  }, []);

  // Update suggestions based on context
  useEffect(() => {
    if (messages.length === 0) {
      setSuggestions([
        { id: 'welcome', text: 'How can I help you today?', icon: '👋' },
        { id: 'grants', text: 'Find available grants', icon: '💰' },
        { id: 'help', text: 'Get help with applications', icon: '📝' }
      ]);
    } else if (messages.length > 0 && messages[messages.length - 1].sender === 'user') {
      const lastMessage = messages[messages.length - 1].text.toLowerCase();
      if (lastMessage.includes('grant') || lastMessage.includes('funding')) {
        setSuggestions([
          { id: 'search', text: 'Search for grants', icon: '🔍' },
          { id: 'eligibility', text: 'Check eligibility', icon: '✅' },
          { id: 'deadline', text: 'Find deadlines', icon: '📅' }
        ]);
      } else if (lastMessage.includes('help') || lastMessage.includes('support')) {
        setSuggestions([
          { id: 'contact', text: 'Contact support', icon: '📞' },
          { id: 'faq', text: 'View FAQ', icon: '❓' },
          { id: 'guide', text: 'Get application guide', icon: '📖' }
        ]);
      } else {
        setSuggestions([
          { id: 'more', text: 'Tell me more', icon: '📚' },
          { id: 'examples', text: 'Show examples', icon: '💡' },
          { id: 'clear', text: 'Clear conversation', icon: '🗑️' }
        ]);
      }
    }
  }, [messages]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isTyping]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chatContainerRef.current) {
        chatContainerRef.current.style.height = `${window.innerHeight * 0.7}px`;
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update analytics
  useEffect(() => {
    const messagesSent = messages.filter(m => m.sender === 'user').length;
    const messagesReceived = messages.filter(m => m.sender === 'bot').length;
    
    setAnalytics(prev => ({
      ...prev,
      messagesSent,
      messagesReceived,
      avgResponseTime: messagesReceived > 0 
        ? messages.filter(m => m.sender === 'bot').reduce((sum, m) => sum + (m.responseTime || 0), 0) / messagesReceived
        : 0
    }));
  }, [messages]);

  // Natural Language Processing - Intent recognition
  const analyzeIntent = useCallback((text) => {
    const normalized = text.toLowerCase().trim();
    
    // Greetings
    if (/^(hello|hi|hey|greetings|good [morning|afternoon|evening])*/i.test(normalized)) {
      return { intent: 'greeting', confidence: 0.9 };
    }
    
    // Grants/funding related
    if (/(grant|funding|scholarship|financial aid|bursary|subsidy)/i.test(normalized)) {
      return { intent: 'grant_info', confidence: 0.8 };
    }
    
    // Eligibility
    if (/(eligible|qualify|requirement|criteria)/i.test(normalized)) {
      return { intent: 'eligibility', confidence: 0.85 };
    }
    
    // Deadlines
    if (/(deadline|due date|when|application period)/i.test(normalized)) {
      return { intent: 'deadline', confidence: 0.8 };
    }
    
    // Help/support
    if (/(help|support|assistance|trouble|issue|problem)/i.test(normalized)) {
      return { intent: 'help', confidence: 0.75 };
    }
    
    // Thank you
    if (/(thank|thanks|appreciate|great help)/i.test(normalized)) {
      return { intent: 'gratitude', confidence: 0.9 };
    }
    
    return { intent: 'unknown', confidence: 0.1 };
  }, []);

  // Generate context-aware response
  const generateResponse = useCallback(async (message, intent) => {
    setIsLoading(true);
    setIsTyping(true);
    
    const startTime = Date.now();
    
    try {
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 400));
      
      // Context-aware responses based on intent and conversation history
      const context = {
        currentMessage: message,
        intent,
        history: conversationHistoryRef.current.slice(-5),
        location: location.pathname,
        language
      };
      
      // Generate response based on context
      let response = '';
      
      switch (intent.intent) {
        case 'greeting':
          response = getGreetingResponse(message, language);
          break;
        case 'grant_info':
          response = await getGrantInfoResponse(message, language);
          break;
        case 'eligibility':
          response = await getEligibilityResponse(message, language);
          break;
        case 'deadline':
          response = await getDeadlineResponse(message, language);
          break;
        case 'help':
          response = getHelpResponse(message, language);
          break;
        case 'gratitude':
          response = getGratitudeResponse(message, language);
          break;
        default:
          response = getFallbackResponse(message, language);
      }
      
      const responseTime = Date.now() - startTime;
      
      return {
        text: response,
        sender: 'bot',
        timestamp: new Date().toISOString(),
        responseTime,
        metadata: {
          intent: intent.intent,
          confidence: intent.confidence,
          context
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
  }, [location.pathname, language]);

  // Handle user message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    const userMessage = {
      text: inputValue,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Add user message to conversation
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    conversationHistoryRef.current = updatedMessages;
    
    // Store in localStorage
    localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify(updatedMessages));
    
    // Clear input
    setInputValue('');
    setError(null);
    
    // Analyze intent
    const intent = analyzeIntent(inputValue);
    
    // Generate and add bot response
    const botResponse = await generateResponse(inputValue, intent);
    
    setMessages(prev => [...prev, botResponse]);
    conversationHistoryRef.current = [...updatedMessages, botResponse];
    
    // Store updated conversation
    localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify([...updatedMessages, botResponse]));
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      messagesSent: prev.messagesSent + 1,
      messagesReceived: prev.messagesReceived + 1
    }));
  }, [inputValue, messages, isLoading, sessionId, analyzeIntent, generateResponse, analytics]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    switch (suggestion.id) {
      case 'clear':
        setMessages([]);
        conversationHistoryRef.current = [];
        localStorage.removeItem(`chatbot_history_${sessionId}`);
        break;
      case 'welcome':
        setInputValue('Hello!');
        break;
      case 'grants':
        setInputValue('What grants are available?');
        break;
      case 'help':
        setInputValue('I need help with my application');
        break;
      case 'search':
        setInputValue('Search for grants');
        break;
      case 'eligibility':
        setInputValue('What are the eligibility criteria?');
        break;
      case 'deadline':
        setInputValue('When is the deadline?');
        break;
      case 'contact':
        setInputValue('How can I contact support?');
        break;
      case 'faq':
        setInputValue('Show me the FAQ');
        break;
      case 'guide':
        setInputValue('Give me an application guide');
        break;
      case 'more':
        setInputValue('Tell me more about this');
        break;
      case 'examples':
        setInputValue('Show me some examples');
        break;
      default:
        setInputValue(suggestion.text);
    }
    
    // Auto-send if not empty
    if (inputValue.trim()) {
      handleSendMessage();
    }
  }, [inputValue, handleSendMessage, sessionId]);

  // Handle feedback
  const handleFeedback = useCallback((score) => {
    setFeedback(score);
    
    // Store feedback with message
    if (messages.length > 0) {
      const lastMessageIndex = messages.length - 1;
      const updatedMessages = [...messages];
      updatedMessages[lastMessageIndex] = {
        ...updatedMessages[lastMessageIndex],
        feedback: score
      };
      setMessages(updatedMessages);
      conversationHistoryRef.current = updatedMessages;
      localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify(updatedMessages));
      
      // Update overall satisfaction score
      const feedbackCount = messages.filter(m => m.feedback !== undefined).length;
      const totalScore = messages.reduce((sum, m) => sum + (m.feedback || 0), 0);
      setAnalytics(prev => ({
        ...prev,
        satisfactionScore: totalScore / feedbackCount
      }));
    }
    
    // Hide feedback after 3 seconds
    setTimeout(() => setFeedback(null), 3000);
  }, [messages, sessionId]);

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
      // Ctrl+Shift+C to toggle chat
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
      
      // Escape to close chat
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Response templates
  const getGreetingResponse = (message, lang) => {
    const greetings = {
      en: [
        'Hello! 👋 How can I assist you today?',
        'Hi there! What can I help you with?',
        'Welcome! How may I be of service?'
      ],
      es: [
        '¡Hola! 👋 ¿En qué puedo ayudarte hoy?',
        '¡Hola! ¿Qué necesitas?',
        '¡Bienvenido! ¿Cómo puedo ayudarte?'
      ],
      fr: [
        'Bonjour ! 👋 Comment puis-je vous aider aujourd\'hui ?',
        'Salut ! Que puis-je faire pour vous ?',
        'Bienvenue ! Comment puis-je vous aider ?'
      ],
      de: [
        'Hallo! 👋 Wie kann ich Ihnen heute helfen?',
        'Hallo! Was kann ich für Sie tun?',
        'Willkommen! Wie kann ich Ihnen helfen?'
      ],
      hi: [
        'नमस्ते! 👋 मैं आज आपकी कैसे मदद कर सकता हूँ?',
        'हेलो! मैं आपकी कैसे मदद कर सकता हूँ?',
        'स्वागत है! मैं आपकी कैसे मदद कर सकता हूँ?'
      ]
    };
    
    return greetings[lang]?.[Math.floor(Math.random() * greetings[lang].length)] || greetings.en[0];
  };

  const getGrantInfoResponse = async (message, lang) => {
    // In a real implementation, this would call the actual API
    const responses = {
      en: [
        'Here are some available grants that might match your needs:',
        'I found several grant opportunities for you:',
        'Check out these funding options:'
      ],
      es: [
        'Aquí tienes algunas subvenciones disponibles que podrían interesarte:',
        'He encontrado varias oportunidades de subvención para ti:',
        'Revisa estas opciones de financiamiento:'
      ],
      fr: [
        'Voici quelques subventions disponibles qui pourraient vous intéresser:',
        'J\'ai trouvé plusieurs opportunités de subvention pour vous:',
        'Consultez ces options de financement:'
      ],
      de: [
        'Hier sind einige verfügbare Zuschüsse, die für Sie interessant sein könnten:',
        'Ich habe mehrere Fördermöglichkeiten für Sie gefunden:',
        'Schauen Sie sich diese Finanzierungsoptionen an:'
      ],
      hi: [
        'यहां कुछ उपलब्ध अनुदान हैं जो आपकी आवश्यकताओं के अनुरूप हो सकते हैं:',
        'मैं आपके लिए कुछ अनुदान अवसर ढूंढा:',
        'इन वित्तपोषण विकल्पों पर नज़र डालें:'
      ]
    };
    
    // Simulate API call to get grants data
    try {
      const response = await fetch('/api/grants');
      if (response.ok) {
        const grants = await response.json();
        const sampleGrants = grants.slice(0, 3);
        return `${responses[lang][Math.floor(Math.random() * responses[lang].length)]}\n\n${sampleGrants.map(g => `• ${g.name} (${g.sector}) - ${g.amount} ${g.currency}`).join('\n')}`;
      }
    } catch (e) {
      console.error('Error fetching grants:', e);
    }
    
    return responses[lang]?.[0] || responses.en[0];
  };

  const getEligibilityResponse = async (message, lang) => {
    const responses = {
      en: [
        'Eligibility criteria typically include:',
        'To qualify, you usually need:',
        'Common eligibility requirements are:'
      ],
      es: [
        'Los criterios de elegibilidad suelen incluir:',
        'Para calificar, generalmente necesitas:',
        'Los requisitos de elegibilidad comunes son:'
      ],
      fr: [
        'Les critères d\'éligibilité comprennent généralement:',
        'Pour être éligible, vous avez généralement besoin de:',
        'Les exigences d\'éligibilité courantes sont:'
      ],
      de: [
        'Die Zulassungskriterien umfassen typischerweise:',
        'Um berechtigt zu sein, benötigen Sie normalerweise:',
        'Häufige Zulassungskriterien sind:'
      ],
      hi: [
        'पात्रता मानदंड通常 शामिल होते हैं:',
        'पात्र होने के लिए आपको आमतौर पर चाहिए:',
        'सामान्य पात्रता आवश्यकताएँ हैं:'
      ]
    };
    
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
  };

  const getDeadlineResponse = async (message, lang) => {
    const responses = {
      en: [
        'Grant deadlines vary by program. Would you like me to find specific deadlines for you?',
        'Application deadlines are typically listed in the grant details. Let me check!',
        'Deadlines depend on the specific grant. I can help you find them.'
      ],
      es: [
        'Las fechas límite de las subvenciones varían según el programa. ¿Te gustaría que encuentre fechas específicas para ti?',
        'Las fechas de cierre de solicitudes suelen estar en los detalles de la subvención. ¡Déjame verificar!',
        'Las fechas límite dependen de la subvención específica. Puedo ayudarte a encontrarlas.'
      ],
      fr: [
        'Les dates limites des subventions varient selon le programme. Voulez-vous que je trouve des dates spécifiques pour vous ?',
        'Les dates de clôture des candidatures sont généralement indiquées dans les détails de la subvention. Laissez-moi vérifier !',
        'Les dates limites dépendent de la subvention spécifique. Je peux vous aider à les trouver.'
      ],
      de: [
        'Fristen für Zuschüsse variieren je nach Programm. Möchten Sie, dass ich spezifische Fristen für Sie finde?',
        'Anmeldefristen sind normalerweise in den Zuschussdetails aufgeführt. Lass mich nachsehen!',
        'Fristen hängen vom jeweiligen Zuschuss ab. Ich kann Ihnen helfen, sie zu finden.'
      ],
      hi: [
        'अनुदान की अंतिम तिथियाँ प्रोग्राम के अनुसार भिन्न होती हैं। क्या आप चाहते हैं कि मैं आपके लिए विशेष अंतिम तिथियाँ ढूंढे?',
        'आवेदन की अंतिम तिथियाँ आमतौर पर अनुदान विवरण में दी जाती हैं। मुझे जांचने दें!',
        'अंतिम तिथियाँ विशेष अनुदान पर निर्भर करती हैं। मैं आपकी मदद कर सकता हूँ उन्हें ढूंढने में।'
      ]
    };
    
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
  };

  const getHelpResponse = (message, lang) => {
    const responses = {
      en: [
        'I can help with grant applications, eligibility questions, and more. What do you need assistance with?',
        'Need help? I can guide you through the process, answer questions, and provide resources.',
        'How can I assist you? I\'m here to help with anything related to grants and funding.'
      ],
      es: [
        'Puedo ayudarte con solicitudes de subvenciones, preguntas de elegibilidad y más. ¿Qué necesitas?',
        '¿Necesitas ayuda? Puedo guiarte a través del proceso, responder preguntas y proporcionar recursos.',
        '¿Cómo puedo ayudarte? Estoy aquí para ayudarte con cualquier cosa relacionada con subvenciones y financiamiento.'
      ],
      fr: [
        'Je peux vous aider avec les demandes de subvention, les questions d\'éligibilité et plus encore. Que vous faut-il ?',
        'Besoin d\'aide ? Je peux vous guider à travers le processus, répondre aux questions et fournir des ressources.',
        'Comment puis-je vous aider ? Je suis ici pour vous aider avec tout ce qui concerne les subventions et le financement.'
      ],
      de: [
        'Ich kann Ihnen bei Zuschussanträgen, Fragen zur Eignung und mehr helfen. Was benötigen Sie?',
        'Brauchen Sie Hilfe? Ich kann Sie durch den Prozess führen, Fragen beantworten und Ressourcen bereitstellen.',
        'Wie kann ich Ihnen helfen? Ich bin hier, um Ihnen bei allem rund um Zuschüsse und Finanzierung zu helfen.'
      ],
      hi: [
        'मैं अनुदान आवेदन, पात्रता प्रश्न और अधिक के साथ मदद कर सकता हूँ। आपको क्या चाहिए?',
        'मदद चाहिए? मैं आपको प्रक्रिया के माध्यम से मार्गदर्शन कर सकता हूँ, प्रश्नों का उत्तर दे सकता हूँ और संसाधन प्रदान कर सकता हूँ।',
        'मैं आपकी कैसे मदद कर सकता हूँ? मैं अनुदान और वित्तपोषण से संबंधित किसी भी चीज़ के लिए यहाँ हूँ।'
      ]
    };
    
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
  };

  const getGratitudeResponse = (message, lang) => {
    const responses = {
      en: [
        'You\'re welcome! 😊 Is there anything else I can help you with?',
        'Happy to help! Let me know if you need anything else.',
        'Anytime! Feel free to ask if you have more questions.'
      ],
      es: [
        '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
        '¡Feliz de ayudar! Avísame si necesitas algo más.',
        '¡Cuando quieras! No dudes en preguntar si tienes más preguntas.'
      ],
      fr: [
        'Avec plaisir ! 😊 Y a-t-il autre chose que je puisse faire pour vous ?',
        'Ravi de vous aider ! Faites-moi savoir si vous avez besoin de quelque chose d\'autre.',
        'Avec plaisir ! N\'hésitez pas à demander si vous avez d\'autres questions.'
      ],
      de: [
        'Gern geschehen! 😊 Brauchen Sie noch etwas?',
        'Gern geschehen! Lassen Sie es mich wissen, wenn Sie noch etwas benötigen.',
        'Jederzeit! Zögern Sie nicht zu fragen, wenn Sie weitere Fragen haben.'
      ],
      hi: [
        'स्वागत है! 😊 क्या मैं आपकी और मदद कर सकता हूँ?',
        'मदद करने में खुशी हुई! अगर आपको और कुछ चाहिए तो मुझे बताएं।',
        'कभी भी! अगर आपके और सवाल हैं तो पूछें।'
      ]
    };
    
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
  };

  const getFallbackResponse = (message, lang) => {
    const responses = {
      en: [
        'I\'m not sure I understand. Could you rephrase that?',
        'I didn\'t quite get that. Can you clarify?',
        'Sorry, I don\'t have an answer for that. Let me know how I can help!'
      ],
      es: [
        'No estoy seguro de entender. ¿Podrías reformular eso?',
        'No lo entendí del todo. ¿Puedes aclarar?',
        'Lo siento, no tengo una respuesta para eso. ¡Hazme saber cómo puedo ayudar!'
      ],
      fr: [
        'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?',
        'Je n\'ai pas tout compris. Pouvez-vous clarifier ?',
        'Désolé, je n\'ai pas de réponse à cela. Faites-moi savoir comment je peux aider !'
      ],
      de: [
        'Ich bin mir nicht sicher, ob ich das verstehe. Könnten Sie das umformulieren?',
        'Das habe ich nicht ganz verstanden. Können Sie das klären?',
        'Entschuldigung, ich habe keine Antwort darauf. Lassen Sie mich wissen, wie ich helfen kann!'
      ],
      hi: [
        'मुझे नहीं समझ आ रहा। क्या आप इसे दोबारा कह सकते हैं?',
        'मुझे पूरी तरह से समझ में नहीं आया। क्या आप स्पष्ट कर सकते हैं?',
        'माफ कीजिए, मुझे इसका उत्तर नहीं है। मुझे बताएं कि मैं आपकी कैसे मदद कर सकता हूँ!'
      ]
    };
    
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
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
        {message.text.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        {message.metadata?.intent && (
          <div className="chatbot-message-metadata">
            <small>Intent: {message.metadata.intent} ({Math.round(message.metadata.confidence * 100)}%)</small>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`chatbot-container ${isOpen ? 'chatbot-open' : ''}`}>
      {/* Chat toggle button */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
      >
        <span className="chatbot-icon">💬</span>
        {isOpen ? 'Close' : 'Chat'}
      </button>

      {/* Chat window */}
      <div className="chatbot-window" ref={chatContainerRef}>
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-header-content">
            <span className="chatbot-icon">🤖</span>
            <h3>GrantTracker Assistant</h3>
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

        {/* Messages container */}
        <div className="chatbot-messages">
          {messages.length === 0 && !isLoading && (
            <div className="chatbot-empty-state">
              <div className="chatbot-empty-icon">👋</div>
              <h4>Welcome to GrantTracker Assistant</h4>
              <p>How can I help you today?</p>
              <div className="chatbot-suggestions">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    className="chatbot-suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <span className="chatbot-suggestion-icon">{suggestion.icon}</span>
                    <span>{suggestion.text}</span>
                  </button>
                ))}
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
                {message.sender === 'user' ? '👤' : '🤖'}
              </div>
              <div className="chatbot-message-bubble">
                {renderMessageContent(message)}
                {message.sender === 'bot' && !message.isError && (
                  <div className="chatbot-feedback">
                    <button
                      onClick={() => handleFeedback(1)}
                      className="chatbot-feedback-btn positive"
                      aria-label="Thumbs up"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback(0)}
                      className="chatbot-feedback-btn negative"
                      aria-label="Thumbs down"
                    >
                      👎
                    </button>
                  </div>
                )}
              </div>
              <div className="chatbot-message-time">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chatbot-message bot">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-message-bubble">
                <div className="chatbot-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          {isTyping && (
            <div className="chatbot-message bot">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-message-bubble">
                <div className="chatbot-typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chatbot-input-area">
          {error && (
            <div className="chatbot-error-message">
              {error}
              <button onClick={() => setError(null)} className="chatbot-error-close">×</button>
            </div>
          )}

          {feedback && (
            <div className="chatbot-feedback-notification">
              {feedback === 1 ? 'Thanks for your feedback! 👍' : 'Thanks for your feedback! 👎'}
            </div>
          )}

          <div className="chatbot-input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type your message..."
              disabled={isLoading}
              aria-label="Chat input"
              className="chatbot-input"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isLoading}
              className="chatbot-send-button"
              aria-label="Send message"
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {suggestions.length > 0 && messages.length > 0 && (
            <div className="chatbot-suggestions">
              {suggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  className="chatbot-suggestion-button"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <span className="chatbot-suggestion-icon">{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Analytics overlay (visible to admins in dev mode) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="chatbot-analytics-overlay">
            <div className="chatbot-analytics">
              <h4>Analytics</h4>
              <div className="chatbot-analytics-item">
                <span>Messages Sent:</span>
                <strong>{analytics.messagesSent}</strong>
              </div>
              <div className="chatbot-analytics-item">
                <span>Messages Received:</span>
                <strong>{analytics.messagesReceived}</strong>
              </div>
              <div className="chatbot-analytics-item">
                <span>Avg Response Time:</span>
                <strong>{analytics.avgResponseTime.toFixed(0)}ms</strong>
              </div>
              <div className="chatbot-analytics-item">
                <span>Satisfaction Score:</span>
                <strong>{analytics.satisfactionScore.toFixed(1)}/5</strong>
              </div>
            </div>
          </div>
        )}
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
