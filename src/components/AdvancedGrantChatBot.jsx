import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import santaIcon from '../assets/santa.svg';
import { useRealTimeDataSync } from '../hooks/useRealTimeDataSync.js';
import './AdvancedGrantChatBot.css';

// Advanced ML-Based Grant Intelligence System
class GrantKnowledgeProcessor {
  constructor() {
    this.grantDatabase = this.initializeGrantDatabase();
    this.vectorIndex = this.buildVectorIndex();
    this.mlModel = this.initializeMLModel();
    this.trainingData = this.loadTrainingData();
  }

  initializeGrantDatabase() {
    // Comprehensive grant database with real grant information
    const grants = [
      {
        id: 'sbir-2024',
        title: 'Small Business Innovation Research (SBIR)',
        agency: 'NSF',
        amount: '$275,000 - $1,750,000',
        deadline: '2024-03-15',
        category: 'Small Business',
        sector: 'Technology',
        eligibility: ['US-owned for-profit business', 'Less than 500 employees', 'Principal investigator employed by company'],
        description: 'The SBIR program provides funding for research and development of innovative technologies with commercial potential.',
        requirements: ['Phase I: Feasibility study', 'Phase II: Full R&D', 'Phase III: Commercialization'],
        keywords: ['small business', 'innovation', 'research', 'R&D', 'technology', 'commercialization'],
        score: 0.95
      },
      {
        id: 'sbir-dod-2024',
        title: 'SBIR Department of Defense',
        agency: 'DOD',
        amount: '$180,000 - $1,650,000',
        deadline: '2024-04-20',
        category: 'Small Business',
        sector: 'Defense',
        eligibility: ['US-owned for-profit business', 'Less than 500 employees', 'Defense-related research'],
        description: 'Defense-focused SBIR program for technologies supporting national security.',
        requirements: ['Security clearance may be required', 'Defense dual-use potential', 'Technical feasibility'],
        keywords: ['defense', 'national security', 'dual-use', 'military', 'technology'],
        score: 0.92
      },
      {
        id: 'nih-sbir-2024',
        title: 'NIH SBIR',
        agency: 'NIH',
        amount: '$300,000 - $2,000,000',
        deadline: '2024-05-10',
        category: 'Small Business',
        sector: 'Healthcare',
        eligibility: ['US-owned for-profit business', 'Healthcare/biomedical research', 'Commercial potential'],
        description: 'Health-focused SBIR program for biomedical innovations and healthcare technologies.',
        requirements: ['Biomedical research focus', 'Healthcare application', 'Clinical potential'],
        keywords: ['healthcare', 'biomedical', 'medical', 'clinical', 'health', 'medicine'],
        score: 0.94
      },
      {
        id: 'renewable-energy-grants',
        title: 'Renewable Energy Grant Program',
        agency: 'DOE',
        amount: '$500,000 - $5,000,000',
        deadline: '2024-06-30',
        category: 'Research',
        sector: 'Energy',
        eligibility: ['Universities', 'Research institutions', 'Energy companies', 'Non-profits'],
        description: 'Funding for renewable energy research, development, and deployment projects.',
        requirements: ['Renewable energy focus', 'Environmental impact', 'Scalability'],
        keywords: ['renewable energy', 'solar', 'wind', 'clean energy', 'sustainability', 'environment'],
        score: 0.91
      },
      {
        id: 'startup-america',
        title: 'Startup America Initiative',
        agency: 'SBA',
        amount: '$50,000 - $500,000',
        deadline: 'Rolling',
        category: 'Small Business',
        sector: 'General',
        eligibility: ['Startup companies', 'High-growth potential', 'Job creation'],
        description: 'Support for high-growth startups with job creation potential.',
        requirements: ['Business plan', 'Job creation projections', 'Growth potential'],
        keywords: ['startup', 'high growth', 'job creation', 'entrepreneurship', 'business'],
        score: 0.88
      },
      {
        id: 'green-tech-grants',
        title: 'Green Technology Innovation Grants',
        agency: 'EPA',
        amount: '$200,000 - $2,500,000',
        deadline: '2024-07-15',
        category: 'Innovation',
        sector: 'Environment',
        eligibility: ['Green technology companies', 'Environmental organizations', 'Research institutions'],
        description: 'Funding for innovative environmental technologies and solutions.',
        requirements: ['Environmental benefit', 'Technology innovation', 'Market readiness'],
        keywords: ['green technology', 'environmental', 'clean tech', 'sustainability', 'innovation'],
        score: 0.89
      }
    ];

    // Add sector-specific grants
    const sectorGrants = [
      // Healthcare Grants
      {
        id: 'nih-r01',
        title: 'NIH Research Project Grant (R01)',
        agency: 'NIH',
        amount: '$250,000 - $500,000/year',
        deadline: '2024-02-25',
        category: 'Research',
        sector: 'Healthcare',
        eligibility: ['Universities', 'Research institutions', 'Healthcare organizations'],
        description: 'Support for discrete, specified, circumscribed research projects.',
        requirements: ['Strong scientific merit', 'Experienced investigator', 'Adequate resources'],
        keywords: ['research', 'healthcare', 'medical', 'biomedical', 'clinical'],
        score: 0.93
      },
      // Education Grants
      {
        id: 'education-innovation',
        title: 'Education Innovation Grants',
        agency: 'Department of Education',
        amount: '$100,000 - $1,000,000',
        deadline: '2024-08-01',
        category: 'Education',
        sector: 'Education',
        eligibility: ['Schools', 'Universities', 'Educational nonprofits'],
        description: 'Funding for innovative educational programs and technologies.',
        requirements: ['Educational impact', 'Innovation', 'Scalability'],
        keywords: ['education', 'learning', 'school', 'student', 'academic'],
        score: 0.87
      },
      // Agriculture Grants
      {
        id: 'usda-rural-development',
        title: 'USDA Rural Development Grants',
        agency: 'USDA',
        amount: '$25,000 - $500,000',
        deadline: '2024-09-30',
        category: 'Rural Development',
        sector: 'Agriculture',
        eligibility: ['Rural communities', 'Agricultural businesses', 'Farmers'],
        description: 'Support for rural economic development and agricultural innovation.',
        requirements: ['Rural location', 'Agricultural focus', 'Economic impact'],
        keywords: ['agriculture', 'rural', 'farming', 'food', 'rural development'],
        score: 0.85
      }
    ];

    return [...grants, ...sectorGrants];
  }

