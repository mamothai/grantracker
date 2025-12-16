
import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";
import santaImg from "../assets/santa.svg";
import { GRANTS } from "../data/grants";

// Enhanced message types for better UX
const MESSAGE_TYPES = {
  TEXT: 'text',
  SUGGESTION: 'suggestion',
  REACTION: 'reaction',
  SYSTEM: 'system'
};

// Enhanced user preferences and settings
const USER_PREFERENCES = {
  themes: {
    light: 'light',
    dark: 'dark',
    auto: 'auto'
  },
  responseStyles: {
    detailed: 'detailed',
    concise: 'concise',
    balanced: 'balanced'
  },
  notifications: {
    sound: true,
    visual: true,
    typing: true
  }
};



// ChatGPT-Level Advanced Conversation Intelligence with Performance Optimization
class UltraIntelligentConversationEngine {
  constructor() {
    // Performance optimization: Intelligent caching system
    this.cache = {
      intentCache: new Map(), // Cache classified intents
      entityCache: new Map(), // Cache extracted entities
      responseCache: new Map(), // Cache generated responses
      grantCache: new Map(), // Cache grant matching results
      maxCacheSize: 100,
      cacheHitRate: 0,
      cacheHits: 0,
      cacheMisses: 0
    };

    this.conversationMemory = {
      shortTerm: [], // Last 15 exchanges
      longTerm: new Map(), // Persistent topics
      userPreferences: new Map(),
      conversationTopics: new Set(),
      reasoningChain: [],
      responseHistory: new Map(), // Track responses to avoid repetition
      casualConversationTopics: new Set(), // Track casual conversation patterns
      sessionInsights: {
        userGoals: [],
        unresolvedQuestions: [],
        userFrustration: 0,
        engagementLevel: 0,
        conversationLength: 0,
        topicsExplored: new Set(),
        lastResponseType: null,
        responseCount: 0,
        averageResponseTime: 0,
        totalProcessingTime: 0
      }
    };

    // Performance optimization: Pre-compiled regex patterns
    this.compiledPatterns = {
      intents: new Map(),
      entities: new Map(),
      casual: new Map()
    };
    this.precompilePatterns();
    
    this.advancedReasoning = {
      causalChain: [],
      logicalInference: [],
      contextualUnderstanding: new Map(),
      analogicalReasoning: []
    };
    
    this.naturalLanguageUnderstanding = {
      intentClassification: {
        primary: 'information_seeking',
        confidence: 0,
        uncertainty: 0
      },
      entityRecognition: {
        mentioned: new Set(),
        relationships: new Map(),
        importance: new Map()
      },
      multiModalContext: {
        userTone: 'neutral',
        urgencyLevel: 0,
        confidence: 0,
        preferredResponseStyle: 'balanced'
      }
    };
    

    this.conversationStrategies = {
      clarification: [
        'Could you provide more details about what you\'re looking for?',
        'Let me make sure I understand your needs correctly...',
        'What specific aspect would you like me to focus on?'
      ],
      elaboration: [
        'Let me explain this in more detail...',
        'Here\'s additional context that might help...',
        'To give you a complete picture...'
      ],
      confirmation: [
        'Does this answer your question completely?',
        'Is this the information you were looking for?',
        'Would you like me to elaborate on any part?'
      ],
      followUp: [
        'What would you like to know next?',
        'Is there anything else about this topic you\'d like to explore?',
        'How can I help you further with this information?'
      ]
    };
  }

