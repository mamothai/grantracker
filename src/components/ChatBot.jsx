import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// ChatBot Component - Best-in-Class Implementation with Comprehensive Website Coverage
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
  const [proactiveSuggestions, setProactiveSuggestions] = useState([]);
  const [accessibilityMode, setAccessibilityMode] = useState(false);
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
  const navigate = useNavigate();
  const typingTimeoutRef = useRef(null);
  const conversationHistoryRef = useRef([]);
  const proactiveTimeoutRef = useRef(null);

  // Website navigation paths for direct navigation
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

  // Website content database for comprehensive responses
  const websiteContent = {
    pages: {
      home: {
        title: "GrantTracker Portal - Home",
        description: "A transparent digital system connecting officials, creators, and the public with verified grant activity",
        features: ["500+ Active Grants", "₹50M+ Total Allocation", "100% Transparency", "Real-time tracking", "Public suggestions", "Government dashboard", "Creator portal"],
        ctas: ["Explore Dashboard", "Creator Login", "Government Login", "Submit Feedback"]
      },
      about: {
        title: "About GrantTracker",
        description: "Transparent grants start with honest data. GrantTracker brings every stakeholder onto a single, verifiable source of truth",
        features: ["End-to-end grant status", "Deadline & compliance guardrails", "Analytics & public transparency", "Real-time tracking", "Multi-sector support"],
        stats: ["50K+ Grants mapped in pilots", "12 Sectors supported", "3x Faster reporting cycles"]
      },
      dashboard: {
        title: "Analytics Dashboard",
        description: "Live charts, distribution & analytics for grant allocations across sectors",
        features: ["Real-time analytics", "Sector-wise distribution", "Geographic breakdown", "Performance metrics", "Export capabilities"]
      },
      benefits: {
        title: "Government Benefits",
        description: "Comprehensive government schemes and benefits designed to empower citizens across all sectors",
        sectors: ["Agriculture", "Education", "Health", "Infrastructure", "Environment", "Technology", "Women & Child"]
      }
    },
    grants: [
      { id: "AGR-001", name: "PM Kisan Samman Nidhi", sector: "Agriculture", amount: "₹6,000/year", description: "Annual income support to farmers", details: "Provides ₹6,000 annually. Over 11 crore farmer families registered. ₹2.8 lakh crore disbursed.", yearLaunched: "2019", beneficiaries: "11 crore farmers", coverage: "National", keywords: ["kisan", "farmer", "agriculture", "income"], officialLink: "https://pmkisan.gov.in/" },
      { id: "AGR-002", name: "Soil Health Card Scheme", sector: "Agriculture", amount: "Free testing", description: "Soil testing and nutrient management", details: "22 crore soil health cards issued. Improves balanced fertilizer use", yearLaunched: "2015", beneficiaries: "22 crore farmers", coverage: "National", keywords: ["soil", "health", "testing", "agriculture"], officialLink: "https://soilhealth.dac.gov.in/" },
      { id: "AGR-003", name: "Pradhan Mantri Fasal Bima Yojana", sector: "Agriculture", amount: "Premium coverage", description: "Crop insurance against crop failure", details: "Protects farmers from natural calamities. Government subsidizes premium.", yearLaunched: "2016", beneficiaries: "Millions of farmers", coverage: "National", keywords: ["crop insurance", "fasal bima", "protection"], officialLink: "https://pmfby.gov.in/" },
      { id: "EDU-001", name: "Mid Day Meal Scheme", sector: "Education", amount: "Free meals", description: "Nutritious meals to school children", details: "10 crore children receive daily meals. Improves attendance and learning.", yearLaunched: "1995", beneficiaries: "10 crore children", coverage: "National", keywords: ["midday meal", "education", "school", "nutrition", "student"], officialLink: "https://mdm.nic.in/" },
      { id: "EDU-002", name: "National Scholarship Scheme", sector: "Education", amount: "Varies by merit", description: "Scholarships for meritorious students", details: "Supports talented students from weaker sections. Covers tuition and maintenance.", yearLaunched: "2006", beneficiaries: "Lakh of students", coverage: "National", keywords: ["scholarship", "student", "education", "merit"], officialLink: "https://scholarships.gov.in/" },
      { id: "EDU-003", name: "Samagra Shiksha", sector: "Education", amount: "Full funding", description: "Comprehensive education program", details: "Integrates RMSA and SSA. Focuses on quality education and infrastructure.", yearLaunched: "2018", beneficiaries: "Millions of students", coverage: "National", keywords: ["samagra shiksha", "education", "school"], officialLink: "https://samagra.education.gov.in/" },
      { id: "HEL-001", name: "Ayushman Bharat", sector: "Health", amount: "₹5 Lakh/family/year", description: "Cashless health insurance scheme", details: "11 crore families covered. Cashless treatment at 24,000+ hospitals. ₹5 lakh annual coverage per family.", yearLaunched: "2018", beneficiaries: "11 crore families", coverage: "National", keywords: ["ayushman bharat", "health insurance", "medical", "hospital"], officialLink: "https://pmjay.gov.in/" },
      { id: "HEL-002", name: "National Health Mission", sector: "Health", amount: "Full funding", description: "Aims to improve health outcomes", details: "Strengthens healthcare delivery. Focuses on maternal and child health.", yearLaunched: "2013", beneficiaries: "Entire population", coverage: "National", keywords: ["health mission", "healthcare", "medical"], officialLink: "https://nhm.gov.in/" },
      { id: "HEL-003", name: "COVID-19 Vaccination Drive", sector: "Health", amount: "Free vaccination", description: "Nationwide vaccination program", details: "Free vaccines. Largest vaccination drive globally. Achieved crores of vaccinations.", yearLaunched: "2021", beneficiaries: "Entire eligible population", coverage: "National", keywords: ["covid vaccine", "vaccination", "immunization"], officialLink: "https://www.mohfw.gov.in/" },
      { id: "INF-001", name: "Pradhan Mantri Gram Sadak Yojana", sector: "Infrastructure", amount: "Full funding", description: "Roads connecting rural habitations", details: "All-weather roads to unconnected villages. Improves rural connectivity and development.", yearLaunched: "2000", beneficiaries: "Rural populations", coverage: "National", keywords: ["gram sadak", "road", "rural", "infrastructure"], officialLink: "https://pmgsy.gov.in/" },
      { id: "INF-002", name: "Smart Cities Mission", sector: "Infrastructure", amount: "₹98,000 crore", description: "Modern infrastructure for 100 cities", details: "Smart transportation, water, waste management. 100 selected cities transformation.", yearLaunched: "2015", beneficiaries: "Urban populations", coverage: "100 cities", keywords: ["smart city", "infrastructure", "urban", "technology"], officialLink: "https://smartcities.gov.in/" },
      { id: "ENV-001", name: "Swachh Bharat Mission", sector: "Environment", amount: "Full funding", description: "National sanitation campaign", details: "11 crore toilets built. Aims for open defecation free India and waste management.", yearLaunched: "2014", beneficiaries: "Entire population", coverage: "National", keywords: ["swachh bharat", "sanitation", "clean", "environment"], officialLink: "https://swachhbharatmission.gov.in/" },
      { id: "ENV-002", name: "National Clean Air Programme", sector: "Environment", amount: "Full funding", description: "Address air pollution", details: "20-30% reduction in PM2.5 and PM10. Covers 102 cities nationwide.", yearLaunched: "2019", beneficiaries: "Urban populations", coverage: "102 cities", keywords: ["clean air", "pollution", "environment"], officialLink: "https://www.mppcb.mp.gov.in/ncap/" },
      { id: "TECH-001", name: "Digital India Programme", sector: "Technology", amount: "Full funding", description: "Digital empowerment of India", details: "Broadband to all villages. Digital literacy and e-governance promotion.", yearLaunched: "2015", beneficiaries: "Entire population", coverage: "National", keywords: ["digital india", "technology", "broadband", "internet"], officialLink: "https://www.digitalindia.gov.in/" },
      { id: "TECH-002", name: "E-Governance Initiative", sector: "Technology", amount: "Full funding", description: "Online government services", details: "Efficient government service delivery. Online portals for citizens. Reduces corruption.", yearLaunched: "2006", beneficiaries: "Entire population", coverage: "National", keywords: ["e-governance", "technology", "online", "digital"], officialLink: "https://www.egov.gov.in/" },
      { id: "WC-001", name: "ICDS - Integrated Child Development Services", sector: "Women & Child", amount: "Full funding", description: "Services for children under 6", details: "8 crore children and mothers covered. Health checkups, nutrition, preschool education.", yearLaunched: "1975", beneficiaries: "8 crore people", coverage: "National", keywords: ["icds", "child development", "nutrition", "children"], officialLink: "https://icds-wcd.nic.in/" },
      { id: "WC-002", name: "Ujjwala - Women's Safety Programme", sector: "Women & Child", amount: "Full funding", description: "Women's safety and empowerment", details: "Legal aid, shelter homes, counseling. Addresses violence against women.", yearLaunched: "2016", beneficiaries: "Millions of women", coverage: "National", keywords: ["ujjwala", "women", "safety", "empowerment"], officialLink: "https://pib.gov.in/PrReleaseContent.aspx?PRID=1575412" }
    ]
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

  // Proactive support system
  const generateProactiveSuggestions = useCallback(() => {
    const path = location.pathname;
    const suggestions = [];
    
    // Page-specific proactive suggestions
    switch (path) {
      case '/':
        suggestions.push(
          { id: 'view_dashboard', text: 'View live analytics dashboard', icon: '📊', action: 'navigate' },
          { id: 'explore_grants', text: 'Explore available grants', icon: '💰', action: 'suggest' },
          { id: 'about_platform', text: 'Learn about GrantTracker', icon: '📖', action: 'navigate' }
        );
        break;
      case '/about':
        suggestions.push(
          { id: 'contact_team', text: 'Contact our team', icon: '💬', action: 'suggest' },
          { id: 'partnership', text: 'Discuss partnership', icon: '🤝', action: 'suggest' }
        );
        break;
      case '/chart':
        suggestions.push(
          { id: 'sector_details', text: 'Get sector-wise details', icon: '📈', action: 'suggest' },
          { id: 'export_data', text: 'Export analytics data', icon: '📊', action: 'suggest' }
        );
        break;
      case '/benefits':
        suggestions.push(
          { id: 'check_eligibility', text: 'Check eligibility for schemes', icon: '✅', action: 'suggest' },
          { id: 'application_guide', text: 'Get application guidance', icon: '📝', action: 'suggest' }
        );
        break;
      default:
        suggestions.push(
          { id: 'general_help', text: 'How can I help you?', icon: '❓', action: 'suggest' }
        );
    }
    
    return suggestions;
  }, [location.pathname]);

  // Show proactive suggestions when chat is opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const suggestions = generateProactiveSuggestions();
      setProactiveSuggestions(suggestions);
      
      // Clear proactive suggestions after 30 seconds
      proactiveTimeoutRef.current = setTimeout(() => {
        setProactiveSuggestions([]);
      }, 30000);
    }
    
    return () => {
      if (proactiveTimeoutRef.current) {
        clearTimeout(proactiveTimeoutRef.current);
      }
    };
  }, [isOpen, messages.length, generateProactiveSuggestions]);

  // Accessibility improvements
  useEffect(() => {
    // Check for accessibility preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const prefersHighContrast = window.matchMedia('(prefers-contrast: high)').matches;
    
    if (prefersReducedMotion || prefersHighContrast) {
      setAccessibilityMode(true);
    }
  }, []);

  // Enhanced Natural Language Processing - Comprehensive website coverage
  const analyzeIntent = useCallback((text) => {
    const normalized = text.toLowerCase().trim();
    
    // Remove common punctuation for better matching
    const cleaned = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    
    // Direct navigation patterns (Enhanced)
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
    
    // Legacy website navigation queries (for backward compatibility)
    if (/(home|landing|main page|start here)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'home', confidence: 0.95 };
    }
    if (/(about|team|company|who are you|what is granttracker)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'about', confidence: 0.95 };
    }
    if (/(dashboard|analytics|chart|statistics|reports)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'dashboard', confidence: 0.9 };
    }
    if (/(benefits|schemes|government schemes|welfare)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'benefits', confidence: 0.9 };
    }
    if (/(suggestions|feedback|public|comment)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'suggestions', confidence: 0.9 };
    }
    if (/(creator|login|register|apply)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'creator', confidence: 0.85 };
    }
    if (/(government|official|admin|ministry)/i.test(cleaned)) {
      return { intent: 'page_navigation', target: 'government', confidence: 0.85 };
    }
    
    // Sector-specific queries
    if (/(agriculture|farmer|kisan|farming|crop)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Agriculture', confidence: 0.9 };
    }
    if (/(education|school|student|teacher|learning)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Education', confidence: 0.9 };
    }
    if (/(health|medical|hospital|doctor|medicine)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Health', confidence: 0.9 };
    }
    if (/(infrastructure|road|bridge|construction)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Infrastructure', confidence: 0.9 };
    }
    if (/(environment|clean|green|eco)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Environment', confidence: 0.9 };
    }
    if (/(technology|digital|internet|computer)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Technology', confidence: 0.9 };
    }
    if (/(women|child|family|icds)/i.test(cleaned)) {
      return { intent: 'sector_query', sector: 'Women & Child', confidence: 0.9 };
    }
    
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
    
    // Search queries
    if (/(search|find|look for|browse|filter)/i.test(cleaned)) {
      return { intent: 'search', confidence: 0.8 };
    }
    
    // Website features
    if (/(feature|capability|what can you do|what does this do)/i.test(cleaned)) {
      return { intent: 'website_features', confidence: 0.85 };
    }
    
    // Transparency and verification
    if (/(transparency|verify|verified|blockchain|audit)/i.test(cleaned)) {
      return { intent: 'transparency_info', confidence: 0.8 };
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
          break;
          
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
        // Website-specific intents
        case 'page_navigation':
          response = await getPageNavigationResponse(intent, language);
          break;
        case 'sector_query':
          response = await getSectorQueryResponse(intent, language);
          break;
        case 'website_features':
          response = await getWebsiteFeaturesResponse(language);
          break;
        case 'search':
          response = await getSearchResponse(message, language, context);
          break;
        case 'transparency_info':
          response = await getTransparencyResponse(language);
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
  }, [location.pathname, language, activeConversationFlow, handleDirectNavigation]);

  // Quick actions response generator
  const getQuickActionsResponse = () => {
    return `Here's what you can navigate to directly:\n\n${Object.values(websitePaths).map(path => 
      `${path.icon} **${path.label}**`
    ).join('\n\n')}\n\nJust tell me where you'd like to go!`;
  };

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

  // Website-specific response handlers
  const getPageNavigationResponse = async (intent, lang) => {
    const pageResponses = {
      home: {
        en: '🏠 **Welcome to GrantTracker Portal!**\n\nI\'m here to help you navigate our platform. You can:\n• View the **Dashboard** for real-time analytics\n• Explore **Benefits** to find government schemes\n• Submit **Suggestions** for transparency\n• Learn more about our **About** page\n\nWhat would you like to explore?',
        es: '🏠 **¡Bienvenido al Portal GrantTracker!**\n\nEstoy aquí para ayudarte a navegar por nuestra plataforma. Puedes:\n• Ver el **Panel** para análisis en tiempo real\n• Explorar **Beneficios** para encontrar esquemas gubernamentales\n• Enviar **Sugerencias** para transparencia\n• Obtener más información sobre nuestra página **Acerca de**\n\n¿Qué te gustaría explorar?'
      },
      about: {
        en: '📖 **About GrantTracker**\n\nGrantTracker brings transparency to grant funding. We connect officials, creators, and citizens on a single, verifiable platform. Key features:\n\n• **500+ Active Grants** tracking\n• **₹50M+ Total Allocation** monitored\n• **100% Transparency** with blockchain verification\n• **Real-time Analytics** and reporting\n\nWould you like to know more about any specific aspect?',
        es: '📖 **Acerca de GrantTracker**\n\nGrantTracker aporta transparencia a la financiación de subvenciones. Conectamos a funcionarios, creadores y ciudadanos en una sola plataforma verificable. Características clave:\n\n• Seguimiento de **más de 500 Subvenciones Activas**\n• Monitoreo de **más de ₹50M+ en Asignaciones Totales**\n• **100% Transparencia** con verificación blockchain\n• **Análisis en Tiempo Real** e informes\n\n¿Te gustaría saber más sobre algún aspecto específico?'
      },
      dashboard: {
        en: '📊 **Analytics Dashboard**\n\nOur dashboard provides:\n• Live charts and visualizations\n• Sector-wise grant distribution\n• Real-time analytics and metrics\n• Performance tracking\n• Export capabilities\n\nYou can access it at `/chart` for comprehensive grant insights.',
        es: '📊 **Panel de Análisis**\n\nNuestro panel proporciona:\n• Gráficos y visualizaciones en vivo\n• Distribución de subvenciones por sector\n• Análisis y métricas en tiempo real\n• Seguimiento del rendimiento\n• Capacidades de exportación\n\nPuedes acceder a él en `/chart` para obtener información completa sobre subvenciones.'
      },
      benefits: {
        en: '🇮🇳 **Government Benefits**\n\nExplore comprehensive schemes across sectors:\n\n🏛️ **Agriculture**: PM Kisan, Soil Health Cards\n🎓 **Education**: Mid Day Meal, Scholarships\n🏥 **Health**: Ayushman Bharat, Health Mission\n🏗️ **Infrastructure**: Smart Cities, Rural Roads\n🌱 **Environment**: Swachh Bharat, Clean Air\n💻 **Technology**: Digital India, E-Governance\n👶 **Women & Child**: ICDS, Safety Programs\n\nWhich sector interests you?',
        es: '🇮🇳 **Beneficios Gubernamentales**\n\nExplora esquemas integrales en todos los sectores:\n\n🏛️ **Agricultura**: PM Kisan, Tarjetas de Salud del Suelo\n🎓 **Educación**: Comida Mediodía, Becas\n🏥 **Salud**: Ayushman Bharat, Misión de Salud\n🏗️ **Infraestructura**: Ciudades Inteligentes, Carreteras Rurales\n🌱 **Medio Ambiente**: Swachh Bharat, Aire Limpio\n💻 **Tecnología**: India Digital, Gobierno Electrónico\n👶 **Mujeres y Niños**: ICDS, Programas de Seguridad\n\n¿Qué sector te interesa?'
      },
      suggestions: {
        en: '💬 **Public Suggestions**\n\nYour voice matters! Submit feedback about any grant to improve transparency. You can:\n• Report issues with grant distribution\n• Suggest improvements\n• Ask questions about specific schemes\n• Share success stories\n\nVisit `/suggestions` to share your feedback.',
        es: '💬 **Sugerencias Públicas**\n\n¡Tu voz importa! Envía comentarios sobre cualquier subvención para mejorar la transparencia. Puedes:\n• Informar problemas con la distribución de subvenciones\n• Sugerir mejoras\n• Hacer preguntas sobre esquemas específicos\n• Compartir historias de éxito\n\nVisita `/suggestions` para compartir tus comentarios.'
      },
      creator: {
        en: '✍️ **Creator Portal**\n\nCreators can register and manage grants through our streamlined portal:\n• Grant registration and tracking\n• Document management\n• Status updates\n• Progress reporting\n\nAccess the creator portal at `/creator-login` to get started.',
        es: '✍️ **Portal de Creadores**\n\nLos creadores pueden registrar y administrar subvenciones a través de nuestro portal optimizado:\n• Registro y seguimiento de subvenciones\n• Gestión de documentos\n• Actualizaciones de estado\n• Informes de progreso\n\nAccede al portal de creadores en `/creator-login` para comenzar.'
      },
      government: {
        en: '🏛️ **Government Dashboard**\n\nOfficials can manage grants through our secure portal:\n• Upload proof documents\n• Update milestones\n• Monitor progress\n• Generate reports\n• Ensure compliance\n\nGovernment officials can login at `/gov-login`.',
        es: '🏛️ **Panel Gubernamental**\n\nLos funcionarios pueden administrar subvenciones a través de nuestro portal seguro:\n• Subir documentos de prueba\n• Actualizar hitos\n• Monitorear el progreso\n• Generar informes\n• Asegurar el cumplimiento\n\nLos funcionarios gubernamentales pueden iniciar sesión en `/gov-login`.'
      }
    };
    
    return pageResponses[intent.target]?.[lang] || pageResponses[intent.target]?.en || 'I can help you navigate to different pages on our website.';
  };

  const getSectorQueryResponse = async (intent, lang) => {
    const sectorGrants = websiteContent.grants.filter(grant => grant.sector === intent.sector);
    
    const sectorResponses = {
      'Agriculture': {
        en: `🌾 **Agriculture Sector**\n\nKey grants and schemes:\n\n${sectorGrants.map(grant => 
          `• **${grant.name}**\n  ${grant.description}\n  Amount: ${grant.amount}\n  Beneficiaries: ${grant.beneficiaries}`
        ).join('\n\n')}\n\nThese schemes support millions of farmers across India with income support, soil health monitoring, and crop protection.`,
        es: `🌾 **Sector Agrícola**\n\nSubvenciones y esquemas clave:\n\n${sectorGrants.map(grant => 
          `• **${grant.name}**\n  ${grant.description}\n  Cantidad: ${grant.amount}\n  Beneficiarios: ${grant.beneficiaries}`
        ).join('\n\n')}\n\nEstos esquemas apoyan a millones de agricultores en India con apoyo económico, monitoreo de salud del suelo y protección de cultivos.`
      },
      'Education': {
        en: `🎓 **Education Sector**\n\nKey educational schemes:\n\n${sectorGrants.map(grant => 
          `• **${grant.name}**\n  ${grant.description}\n  Coverage: ${grant.coverage}\n  Beneficiaries: ${grant.beneficiaries}`
        ).join('\n\n')}\n\nThese initiatives improve access to education, nutrition, and quality learning for students across India.`,
        es: `🎓 **Sector Educativo**\n\nEsquemas educativos clave:\n\n${sectorGrants.map(grant => 
          `• **${grant.name}**\n  ${grant.description}\n  Cobertura: ${grant.coverage}\n  Beneficiarios: ${grant.beneficiaries}`
        ).join('\n\n')}\n\nEstas iniciativas mejoran el acceso a la educación, nutrición y aprendizaje de calidad para estudiantes en toda India.`
      },
      'Health': {
        en: `🏥 **Health Sector**\n\nMajor health initiatives:\n\n${sectorGrants.map(grant => 
          `• **${grant.name}**\n  ${grant.description}\n  Coverage: ${grant.coverage}\n  Beneficiaries: ${grant.beneficiaries}`
        ).join('\n\n')}\n\nThese programs provide accessible healthcare, insurance coverage, and preventive care for all citizens.`,
        es: `🏥 **Sector Salud**\n\nPrincipales iniciativas de salud:\n\n${sectorGrants.map(grant => 
          `• **${grant.name}**\n  ${grant.description}\n  Cobertura: ${grant.coverage}\n  Beneficiarios: ${grant.beneficiaries}`
        ).join('\n\n')}\n\nEstos programas proporcionan atención médica accesible, cobertura de seguro y atención preventiva para todos los ciudadanos.`
      }
    };
    
    return sectorResponses[intent.sector]?.[lang] || sectorResponses[intent.sector]?.en || `I can provide information about ${intent.sector} sector grants and schemes.`;
  };

  const getWebsiteFeaturesResponse = async (lang) => {
    const featureResponses = {
      en: '⚡ **GrantTracker Features**\n\nI can help you with:\n\n🔍 **Navigation**: Guide you to any page or feature\n📊 **Analytics**: Explain dashboard metrics and charts\n🏛️ **Grant Information**: Details on specific schemes\n📝 **Applications**: Step-by-step application guidance\n💬 **Feedback**: Submit suggestions and reports\n🔒 **Transparency**: Verify grant authenticity\n📱 **Multi-language**: Communicate in your preferred language\n\nJust ask me anything about our platform!',
      es: '⚡ **Características de GrantTracker**\n\nPuedo ayudarte con:\n\n🔍 **Navegación**: Guiarte a cualquier página o característica\n📊 **Análisis**: Explicar métricas y gráficos del panel\n🏛️ **Información de Subvenciones**: Detalles sobre esquemas específicos\n📝 **Aplicaciones**: Guía paso a paso para aplicaciones\n💬 **Comentarios**: Enviar sugerencias e informes\n🔒 **Transparencia**: Verificar la autenticidad de subvenciones\n📱 **Multiidioma**: Comunicarse en tu idioma preferido\n\n¡Solo pregúntame cualquier cosa sobre nuestra plataforma!'
    };
    
    return featureResponses[lang] || featureResponses.en;
  };

  const getSearchResponse = async (message, lang, context) => {
    // Search through grants based on keywords
    const searchTerms = message.toLowerCase().split(/\s+/);
    const matchedGrants = websiteContent.grants.filter(grant => {
      const searchableText = `${grant.name} ${grant.description} ${grant.details} ${grant.keywords.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
    
    if (matchedGrants.length > 0) {
      const resultText = `🔍 **Search Results**\n\nI found ${matchedGrants.length} relevant grant(s):\n\n${matchedGrants.slice(0, 3).map(grant => 
        `• **${grant.name}** (${grant.sector})\n  ${grant.description}\n  Amount: ${grant.amount}`
      ).join('\n\n')}`;
      
      if (matchedGrants.length > 3) {
        return resultText + `\n\n...and ${matchedGrants.length - 3} more. Would you like specific details about any of these?`;
      }
      return resultText;
    }
    
    const responses = {
      en: 'I couldn\'t find specific grants matching your search. Try asking about a particular sector like "agriculture" or "education", or ask for "all grants" to see what\'s available.',
      es: 'No pude encontrar subvenciones específicas que coincidan con tu búsqueda. Prueba preguntando sobre un sector particular como "agricultura" o "educación", o pide "todas las subvenciones" para ver qué está disponible.'
    };
    
    return responses[lang] || responses.en;
  };

  const getTransparencyResponse = async (lang) => {
    const transparencyResponses = {
      en: '🔒 **Transparency & Verification**\n\nGrantTracker ensures complete transparency:\n\n• **Blockchain Verification**: All grants are tamper-proof\n• **Real-time Updates**: Live status tracking\n• **Public Access**: Anyone can view grant details\n• **Audit Trail**: Complete history of all changes\n• **Evidence Upload**: Officials must provide proof\n• **Citizen Feedback**: Public can report issues\n\nThis creates a verifiable source of truth for all grant activities.',
      es: '🔒 **Transparencia y Verificación**\n\nGrantTracker garantiza total transparencia:\n\n• **Verificación Blockchain**: Todas las subvenciones son a prueba de manipulaciones\n• **Actualizaciones en Tiempo Real**: Seguimiento de estado en vivo\n• **Acceso Público**: Cualquiera puede ver detalles de subvenciones\n• **Rastro de Auditoría**: Historial completo de todos los cambios\n• **Subida de Evidencia**: Los funcionarios deben proporcionar pruebas\n• **Comentarios Ciudadanos**: El público puede reportar problemas\n\nEsto crea una fuente de verdad verificable para todas las actividades de subvenciones.'
    };
    
    return transparencyResponses[lang] || transparencyResponses.en;
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

  // Grant info response with dynamic content
  const getGrantInfoResponse = async (message, lang, context) => {
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
          const responses = {
            en: 'Here are some available grants that might match your needs:',
            es: 'Aquí tienes algunas subvenciones disponibles que podrían interesarte:',
            fr: 'Voici quelques subventions disponibles qui pourraient vous intéresser:',
            de: 'Hier sind einige verfügbare Zuschüsse, die für Sie interessant sein könnten:',
            hi: 'यहां कुछ उपलब्ध अनुदान हैं जो आपकी आवश्यकताओं के अनुरूप हो सकते हैं:'
          };
          
          return `${responses[lang] || responses.en}\n\n${sampleGrants.map(g => `• **${g.name}** (${g.sector})\n   Amount: ${g.amount} ${g.currency || ''}\n   ${g.description ? `Description: ${g.description.substring(0, 100)}...` : ''}`).join('\n\n')}`;
        }
      }
    } catch (e) {
      console.error('Error fetching grants:', e);
      // Fallback to local data
    }
    
    // Use local website content as fallback
    const searchTerms = message.toLowerCase().split(/\s+/);
    const matchedGrants = websiteContent.grants.filter(grant => {
      const searchableText = `${grant.name} ${grant.description} ${grant.details} ${grant.keywords.join(' ')}`.toLowerCase();
      return searchTerms.some(term => searchableText.includes(term));
    });
    
    const sampleGrants = matchedGrants.length > 0
      ? matchedGrants.slice(0, 3)
      : websiteContent.grants.slice(0, 3);
    
    const responses = {
      en: 'Based on available grants in our system:',
      es: 'Basado en las subvenciones disponibles en nuestro sistema:',
      fr: 'Basé sur les subventions disponibles dans notre système:',
      de: 'Basierend auf verfügbaren Zuschüssen in unserem System:',
      hi: 'हमारे सिस्टम में उपलब्ध अनुदानों के आधार पर:'
    };
    
    return `${responses[lang] || responses.en}\n\n${sampleGrants.map(g => `• **${g.name}** (${g.sector})\n   Amount: ${g.amount}\n   ${g.description}`).join('\n\n')}`;
  };

  // Enhanced greeting response with navigation options
  const getEnhancedGreetingResponse = (message, lang) => {
    const enhancedGreetings = {
      en: 'Hello! 👋 I\'m your GrantTracker Assistant. I can help you with:\n\n🏠 **Navigate** to any page\n💰 **Find grants** and schemes\n📊 **Understand** dashboard analytics\n📝 **Apply** for funding\n❓ **Answer** your questions\n\nWhat would you like to do?',
      es: '¡Hola! 👋 Soy tu Asistente de GrantTracker. Puedo ayudarte con:\n\n🏠 **Navegar** a cualquier página\n💰 **Encontrar** subvenciones y esquemas\n📊 **Entender** análisis del panel\n📝 **Solicitar** financiación\n❓ **Responder** tus preguntas\n\n¿Qué te gustaría hacer?'
    };
    return enhancedGreetings[lang] || enhancedGreetings.en;
  };

  // Simplified versions of other response functions
  const getGreetingResponse = (message, lang) => {
    // Enhanced greeting with navigation and feature overview
    return getEnhancedGreetingResponse(message, lang);
  };

  const getEligibilityResponse = async (message, lang) => {
    const responses = {
      en: 'Eligibility criteria typically include: organization type, location, revenue limits, and specific sector requirements. I can help you check eligibility for specific grants. What type of organization are you?',
      es: 'Los criterios de elegibilidad suelen incluir: tipo de organización, ubicación, límites de ingresos y requisitos específicos del sector. Puedo ayudarte a verificar la elegibilidad para subvenciones específicas.',
      fr: 'Les critères d\'éligibilité comprennent généralement: le type d\'organisation, l\'emplacement, les limites de revenus et les exigences spécifiques du secteur.',
      de: 'Die Zulassungskriterien umfassen typischerweise: Organisationstyp, Standort, Einkommensgrenzen und spezifische Sektoranforderungen.',
      hi: 'पात्रता मानदंड में आमतौर पर शामिल होते हैं: संगठन का प्रकार, स्थान, आय सीमा, और विशिष्ट क्षेत्र की आवश्यकताएं।'
    };
    return responses[lang] || responses.en;
  };

  const getDeadlineResponse = async (message, lang) => {
    const responses = {
      en: 'Grant deadlines vary by program. Many schemes have rolling applications, while others have specific deadlines. I can help you find deadline information for specific grants.',
      es: 'Las fechas límite de las subvenciones varían según el programa. Muchos esquemas tienen solicitudes continuas, mientras que otros tienen fechas límite específicas.',
      fr: 'Les dates limites des subventions varient selon le programme.许多计划有滚动申请，而其他计划有特定的截止日期。',
      de: 'Zuschussfristen variieren je nach Programm. Viele Programme haben laufende Bewerbungen, während andere spezifische Fristen haben.',
      hi: 'अनुदान की अंतिम तिथियाँ कार्यक्रम के अनुसार भिन्न होती हैं। कई योजनाओं में निरंतर आवेदन होते हैं, जबकि अन्य में विशिष्ट अंतिम तिथियाँ होती हैं।'
    };
    return responses[lang] || responses.en;
  };

  const getHelpResponse = (message, lang) => {
    const responses = {
      en: 'I can help with grant applications, eligibility questions, website navigation, and general support. What specific help do you need?',
      es: 'Puedo ayudarte con solicitudes de subvenciones, preguntas de elegibilidad, navegación del sitio web y soporte general.',
      fr: 'Je peux vous aider avec les demandes de subvention, les questions d\'éligibilité, la navigation du site web et le support général.',
      de: 'Ich kann bei Zuschussanträgen, Eignungsfragen, Website-Navigation und allgemeiner Unterstützung helfen.',
      hi: 'मैं अनुदान आवेदन, पात्रता प्रश्न, वेबसाइट नेविगेशन और सामान्य सहायता में मदद कर सकता हूँ।'
    };
    return responses[lang] || responses.en;
  };

  const getGratitudeResponse = (message, lang) => {
    const responses = {
      en: 'You\'re welcome! 😊 Is there anything else I can help you with?',
      es: '¡De nada! 😊 ¿Hay algo más en lo que pueda ayudarte?',
      fr: 'Avec plaisir ! 😊 Y a-t-il autre chose que je puisse faire pour vous ?',
      de: 'Gern geschehen! 😊 Brauchen Sie noch etwas?',
      hi: 'स्वागत है! 😊 क्या मैं आपकी और मदद कर सकता हूँ?'
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
      en: 'Grant amounts vary by program. From small individual scholarships to large infrastructure funding. What type of funding amount are you looking for?',
      es: 'Las cantidades de las subvenciones varían según el programa. Desde becas individuales pequeñas hasta financiamiento de infraestructura grande.',
      fr: 'Les montants des subventions varient selon le programme. Des petites bourses individuelles aux financements d\'infrastructure importants.',
      de: 'Die Zuschussbeträge variieren je nach Programm. Von kleinen individuellen Stipendien bis hin zu großen Infrastrukturfinanzierungen.',
      hi: 'अनुदान की राशि कार्यक्रम के अनुसार भिन्न होती है। छोटी व्यक्तिगत छात्रवृत्ति से लेकर बड़ी बुनियादी ढांचे की फंडिंग तक।'
    };
    return responses[lang] || responses.en;
  };

  const getFallbackResponse = (message, lang, context) => {
    const responses = {
      en: 'I\'m not sure I understand. Could you rephrase that? I can help with grants, website navigation, eligibility questions, and general information about GrantTracker.',
      es: 'No estoy seguro de entender. ¿Podrías reformular eso? Puedo ayudarte con subvenciones, navegación del sitio web, preguntas de elegibilidad e información general.',
      fr: 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ? Je peux vous aider avec les subventions, la navigation du site web, les questions d\'éligibilité et les informations générales.',
      de: 'Ich bin mir nicht sicher, ob ich das verstehe. Könnten Sie das umformulieren? Ich kann bei Zuschüssen, Website-Navigation, Eignungsfragen und allgemeinen Informationen helfen.',
      hi: 'मुझे नहीं समझ आ रहा। क्या आप इसे दोबारा कह सकते हैं? मैं अनुदान, वेबसाइट नेविगेशन, पात्रता प्रश्न और GrantTracker के बारे में सामान्य जानकारी में मदद कर सकता हूँ।'
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
    setProactiveSuggestions([]); // Clear proactive suggestions when user interacts
    
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
  }, [inputValue, messages, isLoading, sessionId, analyzeIntent, generateResponse, validateAndSanitizeInput]);

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
      // Proactive suggestion handlers
      case 'view_dashboard':
        setInputValue('Take me to the analytics dashboard');
        break;
      case 'explore_grants':
        setInputValue('Show me available grants');
        break;
      case 'about_platform':
        setInputValue('Tell me about GrantTracker');
        break;
      case 'contact_team':
        setInputValue('How can I contact the team?');
        break;
      case 'partnership':
        setInputValue('I want to discuss partnership opportunities');
        break;
      case 'sector_details':
        setInputValue('Show me sector-wise grant details');
        break;
      case 'export_data':
        setInputValue('How can I export analytics data?');
        break;
      case 'check_eligibility':
        setInputValue('Check my eligibility for government schemes');
        break;
      case 'application_guide':
        setInputValue('Guide me through the application process');
        break;
      case 'general_help':
        setInputValue('How can you help me?');
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
      messagesEndRef.current.scrollIntoView({ behavior: accessibilityMode ? 'auto' : 'smooth' });
    }
  }, [messages, isLoading, isTyping, accessibilityMode]);

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
      m.metadata?.intent && ['multi_step_guide', 'comparison', 'detailed_info', 'sector_query', 'page_navigation'].includes(m.metadata.intent)
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
        {['multi_step_guide', 'comparison', 'detailed_info', 'sector_query', 'page_navigation'].includes(message.metadata?.intent || '') && (
          <div className="chatbot-complex-query-badge">
            {message.metadata?.intent === 'multi_step_guide' ? 'Step-by-Step Guide' : 
             message.metadata?.intent === 'comparison' ? 'Comparison' : 
             message.metadata?.intent === 'sector_query' ? 'Sector Information' :
             message.metadata?.intent === 'page_navigation' ? 'Website Navigation' : 'Detailed Info'}
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
    <div className={`chatbot-container ${isOpen ? 'chatbot-open' : ''} ${accessibilityMode ? 'accessibility-mode' : ''}`}>
      {/* Chat toggle button with accessibility improvements */}
      <button
        className="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
        aria-expanded={isOpen}
        aria-describedby="chatbot-description"
        role="button"
      >
        <span className="chatbot-icon" aria-hidden="true">💬</span>
        {isOpen ? 'Close' : 'Chat'}
        <div id="chatbot-description" className="sr-only">
          Chat with GrantTracker Assistant for help with grants and website navigation
        </div>
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
          
          {/* Proactive suggestions */}
          {proactiveSuggestions.length > 0 && messages.length === 0 && (
            <div className="chatbot-proactive-suggestions">
              <div className="chatbot-proactive-header">
                <span>💡 Suggested for you:</span>
              </div>
              {proactiveSuggestions.map(suggestion => (
                <button
                  key={suggestion.id}
                  className="chatbot-suggestion-button proactive"
                  onClick={() => handleSuggestionClick(suggestion)}
                  aria-label={suggestion.text}
                >
                  <span className="chatbot-suggestion-icon">{suggestion.icon}</span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          )}
          
          {messages.length === 0 && !isLoading && (
            <div className="chatbot-empty-state">
              <div className="chatbot-empty-icon">👋</div>
              <h4>Welcome to GrantTracker Assistant</h4>
              <p>How can I help you today?</p>
              
              {/* Quick Navigation Actions */}
              <div className="chatbot-quick-actions">
                <button
                  className="chatbot-quick-action-btn"
                  onClick={() => {
                    setInputValue('Take me to home');
                    handleSendMessage();
                  }}
                >
                  🏠 Home
                </button>
                <button
                  className="chatbot-quick-action-btn"
                  onClick={() => {
                    setInputValue('Show me the dashboard');
                    handleSendMessage();
                  }}
                >
                  📊 Dashboard
                </button>
                <button
                  className="chatbot-quick-action-btn"
                  onClick={() => {
                    setInputValue('Tell me about benefits');
                    handleSendMessage();
                  }}
                >
                  🏛️ Benefits
                </button>
                <button
                  className="chatbot-quick-action-btn"
                  onClick={() => {
                    setInputValue('Show me available grants');
                    handleSendMessage();
                  }}
                >
                  💰 Grants
                </button>
              </div>
              
              <div className="chatbot-suggestions">
                {suggestions.map(suggestion => (
                  <button
                    key={suggestion.id}
                    className="chatbot-suggestion-button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    aria-label={suggestion.text}
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
              <div className="chatbot-avatar" aria-hidden="true">
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
                      title="Good response"
                    >
                      👍
                    </button>
                    <button
                      onClick={() => handleFeedback(0)}
                      className="chatbot-feedback-btn negative"
                      aria-label="Thumbs down"
                      title="Poor response"
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
            <div className="chatbot-error-message" role="alert">
              {error}
              <button onClick={() => setError(null)} className="chatbot-error-close" aria-label="Close error">×</button>
            </div>
          )}

          {feedback && (
            <div className="chatbot-feedback-notification" role="status">
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
              maxLength={1000}
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
                  aria-label={suggestion.text}
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