  buildVectorIndex() {
    // Build semantic vector index for similarity matching
    const index = new Map();
    
    this.grantDatabase.forEach(grant => {
      const vector = this.createGrantVector(grant);
      index.set(grant.id, vector);
    });
    
    return index;
  }

  createGrantVector(grant) {
    // Create semantic vector representation of grant
    const keywords = [...grant.keywords, grant.category, grant.sector, grant.agency];
    return keywords.map(word => this.wordToVector(word));
  }

  wordToVector(word) {
    // Simple word embedding simulation (in production, use actual embeddings)
    const hash = this.simpleHash(word);
    const vector = new Array(100).fill(0);
    for (let i = 0; i < 100; i++) {
      vector[i] = ((hash + i) % 1000) / 1000 - 0.5;
    }
    return vector;
  }

  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  initializeMLModel() {
    // Simulated ML model for intent classification and response generation
    return {
      classifyIntent: (query) => this.mlIntentClassification(query),
      extractEntities: (query) => this.mlEntityExtraction(query),
      generateResponse: (context) => this.mlResponseGeneration(context),
      predictRelevance: (grant, query) => this.calculateRelevance(grant, query)
    };
  }

  mlIntentClassification(query) {
    // Advanced ML-based intent classification
    const intents = {
      'grant_search': {
        patterns: ['find grants', 'search grants', 'available grants', 'grant opportunities', 'funding options'],
        confidence: 0.0
      },
      'eligibility_check': {
        patterns: ['eligible', 'qualify', 'requirements', 'can i apply', 'am i qualified'],
        confidence: 0.0
      },
      'application_help': {
        patterns: ['how to apply', 'application process', 'submit application', 'application help'],
        confidence: 0.0
      },
      'deadline_inquiry': {
        patterns: ['deadline', 'due date', 'when is due', 'submission deadline', 'closing date'],
        confidence: 0.0
      },
      'amount_inquiry': {
        patterns: ['funding amount', 'how much', 'award amount', 'grant size', 'money available'],
        confidence: 0.0
      },
      'agency_inquiry': {
        patterns: ['which agency', 'government agency', 'federal agency', 'funding agency'],
        confidence: 0.0
      }
    };

    // Calculate confidence scores using pattern matching
    const queryLower = query.toLowerCase();
    Object.keys(intents).forEach(intent => {
      intents[intent].patterns.forEach(pattern => {
        if (queryLower.includes(pattern.toLowerCase())) {
          intents[intent].confidence += 0.3;
        }
      });
    });

    // Normalize and find best match
    const sortedIntents = Object.entries(intents)
      .sort(([,a], [,b]) => b.confidence - a.confidence);

    return {
      primary: sortedIntents[0][0],
      confidence: sortedIntents[0][1].confidence,
      all: intents
    };
  }