  // Performance Optimization: Pre-compile regex patterns for faster processing
  precompilePatterns() {
    // Intent patterns
    const intentPatterns = {
      eligibility_check: /eligible|qualify|can i|am i|eligibility|who can|what are/i,
      information_seeking: /what is|how does|tell me about|explain|information|details/i,
      application_guidance: /apply|application|register|how to apply|process|steps/i,
      comparison: /compare|difference|vs|versus|better|best|which one/i,
      recommendation: /recommend|suggest|advice|help me choose/i
    };

    // Entity patterns
    const entityPatterns = {
      grants: /(pm kisan|ayushman bharat|awas yojana|education mission|national education)/i,
      sectors: /(agriculture|education|health|infrastructure|environment|technology|women)/i,
      amounts: /₹(\d+(?:\.\d+)?)/gi,
      urgentWords: /urgent|asap|immediately|emergency|critical/i,
      highWords: /quickly|soon|priority|important|fast/i
    };

    // Casual conversation patterns
    const casualPatterns = {
      greetings: /(hello|hi|hey|good morning|good afternoon|good evening)/i,
      thanks: /(thank you|thanks|thx|appreciate)/i,
      compliments: /(great|awesome|amazing|excellent|good job|well done)/i,
      casualInquiry: /(how are you|what\'s up|how\'s it going|how do you work|who are you)/i,
      weather: /(weather|today\'s weather|is it raining|sunny|cloudy)/i,
      jokes: /(joke|funny|make me laugh|haha|lol)/i,
      personal: /(what can you do|tell me about yourself|describe yourself)/i
    };

    // Store compiled patterns
    Object.entries(intentPatterns).forEach(([key, pattern]) => {
      this.compiledPatterns.intents.set(key, pattern);
    });

    Object.entries(entityPatterns).forEach(([key, pattern]) => {
      this.compiledPatterns.entities.set(key, pattern);
    });

    Object.entries(casualPatterns).forEach(([key, pattern]) => {
      this.compiledPatterns.casual.set(key, pattern);
    });
  }

  // Performance Optimization: Intelligent caching system
  getCachedResult(cacheType, key) {
    const cache = this.cache[cacheType + 'Cache'];
    if (cache && cache.has(key)) {
      this.cache.cacheHits++;
      this.cache.cacheHitRate = this.cache.cacheHits / (this.cache.cacheHits + this.cache.cacheMisses);
      return cache.get(key);
    }
    this.cache.cacheMisses++;
    return null;
  }

  setCachedResult(cacheType, key, value) {
    const cache = this.cache[cacheType + 'Cache'];
    if (cache.size >= this.cache.maxCacheSize) {
      // Remove oldest entry (simple FIFO)
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }
    cache.set(key, value);
  }

  // Performance Optimization: Fast intent classification with caching
  classifyIntent(message) {
    const messageKey = message.toLowerCase().substring(0, 100);
    const cached = this.getCachedResult('intent', messageKey);
    if (cached) {
      return cached;
    }

    const lower = message.toLowerCase();
    const intents = {};
    
    // Use pre-compiled patterns for faster matching
    this.compiledPatterns.intents.forEach((pattern, intentName) => {
      const match = pattern.exec(lower);
      intents[intentName] = { score: match ? 1.0 : 0, pattern };
    });

    // Partial matching for uncategorized intents
    const keywords = ['eligible', 'qualify', 'what', 'how', 'explain', 'apply', 'compare', 'recommend'];
    const matchCount = keywords.filter(keyword => lower.includes(keyword)).length;
    intents['general'] = { score: Math.min(matchCount * 0.2, 0.8), pattern: null };

    // Find best intent
    const bestIntent = Object.entries(intents)
      .reduce((best, [name, data]) => data.score > best.score ? { name, ...data } : best, 
              { name: 'general', score: 0 });

    const result = {
      primary: bestIntent.name,
      confidence: bestIntent.score,
      allScores: intents
    };

    this.setCachedResult('intent', messageKey, result);
    return result;
  }

  // Performance Optimization: Fast entity extraction with caching
  extractEntities(message) {
    const messageKey = message.toLowerCase().substring(0, 100);
    const cached = this.getCachedResult('entity', messageKey);
    if (cached) {
      return cached;
    }

    const entities = {
      grants: [],
      sectors: [],
      amounts: [],
      people: [],
      locations: []
    };

    const lower = message.toLowerCase();
    
    // Use cached grant data for faster matching
    GRANTS.forEach(grant => {
      if (lower.includes(grant.name.toLowerCase())) {
        entities.grants.push({
          name: grant.name,
          sector: grant.sector,
          confidence: 0.9
        });
      }
    });

    // Fast sector detection using pre-compiled patterns
    this.compiledPatterns.entities.forEach((pattern, sectorName) => {
      if (pattern.test(lower) && sectorName !== 'grants' && sectorName !== 'amounts') {
        entities.sectors.push({ name: sectorName, confidence: 0.8 });
      }
    });

    // Fast amount detection
    const amountMatches = lower.match(/₹(\d+(?:\.\d+)?)/gi);
    if (amountMatches) {
      entities.amounts.push(...amountMatches.map(match => ({ value: match, confidence: 0.8 })));
    }

    this.setCachedResult('entity', messageKey, entities);
    return entities;
  }

  // Performance Optimization: Optimized grant matching
  findBestGrants(query, grants, limit = 4) {
    const queryKey = query.toLowerCase().substring(0, 50);
    const cached = this.getCachedResult('grant', queryKey);
    if (cached) {
      return cached;
    }

    const lower = query.toLowerCase();
    const matches = grants.filter(grant => {
      // Fast matching using pre-computed scores
      let score = 0;
      
      if (grant.name.toLowerCase().includes(lower)) score += 3;
      if (grant.description.toLowerCase().includes(lower)) score += 2;
      if (grant.sector.toLowerCase().includes(lower)) score += 2;
      
      // Check keywords
      grant.keywords.forEach(keyword => {
        if (lower.includes(keyword.toLowerCase())) score += 1;
      });
      
      return score > 0;
    });

    // Sort by relevance score
    matches.sort((a, b) => {
      const scoreA = this.calculateGrantScore(a, lower);
      const scoreB = this.calculateGrantScore(b, lower);
      return scoreB - scoreA;
    });

    const result = matches.slice(0, limit);
    this.setCachedResult('grant', queryKey, result);
    return result;
  }

  // Helper method for grant scoring
  calculateGrantScore(grant, queryLower) {
    let score = 0;
    if (grant.name.toLowerCase().includes(queryLower)) score += 3;
    if (grant.description.toLowerCase().includes(queryLower)) score += 2;
    if (grant.sector.toLowerCase().includes(queryLower)) score += 2;
    
    grant.keywords.forEach(keyword => {
      if (queryLower.includes(keyword.toLowerCase())) score += 1;
    });
    
    return score;
  }

  // Performance monitoring
  getPerformanceMetrics() {
    return {
      cacheHitRate: (this.cache.cacheHitRate * 100).toFixed(1) + '%',
      cacheSize: {
        intent: this.cache.intentCache.size,
        entity: this.cache.entityCache.size,
        response: this.cache.responseCache.size,
        grant: this.cache.grantCache.size
      },
      conversationLength: this.conversationMemory.sessionInsights.conversationLength,
      averageResponseTime: this.conversationMemory.sessionInsights.averageResponseTime.toFixed(2) + 'ms'
    };
  }

  // Performance Optimization: Smart response generation with caching
  generateAdvancedResponse(message, context = {}, retrievedGrants = []) {
    const startTime = performance.now();
    
    const responseKey = `${message.substring(0, 50)}_${JSON.stringify(context).substring(0, 50)}`;
    const cached = this.getCachedResult('response', responseKey);
    if (cached && !this.checkResponseRepetition(message, context.intent?.primary)) {
      return cached;
    }

    const intent = this.classifyIntent(message);
    const entities = this.extractEntities(message);
    const sentiment = this.analyzeSentiment(message);
    const urgency = this.detectUrgency(message);
    
    const comprehensiveContext = {
      intent,
      entities,
      sentiment,
      urgency,
      retrievedGrants,
      conversationHistory: this.conversationMemory.shortTerm,
      userProfile: context.profile || {}
    };

    // Select optimal response strategy
    const strategy = this.selectResponseStrategy(comprehensiveContext);
    
    // Generate contextual response
    const result = this.generateContextualResponse(strategy, comprehensiveContext);
    
    // Cache the result
    this.setCachedResult('response', responseKey, result);
    
    // Update performance metrics
    const endTime = performance.now();
    const processingTime = endTime - startTime;
    this.conversationMemory.sessionInsights.totalProcessingTime += processingTime;
    this.conversationMemory.sessionInsights.averageResponseTime = 
      this.conversationMemory.sessionInsights.totalProcessingTime / 
      this.conversationMemory.sessionInsights.responseCount;

    return result;
  }

  // Advanced conversation memory management
  updateConversationMemory(message, response, context = {}) {
    const timestamp = Date.now();
    const exchange = {
      message: message.substring(0, 300),
      response: response.substring(0, 400),
      timestamp,
      context: {
        intent: this.classifyIntent(message),
        entities: this.extractEntities(message),
        sentiment: this.analyzeSentiment(message),
        urgency: this.detectUrgency(message),
        confidence: context.confidence || 0
      }
    };

    // Update short-term memory
    this.conversationMemory.shortTerm.push(exchange);
    if (this.conversationMemory.shortTerm.length > 15) {
      this.conversationMemory.shortTerm.shift();
    }

    // Extract and store topics
    const topics = this.extractTopics(message);
    topics.forEach(topic => {
      this.conversationMemory.conversationTopics.add(topic);
    });

    // Update session insights
    this.updateSessionInsights(exchange);
  }


  // Code Structure Improvement: Consolidated intent classification (moved to performance optimized version)


  // Code Structure Improvement: Consolidated entity extraction (moved to performance optimized version)

  // Advanced sentiment analysis
  analyzeSentiment(message) {
    const lower = message.toLowerCase();
    
    const positiveWords = ['good', 'great', 'excellent', 'helpful', 'thank', 'appreciate', 'love', 'amazing'];
    const negativeWords = ['bad', 'terrible', 'confusing', 'frustrated', 'annoyed', 'problem', 'hate', 'awful'];
    
    const positiveScore = positiveWords.filter(word => lower.includes(word)).length;
    const negativeScore = negativeWords.filter(word => lower.includes(word)).length;
    
    let overall = 'neutral';
    if (positiveScore > negativeScore) overall = 'positive';
    else if (negativeScore > positiveScore) overall = 'negative';

    return {
      overall,
      positive: positiveScore,
      negative: negativeScore,
      confidence: Math.min((positiveScore + negativeScore) / 5, 1)
    };
  }

  // Advanced urgency detection
  detectUrgency(message) {
    const lower = message.toLowerCase();
    
    const urgentWords = ['urgent', 'asap', 'immediately', 'emergency', 'critical'];
    const highWords = ['quickly', 'soon', 'priority', 'important', 'fast'];
    const mediumWords = ['when you can', 'eventually', 'no rush'];
    
    let level = 'low';
    let score = 0;
    
    if (urgentWords.some(word => lower.includes(word))) {
      level = 'critical';
      score = 100;
    } else if (highWords.some(word => lower.includes(word))) {
      level = 'high';
      score = 75;
    } else if (mediumWords.some(word => lower.includes(word))) {
      level = 'medium';
      score = 50;
    }

    return { level, score, confidence: Math.min(score / 100, 1) };
  }

  // Extract conversation topics
  extractTopics(message) {
    const topics = new Set();
    const lower = message.toLowerCase();
    
    if (lower.includes('grant') || lower.includes('scheme')) topics.add('grants');
    if (lower.includes('health') || lower.includes('medical')) topics.add('healthcare');
    if (lower.includes('education') || lower.includes('student')) topics.add('education');
    if (lower.includes('agriculture') || lower.includes('farmer')) topics.add('agriculture');
    if (lower.includes('apply') || lower.includes('application')) topics.add('application_process');
    
    return Array.from(topics);
  }


  // Update session insights
  updateSessionInsights(exchange) {
    this.conversationMemory.sessionInsights.engagementLevel = Math.min(
      this.conversationMemory.sessionInsights.engagementLevel + 0.1, 1.0
    );

    this.conversationMemory.sessionInsights.conversationLength += 1;
    this.conversationMemory.sessionInsights.responseCount += 1;

    // Track topics explored
    exchange.context.intent && this.conversationMemory.sessionInsights.topicsExplored.add(exchange.context.intent.primary);
    
    // Update last response type
    this.conversationMemory.sessionInsights.lastResponseType = exchange.context.intent?.primary || 'unknown';

    if (exchange.context.sentiment.overall === 'negative') {
      this.conversationMemory.sessionInsights.userFrustration = Math.min(
        this.conversationMemory.sessionInsights.userFrustration + 0.1, 1.0
      );
    }
  }

  // Enhanced Learning & Memory System - Track response patterns to avoid repetition
  checkResponseRepetition(message, responseType) {
    const messageKey = message.substring(0, 50).toLowerCase();
    const responseKey = `${responseType}_${messageKey}`;
    
    // Check if we've used this response type recently for similar messages
    const recentResponses = this.conversationMemory.shortTerm.slice(-3);
    const hasRecentSimilarResponse = recentResponses.some(exchange => 
      exchange.message.substring(0, 50).toLowerCase() === messageKey &&
      exchange.context?.intent?.primary === responseType
    );

    if (hasRecentSimilarResponse) {
      this.conversationMemory.responseHistory.set(responseKey, 
        (this.conversationMemory.responseHistory.get(responseKey) || 0) + 1);
      
      // If we've used this combination too many times, suggest alternatives
      if (this.conversationMemory.responseHistory.get(responseKey) > 2) {
        return false; // Avoid repetition
      }
    }

    return true; // Safe to use this response
  }

  // Advanced Personalization Engine - Deep behavioral analysis
  analyzeUserBehavior(message, response, userProfile) {
    const lowerMessage = message.toLowerCase();
    const patterns = {
      asksForDetails: /more details|explain further|tell me more/i.test(lowerMessage),
      seeksComparisons: /compare|vs|difference|which.*better/i.test(lowerMessage),
      wantsStepByStep: /step.*by.*step|how.*to|process|procedure/i.test(lowerMessage),
      asksForRecommendations: /recommend|suggest|advice|best/i.test(lowerMessage),
      expressesConfusion: /confused|don.*t understand|unclear/i.test(lowerMessage),
      showsUrgency: /urgent|asap|immediately|quickly/i.test(lowerMessage)
    };

    // Update user preferences based on interaction patterns
    Object.entries(patterns).forEach(([pattern, isMatch]) => {
      if (isMatch) {
        const currentCount = this.conversationMemory.userPreferences.get(pattern) || 0;
        this.conversationMemory.userPreferences.set(pattern, currentCount + 1);
      }
    });

    // Analyze response effectiveness
    if (response && response.includes('?')) {
      const engagementBoost = this.conversationMemory.sessionInsights.engagementLevel + 0.05;
      this.conversationMemory.sessionInsights.engagementLevel = Math.min(engagementBoost, 1.0);
    }

    return this.getPersonalizedResponseStyle();
  }

  // Get personalized response style based on user behavior
  getPersonalizedResponseStyle() {
    const preferences = this.conversationMemory.userPreferences;
    
    // Analyze user preferences to determine optimal response style
    const detailScore = (preferences.get('asksForDetails') || 0) * 2;
    const stepScore = (preferences.get('wantsStepByStep') || 0) * 2;
    const comparisonScore = (preferences.get('seeksComparisons') || 0) * 1.5;
    
    if (stepScore > detailScore && stepScore > comparisonScore) {
      return 'step_by_step';
    } else if (comparisonScore > detailScore) {
      return 'comparison';
    } else if (detailScore > 0) {
      return 'elaborate';
    }
    
    return 'balanced';
  }

  // Enhanced Casual Conversation Handling
  handleCasualConversation(message) {
    const lowerMessage = message.toLowerCase();
    const casualPatterns = {
      greetings: /(hello|hi|hey|good morning|good afternoon|good evening)/,
      thanks: /(thank you|thanks|thx|appreciate)/,
      compliments: /(great|awesome|amazing|excellent|good job|well done)/,
      casualInquiry: /(how are you|what\'s up|how\'s it going|how do you work|who are you)/,
      weather: /(weather|today\'s weather|is it raining|sunny|cloudy)/,
      jokes: /(joke|funny|make me laugh|haha|lol)/,
      personal: /(what can you do|tell me about yourself|describe yourself)/
    };

    // Track casual conversation patterns
    Object.entries(casualPatterns).forEach(([pattern, regex]) => {
      if (regex.test(lowerMessage)) {
        this.conversationMemory.casualConversationTopics.add(pattern);
      }
    });

    // Generate contextual casual responses
    if (casualPatterns.greetings.test(lowerMessage)) {
      return this.generatePersonalizedGreeting();
    }
    
    if (casualPatterns.thanks.test(lowerMessage)) {
      return this.generateContextualThanks();
    }
    
    if (casualPatterns.compliments.test(lowerMessage)) {
      return this.generateHumbleResponse();
    }
    
    if (casualPatterns.casualInquiry.test(lowerMessage)) {
      return this.generateSelfIntroduction();
    }

    return null; // Not a casual conversation
  }

  // Generate personalized greeting based on conversation history
  generatePersonalizedGreeting() {
    const sessionInsights = this.conversationMemory.sessionInsights;
    const isReturningUser = sessionInsights.conversationLength > 5;
    const topicsExplored = Array.from(sessionInsights.topicsExplored);
    
    let greeting = "Hello! ";
    
    if (isReturningUser && topicsExplored.length > 0) {
      const recentTopic = topicsExplored[topicsExplored.length - 1];
      greeting += `Welcome back! I see you've been exploring ${recentTopic.replace('_', ' ')} topics. `;
    }
    
    greeting += "How can I help you discover the perfect government grants and schemes today?";
    
    const suggestions = [
      "What's new in grants?",
      "Continue our previous topic",
      "Show me all schemes",
      "Help me find specific grants"
    ];

    return {
      text: greeting,
      suggestions: suggestions,
      reasoning: 'Personalized greeting based on conversation history'
    };
  }

  // Generate contextual thank you response
  generateContextualThanks() {
    const engagementLevel = this.conversationMemory.sessionInsights.engagementLevel;
    const responseCount = this.conversationMemory.sessionInsights.responseCount;
    
    let thanksMessage = "You're very welcome! 😊 ";
    
    if (engagementLevel > 0.7) {
      thanksMessage += "I'm delighted that our conversation has been so helpful! ";
    }
    
    if (responseCount > 10) {
      thanksMessage += "We've covered quite a bit together - feel free to ask about anything else!";
    } else {
      thanksMessage += "Is there anything else you'd like to explore or understand better?";
    }

    const suggestions = [
      "Tell me something interesting",
      "Show me advanced features", 
      "Help with complex queries",
      "What else can you do?"
    ];

    return {
      text: thanksMessage,
      suggestions: suggestions,
      reasoning: 'Contextual thank you response encouraging further engagement'
    };
  }


  // Generate humble response to compliments
  generateHumbleResponse() {
    let response = "Thank you! 🙏 I strive to provide the most helpful and accurate information about government grants and schemes. ";
    response += "My goal is to make finding the right opportunities as simple and efficient as possible for you. ";
    response += "What specific area would you like to dive deeper into?";
    
    const suggestions = [
      "How do you work?",
      "Show me your capabilities",
      "Test your knowledge",
      "Help me with complex queries"
    ];

    return {
      text: response,
      suggestions: suggestions,
      reasoning: 'Humble response to compliments redirecting to user needs'
    };
  }

  // Generate self-introduction
  generateSelfIntroduction() {
    let intro = "I'm an ultra-intelligent AI assistant specializing in government grants and schemes! 🧠✨ ";
    intro += "I can help you with:\n\n";
    intro += "• **Smart Matching** - Find grants perfect for your profile\n";
    intro += "• **Step-by-Step Guidance** - Navigate application processes easily\n";
    intro += "• **Intelligent Comparisons** - Compare different schemes objectively\n";
    intro += "• **Personalized Recommendations** - Get suggestions tailored to your needs\n\n";
    intro += "I learn from our conversations to provide increasingly better assistance. What would you like to explore?";
    
    const suggestions = [
      "Find grants for my profile",
      "Show me your matching ability",
      "Explain a complex scheme",
      "Test your intelligence"
    ];

    return {
      text: intro,
      suggestions: suggestions,
      reasoning: 'Comprehensive self-introduction showcasing capabilities'
    };
  }

  // Enhanced Occupation Understanding
  enhanceOccupationDetection(message, currentProfile) {
    const lowerMessage = message.toLowerCase();
    const occupationPatterns = {
      // Agriculture & Rural
      farmer: /(farmer|agriculture|farming|crop|livestock|agricultural|agrarian|fields|rural worker)/,
      agriculturalWorker: /(farm worker|agricultural laborer|harvest|dairy|poultry)/,
      
      // Education & Students
      student: /(student|college|university|school|education|studying|academic)/,
      teacher: /(teacher|professor|instructor|educator|faculty|teaching)/,
      researcher: /(researcher|scientist|phd|postdoc|academic research)/,
      
      // Healthcare
      healthcareWorker: /(doctor|nurse|medical|healthcare|physician|surgeon|therapist)/,
      patient: /(patient|medical treatment|health insurance|medical bill)/,
      
      // Technology & IT
      itProfessional: /(software|developer|programmer|engineer|tech|it|computer|website)/,
      startup: /(startup|founder|entrepreneur|business idea|innovation)/,
      
      // Women & Social
      woman: /(woman|female|lady|girl|mother|wife|sister)/,
      socialWorker: /(social worker|counselor|community|non-profit|social service)/,
      
      // Business & Employment
      businessman: /(business|company|corporate|entrepreneur|owner|management)/,
      employee: /(employee|worker|staff|job|employment|career)/,
      unemployed: /(unemployed|jobless|seeking employment|looking for work)/,
      
      // Special Categories
      veteran: /(veteran|military|ex-serviceman|defense)/,
      disabled: /(disabled|disability|special needs|handicapped)/,
      senior: /(senior|elderly|retired|old age|pension)/,
      youth: /(youth|teen|adolescent|young adult|student)/
    };

    const detectedOccupations = [];
    Object.entries(occupationPatterns).forEach(([occupation, pattern]) => {
      if (pattern.test(lowerMessage)) {
        detectedOccupations.push(occupation);
      }
    });

    // Enhanced profile analysis
    if (detectedOccupations.length > 0) {
      const enhancedProfile = { ...currentProfile };
      
      detectedOccupations.forEach(occupation => {
        switch (occupation) {
          case 'farmer':
          case 'agriculturalWorker':
            enhancedProfile.occupation = 'farmer';
            enhancedProfile.sector = 'agriculture';
            enhancedProfile.location = 'rural';
            break;
          case 'student':
          case 'teacher':
          case 'researcher':
            enhancedProfile.occupation = occupation;
            enhancedProfile.sector = 'education';
            break;
          case 'healthcareWorker':
          case 'patient':
            enhancedProfile.occupation = occupation === 'patient' ? 'individual' : 'healthcare worker';
            enhancedProfile.sector = 'healthcare';
            break;
          case 'itProfessional':
          case 'startup':
            enhancedProfile.occupation = occupation;
            enhancedProfile.sector = 'technology';
            enhancedProfile.incomeLevel = occupation === 'startup' ? 'variable' : 'medium';
            break;
          case 'woman':
            enhancedProfile.gender = 'female';
            if (!enhancedProfile.occupation) enhancedProfile.occupation = 'individual';
            break;
          case 'socialWorker':
            enhancedProfile.occupation = 'social worker';
            enhancedProfile.sector = 'social';
            break;
          case 'businessman':
          case 'employee':
            enhancedProfile.occupation = occupation === 'businessman' ? 'business owner' : 'employee';
            enhancedProfile.sector = 'business';
            break;
          case 'unemployed':
            enhancedProfile.employmentStatus = 'unemployed';
            enhancedProfile.occupation = 'seeking employment';
            break;
          case 'veteran':
            enhancedProfile.category = 'veteran';
            enhancedProfile.occupation = 'veteran';
            break;
          case 'disabled':
            enhancedProfile.category = 'disabled';
            enhancedProfile.needs = ['accessibility', 'special assistance'];
            break;
          case 'senior':
            enhancedProfile.ageGroup = 'senior';
            enhancedProfile.occupation = 'retired';
            break;
          case 'youth':
            enhancedProfile.ageGroup = 'youth';
            if (!enhancedProfile.occupation) enhancedProfile.occupation = 'student';
            break;
        }
      });

      return enhancedProfile;
    }

    return currentProfile;
  }


  // Advanced response generation - removed duplicate method
  // The generateAdvancedResponse method is already implemented above with performance optimization


  // Dynamic Conversation Flow - Adaptive response strategy selection
  selectResponseStrategy(context) {
    const strategies = {
      direct_answer: { weight: 0, baseScore: 0 },
      clarification: { weight: 0, baseScore: 0 },
      step_by_step: { weight: 0, baseScore: 0 },
      comparison: { weight: 0, baseScore: 0 },
      recommendation: { weight: 0, baseScore: 0 },
      elaboration: { weight: 0, baseScore: 0 }
    };

    // Base strategy selection from intent
    switch (context.intent.primary) {
      case 'information_seeking':
        strategies.direct_answer.baseScore = 100;
        strategies.elaboration.baseScore = 80;
        break;
      case 'eligibility_check':
        strategies.step_by_step.baseScore = 100;
        strategies.recommendation.baseScore = 90;
        break;
      case 'application_guidance':
        strategies.step_by_step.baseScore = 100;
        strategies.clarification.baseScore = 70;
        break;
      case 'comparison':
        strategies.comparison.baseScore = 100;
        strategies.elaboration.baseScore = 70;
        break;
      case 'recommendation':
        strategies.recommendation.baseScore = 100;
        strategies.direct_answer.baseScore = 80;
        break;
      default:
        strategies.direct_answer.baseScore = 80;
        strategies.recommendation.baseScore = 60;
    }

    // Dynamic contextual adjustments
    const adjustments = {
      direct_answer: 0,
      clarification: 0,
      step_by_step: 0,
      comparison: 0,
      recommendation: 0,
      elaboration: 0
    };

    // Sentiment-based adjustments
    if (context.sentiment.overall === 'negative') {
      adjustments.clarification += 30;
      adjustments.elaboration += 20;
    } else if (context.sentiment.overall === 'positive') {
      adjustments.direct_answer += 15;
      adjustments.recommendation += 10;
    }

    // Urgency-based adjustments
    if (context.urgency.level === 'critical') {
      adjustments.direct_answer += 40;
      adjustments.step_by_step += 30;
    } else if (context.urgency.level === 'high') {
      adjustments.direct_answer += 25;
      adjustments.step_by_step += 20;
    }

    // Confidence-based adjustments
    if (context.intent.confidence < 0.4) {
      adjustments.clarification += 50;
    } else if (context.intent.confidence > 0.8) {
      adjustments.direct_answer += 20;
    }

    // Conversation history-based adjustments
    const conversationLength = this.conversationMemory.sessionInsights.conversationLength;
    const topicsExplored = this.conversationMemory.sessionInsights.topicsExplored;
    
    if (conversationLength > 10) {
      // Long conversation - prefer more sophisticated responses
      adjustments.recommendation += 15;
      adjustments.comparison += 15;
    }
    
    if (topicsExplored.size > 3) {
      // Multiple topics explored - prefer synthesis and connections
      adjustments.elaboration += 20;
      adjustments.comparison += 10;
    }

    // User preference-based adjustments
    const preferredStyle = this.getPersonalizedResponseStyle();
    if (preferredStyle === 'step_by_step') {
      adjustments.step_by_step += 25;
    } else if (preferredStyle === 'comparison') {
      adjustments.comparison += 25;
    } else if (preferredStyle === 'elaborate') {
      adjustments.elaboration += 25;
    }

    // Check for response repetition and avoid it
    const lastResponseType = this.conversationMemory.sessionInsights.lastResponseType;
    if (lastResponseType && adjustments[lastResponseType]) {
      adjustments[lastResponseType] -= 20; // Reduce weight of last used strategy
    }

    // Calculate final weights
    Object.keys(strategies).forEach(strategy => {
      strategies[strategy].weight = strategies[strategy].baseScore + adjustments[strategy];
    });

    // Select best strategy with tie-breaking
    const bestStrategies = Object.entries(strategies)
      .sort(([,a], [,b]) => b.weight - a.weight);

    // If top strategies are very close, add some randomness
    if (bestStrategies.length > 1 && Math.abs(bestStrategies[0][1].weight - bestStrategies[1][1].weight) < 10) {
      const randomIndex = Math.random() < 0.7 ? 0 : 1; // 70% chance to pick the best
      return bestStrategies[randomIndex][0];
    }

    return bestStrategies[0][0];
  }

  // Generate contextual response
  generateContextualResponse(strategy, context) {
    const responses = {
      direct_answer: () => this.generateDirectAnswer(context),
      clarification: () => this.generateClarification(context),
      step_by_step: () => this.generateStepByStep(context),
      comparison: () => this.generateComparison(context),
      recommendation: () => this.generateRecommendation(context)
    };

    const responseGenerator = responses[strategy];
    if (responseGenerator) {
      return responseGenerator();
    }

    return this.generateDefaultResponse(context);
  }

  // Generate direct answer response
  generateDirectAnswer(context) {
    if (context.retrievedGrants && context.retrievedGrants.length > 0) {
      let response = `🎯 **Here's what I found for you:**\n\n`;
      
      context.retrievedGrants.forEach((grant, index) => {
        response += `**${index + 1}. ${grant.name}** (${grant.sector})\n`;
        response += `💰 **Benefit:** ${grant.amount}\n`;
        response += `📝 **Details:** ${grant.description}\n\n`;
      });

      response += `**Would you like more specific information about any of these?**`;
      
      return {
        text: response,
        suggestions: context.retrievedGrants.slice(0, 2).map(g => `About ${g.name.split(" ")[0]}`),
        reasoning: 'Direct information delivery based on user query and retrieved grants'
      };
    }

    return this.generateDefaultResponse(context);
  }

  // Generate clarification response
  generateClarification(context) {
    const clarifications = this.conversationStrategies.clarification;
    const selectedClarification = clarifications[Math.floor(Math.random() * clarifications.length)];
    
    return {
      text: `🤔 ${selectedClarification}\n\nThis will help me provide you with the most accurate and relevant information.`,
      suggestions: ['I\'m a farmer', 'I need education help', 'I want health insurance', 'I need financial assistance'],
      reasoning: 'Requesting clarification to improve response accuracy and relevance'
    };
  }

  // Generate step-by-step response
  generateStepByStep(context) {
    const steps = [
      '**Step 1: Check Eligibility** - Verify if you meet the basic requirements',
      '**Step 2: Gather Documents** - Collect necessary paperwork and proofs',
      '**Step 3: Online Application** - Visit the official portal and fill the form',
      '**Step 4: Submit & Track** - Submit your application and monitor its status'
    ];

    let response = `📋 **Step-by-Step Guide:**\n\n${steps.join('\n')}\n\n`;
    response += `**Need help with any specific step? Just let me know!**`;

    return {
      text: response,
      suggestions: ['Explain Step 1', 'What documents needed?', 'Application portal link', 'Check application status'],
      reasoning: 'Providing structured guidance for complex processes'
    };
  }

  // Generate comparison response
  generateComparison(context) {
    if (context.retrievedGrants && context.retrievedGrants.length >= 2) {
      let response = `📊 **Comparison of Top Schemes:**\n\n`;
      
      context.retrievedGrants.slice(0, 3).forEach((grant, index) => {
        response += `**${grant.name}**\n`;
        response += `• Benefit: ${grant.amount}\n`;
        response += `• Sector: ${grant.sector}\n`;
        response += `• Coverage: ${grant.coverage}\n`;
        response += `• Best for: ${this.getGrantRecommendation(grant)}\n\n`;
      });

      response += `**Which one seems most suitable for your needs?**`;

      return {
        text: response,
        suggestions: ['Compare benefits', 'Which has easier application?', 'Best for my profile?', 'Next steps'],
        reasoning: 'Providing comparative analysis to help user make informed decision'
      };
    }

    return this.generateDefaultResponse(context);
  }

  // Generate recommendation response
  generateRecommendation(context) {
    let response = `💡 **Based on your query, I recommend:**\n\n`;
    
    if (context.entities.sectors.length > 0) {
      const sector = context.entities.sectors[0].name;
      response += `Since you're interested in **${sector}**, here are the top opportunities:\n\n`;
    }

    if (context.retrievedGrants && context.retrievedGrants.length > 0) {
      const topGrant = context.retrievedGrants[0];
      response += `**${topGrant.name}** is highly recommended because:\n`;
      response += `• High benefit amount: ${topGrant.amount}\n`;
      response += `• Wide coverage: ${topGrant.coverage}\n`;
      response += `• Simple application process\n\n`;
    }

    response += `**Would you like me to explain why this is the best option for you?**`;

    return {
      text: response,
      suggestions: ['Why this one?', 'Compare with others', 'How to apply', 'Next steps'],
      reasoning: 'Providing personalized recommendations based on user profile and query analysis'
    };
  }

  // Generate default response
  generateDefaultResponse(context) {
    let response = `🤖 **I\'m here to help you with government grants and schemes!**\n\n`;
    response += `I understand you're asking about: **"${context.message || 'various topics'}"**\n\n`;
    response += `**I can help you with:**\n`;
    response += `• Checking eligibility for schemes\n`;
    response += `• Finding relevant grants for your situation\n`;
    response += `• Explaining application processes\n`;
    response += `• Comparing different options\n\n`;
    response += `**What would you like to explore?**`;

    return {
      text: response,
      suggestions: ['Check my eligibility', 'Browse all grants', 'Tell me about health schemes', 'How to apply for PM Kisan'],
      reasoning: 'Default informative response with helpful suggestions'
    };
  }

  // Utility method for grant recommendations
  getGrantRecommendation(grant) {
    const recommendations = {
      'PM Kisan': 'Small farmers and agricultural workers',
      'Ayushman Bharat': 'Families needing healthcare coverage',
      'Pradhan Mantri Awas Yojana': 'Families needing housing support',
      'National Education Mission': 'Students and educational institutions'
    };
    return recommendations[grant.name] || 'General population';
  }
}


// Enhanced error categorization and contextual error generation
const categorizeError = (error) => {
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return 'network_failure';
  }
  if (error.message.includes('timeout')) {
    return 'timeout_error';
  }
  if (error.message.includes('unauthorized') || error.message.includes('401')) {
    return 'authentication_error';
  }
  if (error.message.includes('server error') || error.message.includes('500')) {
    return 'server_error';
  }
  return 'unknown_error';
};

const generateContextualError = (error, errorType, networkStatus) => {
  const errorResponses = {
    network_failure: {
      message: `🔌 **Connection Issue Detected**\n\nI encountered a network problem while trying to connect to our servers. Don't worry - I can still help you with grant information!\n\n**What I can do right now:**\n• Provide general grant information\n• Answer eligibility questions\n• Guide you through application processes\n• Help with scheme comparisons\n\n**Try these actions:**\n• Ask about specific schemes (PM Kisan, Ayushman Bharat)\n• Check eligibility criteria\n• Get step-by-step guidance`,
      suggestions: [
        "Tell me about PM Kisan",
        "What are health schemes?", 
        "Check eligibility criteria",
        "Application process help"
      ],
      recoverable: true
    },
    timeout_error: {
      message: `⏱️ **Request Timeout**\n\nThe server took too long to respond, but I'm still here to help!\n\n**Available assistance:**\n• Instant grant information\n• Eligibility verification\n• Application guidance\n• Scheme comparisons\n\n**Quick actions you can try:**`,
      suggestions: [
        "PM Kisan details",
        "Ayushman Bharat info",
        "Check my eligibility", 
        "How to apply"
      ],
      recoverable: true
    },
    server_error: {
      message: `🛠️ **Server Maintenance**\n\nOur servers are currently experiencing issues, but I can still provide valuable assistance!\n\n**What works perfectly:**\n• Grant information and details\n• Eligibility checking\n• Application guidance\n• Scheme comparisons\n\n**Popular requests that work great:**`,
      suggestions: [
        "List all available schemes",
        "Farmer benefits available",
        "Health insurance options",
        "Education grants"
      ],
      recoverable: true
    },
    authentication_error: {
      message: `🔐 **Access Restricted**\n\nThere seems to be an authentication issue, but I can help with general grant information!\n\n**I can assist with:**\n• General grant details\n• Scheme comparisons\n• Eligibility criteria\n• Application processes\n\n**General information requests:**`,
      suggestions: [
        "Compare different schemes",
        "General eligibility info",
        "Application steps",
        "Required documents"
      ],
      recoverable: true
    }
  };

  const defaultError = {
    message: `🤔 **Temporary Issue**\n\nI'm experiencing a technical hiccup, but I'm designed to handle this gracefully!\n\n**What I can still do:**\n• Provide comprehensive grant information\n• Answer questions about schemes\n• Help with eligibility checks\n• Guide through applications\n\n**Let's explore grants together:**`,
    suggestions: [
      "Show me popular schemes",
      "Tell me about farmer benefits",
      "Health scheme information",
      "Education opportunities"
    ],
    recoverable: true
  };

  return errorResponses[errorType] || defaultError;
};

// Simple grant matcher class
class AdvancedGrantMatcher {
  constructor(grants) {
    this.grants = grants;
  }

  findBestGrants(query, limit = 4) {
    const lower = query.toLowerCase();
    const matches = this.grants.filter(grant => 
      grant.name.toLowerCase().includes(lower) ||
      grant.description.toLowerCase().includes(lower) ||
      grant.sector.toLowerCase().includes(lower) ||
      grant.keywords.some(keyword => lower.includes(keyword.toLowerCase()))
    );
    return matches.slice(0, limit);
  }

  analyzeUserProfile(message, currentProfile) {
    const profile = { ...currentProfile };
    const lower = message.toLowerCase();
    
    if (lower.includes('farmer') || lower.includes('agriculture')) {
      profile.occupation = 'farmer';
      profile.location = 'rural';
    } else if (lower.includes('student') || lower.includes('education')) {
      profile.occupation = 'student';
    } else if (lower.includes('woman') || lower.includes('female')) {
      profile.gender = 'female';
    }
    
    return profile;
  }
}

// Enhanced ChatGPT-Level ChatBot Component
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your Grant Assistant. How can I help you find information about government grants and schemes today?",
      sender: "bot",
      timestamp: new Date(),
      suggestions: ["Check my eligibility", "Browse available grants", "Tell me about health schemes"]
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [currentTypingText, setCurrentTypingText] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  const [fastMode, setFastMode] = useState(true);
  const [conversationMode, setConversationMode] = useState('intelligent');
  const [analyticsMode, setAnalyticsMode] = useState(false);
  const [userSatisfaction, setUserSatisfaction] = useState({
    currentScore: 0,
    trend: 'neutral',
    feedbackCount: 0,
    lastUpdate: null
  });
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: 0,
    cacheHitRate: 0,
    userEngagement: 0,
    sessionSuccessRate: 0
  });

