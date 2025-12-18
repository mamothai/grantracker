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
  const [activeConversationFlow, setActiveConversationFlow] = useState(null);
  const [analytics, setAnalytics] = useState({
    messagesSent: 0,
    messagesReceived: 0,
    avgResponseTime: 0,
    satisfactionScore: 0,
    complexQueriesHandled: 0
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
          { id: 'deadline', text: 'Find deadlines', icon: '📅' },
          { id: 'guide', text: 'Step-by-step guide', icon: '📖' }
        ]);
      } else if (lastMessage.includes('help') || lastMessage.includes('support')) {
        setSuggestions([
          { id: 'contact', text: 'Contact support', icon: '📞' },
          { id: 'faq', text: 'View FAQ', icon: '❓' },
          { id: 'guide', text: 'Get detailed guide', icon: '📖' },
          { id: 'compare', text: 'Compare options', icon: '⚖️' }
        ]);
      } else if (lastMessage.includes('step') || lastMessage.includes('guide') || lastMessage.includes('walk')) {
        setSuggestions([
          { id: 'next_step', text: 'Next step', icon: '➡️' },
          { id: 'previous', text: 'Previous step', icon: '⬅️' },
          { id: 'summary', text: 'Show summary', icon: '📊' },
          { id: 'clear', text: 'End guide', icon: '🗑️' }
        ]);
      } else {
        setSuggestions([
          { id: 'more', text: 'Tell me more', icon: '📚' },
          { id: 'examples', text: 'Show examples', icon: '💡' },
          { id: 'clear', text: 'Clear conversation', icon: '🗑️' },
          { id: 'compare', text: 'Compare options', icon: '⚖️' }
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
    const complexQueries = messages.filter(m =>
      m.metadata?.intent && ['multi_step_guide', 'comparison', 'detailed_info'].includes(m.metadata.intent)
    ).length;
    
    setAnalytics(prev => ({
      ...prev,
      messagesSent,
      messagesReceived,
      avgResponseTime: messagesReceived > 0
        ? messages.filter(m => m.sender === 'bot').reduce((sum, m) => sum + (m.responseTime || 0), 0) / messagesReceived
        : 0,
      complexQueriesHandled: complexQueries
    }));
  }, [messages]);

  // Enhanced Natural Language Processing - Intent recognition with improved parsing
  const analyzeIntent = useCallback((text) => {
    const normalized = text.toLowerCase().trim();
    
    // Remove common punctuation for better matching
    const cleaned = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    
    // Greetings - expanded patterns
    if (/^(hello|hi|hey|greetings|good [morning|afternoon|evening]|howdy|yo|hey there|what's up|hi there)/i.test(cleaned)) {
      return { intent: 'greeting', confidence: 0.95 };
    }
    
    // Grants/funding related - expanded patterns
    if (/(grant|funding|scholarship|financial aid|bursary|subsidy|loan|financial assistance|money for|fund|finance)/i.test(cleaned)) {
      return { intent: 'grant_info', confidence: 0.85 };
    }
    
    // Eligibility - expanded patterns
    if (/(eligible|qualify|requirement|criteria|qualification|who can apply|am i eligible|can i get|requirements for)/i.test(cleaned)) {
      return { intent: 'eligibility', confidence: 0.9 };
    }
    
    // Deadlines - expanded patterns
    if (/(deadline|due date|when|application period|when is|date for|last day|cutoff|closing date)/i.test(cleaned)) {
      return { intent: 'deadline', confidence: 0.85 };
    }
    
    // Help/support - expanded patterns
    if (/(help|support|assistance|trouble|issue|problem|how to|guide|walk me through|explain|need help)/i.test(cleaned)) {
      return { intent: 'help', confidence: 0.8 };
    }
    
    // Thank you - expanded patterns
    if (/(thank|thanks|appreciate|great help|thank you|thanks a lot|much appreciated|you're helpful)/i.test(cleaned)) {
      return { intent: 'gratitude', confidence: 0.95 };
    }
    
    // Clear conversation
    if (/(clear|reset|start over|new conversation|empty|delete|remove)/i.test(cleaned)) {
      return { intent: 'clear', confidence: 0.9 };
    }
    
    // Specific grant queries
    if (/(how much|amount|money|budget|cost)/i.test(cleaned)) {
      return { intent: 'amount', confidence: 0.7 };
    }
    
    // Complex multi-step queries
    if (/(step by step|walk me through|process for|how do i|guide me|what are the steps|procedure for)/i.test(cleaned)) {
      return { intent: 'multi_step_guide', confidence: 0.9 };
    }
    
    // Comparison queries
    if (/(compare|difference between|which is better|vs|versus|compare .* and .*)/i.test(cleaned)) {
      return { intent: 'comparison', confidence: 0.85 };
    }
    
    // Detailed information requests
    if (/(details about|more information on|tell me about|explain|describe|what is)/i.test(cleaned)) {
      return { intent: 'detailed_info', confidence: 0.8 };
    }
    
    return { intent: 'unknown', confidence: 0.1 };
  }, []);
  
  // Multi-step conversation flow management
  const conversationFlows = {
    'grant_application': {
      steps: [
        { id: 'find_grants', prompt: 'Let me help you find suitable grants. What type of funding are you looking for?' },
        { id: 'check_eligibility', prompt: 'Great! Now let\'s check if you qualify. What is your organization type?' },
        { id: 'gather_documents', prompt: 'You\'ll need certain documents. Do you have your financial statements ready?' },
        { id: 'submit_application', prompt: 'Almost there! Would you like me to guide you through the submission process?' }
      ],
      currentStep: 0
    },
    'eligibility_check': {
      steps: [
        { id: 'organization_type', prompt: 'What type of organization are you (non-profit, business, individual)?' },
        { id: 'location', prompt: 'Where is your organization located?' },
        { id: 'revenue', prompt: 'What is your annual revenue range?' },
        { id: 'summary', prompt: 'Based on your answers, here\'s what I found about your eligibility...' }
      ],
      currentStep: 0
    }
  };
  
  const startConversationFlow = useCallback((flowId) => {
    if (conversationFlows[flowId]) {
      setActiveConversationFlow({
        ...conversationFlows[flowId],
        id: flowId
      });
      return true;
    }
    return false;
  }, []);
  
  const advanceConversationFlow = useCallback(() => {
    if (activeConversationFlow) {
      const updatedFlow = {
        ...activeConversationFlow,
        currentStep: activeConversationFlow.currentStep + 1
      };
      setActiveConversationFlow(updatedFlow);
      
      if (updatedFlow.currentStep >= updatedFlow.steps.length - 1) {
        setTimeout(() => {
          setActiveConversationFlow(null);
        }, 3000);
      }
      
      return updatedFlow;
    }
    return null;
  }, [activeConversationFlow]);

  // Enhanced context-aware response generation with improved error handling
  const generateResponse = useCallback(async (message, intent) => {
    setIsLoading(true);
    setIsTyping(true);
    
    const startTime = Date.now();
    
    try {
      // Simulate API call with realistic delay (optimized for performance)
      await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
      
      // Enhanced context with conversation history and user preferences
      const context = {
        currentMessage: message,
        intent,
        history: conversationHistoryRef.current.slice(-10), // Keep last 10 messages for better context
        location: location.pathname,
        language,
        timestamp: new Date().toISOString(),
        activeFlow: activeConversationFlow
      };
      
      // Generate response based on intent with fallback mechanisms
      let response = '';
      
      switch (intent.intent) {
        case 'greeting':
          response = getGreetingResponse(message, language);
          break;
        case 'grant_info':
          response = await getGrantInfoResponse(message, language, context);
          break;
        case 'eligibility':
          response = await getEligibilityResponse(message, language, context);
          break;
        case 'deadline':
          response = await getDeadlineResponse(message, language, context);
          break;
        case 'help':
          response = getHelpResponse(message, language, context);
          break;
        case 'gratitude':
          response = getGratitudeResponse(message, language);
          break;
        case 'clear':
          response = getClearResponse(language);
          break;
        case 'amount':
          response = await getAmountResponse(message, language, context);
          break;
        case 'multi_step_guide':
          response = await getMultiStepGuideResponse(message, language, context);
          break;
        case 'comparison':
          response = await getComparisonResponse(message, language, context);
          break;
        case 'detailed_info':
          response = await getDetailedInfoResponse(message, language, context);
          break;
        default:
          // Enhanced fallback with context awareness
          response = getFallbackResponse(message, language, context);
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
          context,
          processed: true
        }
      };
    } catch (err) {
      console.error('Error generating response:', err);
      
      // Enhanced error handling with specific error types
      if (err.message.includes('network') || err.message.includes('fetch')) {
        return {
          text: getNetworkErrorResponse(language),
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isError: true,
          errorType: 'network'
        };
      } else if (err.message.includes('timeout')) {
        return {
          text: getTimeoutErrorResponse(language),
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isError: true,
          errorType: 'timeout'
        };
      } else {
        return {
          text: getErrorResponse(language),
          sender: 'bot',
          timestamp: new Date().toISOString(),
          isError: true,
          errorType: 'unknown'
        };
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [location.pathname, language, activeConversationFlow]);
  
  // Multi-step guide response
  const getMultiStepGuideResponse = async (message, lang, context) => {
    const responses = {
      en: {
        intro: 'I can guide you through this step by step. Let me start with the first step:',
        step: 'Step {current} of {total}: {description}',
        conclusion: 'You\'ve completed all the steps! Would you like to review anything or start over?'
      },
      es: {
        intro: 'Puedo guiarte paso a paso. Empecemos con el primer paso:',
        step: 'Paso {current} de {total}: {description}',
        conclusion: '¡Has completado todos los pasos! ¿Te gustaría revisar algo o empezar de nuevo?'
      },
      fr: {
        intro: 'Je peux vous guider étape par étape. Commençons par la première étape:',
        step: 'Étape {current} sur {total}: {description}',
        conclusion: 'Vous avez terminé toutes les étapes ! Voulez-vous réviser quelque chose ou recommencer ?'
      },
      de: {
        intro: 'Ich kann Sie Schritt für Schritt führen. Beginnen wir mit dem ersten Schritt:',
        step: 'Schritt {current} von {total}: {description}',
        conclusion: 'Sie haben alle Schritte abgeschlossen! Möchten Sie etwas überprüfen oder von vorne beginnen?'
      },
      hi: {
        intro: 'मैं आपको चरण दर चरण मार्गदर्शन कर सकता हूँ। पहले चरण से शुरू करें:',
        step: 'चरण {current} में से {total}: {description}',
        conclusion: 'आपने सभी चरणों को पूरा कर लिया है! क्या आप कुछ समीक्षा करना चाहते हैं या फिर से शुरू करना चाहते हैं?'
      }
    };
    
    // Start or continue a conversation flow
    if (!activeConversationFlow) {
      // Try to determine which flow to start based on message content
      if (message.toLowerCase().includes('grant') || message.toLowerCase().includes('application')) {
        startConversationFlow('grant_application');
        return responses[lang].intro || responses.en.intro;
      } else if (message.toLowerCase().includes('eligible') || message.toLowerCase().includes('qualify')) {
        startConversationFlow('eligibility_check');
        return responses[lang].intro || responses.en.intro;
      }
    }
    
    // If we have an active flow, continue it
    if (activeConversationFlow && activeConversationFlow.currentStep < activeConversationFlow.steps.length) {
      const currentStep = activeConversationFlow.steps[activeConversationFlow.currentStep];
      const stepTemplate = responses[lang].step || responses.en.step;
      const stepDescription = currentStep.prompt;
      
      return stepTemplate
        .replace('{current}', activeConversationFlow.currentStep + 1)
        .replace('{total}', activeConversationFlow.steps.length)
        .replace('{description}', stepDescription);
    }
    
    // Flow completed
    return responses[lang].conclusion || responses.en.conclusion;
  };
  
  // Comparison response
  const getComparisonResponse = async (message, lang, context) => {
    const responses = {
      en: {
        intro: 'Let me compare these options for you:',
        comparison: 'Here\'s how they compare:',
        conclusion: 'Would you like more details about either option?'
      },
      es: {
        intro: 'Déjame comparar estas opciones para ti:',
        comparison: 'Así es como se comparan:',
        conclusion: '¿Te gustaría más detalles sobre alguna opción?'
      },
      fr: {
        intro: 'Laissez-moi comparer ces options pour vous:',
        comparison: 'Voici comment elles se comparent:',
        conclusion: 'Voulez-vous plus de détails sur l\'une ou l\'autre option ?'
      },
      de: {
        intro: 'Lass mich diese Optionen für Sie vergleichen:',
        comparison: 'So vergleichen sie sich:',
        conclusion: 'Möchten Sie mehr Details über eine der Optionen?'
      },
      hi: {
        intro: 'मुझे इन विकल्पों की तुलना करने दें:',
        comparison: 'यहाँ उनकी तुलना है:',
        conclusion: 'क्या आप किसी विकल्प के बारे में और विवरण चाहते हैं?'
      }
    };
    
    return `${responses[lang].intro || responses.en.intro}\n\n${responses[lang].comparison || responses.en.comparison}\n\n${responses[lang].conclusion || responses.en.conclusion}`;
  };
  
  // Detailed information response
  const getDetailedInfoResponse = async (message, lang, context) => {
    const responses = {
      en: {
        intro: 'Here\'s detailed information about that:',
        section: '• {section}: {details}',
        conclusion: 'Would you like to know more about any specific aspect?'
      },
      es: {
        intro: 'Aquí tienes información detallada sobre eso:',
        section: '• {section}: {details}',
        conclusion: '¿Te gustaría saber más sobre algún aspecto específico?'
      },
      fr: {
        intro: 'Voici des informations détaillées à ce sujet:',
        section: '• {section}: {details}',
        conclusion: 'Voulez-vous en savoir plus sur un aspect spécifique ?'
      },
      de: {
        intro: 'Hier sind detaillierte Informationen dazu:',
        section: '• {section}: {details}',
        conclusion: 'Möchten Sie mehr über einen bestimmten Aspekt erfahren?'
      },
      hi: {
        intro: 'यहाँ उस बारे में विस्तृत जानकारी है:',
        section: '• {section}: {details}',
        conclusion: 'क्या आप किसी विशेष पहलू के बारे में और जानना चाहते हैं?'
      }
    };
    
    return `${responses[lang].intro || responses.en.intro}\n\n• Point 1: Detailed information\n• Point 2: More details here\n• Point 3: Additional information\n\n${responses[lang].conclusion || responses.en.conclusion}`;
  };

  // Input validation and sanitization
  const validateAndSanitizeInput = useCallback((input) => {
    if (!input || typeof input !== 'string') {
      return { isValid: false, error: 'Invalid input type' };
    }
    
    const trimmed = input.trim();
    
    // Check for excessive length
    if (trimmed.length > 1000) {
      return { isValid: false, error: 'Message too long (max 1000 characters)' };
    }
    
    // Check for potentially malicious content
    const dangerousPatterns = [
      /<script.*?>/gi,
      /<\/script>/gi,
      /javascript:/gi,
      /onerror\s*=/gi,
      /onload\s*=/gi,
      /eval\(/gi,
      /document\.cookie/gi,
      /window\.location/gi
    ];
    
    for (const pattern of dangerousPatterns) {
      if (pattern.test(trimmed)) {
        return { isValid: false, error: 'Invalid characters detected' };
      }
    }
    
    // Check for excessive special characters
    const specialCharCount = (trimmed.match(/[!@#$%^&*()_+{}\[\]:;<>,.?~\/\\]/g) || []).length;
    if (specialCharCount > 20) {
      return { isValid: false, error: 'Too many special characters' };
    }
    
    return { isValid: true, cleaned: trimmed };
  }, []);

  // Handle user message with enhanced validation
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;
    
    // Validate and sanitize input
    const validation = validateAndSanitizeInput(inputValue);
    
    if (!validation.isValid) {
      setError(validation.error);
      setInputValue('');
      return;
    }
    
    const userMessage = {
      text: validation.cleaned,
      sender: 'user',
      timestamp: new Date().toISOString()
    };
    
    // Add user message to conversation
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    conversationHistoryRef.current = updatedMessages;
    
    // Store in localStorage with size limit
    try {
      localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify(updatedMessages));
    } catch (e) {
      console.error('Storage full, clearing old data');
      // Clear old sessions if storage is full
      localStorage.removeItem(`chatbot_history_${sessionId}`);
      localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify(updatedMessages.slice(-50)));
    }
    
    // Clear input
    setInputValue('');
    setError(null);
    
    // Analyze intent
    const intent = analyzeIntent(validation.cleaned);
    
    // Generate and add bot response
    const botResponse = await generateResponse(validation.cleaned, intent);
    
    setMessages(prev => [...prev, botResponse]);
    conversationHistoryRef.current = [...updatedMessages, botResponse];
    
    // Store updated conversation with size limit
    try {
      localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify([...updatedMessages, botResponse]));
    } catch (e) {
      console.error('Storage full, keeping recent messages');
      localStorage.setItem(`chatbot_history_${sessionId}`, JSON.stringify([...updatedMessages, botResponse].slice(-50)));
    }
    
    // Update analytics
    setAnalytics(prev => ({
      ...prev,
      messagesSent: prev.messagesSent + 1,
      messagesReceived: prev.messagesReceived + 1
    }));
  }, [inputValue, messages, isLoading, sessionId, analyzeIntent, generateResponse, analytics, validateAndSanitizeInput]);

  // Handle suggestion click
  const handleSuggestionClick = useCallback((suggestion) => {
    switch (suggestion.id) {
      case 'clear':
        setMessages([]);
        conversationHistoryRef.current = [];
        localStorage.removeItem(`chatbot_history_${sessionId}`);
        setActiveConversationFlow(null);
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
        setInputValue('Give me a step-by-step guide for grant applications');
        break;
      case 'more':
        setInputValue('Tell me more about this');
        break;
      case 'examples':
        setInputValue('Show me some examples');
        break;
      case 'compare':
        setInputValue('Compare different grant options');
        break;
      case 'next_step':
        advanceConversationFlow();
        return; // Don't send message, just advance flow
      case 'previous':
        if (activeConversationFlow && activeConversationFlow.currentStep > 0) {
          setActiveConversationFlow({
            ...activeConversationFlow,
            currentStep: activeConversationFlow.currentStep - 1
          });
        }
        return;
      case 'summary':
        setInputValue('Show me a summary of the steps');
        break;
      default:
        setInputValue(suggestion.text);
    }
    
    // Auto-send if not empty
    if (inputValue.trim()) {
      handleSendMessage();
    }
  }, [inputValue, handleSendMessage, sessionId, activeConversationFlow, advanceConversationFlow]);

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

  const getGrantInfoResponse = async (message, lang, context) => {
    // Enhanced context-aware response with better error handling
    const responses = {
      en: [
        'Here are some available grants that might match your needs:',
        'I found several grant opportunities for you:',
        'Check out these funding options:',
        'Based on your query, here are relevant grants:'
      ],
      es: [
        'Aquí tienes algunas subvenciones disponibles que podrían interesarte:',
        'He encontrado varias oportunidades de subvención para ti:',
        'Revisa estas opciones de financiamiento:',
        'Según tu consulta, aquí tienes subvenciones relevantes:'
      ],
      fr: [
        'Voici quelques subventions disponibles qui pourraient vous intéresser:',
        'J\'ai trouvé plusieurs opportunités de subvention pour vous:',
        'Consultez ces options de financement:',
        'Selon votre demande, voici des subventions pertinentes:'
      ],
      de: [
        'Hier sind einige verfügbare Zuschüsse, die für Sie interessant sein könnten:',
        'Ich habe mehrere Fördermöglichkeiten für Sie gefunden:',
        'Schauen Sie sich diese Finanzierungsoptionen an:',
        'Basierend auf Ihrer Anfrage, hier sind relevante Zuschüsse:'
      ],
      hi: [
        'यहां कुछ उपलब्ध अनुदान हैं जो आपकी आवश्यकताओं के अनुरूप हो सकते हैं:',
        'मैं आपके लिए कुछ अनुदान अवसर ढूंढा:',
        'इन वित्तपोषण विकल्पों पर नज़र डालें:',
        'अपने प्रश्न के आधार पर, यहाँ relevante अनुदान हैं:'
      ]
    };
    
    // Try to fetch real data with enhanced error handling
    try {
      const response = await fetch('/api/grants', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      
      if (response.ok) {
        const grants = await response.json();
        
        // Context-aware filtering
        const normalizedMessage = message.toLowerCase();
        const filteredGrants = grants.filter(grant => {
          const grantText = (grant.name + ' ' + grant.sector + ' ' + grant.description).toLowerCase();
          return grantText.includes(normalizedMessage.split(/[^a-zA-Z0-9]/).filter(Boolean).join(' '));
        });
        
        const sampleGrants = filteredGrants.length > 0
          ? filteredGrants.slice(0, 3)
          : grants.slice(0, 3);
        
        if (sampleGrants.length > 0) {
          return `${responses[lang][Math.floor(Math.random() * responses[lang].length)]}\n\n${sampleGrants.map(g => `• **${g.name}** (${g.sector})\n   Amount: ${g.amount} ${g.currency}\n   ${g.description ? `Description: ${g.description.substring(0, 100)}...` : ''}`).join('\n\n')}`;
        }
      }
    } catch (e) {
      console.error('Error fetching grants:', e);
      // Fallback with cached data or generic response
      if (context.history.length > 0) {
        return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
      }
    }
    
    // Final fallback with helpful information
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)]
      || `I found some grants that might help you. Would you like me to search for something specific?`;
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

  const getFallbackResponse = (message, lang, context) => {
    const responses = {
      en: [
        'I\'m not sure I understand. Could you rephrase that?',
        'I didn\'t quite get that. Can you clarify?',
        'Sorry, I don\'t have an answer for that. Let me know how I can help!',
        'I\'m still learning! Could you provide more details?',
        'I didn\'t catch that. Could you try different words?'
      ],
      es: [
        'No estoy seguro de entender. ¿Podrías reformular eso?',
        'No lo entendí del todo. ¿Puedes aclarar?',
        'Lo siento, no tengo una respuesta para eso. ¡Hazme saber cómo puedo ayudar!',
        '¡Todavía estoy aprendiendo! ¿Podrías proporcionar más detalles?',
        'No lo entendí. ¿Podrías usar palabras diferentes?'
      ],
      fr: [
        'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?',
        'Je n\'ai pas tout compris. Pouvez-vous clarifier ?',
        'Désolé, je n\'ai pas de réponse à cela. Faites-moi savoir comment je peux aider !',
        'Je suis encore en apprentissage ! Pouvez-vous fournir plus de détails ?',
        'Je n\'ai pas compris. Pouvez-vous utiliser des mots différents ?'
      ],
      de: [
        'Ich bin mir nicht sicher, ob ich das verstehe. Könnten Sie das umformulieren?',
        'Das habe ich nicht ganz verstanden. Können Sie das klären?',
        'Entschuldigung, ich habe keine Antwort darauf. Lassen Sie mich wissen, wie ich helfen kann!',
        'Ich lerne noch! Könnten Sie mehr Details geben?',
        'Das habe ich nicht verstanden. Könnten Sie andere Wörter verwenden?'
      ],
      hi: [
        'मुझे नहीं समझ आ रहा। क्या आप इसे दोबारा कह सकते हैं?',
        'मुझे पूरी तरह से समझ में नहीं आया। क्या आप स्पष्ट कर सकते हैं?',
        'माफ कीजिए, मुझे इसका उत्तर नहीं है। मुझे बताएं कि मैं आपकी कैसे मदद कर सकता हूँ!',
        'मैं अभी सीख रहा हूँ! क्या आप और विवरण दे सकते हैं?',
        'मुझे समझ में नहीं आया। क्या आप अलग शब्दों का उपयोग कर सकते हैं?'
      ]
    };
    
    // Context-aware fallback
    if (context && context.history.length > 0) {
      const lastUserMessage = context.history[context.history.length - 2]?.text || '';
      if (lastUserMessage.toLowerCase().includes('grant') || lastUserMessage.toLowerCase().includes('funding')) {
        return `I couldn't find information about that specific grant. Would you like me to search for grants in a different category?`;
      }
    }
    
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

  const getNetworkErrorResponse = (lang) => {
    const responses = {
      en: 'Network error. Please check your connection and try again.',
      es: 'Error de red. Verifique su conexión e intente nuevamente.',
      fr: 'Erreur de réseau. Veuillez vérifier votre connexion et réessayer.',
      de: 'Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung und versuchen Sie es erneut.',
      hi: 'नेटवर्क त्रुटि। कृपया अपने कनेक्शन की जांच करें और पुन: प्रयास करें।'
    };
    
    return responses[lang] || responses.en;
  };

  const getTimeoutErrorResponse = (lang) => {
    const responses = {
      en: 'The request timed out. Please try again.',
      es: 'La solicitud tardó demasiado. Por favor, intente nuevamente.',
      fr: 'La requête a expiré. Veuillez réessayer.',
      de: 'Die Anfrage ist abgelaufen. Bitte versuchen Sie es erneut.',
      hi: 'रिक्वेस्ट टाइम आउट हो गया। कृपया पुन: प्रयास करें।'
    };
    
    return responses[lang] || responses.en;
  };

  const getClearResponse = (lang) => {
    const responses = {
      en: 'Conversation cleared! How can I help you now?',
      es: 'Conversación borrada. ¿En qué puedo ayudarte ahora?',
      fr: 'Conversation effacée. Comment puis-je vous aider maintenant ?',
      de: 'Unterhaltung gelöscht. Wie kann ich Ihnen jetzt helfen?',
      hi: 'कन्वर्सेशन साफ़ किया गया! अब मैं आपकी कैसे मदद कर सकता हूँ?'
    };
    
    return responses[lang] || responses.en;
  };

  const getAmountResponse = async (message, lang, context) => {
    const responses = {
      en: [
        'Grant amounts vary by program. Would you like me to find specific amount information?',
        'The funding amount depends on the grant. Let me check the details for you!',
        'Grant amounts typically range from small to large depending on the program.'
      ],
      es: [
        'Las cantidades de las subvenciones varían según el programa. ¿Te gustaría que encuentre información específica?',
        'La cantidad de financiamiento depende de la subvención. ¡Déjame verificar los detalles!',
        'Las cantidades de las subvenciones suelen variar desde pequeñas a grandes según el programa.'
      ],
      fr: [
        'Les montants des subventions varient selon le programme. Voulez-vous que je trouve des informations spécifiques ?',
        'Le montant du financement dépend de la subvention. Laissez-moi vérifier les détails !',
        'Les montants des subventions varient généralement de petits à grands selon le programme.'
      ],
      de: [
        'Die Zuschussbeträge variieren je nach Programm. Möchten Sie, dass ich spezifische Betragsinformationen finde?',
        'Der Förderbetrag hängt vom Zuschuss ab. Lass mich die Details für Sie prüfen!',
        'Zuschussbeträge variieren typischerweise von klein bis groß je nach Programm.'
      ],
      hi: [
        'अनुदान की राशि प्रोग्राम पर निर्भर करती है। क्या आप चाहते हैं कि मैं विशेष राशि जानकारी ढूंढे?',
        'वित्तपोषण की राशि अनुदान पर निर्भर करती है। मुझे विवरण जांचने दें!',
        'अनुदान की राशियाँ आमतौर पर प्रोग्राम के अनुसार छोटी से बड़ी होती हैं।'
      ]
    };
    
    return responses[lang]?.[Math.floor(Math.random() * responses[lang].length)] || responses.en[0];
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
    
    // Check if this is a step in a conversation flow
    const isStepMessage = message.metadata?.context?.activeFlow &&
                         message.metadata?.intent === 'multi_step_guide';
    
    return (
      <div className="chatbot-message-content">
        {message.text.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
        
        {/* Show complex query badge for certain intents */}
        {['multi_step_guide', 'comparison', 'detailed_info'].includes(message.metadata?.intent || '') && (
          <div className="chatbot-complex-query-badge">
            {message.metadata?.intent === 'multi_step_guide' ? 'Step-by-Step Guide' :
             message.metadata?.intent === 'comparison' ? 'Comparison' : 'Detailed Info'}
          </div>
        )}
        
        {message.metadata?.intent && (
          <div className="chatbot-message-metadata">
            <small>Intent: {message.metadata.intent} ({Math.round(message.metadata.confidence * 100)}%)</small>
          </div>
        )}
      </div>
    );
  };
  
  // Render conversation flow progress
  const renderFlowProgress = () => {
    if (!activeConversationFlow) return null;
    
    return (
      <div className="chatbot-flow-progress">
        <div className="chatbot-flow-progress-header">
          <span>Guide Progress</span>
          <span>{activeConversationFlow.currentStep + 1} of {activeConversationFlow.steps.length}</span>
        </div>
        <div className="chatbot-flow-progress-steps">
          {activeConversationFlow.steps.map((step, index) => {
            let stepStatus = 'upcoming';
            if (index < activeConversationFlow.currentStep) {
              stepStatus = 'completed';
            } else if (index === activeConversationFlow.currentStep) {
              stepStatus = 'active';
            }
            
            return (
              <div key={index} className={`chatbot-flow-progress-step ${stepStatus}`}>
                <div className="chatbot-flow-progress-step-indicator">
                  {index < activeConversationFlow.currentStep ? '✓' : index + 1}
                </div>
                <span>{step.prompt}</span>
              </div>
            );
          })}
        </div>
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
          {/* Conversation flow progress indicator */}
          {activeConversationFlow && renderFlowProgress()}
          
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

          {(isLoading || isTyping) && (
            <div className="chatbot-message bot">
              <div className="chatbot-avatar">🤖</div>
              <div className="chatbot-message-bubble">
                <div className="chatbot-typing-indicator-enhanced">
                  <div className="chatbot-avatar">🤖</div>
                  <div className="chatbot-typing-indicator-enhanced-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
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
              <div className="chatbot-analytics-item">
                <span>Complex Queries:</span>
                <strong>{analytics.complexQueriesHandled}</strong>
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