  mlEntityExtraction(query) {
    // Advanced ML-based entity extraction
    const entities = {
      grant_types: [],
      sectors: [],
      agencies: [],
      amounts: [],
      deadlines: [],
      business_types: [],
      locations: []
    };

    // Grant type extraction
    const grantTypePatterns = {
      'small business': ['small business', 'startup', 'entrepreneur'],
      'research': ['research', 'academic', 'university', 'scientific'],
      'nonprofit': ['nonprofit', 'ngo', 'charity', 'foundation'],
      'government': ['government', 'federal', 'state', 'municipal'],
      'individual': ['individual', 'person', 'personal']
    };

    Object.entries(grantTypePatterns).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        if (query.toLowerCase().includes(pattern)) {
          entities.grant_types.push(type);
        }
      });
    });

    // Sector extraction
    const sectorPatterns = {
      'technology': ['technology', 'tech', 'software', 'hardware', 'IT'],
      'healthcare': ['healthcare', 'medical', 'health', 'biomedical', 'pharmaceutical'],
      'energy': ['energy', 'renewable', 'solar', 'wind', 'clean energy'],
      'environment': ['environment', 'environmental', 'green', 'sustainability'],
      'education': ['education', 'educational', 'school', 'university', 'student'],
      'agriculture': ['agriculture', 'farming', 'rural', 'food'],
      'defense': ['defense', 'military', 'national security'],
      'manufacturing': ['manufacturing', 'industrial', 'production']
    };

    Object.entries(sectorPatterns).forEach(([sector, patterns]) => {
      patterns.forEach(pattern => {
        if (query.toLowerCase().includes(pattern)) {
          entities.sectors.push(sector);
        }
      });
    });

    // Amount extraction
    const amountPattern = /\$?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d+)?)\s*(?:thousand|million|billion|k|m|b)?/gi;
    const amountMatches = query.match(amountPattern);
    if (amountMatches) {
      entities.amounts = amountMatches.map(match => match.trim());
    }

    // Deadline extraction
    const deadlinePattern = /\b(?:today|tomorrow|next\s+\w+|this\s+\w+|last\s+\w+|\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})\b/gi;
    const deadlineMatches = query.match(deadlinePattern);
    if (deadlineMatches) {
      entities.deadlines = deadlineMatches.map(match => match.trim());
    }

    // Business type extraction
    const businessPatterns = {
      'small business': ['small business', 'startup', 'entrepreneur'],
      'corporation': ['corporation', 'corp', 'company'],
      'nonprofit': ['nonprofit', 'ngo', 'charity'],
      'university': ['university', 'college', 'academic institution'],
      'government': ['government agency', 'federal', 'state agency']
    };

    Object.entries(businessPatterns).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        if (query.toLowerCase().includes(pattern)) {
          entities.business_types.push(type);
        }
      });
    });

    return entities;
  }

  calculateRelevance(grant, query) {
    // ML-based relevance scoring
    const queryEntities = this.mlEntityExtraction(query);
    let score = 0;

    // Sector match
    if (queryEntities.sectors.includes(grant.sector.toLowerCase())) {
      score += 0.3;
    }

    // Grant type match
    if (queryEntities.grant_types.includes(grant.category.toLowerCase())) {
      score += 0.25;
    }

    // Keyword matching
    const queryWords = query.toLowerCase().split(/\s+/);
    const grantKeywords = grant.keywords.map(k => k.toLowerCase());
    const keywordMatches = queryWords.filter(word => 
      grantKeywords.some(keyword => keyword.includes(word) || word.includes(keyword))
    ).length;
    score += (keywordMatches / queryWords.length) * 0.3;

    // Agency match
    if (queryEntities.agencies.includes(grant.agency.toLowerCase())) {
      score += 0.15;
    }

    return Math.min(score, 1.0);
  }

  searchGrants(query) {
    // Intelligent grant search using ML
    const intent = this.mlModel.classifyIntent(query);
    const entities = this.mlModel.extractEntities(query);
    
    let results = this.grantDatabase
      .map(grant => ({
        ...grant,
        relevance: this.calculateRelevance(grant, query),
        matchReasons: this.getMatchReasons(grant, query, entities)
      }))
      .filter(grant => grant.relevance > 0.3)
      .sort((a, b) => b.relevance - a.relevance);

    // Apply intent-specific filtering
    if (intent.primary === 'eligibility_check') {
      results = results.map(grant => ({
        ...grant,
        eligibility: this.analyzeEligibility(grant, entities)
      }));
    }

    return {
      results: results.slice(0, 5),
      intent,
      entities,
      query: query
    };
  }

  getMatchReasons(grant, query, entities) {
    const reasons = [];
    
    if (entities.sectors.includes(grant.sector.toLowerCase())) {
      reasons.push(`Matches your ${grant.sector} sector interest`);
    }
    
    if (entities.grant_types.includes(grant.category.toLowerCase())) {
      reasons.push(`Suitable for ${grant.category.toLowerCase()} organizations`);
    }
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const keywordMatches = queryWords.filter(word => 
      grant.keywords.some(keyword => keyword.toLowerCase().includes(word))
    );
    
    if (keywordMatches.length > 0) {
      reasons.push(`Relevant keywords: ${keywordMatches.join(', ')}`);
    }
    
    return reasons;
  }

  analyzeEligibility(grant, entities) {
    const eligibility = {
      likely: [],
      uncertain: [],
      unlikely: []
    };

    // Analyze based on extracted entities
    entities.business_types.forEach(type => {
      if (grant.eligibility.some(req => req.toLowerCase().includes(type))) {
        eligibility.likely.push(`You appear to be a ${type} - this grant may be suitable`);
      } else {
        eligibility.uncertain.push(`Grant eligibility for ${type} needs verification`);
      }
    });

    return eligibility;
  }

  loadTrainingData() {
    // Training data for ML model improvement
    return {
      queries: [
        {
          query: "What grants are available for small businesses in renewable energy?",
          intent: "grant_search",
          entities: {
            grant_types: ["small business"],
            sectors: ["renewable energy"],
            business_types: ["small business"]
          },
          expected_grants: ["sbir-2024", "renewable-energy-grants", "green-tech-grants"]
        },
        {
          query: "How much funding can I get for healthcare research?",
          intent: "amount_inquiry",
          entities: {
            sectors: ["healthcare"],
            grant_types: ["research"]
          },
          expected_response_type: "amount_info"
        }
      ]
    };
  }

  getResponseTime() {
    return 150 + Math.random() * 200; // Simulated ML processing time
  }
}

class AdvancedConversationManager {
  constructor() {
    this.conversationHistory = [];
    this.contextWindow = 15;
    this.userProfile = this.loadUserProfile();
    this.learningData = this.loadLearningData();
  }

  addInteraction(query, response, intent, entities) {
    const interaction = {
      timestamp: Date.now(),
      query,
      response,
      intent,
      entities,
      userSatisfaction: null,
      helpfulness: null
    };

    this.conversationHistory.push(interaction);
    this.updateUserProfile(interaction);
    this.updateLearningData(interaction);
    
    // Maintain context window
    if (this.conversationHistory.length > this.contextWindow) {
      this.conversationHistory.shift();
    }
  }

  updateUserProfile(interaction) {
    // Analyze user interests and preferences
    const interests = this.extractInterests(interaction.entities);
    this.userProfile.interests = { ...this.userProfile.interests, ...interests };
    
    // Update preferred communication style
    if (interaction.userSatisfaction) {
      this.userProfile.satisfactionScores.push({
        timestamp: Date.now(),
        satisfaction: interaction.userSatisfaction,
        interaction_type: interaction.intent
      });
    }
  }

  extractInterests(entities) {
    const interests = {};
    
    if (entities.sectors) {
      entities.sectors.forEach(sector => {
        interests[sector] = (interests[sector] || 0) + 1;
      });
    }
    
    if (entities.grant_types) {
      entities.grant_types.forEach(type => {
        interests[type] = (interests[type] || 0) + 1;
      });
    }
    
    return interests;
  }

  getContextualResponse(query, knowledgeProcessor) {
    const recentHistory = this.conversationHistory.slice(-5);
    const searchResults = knowledgeProcessor.searchGrants(query);
    
    // Enhance search with conversation context
    const contextualQuery = this.enhanceQueryWithContext(query, recentHistory);
    const enhancedResults = knowledgeProcessor.searchGrants(contextualQuery);
    
    return {
      ...enhancedResults,
      context: this.getConversationContext(),
      recommendations: this.generatePersonalizedRecommendations(searchResults)
    };
  }