  const [analytics, setAnalytics] = useState({
    sessionStart: Date.now(),
    totalMessages: 0,
    topicsExplored: new Set(),
    responseTimes: [],
    satisfactionScores: [],
    errorCount: 0,
    networkIssues: 0,
    userJourney: []
  });


  // Enhanced UI State Management
  const [uiState, setUIState] = useState({
    isHighContrast: false,
    reducedMotion: false,
    focusMode: false,
    compactMode: isMobile,
    theme: 'auto',
    keyboardNavigation: false
  });


  // Network Status Monitoring
  const [networkStatus, setNetworkStatus] = useState({
    isOnline: true,
    connectionType: 'unknown',
    quality: 'good'
  });

  // Proactive Assistance System
  const [proactiveAssistance, setProactiveAssistance] = useState({
    isEnabled: true,
    lastInteraction: Date.now(),
    conversationDepth: 0,
    userEngagement: 0,
    suggestedActions: [],
    proactiveMessages: [],
    sessionInsights: {
      userGoals: new Set(),
      unresolvedQuestions: [],
      userFrustration: 0,
      engagementLevel: 0,
      conversationLength: 0
    }
  });
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();


  // Initialize ultra-intelligent conversation engine
  const conversationEngine = useRef(new UltraIntelligentConversationEngine());

  // Initialize grant matcher (existing)
  const grantMatcher = useRef(new AdvancedGrantMatcher(GRANTS));

  // Proactive Assistance System Functions
  const analyzeProactiveOpportunities = useCallback((currentMessages, userProfile) => {
    const opportunities = [];
    const sessionLength = currentMessages.length;
    
    // Check for long conversations without specific action
    if (sessionLength > 8 && !currentMessages.some(m => m.text.toLowerCase().includes('apply'))) {
      opportunities.push({
        type: 'application_guidance',
        priority: 'high',
        trigger: 'long_conversation_no_action',
        message: "I've noticed we've been discussing various schemes. Would you like me to guide you through the application process for any specific scheme?"
      });
    }

    // Check for repeated queries about same topic
    const grantQueries = currentMessages.filter(m => 
      m.sender === 'user' && (m.text.toLowerCase().includes('grant') || m.text.toLowerCase().includes('scheme'))
    );
    if (grantQueries.length >= 3) {
      opportunities.push({
        type: 'scheme_recommendation',
        priority: 'medium',
        trigger: 'repeated_queries',
        message: "I see you've asked about multiple schemes. Based on your interests, let me recommend the most suitable ones for your profile."
      });
    }

    // Check for unclear or confused messages
    const confusedMessages = currentMessages.filter(m => 
      m.sender === 'user' && (
        m.text.toLowerCase().includes('confused') || 
        m.text.toLowerCase().includes('don\'t understand') ||
        m.text.toLowerCase().includes('not clear')
      )
    );
    if (confusedMessages.length > 0) {
      opportunities.push({
        type: 'clarification',
        priority: 'high',
        trigger: 'confusion_detected',
        message: "I want to make sure I'm helping you effectively. Would you prefer a simpler explanation or specific examples?"
      });
    }

    // Check for eligibility-related questions without resolution
    const eligibilityQueries = currentMessages.filter(m => 
      m.sender === 'user' && m.text.toLowerCase().includes('eligible')
    );
    if (eligibilityQueries.length >= 2) {
      opportunities.push({
        type: 'eligibility_check',
        priority: 'medium',
        trigger: 'repeated_eligibility',
        message: "Let me help you check your eligibility more systematically. What's your occupation and annual income range?"
      });
    }

    return opportunities;
  }, []);

  const generateProactiveMessage = useCallback((opportunity, userProfile) => {
    const messages = {
      application_guidance: {
        text: "🎯 **Ready to Take Action?**\n\nI've been helping you explore different schemes. Would you like me to guide you through applying for any specific scheme?\n\n**Popular next steps:**\n• Apply for PM Kisan (farmers)\n• Get Ayushman Bharat health card\n• Check housing scheme eligibility\n• Start education grant application",
        suggestions: ["Guide me through PM Kisan application", "Help with Ayushman Bharat", "Check my housing eligibility", "Education grant process"]
      },
      scheme_recommendation: {
        text: "💡 **Personalized Scheme Recommendations**\n\nBased on our conversation, here are the schemes most relevant to your needs:",
        suggestions: ["Show me my top matches", "Explain PM Kisan benefits", "Health scheme comparison", "Application timeline"]
      },
      clarification: {
        text: "🤝 **Let me Help You Better**\n\nI want to make sure my explanations are clear and helpful. What's the best way for me to assist you?",
        suggestions: ["Use simpler language", "Give me real examples", "Show step-by-step process", "Compare different options"]
      },
      eligibility_check: {
        text: "✅ **Let's Check Your Eligibility Together**\n\nTo provide accurate eligibility information, I need to understand your profile better.",
        suggestions: ["I'm a farmer", "I need health insurance", "I'm a student", "I run a small business"]
      }
    };

    const messageTemplate = messages[opportunity.type];
    if (messageTemplate) {
      return {
        text: messageTemplate.text,
        suggestions: messageTemplate.suggestions,
        proactive: true,
        trigger: opportunity.trigger
      };
    }

    return null;
  }, []);

  const triggerProactiveAssistance = useCallback(() => {
    if (!proactiveAssistance.isEnabled) return;

    const opportunities = analyzeProactiveOpportunities(messages, userProfile);
    const highPriorityOpportunity = opportunities.find(op => op.priority === 'high');
    
    if (highPriorityOpportunity) {
      const proactiveMessage = generateProactiveMessage(highPriorityOpportunity, userProfile);
      if (proactiveMessage) {
        const msg = {
          id: Date.now() + 1,
          text: proactiveMessage.text,
          sender: 'bot',
          suggestions: proactiveMessage.suggestions,
          timestamp: new Date(),
          type: "proactive-message",
          category: proactiveMessage.trigger
        };
        setMessages(prev => [...prev, msg]);
        
        setProactiveAssistance(prev => ({
          ...prev,
          lastInteraction: Date.now(),
          conversationDepth: prev.conversationDepth + 1
        }));
      }
    }
  }, [messages, userProfile, proactiveAssistance.isEnabled, analyzeProactiveOpportunities, generateProactiveMessage]);

  // Monitor conversation for proactive opportunities
  useEffect(() => {
    if (messages.length > 3 && isOpen) {
      const timer = setTimeout(() => {
        triggerProactiveAssistance();
      }, 10000); // Check every 10 seconds after initial interaction
      
      return () => clearTimeout(timer);
    }
  }, [messages.length, isOpen, triggerProactiveAssistance]);

  // Update proactive insights based on user interactions
  const updateProactiveInsights = useCallback((messageText, responseType) => {
    setProactiveAssistance(prev => {
      const newInsights = { ...prev.sessionInsights };
      
      // Track user goals
      if (messageText.toLowerCase().includes('apply')) {
        newInsights.userGoals.add('application');
      }
      if (messageText.toLowerCase().includes('eligible')) {
        newInsights.userGoals.add('eligibility_check');
      }
      if (messageText.toLowerCase().includes('compare')) {
        newInsights.userGoals.add('comparison');
      }

      // Track engagement level
      newInsights.engagementLevel = Math.min(newInsights.engagementLevel + 0.1, 1.0);
      newInsights.conversationLength = prev.sessionInsights.conversationLength + 1;

      // Track unresolved questions
      if (responseType === 'clarification' || responseType === 'confusion') {
        newInsights.unresolvedQuestions.push({
          question: messageText,
          timestamp: Date.now(),
          context: 'proactive_monitoring'
        });
      }

      return {
        ...prev,
        sessionInsights: newInsights
      };
    });
  }, []);


  // Mobile detection and responsive design
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Network Status Monitoring
  useEffect(() => {
    const updateNetworkStatus = () => {
      const isOnline = navigator.onLine;
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      setNetworkStatus({
        isOnline,
        connectionType: connection?.effectiveType || 'unknown',
        quality: connection?.effectiveType ? 
          (connection.effectiveType.includes('4g') ? 'excellent' : 
           connection.effectiveType.includes('3g') ? 'good' : 'poor') : 'unknown'
      });
    };

    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    updateNetworkStatus();
    
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }
    
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    return () => {
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
      window.removeEventListener('online', updateNetworkStatus);
      window.removeEventListener('offline', updateNetworkStatus);
    };
  }, []);

  // Accessibility and UI State Management
  useEffect(() => {
    // Detect reduced motion preference
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setUIState(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));
      
      const handleChange = () => {
        setUIState(prev => ({ ...prev, reducedMotion: mediaQuery.matches }));
      };
      
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  // Enhanced focus management for accessibility
  useEffect(() => {
    if (uiState.focusMode && isOpen) {
      const chatInput = document.querySelector('[aria-label="Chat input field"]');
      if (chatInput) {
        chatInput.focus();
      }
    }
  }, [uiState.focusMode, isOpen]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = false;
        recognitionInstance.lang = 'en-IN';
        
        recognitionInstance.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputValue(transcript);
          setIsListening(false);
        };
        
        recognitionInstance.onerror = () => {
          setIsListening(false);
          alert("Voice recognition error. Please try again.");
        };
        
        recognitionInstance.onend = () => {
          setIsListening(false);
        };
        
        setRecognition(recognitionInstance);
      }
    }
  }, []);


  // Voice input toggle
  const toggleVoiceInput = useCallback(() => {
    if (!recognition) {
      alert("Voice recognition not supported in this browser. Please try Chrome or Edge.");
      return;
    }
    
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      // Confirm before starting voice for the first time
      if (!isListening && userProfile.voiceConsent !== true) {
        const consent = confirm("🎤 Enable voice input? You can speak your messages instead of typing. Click 'OK' to enable.");
        if (consent) {
          setUserProfile(prev => ({ ...prev, voiceConsent: true }));
          setIsListening(true);
          recognition.start();
        }
      } else {
        setIsListening(true);
        recognition.start();
      }
    }
  }, [recognition, isListening, userProfile.voiceConsent]);


  // Enhanced Analytics Tracking System
  const trackAnalytics = useCallback((eventType, data = {}) => {
    const timestamp = Date.now();
    const sessionDuration = timestamp - analytics.sessionStart;
    
    setAnalytics(prev => ({
      ...prev,
      totalMessages: prev.totalMessages + (eventType === 'message_sent' ? 1 : 0),
      sessionDuration,
      userJourney: [...prev.userJourney, { timestamp, eventType, data }]
    }));

    // Update performance metrics
    if (eventType === 'response_received') {
      const responseTime = data.responseTime || 0;
      setAnalytics(prev => ({
        ...prev,
        responseTimes: [...prev.responseTimes.slice(-9), responseTime] // Keep last 10
      }));
    }

    // Update satisfaction tracking
    if (eventType === 'satisfaction_feedback') {
      setUserSatisfaction(prev => ({
        ...prev,
        currentScore: data.score,
        feedbackCount: prev.feedbackCount + 1,
        lastUpdate: timestamp,
        trend: data.trend || 'neutral'
      }));
      setAnalytics(prev => ({
        ...prev,
        satisfactionScores: [...prev.satisfactionScores.slice(-19), data.score] // Keep last 20
      }));
    }
  }, [analytics.sessionStart]);

  // Calculate real-time performance metrics
  useEffect(() => {
    const avgResponseTime = analytics.responseTimes.length > 0 
      ? analytics.responseTimes.reduce((a, b) => a + b, 0) / analytics.responseTimes.length
      : 0;
    
    const cacheHitRate = conversationEngine.current.getPerformanceMetrics().cacheHitRate;
    const userEngagement = Math.min(analytics.totalMessages * 0.1, 1.0);
    const successRate = analytics.totalMessages > 0 ? Math.min((analytics.totalMessages - analytics.errorCount) / analytics.totalMessages, 1.0) : 0;

    setPerformanceMetrics({
      averageResponseTime: avgResponseTime,
      cacheHitRate: parseFloat(cacheHitRate),
      userEngagement: userEngagement,
      sessionSuccessRate: successRate
    });
  }, [analytics.responseTimes, analytics.totalMessages, analytics.errorCount]);

  // Enhanced scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.altKey && event.key === 'v') {
        event.preventDefault();
             }
      
      toggleVoiceInput();
 if (event.altKey && event.key === 't') {
        event.preventDefault();
        setIsOpen(!isOpen);
      }

      if (event.altKey && event.key === 'c') {
        event.preventDefault();
        const modes = ['intelligent', 'detailed', 'quick'];
        const currentIndex = modes.indexOf(conversationMode);
        const nextIndex = (currentIndex + 1) % modes.length;
        setConversationMode(modes[nextIndex]);
      }
      
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, toggleVoiceInput, conversationMode]);

  // Enhanced typing animation
  const typeText = useCallback((text, callback) => {
    setIsTyping(true);
    setCurrentTypingText("");
    let index = 0;
    
    const typeInterval = setInterval(() => {
      if (index < text.length) {
        setCurrentTypingText(text.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typeInterval);
        setIsTyping(false);
        setCurrentTypingText("");
        callback?.();
      }
    }, conversationMode === 'quick' ? 5 : 10);
  }, [conversationMode]);



  // Ultra-intelligent message handling with analytics tracking
  const handleSend = useCallback(async (text = inputValue) => {
    if (!text.trim()) return;

    const userMsg = { 
      id: Date.now(), 
      text, 
      sender: "user", 
      timestamp: new Date(),
      type: "user-message"
    };
    
    // Track message analytics
    trackAnalytics('message_sent', { textLength: text.length });
    
    setMessages(prev => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(false);
    
    const startTime = Date.now();

    // Enhanced casual conversation handling
    const lowerText = text.toLowerCase().trim();
    
    // Check for greetings (including variations like "halo", "helo", etc.)
    const greetingPatterns = /(halo|helo|hello|hi|hey|good morning|good afternoon|good evening|whats up|what's up)/;
    if (greetingPatterns.test(lowerText)) {
      setTimeout(() => {
        const casualResponse = conversationEngine.current.handleCasualConversation(text) || {
          text: `Hello! 👋 Great to see you! I'm here to help you find the perfect government grants and schemes. What can I assist you with today?`,
          suggestions: generateRealisticSuggestions("greeting", text),
          reasoning: 'Greeting response'
        };
        
        const instantResponse = {
          id: Date.now() + 1,
          text: casualResponse.text,
          sender: 'bot',
          suggestions: casualResponse.suggestions,
          timestamp: new Date(),
          type: "bot-message",
          reasoning: casualResponse.reasoning
        };

        setMessages(prev => [...prev, instantResponse]);
        setIsLoading(false);
        
        // Track casual response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'casual',
          success: true 
        });
      }, 100);
      return;
    }

    // Enhanced thank you handling
    const thankPatterns = /(thank you|thanks|thx|thnx|appreciate|grateful)/;
    if (thankPatterns.test(lowerText)) {
      setTimeout(() => {
        const thanksResponse = {
          id: Date.now() + 1,
          text: `😊 **You're very welcome!** I'm happy to help! \n\nI'm constantly learning to provide better assistance. Each conversation helps me understand your needs better.\n\n**What else can I help you discover today?**`,
          sender: 'bot',
          suggestions: generateRealisticSuggestions("thanks", text),
          timestamp: new Date(),
          type: "bot-message",
          reasoning: 'Thank you response with continued engagement'
        };

        setMessages(prev => [...prev, thanksResponse]);
        setIsLoading(false);
        
        // Track thanks response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'thanks',
          success: true 
        });
      }, 100);
      return;
    }

    // Handle compliments
    const complimentPatterns = /(great|awesome|amazing|excellent|good job|well done|brilliant|impressive)/;
    if (complimentPatterns.test(lowerText)) {
      setTimeout(() => {
        const humbleResponse = {
          id: Date.now() + 1,
          text: `🙏 **Thank you so much!** I really appreciate the kind words. My goal is to make finding government grants as simple and helpful as possible for you.\n\n**What specific grant or scheme would you like to explore?**`,
          sender: 'bot',
          suggestions: generateRealisticSuggestions("compliment", text),
          timestamp: new Date(),
          type: "bot-message",
          reasoning: 'Humble response to compliments'
        };

        setMessages(prev => [...prev, humbleResponse]);
        setIsLoading(false);
        
        // Track compliment response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'compliment',
          success: true 
        });
      }, 100);
      return;
    }


  // Handle casual inquiries about the AI
    const aiInquiryPatterns = /(who are you|what can you do|tell me about yourself|how do you work|describe yourself)/;
    if (aiInquiryPatterns.test(lowerText)) {
      setTimeout(() => {
        const selfIntro = conversationEngine.current.generateSelfIntroduction();
        const introResponse = {
          id: Date.now() + 1,
          text: selfIntro.text,
          sender: 'bot',
          suggestions: selfIntro.suggestions,
          timestamp: new Date(),
          type: "bot-message",
          reasoning: selfIntro.reasoning
        };

        setMessages(prev => [...prev, introResponse]);
        setIsLoading(false);
        
        // Track AI inquiry response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'self_intro',
          success: true 
        });
      }, 100);
      return;
    }

    // Handle "how are you" and casual conversation
    const casualPatterns = /(how are you|how's it going|what's up|how do you feel|are you good)/;
    if (casualPatterns.test(lowerText)) {
      setTimeout(() => {
        const casualResponse = {
          id: Date.now() + 1,
          text: `I'm doing great, thanks for asking! 😊 I'm always excited to help people discover government grants and schemes. \n\n**How are YOU doing today?** Is there something specific I can help you find?`,
          sender: 'bot',
          suggestions: generateRealisticSuggestions("casual", text),
          timestamp: new Date(),
          type: "bot-message",
          reasoning: 'Casual conversation response maintaining engagement'
        };

        setMessages(prev => [...prev, casualResponse]);
        setIsLoading(false);
        
        // Track casual conversation analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'casual_conversation',
          success: true 
        });
      }, 100);
      return;
    }

    // Handle weather/joke requests with redirect to grants
    const diversionPatterns = /(weather|joke|funny|tell me a joke|what's the weather)/;
    if (diversionPatterns.test(lowerText)) {
      setTimeout(() => {
        const redirectResponse = {
          id: Date.now() + 1,
          text: `I love your enthusiasm! 😄 While I don't handle weather or jokes, I'm actually really good at finding government grants and schemes that could benefit you!\n\n**Let me help you discover some opportunities instead!** What kind of grants or schemes are you looking for?`,
          sender: 'bot',
          suggestions: ["Show me agriculture grants", "Health insurance schemes", "Education opportunities", "Small business support"],
          timestamp: new Date(),
          type: "bot-message",
          reasoning: 'Redirecting off-topic conversation back to core functionality'
        };

        setMessages(prev => [...prev, redirectResponse]);
        setIsLoading(false);
        
        // Track diversion response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'diversion_redirect',
          success: true 
        });
      }, 100);
      return;
    }

    // Handle clarification questions
    const clarificationPatterns = /(i don't understand|confused|can you explain|what do you mean|not clear)/;
    if (clarificationPatterns.test(lowerText)) {
      setTimeout(() => {
        const clarificationResponse = {
          id: Date.now() + 1,
          text: `No problem! Let me break this down more clearly for you. 🤔\n\n**Here's a simpler explanation:**\n\nI can help you:\n• Find grants you might be eligible for\n• Explain how to apply for schemes\n• Compare different government benefits\n• Answer questions about requirements\n\n**What specific aspect would you like me to explain differently?**`,
          sender: 'bot',
          suggestions: ["Explain in simple terms", "Give me an example", "What do I need to do?", "Show me the steps"],
          timestamp: new Date(),
          type: "bot-message",
          reasoning: 'Providing clarification with simpler language and clear structure'
        };

        setMessages(prev => [...prev, clarificationResponse]);
        setIsLoading(false);
        
        // Track clarification response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'clarification',
          success: true 
        });
      }, 100);
      return;
    }

    // Handle urgency/frustration
    const urgentPatterns = /(urgent|immediately|asap|quick|emergency|critical|help now)/;
    if (urgentPatterns.test(lowerText)) {
      setTimeout(() => {
        const urgentResponse = {
          id: Date.now() + 1,
          text: `🚨 **I understand this is important!** Let me help you quickly:\n\n**Fastest way to get help:**\n• Tell me what you need (farmer, student, business, etc.)\n• I\'ll find relevant grants immediately\n• Give you step-by-step instructions\n\n**What\'s your situation?** (e.g., "I\'m a farmer", "I need health insurance", "I\'m a student")`,
          sender: 'bot',
          suggestions: ["I'm a farmer", "I need health help", "I'm a student", "I run a small business"],
          timestamp: new Date(),
          type: "bot-message",
          reasoning: 'Immediate priority response for urgent requests'
        };

        setMessages(prev => [...prev, urgentResponse]);
        setIsLoading(false);
        
        // Track urgent response analytics
        const responseTime = Date.now() - startTime;
        trackAnalytics('response_received', { 
          responseTime, 
          responseType: 'urgent',
          success: true,
          priority: 'high'
        });
      }, 100);
      return;
    }

    // Update user profile
    const newProfile = grantMatcher.current.analyzeUserProfile(text, userProfile);
    setUserProfile(newProfile);


    try {
      // Enhanced API call with conversation context
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: text, 
          history: messages.slice(-6).map(m => ({ sender: m.sender, text: m.text })),
          profile: newProfile,
          conversationMode: conversationMode
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);


      if (response.ok) {
        const data = await response.json();
        if (data?.reply) {
          const botMsg = {
            id: Date.now() + 1,
            text: data.reply,
            sender: 'bot',
            suggestions: data.suggestions || generateEnhancedSuggestions(text, newProfile),
            timestamp: new Date(),
            type: "bot-message"
          };
          setMessages(prev => [...prev, botMsg]);
          setIsLoading(false);
          
          // Track successful API response
          const responseTime = Date.now() - startTime;
          trackAnalytics('response_received', { 
            responseTime, 
            responseType: 'api_success',
            success: true,
            hasSuggestions: !!(data.suggestions && data.suggestions.length > 0)
          });
          return;
        }
      }
      
      throw new Error('Remote AI unavailable');


    } catch (error) {
      // Track error analytics with enhanced categorization
      const errorType = categorizeError(error);
      const networkError = error.name === 'TypeError' && error.message.includes('fetch');
      
      trackAnalytics('error_occurred', { 
        errorType: errorType,
        errorMessage: error.message,
        hasNetworkError: networkError,
        isOnline: networkStatus.isOnline,
        connectionQuality: networkStatus.quality
      });
      
      setAnalytics(prev => ({
        ...prev,
        errorCount: prev.errorCount + 1,
        networkIssues: networkError ? prev.networkIssues + 1 : prev.networkIssues
      }));
      
      // Enhanced contextual error response system
      const contextualError = generateContextualError(error, errorType, networkStatus);
      const botMsg = {
        id: Date.now() + 1,
        text: contextualError.message,
        sender: 'bot',
        suggestions: contextualError.suggestions,
        timestamp: new Date(),
        type: "bot-message",
        category: "error_response",
        errorDetails: {
          type: errorType,
          timestamp: new Date().toISOString(),
          recoverable: contextualError.recoverable
        }
      };
      
      setMessages(prev => [...prev, botMsg]);
      setIsLoading(false);
      
      // Track error response analytics
      const responseTime = Date.now() - startTime;
      trackAnalytics('response_received', { 
        responseTime, 
        responseType: 'error_handling',
        success: contextualError.recoverable,
        errorType: errorType,
        isRecoverable: contextualError.recoverable
      });
    }
  }, [inputValue, messages, userProfile, conversationMode]);


  // Generate enhanced suggestions with realistic capabilities
  const generateEnhancedSuggestions = useCallback((message, profile) => {
    const suggestions = [];
    const lower = message.toLowerCase();
    
    if (lower.includes('eligibility')) {
      suggestions.push("Who can apply for PM Kisan?", "What's the income limit?", "Check my eligibility");
    } else if (lower.includes('apply')) {
      suggestions.push("How to apply for schemes", "Application process", "Required documents");
    } else if (lower.includes('compare')) {
      suggestions.push("Compare PM Kisan vs Ayushman Bharat", "Health scheme comparison", "Which scheme is better?");
    } else {
      suggestions.push("Tell me about PM Kisan", "What are health schemes?", "Agriculture grants");
    }
    
    // Add realistic suggestions that AI can actually help with
    suggestions.push("Explain a scheme", "Find schemes for farmers", "Health insurance options");
    return suggestions.slice(0, 4);
  }, []);


  // Generate dynamic, engaging placeholder text
  const generateDynamicPlaceholder = useCallback(() => {
    const hour = new Date().getHours();
    const greetings = {
      morning: "Good morning! 🌅 What grants can I help you discover today?",
      afternoon: "Good afternoon! ☀️ How can I assist with your grant search?",
      evening: "Good evening! 🌙 What government schemes are you interested in?",
      night: "Working late? 🌙 I'm here to help find grants for you!"
    };

    const contextualHints = [
      "Try: 'I'm a farmer looking for schemes'",
      "Ask: 'What health insurance is available?'",
      "Say: 'I need education grants'",
      "Try: 'Compare PM Kisan and Ayushman Bharat'",
      "Ask: 'How to apply for housing schemes'",
      "Say: 'I need financial assistance'",
      "Try: 'What grants for startups?'",
      "Ask: 'How to check eligibility?'"
    ];

    const motivationalPhrases = [
      "Let's find your perfect grant match! 🎯",
      "Discover opportunities waiting for you! ✨",
      "Your ideal scheme is just a question away! 🚀",
      "Ready to unlock government benefits? 💎",
      "Let's navigate grants together! 🧭",
      "Your next opportunity starts here! 🌟"
    ];

    // Time-based greeting
    let timeGreeting;
    if (hour >= 5 && hour < 12) timeGreeting = greetings.morning;
    else if (hour >= 12 && hour < 17) timeGreeting = greetings.afternoon;
    else if (hour >= 17 && hour < 22) timeGreeting = greetings.evening;
    else timeGreeting = greetings.night;

    // Random contextual hint and motivational phrase
    const randomHint = contextualHints[Math.floor(Math.random() * contextualHints.length)];
    const randomMotivation = motivationalPhrases[Math.floor(Math.random() * motivationalPhrases.length)];

    // Return mobile or desktop specific format
    if (isMobile) {
      return `${timeGreeting.split('!')[0]}! 💬 Ask me anything...`;
    } else {
      return `${timeGreeting} 💡 ${randomMotivation} \n💡 ${randomHint}`;
    }
  }, [isMobile]);

  // Generate realistic suggestions for different conversation types
  const generateRealisticSuggestions = useCallback((type, message) => {
    const suggestions = {
      greeting: [
        "Tell me about available grants",
        "How to find schemes for farmers", 
        "Health insurance schemes",
        "Education grants available"
      ],
      thanks: [
        "Tell me about PM Kisan",
        "What schemes are available?",
        "How to check eligibility",
        "Application process"
      ],
      compliment: [
        "Can you help me find grants?",
        "What are the top schemes?",
        "How do I apply for benefits?",
        "Explain health schemes"
      ],
      casual: [
        "What can you help me with?",
        "Show me available grants",
        "Tell me about schemes",
        "How to get started?"
      ]
    };
    
    return suggestions[type] || suggestions.greeting;
  }, []);


  // Enhanced suggestion handling with smart categorization
  const handleSuggestion = useCallback((suggestion) => {
    const navigationMap = {
      "View Dashboard": "/chart",
      "Submit Feedback": "/suggestions", 
      "About Us": "/about"
    };

    const actionSuggestions = {
      "Tell me about PM Kisan": () => {
        const response = {
          id: Date.now() + 1,
          text: `🌾 **PM Kisan Samman Nidhi**\n\n**Key Benefits:**\n• ₹6,000 annually to eligible farmers\n• Direct bank transfer\n• No middlemen\n\n**Eligibility:**\n• Small & marginal farmers\n• Annual income limit applies\n• Land ownership verification\n\n**Application:**\n• Visit pmkisan.gov.in\n• Fill online form\n• Upload required documents\n• Track application status`,
          sender: 'bot',
          suggestions: ["How to apply?", "Check my eligibility", "Required documents", "Application status"],
          timestamp: new Date(),
          type: "bot-message",
          category: "direct_info"
        };
        setMessages(prev => [...prev, response]);
      },
      "What health schemes available?": () => {
        const response = {
          id: Date.now() + 1,
          text: `🏥 **Top Health Insurance Schemes:**\n\n**1. Ayushman Bharat**\n• ₹5 lakh health coverage\n• 50 crore beneficiaries\n• Cashless treatment\n\n**2. Pradhan Mantri Jan Arogya Yojana**\n• Family floater plan\n• 1,400+ covered procedures\n• Nationwide network\n\n**3. ESI Scheme**\n• Employees' health insurance\n• Medical benefits\n• Unemployment protection`,
          sender: 'bot',
          suggestions: ["Ayushman Bharat details", "Apply for health card", "Find nearby hospitals", "Check eligibility"],
          timestamp: new Date(),
          type: "bot-message",
          category: "health_info"
        };
        setMessages(prev => [...prev, response]);
      },
      "How to check eligibility": () => {
        const response = {
          id: Date.now() + 1,
          text: `✅ **How to Check Eligibility:**\n\n**Step-by-Step Process:**\n1. **Identify the Scheme** - Choose relevant scheme\n2. **Check Basic Criteria** - Age, income, occupation\n3. **Visit Official Portal** - Government websites\n4. **Use Eligibility Calculator** - Online tools available\n5. **Document Verification** - Gather required proofs\n\n**Quick Eligibility Check:**\n• **PM Kisan:** Farmer with cultivable land\n• **Ayushman Bharat:** Earning ≤₹5 lakh annually\n• **Housing:** Income ≤₹18 lakh (varies by location)`,
          sender: 'bot',
          suggestions: ["Check PM Kisan eligibility", "Ayushman Bharat criteria", "Income limits by scheme", "Document requirements"],
          timestamp: new Date(),
          type: "bot-message",
          category: "guidance"
        };
        setMessages(prev => [...prev, response]);
      },
      "Compare PM Kisan and Ayushman Bharat": () => {
        const response = {
          id: Date.now() + 1,
          text: `📊 **PM Kisan vs Ayushman Bharat Comparison:**\n\n| Aspect | PM Kisan | Ayushman Bharat |\n|--------|----------|------------------|\n| **Benefit** | ₹6,000/year | ₹5 lakh health cover |\n| **Target** | Farmers | All eligible families |\n| **Payment** | Quarterly | Medical emergencies |\n| **Coverage** | Direct cash | Hospitalization |\n| **Eligibility** | Land ownership | Income criteria |\n\n**Which is Better for You?**\n• **Farmer** → Both schemes (complementary)\n• **Non-farmer** → Ayushman Bharat\n• **Combined benefits** → Apply for both`,
          sender: 'bot',
          suggestions: ["Apply for both", "Check my eligibility", "Find common benefits", "Application process"],
          timestamp: new Date(),
          type: "bot-message",
          category: "comparison"
        };
        setMessages(prev => [...prev, response]);
      }
    };

    // Check if suggestion has predefined action
    if (actionSuggestions[suggestion]) {
      actionSuggestions[suggestion]();
      return;
    }

    // Handle navigation suggestions
    if (navigationMap[suggestion]) {
      const route = navigationMap[suggestion];
      if (route.startsWith('/')) {
        navigate(route);
        return;
      }
    }

    // Default: send as chat message
    handleSend(suggestion);
  }, [navigate, handleSend]);

  // Enhanced text formatting
  const formatText = useCallback((text) => {
    const parts = [];
    let lastIndex = 0;
    
    const regex = /\*\*([^*]+)\*\*|•|(\n)|`([^`]+)`/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        const textPart = text.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${match.index}`} style={{ animation: 'fadeIn 0.3s ease-in' }}>
            {textPart}
          </span>
        );
      }

      if (match[1]) {

        parts.push(
          <strong 
            key={`bold-${match.index}`} 
            style={{ 
              color: "#667eea",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            {match[1]}
          </strong>
        );
      } else if (match[3]) {

        parts.push(
          <code 
            key={`code-${match.index}`}
            style={{
              background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
              padding: "2px 4px",
              borderRadius: "4px",
              fontFamily: "monospace",
              fontSize: "0.9em",
              color: "#667eea"
            }}
          >
            {match[3]}
          </code>
        );
      } else if (match[0] === "\n") {
        parts.push(<br key={`br-${match.index}`} />);
      }

      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex)}
        </span>
      );
    }

    return parts;
  }, []);

  return (
    <>
      {/* Enhanced Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          position: "fixed",
          bottom: "clamp(15px, 4vw, 25px)",
          right: "clamp(15px, 4vw, 25px)",
          width: "clamp(56px, 12vw, 72px)",
          height: "clamp(56px, 12vw, 72px)",
          borderRadius: "50%",

          background: isOpen
            ? "linear-gradient(135deg, #667eea, #764ba2, #f093fb)"
            : "linear-gradient(135deg, #667eea, #764ba2)",
          border: "3px solid rgba(255, 255, 255, 0.2)",
          cursor: "pointer",
          boxShadow: "0 8px 32px rgba(102, 126, 234, 0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
          animation: !isOpen ? "float 3s ease-in-out infinite" : "none",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          touchAction: "manipulation",
          userSelect: "none",
          WebkitUserSelect: "none"
        }}
      >
        {isOpen ? (
          <div style={{ 
            width: 40, 
            height: 40, 
            borderRadius: "12px", 
            background: "rgba(255,255,255,0.2)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            color: "#fff", 
            fontSize: 20,
            fontWeight: "bold"
          }}>
            ✕
          </div>
        ) : (
          <div style={{ position: "relative" }}>
            <img 
              src={santaImg} 
              alt="Ultra-Intelligent AI Assistant" 
              style={{ 
                width: 52, 
                height: 52, 
                borderRadius: "50%", 
                animation: "bounce 2s infinite"
              }} 
            />
            <div style={{
              position: "absolute",
              top: -3,
              right: -3,
              width: 20,
              height: 20,
              background: "linear-gradient(135deg, #51cf66, #40c057)",
              borderRadius: "50%",
              border: "3px solid white",
              animation: "pulse 1.5s infinite"
            }}>
              <div style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: 6,
                height: 6,
                background: "white",
                borderRadius: "50%",
                animation: "blink 1s infinite"
              }} />
            </div>
            <div style={{
              position: "absolute",
              bottom: -3,
              left: -3,
              width: 16,
              height: 16,
              background: "linear-gradient(135deg, #ffd43b, #fab005)",
              borderRadius: "50%",
              border: "2px solid white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "8px",
              fontWeight: "bold",
              color: "#fff"
            }}>
              🧠
            </div>
          </div>
        )}
      </button>

      {/* Improved Responsive Chat Window */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Chat Assistant"
          aria-modal="false"
          style={{
            position: "fixed",
            bottom: "clamp(80px, 20vh, 120px)",
            right: "clamp(10px, 4vw, 25px)",
            left: isMobile ? "10px" : "auto",
            width: isMobile
              ? "calc(100vw - 20px)"
              : "clamp(320px, 90vw, 420px)",
            height: "clamp(400px, 70vh, 600px)",
            maxHeight: "85vh",
            background: "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "clamp(12px, 3vw, 20px)",
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
            display: "flex",
            flexDirection: "column",
            zIndex: 999,
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            animation: "slideUp 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
            overflow: "hidden",
            touchAction: "manipulation",
            userSelect: "none",
            WebkitUserSelect: "none"
          }}
        >
          {/* Modern Clean Header */}
          <div style={{
            padding: "16px 20px",
            borderBottom: "1px solid rgba(148, 163, 184, 0.1)",

            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.08), rgba(118, 75, 162, 0.08), rgba(240, 147, 251, 0.05))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>

              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "18px",
                boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)"
              }}>
                🤖
              </div>
              <div>

                <h3 style={{
                  margin: 0,
                  color: "#1e293b",
                  fontSize: "16px",
                  fontWeight: "600",
                  background: "linear-gradient(135deg, #667eea, #764ba2, #f093fb)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent"
                }}>
                  Grant Assistant
                </h3>
                <p style={{
                  margin: "4px 0 0 0",
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: "400"
                }}>
                  {isListening ? "🎤 Listening..." : "💡 Ready to help"}
                </p>
              </div>
            </div>


            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <button
                onClick={() => setAnalyticsMode(!analyticsMode)}
                title="Toggle Analytics Dashboard"
                style={{
                  background: analyticsMode 
                    ? "linear-gradient(135deg, #10b981, #059669)"
                    : "rgba(6, 182, 212, 0.1)",
                  border: `1px solid ${analyticsMode ? '#10b981' : '#06b6d4'}`,
                  color: analyticsMode ? "#fff" : "#06b6d4",
                  padding: "4px 8px",
                  borderRadius: "6px",
                  fontSize: "10px",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                aria-label="Toggle analytics dashboard"
              >
                📊 {analyticsMode ? "Hide" : "Show"} Analytics
              </button>

              {/* Network Status Indicator */}
              <div 
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "4px 6px",
                  background: networkStatus.isOnline 
                    ? (networkStatus.quality === 'excellent' 
                       ? "rgba(16, 185, 129, 0.1)" 
                       : networkStatus.quality === 'good'
                       ? "rgba(245, 158, 11, 0.1)"
                       : "rgba(239, 68, 68, 0.1)")
                    : "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${
                    networkStatus.isOnline 
                      ? (networkStatus.quality === 'excellent' 
                         ? '#10b981' 
                         : networkStatus.quality === 'good'
                         ? '#f59e0b'
                         : '#ef4444')
                      : '#ef4444'
                  }`,
                  borderRadius: "6px",
                  fontSize: "10px",
                  color: networkStatus.isOnline 
                    ? (networkStatus.quality === 'excellent' 
                       ? '#10b981' 
                       : networkStatus.quality === 'good'
                       ? '#f59e0b'
                       : '#ef4444')
                    : '#ef4444'
                }}
                title={`Network: ${networkStatus.connectionType} - ${networkStatus.quality}`}
              >
                <span style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: networkStatus.isOnline 
                    ? (networkStatus.quality === 'excellent' 
                       ? '#10b981' 
                       : networkStatus.quality === 'good'
                       ? '#f59e0b'
                       : '#ef4444')
                    : '#ef4444',
                  animation: networkStatus.isOnline && networkStatus.quality !== 'poor' ? "pulse 2s infinite" : "none"
                }} />
                <span>
                  {networkStatus.isOnline 
                    ? (networkStatus.quality === 'excellent' ? '🟢' : 
                       networkStatus.quality === 'good' ? '🟡' : '🔴')
                    : '📵'
                  }
                </span>
              </div>

              {/* Enhanced Status Display */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                color: "#64748b",
                fontSize: "10px"
              }}>
                {isListening ? "🎤 Listening..." : "💡 Ready to help"}
              </div>
            </div>

          </div>

          {/* Advanced Analytics Dashboard */}
          {analyticsMode && (
            <div style={{
              padding: "12px 16px",
              background: "linear-gradient(135deg, rgba(15, 23, 42, 0.95), rgba(30, 41, 59, 0.95))",
              borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
              animation: "slideDown 0.3s ease-out"
            }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
                gap: "12px",
                marginBottom: "12px"
              }}>
                
                {/* Performance Metrics */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  borderRadius: "8px",
                  padding: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>⚡ Performance</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#667eea" }}>
                    {performanceMetrics.averageResponseTime.toFixed(0)}ms
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                    Avg Response
                  </div>
                </div>

                {/* Cache Hit Rate */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(5, 150, 105, 0.1))",
                  border: "1px solid rgba(16, 185, 129, 0.3)",
                  borderRadius: "8px",
                  padding: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>💾 Cache</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#10b981" }}>
                    {performanceMetrics.cacheHitRate}
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                    Hit Rate
                  </div>
                </div>

                {/* User Engagement */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(217, 119, 6, 0.1))",
                  border: "1px solid rgba(245, 158, 11, 0.3)",
                  borderRadius: "8px",
                  padding: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>🎯 Engagement</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#f59e0b" }}>
                    {(performanceMetrics.userEngagement * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                    Active Level
                  </div>
                </div>

                {/* Success Rate */}
                <div style={{
                  background: "linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.1))",
                  border: "1px solid rgba(139, 92, 246, 0.3)",
                  borderRadius: "8px",
                  padding: "8px",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px" }}>✅ Success</div>
                  <div style={{ fontSize: "16px", fontWeight: "600", color: "#8b5cf6" }}>
                    {(performanceMetrics.sessionSuccessRate * 100).toFixed(0)}%
                  </div>
                  <div style={{ fontSize: "10px", color: "#94a3b8" }}>
                    Completion
                  </div>
                </div>

              </div>

              {/* Session Details */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "8px",
                fontSize: "10px"
              }}>
                <div style={{ color: "#64748b" }}>
                  📊 <strong>Messages:</strong> {analytics.totalMessages}
                </div>
                <div style={{ color: "#64748b" }}>
                  ⏱️ <strong>Duration:</strong> {Math.floor((Date.now() - analytics.sessionStart) / 1000 / 60)}m
                </div>
                <div style={{ color: "#64748b" }}>
                  ❌ <strong>Errors:</strong> {analytics.errorCount}
                </div>
                <div style={{ color: "#64748b" }}>
                  🔗 <strong>Network Issues:</strong> {analytics.networkIssues}
                </div>
              </div>

              {/* User Satisfaction Trend */}
              {userSatisfaction.feedbackCount > 0 && (
                <div style={{
                  marginTop: "8px",
                  padding: "6px 8px",
                  background: "linear-gradient(135deg, rgba(16, 185, 129, 0.05), rgba(5, 150, 105, 0.05))",
                  border: "1px solid rgba(16, 185, 129, 0.2)",
                  borderRadius: "6px"
                }}>
                  <div style={{ fontSize: "10px", color: "#64748b", marginBottom: "4px" }}>
                    😊 User Satisfaction: {userSatisfaction.currentScore}/5 
                    {userSatisfaction.trend === 'up' && ' ↗️'}
                    {userSatisfaction.trend === 'down' && ' ↘️'}
                    {userSatisfaction.trend === 'neutral' && ' ➡️'}
                  </div>
                  <div style={{
                    width: "100%",
                    height: "4px",
                    background: "rgba(16, 185, 129, 0.2)",
                    borderRadius: "2px",
                    overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${(userSatisfaction.currentScore / 5) * 100}%`,
                      height: "100%",
                      background: "linear-gradient(90deg, #10b981, #059669)",
                      transition: "width 0.3s ease"
                    }} />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Messages Container */}
          <div style={{ 
            flex: 1, 
            overflowY: "auto", 
            padding: "16px", 
            display: "flex", 
            flexDirection: "column", 
            gap: "12px"
          }}>
            {messages.map(msg => (
              <div 
                key={msg.id} 
                style={{ 
                  display: "flex", 
                  justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
                  animation: "slideIn 0.3s ease-out"
                }}
              >
                <div style={{
                  maxWidth: "85%",
                  padding: "14px 18px",
                  borderRadius: msg.sender === "user"
                    ? "20px 4px 20px 20px"
                    : "4px 20px 20px 20px",

                  background: msg.sender === "user"
                    ? "linear-gradient(135deg, #667eea, #764ba2)"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))",

                  color: msg.sender === "user" ? "#ffffff" : "#ffffff",
                  textShadow: "0 0 3px rgba(102, 126, 234, 0.3), 0 0 6px rgba(118, 75, 162, 0.2), 0 0 9px rgba(240, 147, 251, 0.1)",
                  animation: "softGlow 4s ease-in-out infinite",
                  fontSize: "14px",
                  lineHeight: "1.6",
                  wordWrap: "break-word",
                  boxShadow: msg.sender === "user"
                    ? "0 4px 12px rgba(99, 102, 241, 0.3)"
                    : "0 2px 8px rgba(0, 0, 0, 0.08)",
                  border: msg.sender === "user"
                    ? "none"
                    : "1px solid rgba(255, 255, 255, 0.2)"
                }}>
                  <div style={{ animation: "fadeIn 0.4s ease-in" }}>
                    {formatText(msg.text)}
                  </div>
                  

                  {msg.reasoning && (
                    <div style={{
                      marginTop: "6px",
                      padding: "4px 8px",
                      background: "linear-gradient(135deg, rgba(102, 126, 234, 0.1), rgba(118, 75, 162, 0.1))",
                      borderRadius: "6px",
                      fontSize: "10px",
                      color: "#667eea",
                      fontStyle: "italic"
                    }}>
                      💭 {msg.reasoning}
                    </div>
                  )}
                  
                  {msg.suggestions && msg.suggestions.length > 0 && (
                    <div style={{ 
                      marginTop: "8px", 
                      display: "flex", 
                      flexDirection: "column", 
                      gap: "6px"
                    }}>
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => handleSuggestion(s)}

                          style={{
                            padding: "6px 10px",
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15), rgba(118, 75, 162, 0.15))",
                            border: "1px solid rgba(102, 126, 234, 0.4)",
                            borderRadius: "6px",
                            color: "#667eea",
                            fontSize: "11px",
                            cursor: "pointer",
                            textAlign: "left",
                            transition: "all 0.2s ease"
                          }}
                        >
                          → {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {(isLoading || isTyping) && (
              <div style={{ display: "flex", justifyContent: "flex-start" }}>

                <div style={{
                  padding: "12px 16px",
                  borderRadius: "0 18px 18px 18px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#667eea"
                }}>
                  {isLoading ? (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <div style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(6, 182, 212, 0.3)",
                        borderTop: "2px solid #06b6d4",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite"
                      }} />
                      🧠 Ultra-intelligent AI processing...
                    </div>
                  ) : (
                    <div>
                      {currentTypingText}
                      <span style={{ animation: "blink 1s infinite" }}>|</span>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Enhanced Mobile-Friendly Input Section */}
          <div style={{ 
            padding: isMobile ? "8px" : "12px", 
            borderTop: "1px solid rgba(255, 255, 255, 0.1)", 
            display: "flex", 
            gap: isMobile ? "6px" : "8px",
            background: "rgba(15, 23, 42, 0.8)",
            paddingBottom: isMobile ? "12px" : "12px"
          }}>

            <div style={{ position: "relative", flex: 1 }}>
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder={generateDynamicPlaceholder()}
                aria-label="Chat input field"
                style={{
                  width: "100%",
                  padding: isMobile ? "12px 40px 12px 12px" : "10px 36px 10px 12px",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(6, 182, 212, 0.2)",
                  borderRadius: isMobile ? "12px" : "10px",
                  color: "#e5e7eb",
                  fontSize: isMobile ? "16px" : "13px",
                  outline: "none",
                  WebkitAppearance: "none",
                  appearance: "none",
                  touchAction: "manipulation"
                }}
              />
              
              <button
                onClick={toggleVoiceInput}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                style={{
                  position: "absolute",
                  right: isMobile ? "8px" : "6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: isListening 
                    ? "linear-gradient(135deg, #ff6b6b, #ee5a52)" 
                    : "rgba(6, 182, 212, 0.1)",
                  border: `1px solid ${isListening ? '#ff6b6b' : '#06b6d4'}`,
                  color: isListening ? "#fff" : "#06b6d4",
                  padding: isMobile ? "8px" : "4px",
                  borderRadius: "50%",
                  width: isMobile ? "32px" : "28px",
                  height: isMobile ? "32px" : "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  touchAction: "manipulation"
                }}
              >
                🎤
              </button>
            </div>
            
            <button
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              aria-label="Send message"

              style={{
                padding: isMobile ? "12px 16px" : "10px 16px",
                background: inputValue.trim() 
                  ? "linear-gradient(135deg, #667eea, #764ba2, #f093fb)" 
                  : "rgba(6, 182, 212, 0.2)",
                border: "none",
                borderRadius: isMobile ? "12px" : "10px",
                color: "#fff",
                cursor: inputValue.trim() ? "pointer" : "not-allowed",
                minWidth: isMobile ? "48px" : "40px",
                fontSize: isMobile ? "16px" : "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.2s ease",
                touchAction: "manipulation"
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced CSS Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes slideIn {
          from { transform: translateX(-20px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
        

        @keyframes softGlow {
          0%, 100% {
            text-shadow: 0 0 3px rgba(102, 126, 234, 0.3), 0 0 6px rgba(118, 75, 162, 0.2), 0 0 9px rgba(240, 147, 251, 0.1);
          }
          50% {
            text-shadow: 0 0 1px rgba(102, 126, 234, 0.2), 0 0 3px rgba(118, 75, 162, 0.15), 0 0 5px rgba(240, 147, 251, 0.08);
          }
        }

        @keyframes slideDown {
          from { 
            transform: translateY(-10px); 
            opacity: 0; 
          }
          to { 
            transform: translateY(0); 
            opacity: 1; 
          }
        }

        /* Mobile-specific styles */
        @media (max-width: 768px) {
          .chatbot-input {
            font-size: 16px !important; /* Prevents zoom on iOS */
          }
        }
      `}</style>
    </>
  );
}