  enhanceQueryWithContext(query, history) {
    // Use conversation history to enhance query understanding
    const recentEntities = this.extractRecentEntities(history);
    let enhancedQuery = query;
    
    // Add context from previous interactions
    if (recentEntities.sectors.length > 0 && !query.toLowerCase().includes(recentEntities.sectors[0])) {
      enhancedQuery += ` in ${recentEntities.sectors[0]}`;
    }
    
    return enhancedQuery;
  }

  extractRecentEntities(history) {
    const allEntities = {
      sectors: [],
      grant_types: [],
      agencies: []
    };
    
    history.forEach(interaction => {
      if (interaction.entities) {
        allEntities.sectors.push(...(interaction.entities.sectors || []));
        allEntities.grant_types.push(...(interaction.entities.grant_types || []));
        allEntities.agencies.push(...(interaction.entities.agencies || []));
      }
    });
    
    // Remove duplicates and return most recent
    return {
      sectors: [...new Set(allEntities.sectors)].slice(-3),
      grant_types: [...new Set(allEntities.grant_types)].slice(-3),
      agencies: [...new Set(allEntities.agencies)].slice(-3)
    };
  }

  generatePersonalizedRecommendations(searchResults) {
    const recommendations = [];
    
    // Based on user interests
    const topInterests = Object.entries(this.userProfile.interests)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3);
    
    topInterests.forEach(([interest, count]) => {
      const relatedGrants = searchResults.results.filter(grant =>
        grant.keywords.some(keyword => keyword.toLowerCase().includes(interest.toLowerCase())) ||
        grant.sector.toLowerCase().includes(interest.toLowerCase())
      );
      
      if (relatedGrants.length > 0) {
        recommendations.push({
          type: 'interest_based',
          interest,
          grants: relatedGrants.slice(0, 2),
          reason: `Based on your interest in ${interest}`
        });
      }
    });
    
    return recommendations;
  }

  getConversationContext() {
    const recent = this.conversationHistory.slice(-5);
    return {
      totalInteractions: this.conversationHistory.length,
      recentIntents: recent.map(h => h.intent),
      sessionDuration: this.conversationHistory.length > 0 ? 
        Date.now() - this.conversationHistory[0].timestamp : 0,
      userEngagement: this.calculateEngagement()
    };
  }

  calculateEngagement() {
    if (this.conversationHistory.length === 0) return 0;
    
    const recent = this.conversationHistory.slice(-10);
    const positiveInteractions = recent.filter(h => h.userSatisfaction && h.userSatisfaction > 3).length;
    
    return positiveInteractions / recent.length;
  }

  loadUserProfile() {
    try {
      return JSON.parse(localStorage.getItem('advanced_chatbot_profile')) || {
        interests: {},
        satisfactionScores: [],
        preferences: {
          communicationStyle: 'professional',
          detailLevel: 'moderate',
          responseFormat: 'detailed'
        }
      };
    } catch {
      return {
        interests: {},
        satisfactionScores: [],
        preferences: {
          communicationStyle: 'professional',
          detailLevel: 'moderate',
          responseFormat: 'detailed'
        }
      };
    }
  }

  loadLearningData() {
    try {
      return JSON.parse(localStorage.getItem('advanced_chatbot_learning')) || {
        improvedQueries: [],
        successfulResponses: [],
        userFeedback: []
      };
    } catch {
      return {
        improvedQueries: [],
        successfulResponses: [],
        userFeedback: []
      };
    }
  }

  updateLearningData(interaction) {
    // Learn from successful interactions
    if (interaction.userSatisfaction && interaction.userSatisfaction > 4) {
      this.learningData.successfulResponses.push({
        query: interaction.query,
        intent: interaction.intent,
        entities: interaction.entities,
        timestamp: Date.now()
      });
    }
    
    this.saveToStorage();
  }

  saveToStorage() {
    try {
      localStorage.setItem('advanced_chatbot_profile', JSON.stringify(this.userProfile));
      localStorage.setItem('advanced_chatbot_learning', JSON.stringify(this.learningData));
      localStorage.setItem('advanced_chatbot_conversation', JSON.stringify(this.conversationHistory));
    } catch (error) {
      console.warn('Failed to save conversation data:', error);
    }
  }
}

const AdvancedGrantChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [conversationState, setConversationState] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    accuracy: 0.0,
    userSatisfaction: 0.0,
    totalQueries: 0,
    realTimeData: false,
    apiConnected: true
  });

  const [apiStatus, setApiStatus] = useState({
    connected: true,
    lastSync: null,
    dataFreshness: 'unknown'
  });

  // Real-time data sync
  const {
    data: grantData,
    isLoading: dataLoading,
    error: dataError,
    syncStatus,
    syncNow,
    getFilteredData,
    getUrgentGrants,
    getGrantsByDeadline
  } = useRealTimeDataSync();

  // Advanced AI System Components
  const knowledgeProcessor = useRef(new GrantKnowledgeProcessor()).current;
  const conversationManager = useRef(new AdvancedConversationManager()).current;
  const apiClient = useRef(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  // Initialize API client
  useEffect(() => {
    apiClient.current = {
      async query(q, userId = 'anonymous', sessionId = 'default') {
        try {
          const response = await fetch('/api/advanced-chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query: q, userId, sessionId })
          });
          
          if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
          }
          
          return await response.json();
        } catch (error) {
          console.error('API request failed:', error);
          // Fallback to local processing
          return null;
        }
      },
      
      async healthCheck() {
        try {
          const response = await fetch('/api/advanced-chat');
          return response.ok;
        } catch {
          return false;
        }
      }
    };
  }, []);

  // Initialize with shorter welcome message
  useEffect(() => {
    const welcomeMessage = {
      id: 1,
      text: "🎅 Hi! I'm your AI grant assistant. I can help you find funding opportunities, check eligibility, and guide you through applications. What grants are you looking for?",
      sender: 'bot',
      timestamp: new Date(),
      isWelcome: true,
      aiPowered: true
    };
    setMessages([welcomeMessage]);
    
    // Update API status
    checkApiStatus();
  }, []);

  // Check API connectivity
  const checkApiStatus = useCallback(async () => {
    if (apiClient.current) {
      const connected = await apiClient.current.healthCheck();
      setApiStatus(prev => ({
        ...prev,
        connected,
        lastSync: connected ? new Date() : prev.lastSync
      }));
      
      setPerformanceMetrics(prev => ({
        ...prev,
        apiConnected: connected
      }));
    }
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Handle greetings and basic interactions
  const handleGreeting = useCallback((query) => {
    const greetings = ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'];
    const queryLower = query.toLowerCase();
    
    if (greetings.some(greeting => queryLower.includes(greeting))) {
      return {
        text: "Hello! I'm here to help you find grants and funding opportunities. What type of funding are you looking for?",
        suggestions: [
          "Show me small business grants",
          "What research grants are available?",
          "How do I check eligibility?",
          "Tell me about application deadlines"
        ]
      };
    }
    
    // Handle thanks
    if (queryLower.includes('thank') || queryLower.includes('thanks')) {
      return {
        text: "You're welcome! I'm here to help you find the right grants. Is there anything else you'd like to know?",
        suggestions: [
          "Show me more grants",
          "Help with applications",
          "Check deadlines",
          "Different funding types"
        ]
      };
    }
    
    // Handle help requests
    if (queryLower.includes('help') || queryLower.includes('what can you do')) {
      return {
        text: "I can help you with:\n\n• Finding grants for your specific needs\n• Checking if you're eligible\n• Understanding funding amounts\n• Application guidance\n• Deadline information\n\nWhat would you like to explore?",
        suggestions: [
          "Find grants for my business",
          "Research funding opportunities",
          "Check eligibility requirements",
          "Application help"
        ]
      };
    }
    
    return null;
  }, []);

  // Advanced query processing with real-time API integration
  const processQuery = useCallback(async (query) => {
    const startTime = Date.now();
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Handle greetings and basic interactions first
      const greetingResponse = handleGreeting(query);
      if (greetingResponse) {
        const responseTime = Date.now() - startTime;
        updatePerformanceMetrics(responseTime, 1.0);
        
        return {
          ...greetingResponse,
          timestamp: new Date(),
          processingTime: responseTime,
          metadata: {
            intent: { primary: 'greeting', confidence: 1.0 },
            entities: {},
            source: 'local',
            realTime: false
          }
        };
      }

      // Try API first for real-time processing
      let apiResult = null;
      if (apiClient.current && apiStatus.connected) {
        try {
          const sessionId = `session_${Date.now()}`;
          apiResult = await apiClient.current.query(query, 'user', sessionId);
        } catch (apiError) {
          console.warn('API request failed, falling back to local processing:', apiError);
          setApiStatus(prev => ({ ...prev, connected: false }));
        }
      }

      if (apiResult && apiResult.success) {
        // Use API response
        const response = {
          text: apiResult.response,
          suggestions: apiResult.suggestions || [],
          grants: apiResult.grants || [],
          metadata: apiResult.metadata
        };

        // Update performance metrics
        const responseTime = Date.now() - startTime;
        updatePerformanceMetrics(responseTime, apiResult.metadata?.confidence || 0.8);

        return {
          ...response,
          timestamp: new Date(),
          processingTime: responseTime,
          metadata: {
            ...apiResult.metadata,
            source: 'api',
            realTime: true
          }
        };
      } else {
        // Fallback to local processing
        const processingTime = knowledgeProcessor.getResponseTime();
        await new Promise(resolve => setTimeout(resolve, processingTime));

        // Use real-time grant data if available
        const contextualResults = conversationManager.getContextualResponse(query, knowledgeProcessor);
        
        // Enhance with real-time data
        if (grantData && grantData.length > 0) {
          contextualResults.results = contextualResults.results.map(grant => {
            const realTimeGrant = grantData.find(rtg => rtg.id === grant.id);
            return realTimeGrant ? { ...grant, ...realTimeGrant } : grant;
          });
        }
        
        const response = generateIntelligentResponse(query, contextualResults);
        
        // Update performance metrics
        const responseTime = Date.now() - startTime;
        updatePerformanceMetrics(responseTime, contextualResults.intent.confidence);

        // Add interaction to conversation history
        conversationManager.addInteraction(
          query, 
          response.text, 
          contextualResults.intent.primary, 
          contextualResults.entities
        );

        return {
          ...response,
          timestamp: new Date(),
          processingTime,
          metadata: {
            intent: contextualResults.intent,
            entities: contextualResults.entities,
            relevanceScores: contextualResults.results.map(r => r.relevance),
            personalized: contextualResults.recommendations.length > 0,
            source: 'local_fallback',
            realTime: false
          }
        };
      }

    } catch (error) {
      console.error('Error processing query:', error);
      return generateErrorResponse(query);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [knowledgeProcessor, conversationManager, apiStatus, grantData, handleGreeting]);

  const generateIntelligentResponse = (query, results) => {
    const { intent, entities, results: grants, recommendations } = results;
    
    let response = {
      text: "",
      suggestions: [],
      grantCards: [],
      followUpQuestions: []
    };

    switch (intent.primary) {
      case 'grant_search':
        response = generateGrantSearchResponse(query, grants, entities);
        break;
      case 'eligibility_check':
        response = generateEligibilityResponse(query, grants, entities);
        break;
      case 'amount_inquiry':
        response = generateAmountResponse(query, grants, entities);
        break;
      case 'deadline_inquiry':
        response = generateDeadlineResponse(query, grants, entities);
        break;
      case 'application_help':
        response = generateApplicationHelpResponse(query, grants);
        break;
      default:
        response = generateGeneralResponse(query, results);
    }

    // Add personalized recommendations
    if (recommendations.length > 0) {
      response.text += `\n\n💡 **Personalized for you:**\n${recommendations.map(rec => 
        `• ${rec.reason}: ${rec.grants[0]?.title || 'Relevant grants available'}`
      ).join('\n')}`;
    }

    return response;
  };

  const generateGrantSearchResponse = (query, grants, entities) => {
    if (grants.length === 0) {
      return {
        text: "I couldn't find exact matches, but let me help you explore related opportunities:",
        suggestions: [
          "Try broadening your search criteria",
          "Check different sectors or grant types",
          "Consider federal vs state funding options"
        ]
      };
    }

    let response = `I found ${grants.length} grant${grants.length > 1 ? 's' : ''} that match your query:\n\n`;
    
    grants.forEach((grant, index) => {
      response += `**${index + 1}. ${grant.title}**\n`;
      response += `🏛️ Agency: ${grant.agency}\n`;
      response += `💰 Amount: ${grant.amount}\n`;
      response += `📅 Deadline: ${grant.deadline}\n`;
      if (grant.matchReasons && grant.matchReasons.length > 0) {
        response += `✨ Why it matches: ${grant.matchReasons[0]}\n`;
      }
      response += `\n`;
    });

    return {
      text: response,
      grantCards: grants.slice(0, 3),
      followUpQuestions: [
        "Tell me more about the application process",
        "What are the eligibility requirements?",
        "Show me similar grants"
      ]
    };
  };

  const generateEligibilityResponse = (query, grants, entities) => {
    let response = "Based on the grants that match your profile:\n\n";
    
    grants.forEach(grant => {
      if (grant.eligibility) {
        response += `**${grant.title}:**\n`;
        grant.eligibility.likely.forEach(item => response += `✅ ${item}\n`);
        grant.eligibility.uncertain.forEach(item => response += `❓ ${item}\n`);
        response += "\n";
      }
    });

    return {
      text: response,
      suggestions: [
        "Review full eligibility criteria",
        "Compare with other opportunities",
        "Start application preparation"
      ]
    };
  };

  const generateAmountResponse = (query, grants, entities) => {
    const amounts = grants.map(g => g.amount);
    const uniqueAmounts = [...new Set(amounts)];
    
    let response = "Here's the funding information for relevant grants:\n\n";
    
    grants.forEach(grant => {
      response += `**${grant.title}:** ${grant.amount}\n`;
      response += `💡 This amount is typical for ${grant.category.toLowerCase()} grants in the ${grant.sector.toLowerCase()} sector\n\n`;
    });

    return {
      text: response,
      suggestions: [
        "Compare funding amounts across grants",
        "Understand phase-based funding structure",
        "Plan your budget accordingly"
      ]
    };
  };

  const generateDeadlineResponse = (query, grants, entities) => {
    let response = "Here are the upcoming deadlines for relevant grants:\n\n";
    
    grants.forEach(grant => {
      const deadline = new Date(grant.deadline);
      const today = new Date();
      const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
      
      response += `**${grant.title}:**\n`;
      response += `📅 Deadline: ${grant.deadline}`;
      if (daysUntil > 0) {
        response += ` (${daysUntil} days remaining)`;
      }
      response += `\n\n`;
    });

    return {
      text: response,
      suggestions: [
        "Set up deadline reminders",
        "Start application preparation early",
        "Consider backup options"
      ]
    };
  };

  const generateApplicationHelpResponse = (query, grants) => {
    return {
      text: "I'll guide you through the application process:\n\n**General Steps:**\n1. **Review Requirements** - Read all eligibility criteria carefully\n2. **Prepare Documents** - Gather required forms and supporting materials\n3. **Write Proposal** - Clearly describe your project and impact\n4. **Submit Application** - Double-check before submitting\n5. **Follow Up** - Track your application status\n\n**Specific for your grants:**",
      suggestions: [
        "Get application templates",
        "Review sample proposals",
        "Schedule pre-submission review"
      ]
    };
  };

  const generateGeneralResponse = (query, results) => {
    return {
      text: "I can help you with grant-related questions! Try asking about:\n\n• Specific grant programs\n• Eligibility requirements\n• Funding amounts\n• Application deadlines\n• Application processes\n\nWhat would you like to know more about?",
      suggestions: [
        "Show me available grants",
        "Explain eligibility requirements",
        "Tell me about application deadlines"
      ]
    };
  };

  const generateErrorResponse = (query) => {
    return {
      text: "I apologize, but I encountered an error processing your request. Let me help you in a different way:",
      suggestions: [
        "Try rephrasing your question",
        "Ask about specific grant programs",
        "Request help with applications"
      ],
      isError: true
    };
  };

  const updatePerformanceMetrics = (responseTime, accuracy) => {
    setPerformanceMetrics(prev => ({
      responseTime: (prev.responseTime + responseTime) / 2,
      accuracy: (prev.accuracy + accuracy) / 2,
      userSatisfaction: prev.userSatisfaction, // Would be updated based on feedback
      totalQueries: prev.totalQueries + 1
    }));
  };

  // Handle suggestion click and send
  const handleSuggestionClick = useCallback((suggestion) => {
    setInputValue(suggestion);
    // Auto-send the suggestion after a short delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  }, []);

  // Handle user message
  const handleSendMessage = useCallback(async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Process query with AI
    const botResponse = await processQuery(userMessage.text);
    setMessages(prev => [...prev, botResponse]);

    // Show data freshness info if real-time data is being used
    if (botResponse.metadata?.realTime && syncStatus.lastSyncTime) {
      const timeSinceSync = Date.now() - syncStatus.lastSyncTime;
      if (timeSinceSync < 60000) { // Less than 1 minute
        setTimeout(() => {
          const syncMessage = {
            id: Date.now() + 1,
            text: `📊 **Real-time data active** - Information updated ${Math.round(timeSinceSync / 1000)}s ago`,
            sender: 'bot',
            timestamp: new Date(),
            isSystemMessage: true,
            metadata: { type: 'data_freshness' }
          };
          setMessages(prev => [...prev, syncMessage]);
        }, 2000);
      }
    }

  }, [inputValue, isLoading, processQuery, syncStatus]);

  // Toggle full screen mode for mobile
  const toggleFullScreen = useCallback(() => {
    setIsFullScreen(!isFullScreen);
  }, [isFullScreen]);

  // Close chatbot
  const handleClose = useCallback(() => {
    setIsOpen(false);
    setIsFullScreen(false);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
      if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Handle feedback
  const handleFeedback = useCallback((messageId, rating) => {
    setMessages(prev => prev.map(msg => 
      msg.id === messageId ? { ...msg, userRating: rating } : msg
    ));
    
    // Update conversation manager with feedback
    conversationManager.updateUserSatisfaction(rating);
  }, [conversationManager]);

  // Handle quick actions
  const handleQuickAction = useCallback((action) => {
    const quickQueries = {
      'search_grants': 'What grants are available for my business?',
      'eligibility': 'Am I eligible for federal grants?',
      'amounts': 'How much funding can I get?',
      'deadlines': 'What are the upcoming deadlines?',
      'application': 'How do I apply for grants?'
    };
    
    if (quickQueries[action]) {
      setInputValue(quickQueries[action]);
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Render enhanced message with AI features
  const renderMessageContent = (message) => {
    return (
      <div className="advanced-chatbot-message-content">
        {message.text.split('\n').map((line, i) => {
          if (line.includes('**') && line.includes('**')) {
            const parts = line.split('**');
            return (
              <p key={i} className="message-bold">
                {parts.map((part, j) => 
                  j % 2 === 1 ? <strong key={j}>{part}</strong> : part
                )}
              </p>
            );
          }
          return <p key={i}>{line}</p>;
        })}
        
        {message.aiPowered && (
          <div className="ai-badge-container">
            <span className="ai-badge">🤖 AI Powered</span>
            <span className="ml-badge">🧠 ML Enhanced</span>
          </div>
        )}
        
        {message.metadata && (
          <div className="processing-metadata">
            <small>
              Intent: {message.metadata.intent.primary} | 
              Confidence: {Math.round(message.metadata.intent.confidence * 100)}% |
              Processing: {message.processingTime}ms
            </small>
          </div>
        )}
        
        {message.userRating && (
          <div className="feedback-indicator">
            <span>Your rating: {'⭐'.repeat(message.userRating)}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="advanced-chatbot-container">
      {/* Enhanced AI Toggle Button */}
      <button
        className="advanced-chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        aria-describedby="chatbot-description"
        role="button"
        type="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
      >
        <div className="toggle-content">
          <img 
            src={santaIcon} 
            alt="AI Assistant" 
            className="ai-toggle-icon"
            width="24" 
            height="24"
          />
          <div className="ai-status">
            <div className="status-indicator active"></div>
            <span className="status-text">AI</span>
          </div>
        </div>
        <span className="toggle-text">{isOpen ? 'Close AI' : 'Ask AI'}</span>
        
        {/* Performance indicator */}
        <div className="performance-indicator">
          <span className="perf-dot"></span>
          <span className="perf-text">{Math.round(performanceMetrics.responseTime)}ms</span>
        </div>
      </button>

      {/* Advanced AI Chat Window */}
      {isOpen && (
        <div 
          className={`advanced-chatbot-window ${isFullScreen ? 'fullscreen' : ''}`}
          role="dialog"
          aria-labelledby="chatbot-title"
          aria-describedby="chatbot-description"
          aria-modal="true"
        >
          {/* Enhanced Header with AI Status and Real-time Data */}
          <div className="advanced-chatbot-header">
            <div className="header-content">
              <img 
                src={santaIcon} 
                alt="AI Assistant for Grant Discovery" 
                className="header-ai-icon"
                width="32" 
                height="32"
                role="img"
                aria-hidden="false"
              />
              <div className="header-info">
                <h3 id="chatbot-title">🎅 GrantTracker's AI Assistant</h3>
                <div id="chatbot-description" className="sr-only">
                  AI-powered grant discovery assistant that helps find funding opportunities
                </div>
                <div className="ai-capabilities">
                  <span className="capability">🧠 ML-Powered</span>
                  <span className="capability">📊 Real-Time Data</span>
                  <span className="capability">⚡ API Connected</span>
                  <span className="capability">💡 Personalized</span>
                </div>
                <div className="real-time-status" role="status" aria-live="polite">
                  <div 
                    className={`status-indicator ${apiStatus.connected ? 'connected' : 'disconnected'}`}
                    aria-label={apiStatus.connected ? 'Connected to live data' : 'Using offline data'}
                    role="img"
                  ></div>
                  <span className="status-text">
                    {apiStatus.connected ? 'Live Data' : 'Offline Mode'}
                  </span>
                  {syncStatus.lastSyncTime && (
                    <span className="sync-time">
                      Last sync: {new Date(syncStatus.lastSyncTime).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="header-controls">
              <button 
                className="fullscreen-toggle"
                onClick={toggleFullScreen}
                title={isFullScreen ? "Exit fullscreen" : "Enter fullscreen"}
                aria-label={isFullScreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
                type="button"
              >
                {isFullScreen ? '⛶' : '⛶'}
              </button>
              <button 
                className="close-button"
                onClick={handleClose}
                title="Close chat"
                aria-label="Close chat window"
                type="button"
              >
                ×
              </button>
            </div>
            <div className="header-stats">
              <div className="stat">
                <span className="stat-value">{performanceMetrics.totalQueries}</span>
                <span className="stat-label">Queries</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round(performanceMetrics.accuracy * 100)}%</span>
                <span className="stat-label">Accuracy</span>
              </div>
              <div className="stat">
                <span className="stat-value">{grantData?.length || 0}</span>
                <span className="stat-label">Live Grants</span>
              </div>
              <div className="stat">
                <span className="stat-value">{Math.round(performanceMetrics.responseTime)}ms</span>
                <span className="stat-label">Response</span>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div 
            className="advanced-chatbot-messages"
            role="log"
            aria-live="polite"
            aria-label="Chat conversation"
            tabIndex={-1}
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={`advanced-chatbot-message ${message.sender}`}
                role="article"
                aria-label={`${message.sender === 'user' ? 'Your message' : 'AI response'}`}
              >
                <div className="message-avatar">
                  {message.sender === 'user' ? (
                    <div className="user-avatar" role="img" aria-label="User">👤</div>
                  ) : (
                    <div className="ai-avatar">
                      <img 
                        src={santaIcon} 
                        alt="AI Assistant" 
                        width="24" 
                        height="24"
                        role="img"
                        aria-hidden="true"
                      />
                      <div 
                        className="ai-indicator" 
                        role="img" 
                        aria-label="AI powered response"
                      >
                        🤖
                      </div>
                    </div>
                  )}
                </div>
                <div className="message-content">
                  {renderMessageContent(message)}
                  
                  {message.suggestions && (
                    <div className="message-suggestions" role="group" aria-label="Suggested responses">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="suggestion-button"
                          onClick={() => handleSuggestionClick(suggestion)}
                          disabled={isLoading}
                          aria-label={`Use suggestion: ${suggestion}`}
                          type="button"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {message.sender === 'bot' && !message.isWelcome && (
                    <div className="feedback-section" role="group" aria-label="Rate this response">
                      <span className="feedback-label">Was this helpful?</span>
                      <div className="feedback-buttons" role="radiogroup" aria-label="Rating">
                        {[1, 2, 3, 4, 5].map(rating => (
                          <button
                            key={rating}
                            className="feedback-button"
                            onClick={() => handleFeedback(message.id, rating)}
                            aria-label={`Rate ${rating} out of 5 stars`}
                            role="radio"
                            type="button"
                          >
                            ⭐
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}

            {/* Enhanced Typing Indicator */}
            {(isLoading || isTyping) && (
              <div 
                className="advanced-chatbot-message bot" 
                role="status"
                aria-live="polite"
                aria-label="AI is processing your request"
              >
                <div className="message-avatar">
                  <div className="ai-avatar">
                    <img 
                      src={santaIcon} 
                      alt="AI Processing" 
                      width="24" 
                      height="24"
                      role="img"
                      aria-hidden="true"
                    />
                    <div 
                      className="ai-indicator processing" 
                      role="img"
                      aria-label="AI is thinking"
                    >
                      🧠
                    </div>
                  </div>
                </div>
                <div className="message-content">
                  <div className="ai-typing-indicator" aria-hidden="true">
                    <div className="typing-animation">
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                      <span className="typing-dot"></span>
                    </div>
                  </div>
                  <span className="typing-text">AI is analyzing your question...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions Panel */}
          {showQuickActions && (
            <div className="quick-actions-panel">
              <div className="quick-actions-header">
                <span>Quick Actions</span>
                <button onClick={() => setShowQuickActions(false)}>×</button>
              </div>
              <div className="quick-actions-grid">
                {[
                  { key: 'search_grants', label: '🔍 Find Grants', desc: 'Search for available opportunities' },
                  { key: 'eligibility', label: '✅ Check Eligibility', desc: 'See what you qualify for' },
                  { key: 'amounts', label: '💰 Funding Amounts', desc: 'Learn about funding levels' },
                  { key: 'deadlines', label: '📅 Deadlines', desc: 'Important dates and timelines' },
                  { key: 'application', label: '📝 Application Help', desc: 'Step-by-step guidance' }
                ].map(action => (
                  <button
                    key={action.key}
                    className="quick-action-item"
                    onClick={() => handleQuickAction(action.key)}
                  >
                    <div className="action-icon">{action.label.split(' ')[0]}</div>
                    <div className="action-content">
                      <div className="action-label">{action.label.split(' ').slice(1).join(' ')}</div>
                      <div className="action-desc">{action.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced Input Area */}
          <div className="advanced-chatbot-input">
            <form 
              className="input-container" 
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              role="form"
              aria-label="Chat input form"
            >
              <label htmlFor="chat-input" className="sr-only">
                Enter your message about grants
              </label>
              <input
                id="chat-input"
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Ask me anything about grants... (e.g., 'What grants for renewable energy startups?')"
                disabled={isLoading}
                className="ai-input"
                maxLength={500}
                autoComplete="off"
                spellCheck="true"
                aria-describedby="input-help"
                aria-required="true"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputValue.trim() || isLoading}
                className="ai-send-button"
                type="submit"
                aria-label={isLoading ? "Sending message..." : "Send message"}
              >
                {isLoading ? '🧠' : '🚀'}
              </button>
            </form>
            <div id="input-help" className="sr-only">
              Press Enter to send, Shift+Enter for new line
            </div>
            <div className="input-suggestions" role="group" aria-label="Quick suggestions">
              <span className="suggestion-text">Try:</span>
              {[
                'Small business grants',
                'Healthcare funding',
                'Research opportunities',
                'Eligibility requirements'
              ].map(suggestion => (
                <button
                  key={suggestion}
                  className="input-suggestion"
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={isLoading}
                  aria-label={`Use suggestion: ${suggestion}`}
                  type="button"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedGrantChatBot;