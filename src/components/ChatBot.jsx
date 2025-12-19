import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import santaIcon from '../assets/santa.svg';
import './ChatBot.css';

// Advanced AI System Components
class ConversationMemory {
  constructor() {
    this.history = [];
    this.maxHistorySize = 50;
    this.contextWindow = 10;
    this.sessionStart = new Date();
    this.userPreferences = this.loadUserPreferences();
    this.grantContext = this.initializeGrantContext();
  }

  addMessage(message, sentiment = 'neutral', entities = []) {
    const messageWithContext = {
      ...message,
      timestamp: new Date(),
      sentiment,
      entities,
      context: this.buildContext()
    };
    
    this.history.push(messageWithContext);
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
    
    // Update grant-specific context
    this.updateGrantContext(messageWithContext);
    this.saveToStorage();
  }

  buildContext() {
    const recentMessages = this.history.slice(-this.contextWindow);
    const context = {
      topics: this.extractTopics(recentMessages),
      entities: this.consolidateEntities(recentMessages),
      patterns: this.analyzePatterns(recentMessages),
      sessionLength: this.history.length,
      timeInSession: Date.now() - this.sessionStart.getTime(),
      grantInterests: this.grantContext.interests,
      userProfile: this.grantContext.profile
    };
    return context;
  }

  initializeGrantContext() {
    return {
      interests: new Set(),
      profile: {
        occupation: null,
        organizationType: null,
        projectScope: null,
        fundingAmount: null,
        timeline: null,
        targetDemographic: null,
        geographicLocation: null,
        grantHistory: [],
        successRate: 0.8
      },
      preferences: {
        preferredAmount: null,
        preferredTimeline: null,
        preferredSector: null,
        previousApplications: []
      }
    };
  }

  updateGrantContext(message) {
    // Extract and update grant-specific information
    if (message.entities) {
      message.entities.forEach(entity => {
        switch (entity.type) {
          case 'occupation':
            this.grantContext.profile.occupation = entity.value;
            this.grantContext.interests.add('professional');
            break;
          case 'organization_type':
            this.grantContext.profile.organizationType = entity.value;
            break;
          case 'funding_amount':
            this.grantContext.profile.fundingAmount = entity.value;
            this.grantContext.preferences.preferredAmount = entity.value;
            break;
          case 'timeline':
            this.grantContext.profile.timeline = entity.value;
            this.grantContext.preferences.preferredTimeline = entity.value;
            break;
          case 'geographic':
            this.grantContext.profile.geographicLocation = entity.value;
            break;
        }
      });
    }
  }

  extractTopics(messages) {
    const topics = new Map();
    messages.forEach(msg => {
      if (msg.entities) {
        msg.entities.forEach(entity => {
          const topic = entity.type;
          topics.set(topic, (topics.get(topic) || 0) + 1);
        });
      }
    });
    return Array.from(topics.entries()).sort((a, b) => b[1] - a[1]);
  }

  consolidateEntities(messages) {
    const entities = new Map();
    messages.forEach(msg => {
      if (msg.entities) {
        msg.entities.forEach(entity => {
          const key = `${entity.type}:${entity.value}`;
          if (!entities.has(key)) {
            entities.set(key, { ...entity, frequency: 0 });
          }
          entities.get(key).frequency++;
        });
      }
    });
    return Array.from(entities.values());
  }

  analyzePatterns(messages) {
    const patterns = {
      questionFrequency: messages.filter(m => m.text.includes('?')).length,
      navigationCount: messages.filter(m => m.sender === 'user' && 
        /navigate|go to|take me|show me/i.test(m.text)).length,
      helpSeeking: messages.filter(m => m.text.includes('help')).length,
      positiveSentiment: messages.filter(m => m.sentiment === 'positive').length,
      negativeSentiment: messages.filter(m => m.sentiment === 'negative').length,
      grantQueries: messages.filter(m => 
        /grant|funding|application|deadline|amount|eligibility/i.test(m.text)).length
    };
    return patterns;
  }

  getRelevantContext(query) {
    const relevant = this.history
      .filter(msg => this.isRelevant(msg, query))
      .slice(-5);
    return relevant;
  }

  isRelevant(message, query) {
    const queryWords = query.toLowerCase().split(/\s+/);
    const messageText = message.text.toLowerCase();
    return queryWords.some(word => messageText.includes(word)) ||
           message.entities?.some(entity => 
             queryWords.includes(entity.value.toLowerCase()));
  }

  loadUserPreferences() {
    try {
      return JSON.parse(localStorage.getItem('chatbot_preferences')) || {
        communicationStyle: 'friendly',
        preferredTopics: [],
        interactionFrequency: 0,
        lastSession: null,
        personalityTraits: {
          formality: 0.5,
          enthusiasm: 0.7,
          helpfulness: 0.9
        }
      };
    } catch {
      return {
        communicationStyle: 'friendly',
        preferredTopics: [],
        interactionFrequency: 0,
        lastSession: null,
        personalityTraits: {
          formality: 0.5,
          enthusiasm: 0.7,
          helpfulness: 0.9
        }
      };
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem('chatbot_conversation', JSON.stringify({
        history: this.history,
        preferences: this.userPreferences,
        sessionStart: this.sessionStart,
        grantContext: this.grantContext
      }));
    } catch (error) {
      console.warn('Failed to save conversation to storage:', error);
    }
  }

  getGrantRecommendations() {
    const profile = this.grantContext.profile;
    const recommendations = [];
    
    // Generate recommendations based on user profile
    if (profile.occupation) {
      recommendations.push({
        category: 'professional_development',
        description: `Grants specifically for ${profile.occupation}s`,
        relevance: 0.9
      });
    }
    
    if (profile.organizationType) {
      recommendations.push({
        category: 'organization_specific',
        description: `Funding opportunities for ${profile.organizationType}`,
        relevance: 0.85
      });
    }
    
    if (profile.fundingAmount) {
      const amount = parseInt(profile.fundingAmount.replace(/[^\d]/g, ''));
      if (amount < 50000) {
        recommendations.push({
          category: 'seed_funding',
          description: 'Small grants and seed funding opportunities',
          relevance: 0.8
        });
      } else if (amount > 500000) {
        recommendations.push({
          category: 'major_funding',
          description: 'Large-scale funding and major grants',
          relevance: 0.8
        });
      }
    }
    
    return recommendations;
  }
}

class EntityExtractor {
  constructor() {
    this.patterns = {
      dates: /\b(?:today|yesterday|tomorrow|next\s+\w+|this\s+\w+|last\s+\w+|\d{1,2}\/\d{1,2}\/\d{2,4}|\w+\s+\d{1,2},?\s+\d{4})\b/gi,
      amounts: /\$?\d{1,3}(?:,\d{3})*(?:\.\d{2})?|\d+(?:\.\d+)?\s*(?:thousand|million|billion|k|m|b)\b/gi,
      emails: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      phones: /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      urls: /https?:\/\/[^\s]+/g,
      names: /\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g,
      organizations: /\b(?:Inc|LLC|Corp|Corporation|Company|Co\.|University|College|Institute|Foundation|Ministry|Department|Agency|Bank|Trust|Limited|Ltd)\b/gi,
      amounts_text: /\b(\d+(?:\.\d+)?)\s*(?:dollars?|usd|thousand|k|million|m|billion|b)\b/gi,
      percentages: /\d+(?:\.\d+)?%/g,
      
      // Grant-specific patterns
      occupations: /\b(?:teacher|professor|researcher|scientist|engineer|doctor|nurse|artist|musician|writer|entrepreneur|student|nonprofit|small business|startup|community organization|federal agency|state government|local government|municipality)\b/gi,
      organization_types: /\b(?:nonprofit|501\(c\)|foundation|university|college|school district|hospital|clinic|research institute|small business|corporation|government agency|municipality|community organization|faith-based organization)\b/gi,
      grant_types: /\b(?:research grant|seed funding|development grant|capacity building|infrastructure|equipment|travel|conference|training|workshop|seminar|scholarship|fellowship|contract|cooperative agreement|subgrant|pass-through)\b/gi,
      funding_amounts: /\b(?:up to\s+\$?\d+(?:,\d{3})*(?:\.\d{2})?|\$?\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:to|-\s*)\$?\d+(?:,\d{3})*(?:\.\d{2})?|minimum\s+\$?\d+(?:,\d{3})*(?:\.\d{2})?)\b/gi,
      deadlines: /\b(?:due\s+by|deadline|applications\s+close|submit\s+by|no\s+later\s+than)\s+([^.]+?)(?:\.|$)/gi,
      geographic: /\b(?:national|federal|state|local|regional|international|global|county|city|district)\b/gi,
      eligibility: /\b(?:eligible|qualify|requirements|criteria|must\s+be| applicants\s+must)\b/gi
    };
  }

  extract(text) {
    const entities = [];
    const processed = new Set();

    Object.entries(this.patterns).forEach(([type, pattern]) => {
      const matches = text.match(pattern) || [];
      matches.forEach(match => {
        const normalized = this.normalizeEntity(match, type);
        if (!processed.has(normalized.value.toLowerCase())) {
          entities.push({
            type,
            value: normalized.value,
            confidence: normalized.confidence,
            startIndex: text.indexOf(match),
            endIndex: text.indexOf(match) + match.length
          });
          processed.add(normalized.value.toLowerCase());
        }
      });
    });

    return entities.sort((a, b) => b.confidence - a.confidence);
  }

  normalizeEntity(value, type) {
    const normalized = { value: value.trim(), confidence: 0.9 };

    switch (type) {
      case 'amounts_text':
        const number = value.match(/\d+(?:\.\d+)?/);
        if (number) {
          const multiplier = value.includes('million') ? 1000000 : 
                           value.includes('billion') ? 1000000000 :
                           value.includes('thousand') || value.includes('k') ? 1000 : 1;
          normalized.value = (parseFloat(number[0]) * multiplier).toString();
          normalized.confidence = 0.85;
        }
        break;
      case 'dates':
        if (value.includes('today')) {
          normalized.value = new Date().toISOString().split('T')[0];
          normalized.confidence = 0.95;
        } else if (value.includes('yesterday')) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          normalized.value = yesterday.toISOString().split('T')[0];
          normalized.confidence = 0.95;
        } else if (value.includes('tomorrow')) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          normalized.value = tomorrow.toISOString().split('T')[0];
          normalized.confidence = 0.95;
        }
        break;
      case 'amounts':
        normalized.value = value.replace(/[,$\s]/g, '');
        normalized.confidence = 0.9;
        break;
    }

    return normalized;
  }
}

class SentimentAnalyzer {
  constructor() {
    this.positiveWords = [
      'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
      'helpful', 'thanks', 'thank you', 'perfect', 'love', 'like',
      'good', 'nice', 'cool', 'brilliant', 'outstanding', 'superb',
      'excited', 'interested', 'eager', 'enthusiastic'
    ];
    
    this.negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'hate', 'dislike',
      'problem', 'issue', 'error', 'wrong', 'broken', 'frustrated',
      'annoying', 'disappointed', 'upset', 'angry', 'mad',
      'confused', 'lost', 'stuck', 'difficult', 'hard'
    ];
    
    this.intensifiers = ['very', 'extremely', 'really', 'totally', 'absolutely', 'completely'];
    this.negations = ['not', 'no', 'never', 'nothing', 'nobody', 'nowhere'];
    
    // Grant-specific sentiment indicators
    this.urgencyWords = ['urgent', 'asap', 'quickly', 'soon', 'desperate', 'need'];
    this.hopefulWords = ['hope', 'optimistic', 'bright', 'promising', 'potential'];
  }

  analyze(text) {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    let confidence = 0.5;
    
    // Check for intensifiers and negations
    let intensifier = 1;
    let negation = 1;
    
    words.forEach((word, index) => {
      if (this.intensifiers.includes(word)) {
        intensifier = 1.5;
      }
      if (this.negations.includes(word)) {
        negation = -1;
      }
      
      if (this.positiveWords.includes(word)) {
        score += intensifier * negation;
        confidence += 0.1;
      }
      if (this.negativeWords.includes(word)) {
        score -= intensifier * negation;
        confidence += 0.1;
      }
    });
    
    // Normalize score
    score = Math.max(-1, Math.min(1, score / words.length * 5));
    confidence = Math.min(1, confidence);
    
    let sentiment = 'neutral';
    if (score > 0.2) sentiment = 'positive';
    else if (score < -0.2) sentiment = 'negative';
    
    return {
      sentiment,
      score,
      confidence: Math.min(1, confidence),
      emotions: this.extractEmotions(text),
      intensity: Math.abs(score),
      urgency: this.detectUrgency(text),
      hopefulness: this.detectHopefulness(text)
    };
  }
  
  extractEmotions(text) {
    const emotions = {
      joy: 0,
      anger: 0,
      fear: 0,
      sadness: 0,
      surprise: 0
    };
    
    const emotionWords = {
      joy: ['happy', 'excited', 'glad', 'pleased', 'delighted', 'cheerful'],
      anger: ['angry', 'mad', 'frustrated', 'annoyed', 'irritated', 'furious'],
      fear: ['worried', 'anxious', 'concerned', 'nervous', 'scared', 'afraid'],
      sadness: ['sad', 'disappointed', 'upset', 'depressed', 'unhappy', 'miserable'],
      surprise: ['surprised', 'shocked', 'amazed', 'astonished', 'stunned', 'incredible']
    };
    
    const words = text.toLowerCase().split(/\s+/);
    words.forEach(word => {
      Object.entries(emotionWords).forEach(([emotion, emotionWordList]) => {
        if (emotionWordList.includes(word)) {
          emotions[emotion] += 1;
        }
      });
    });
    
    return emotions;
  }

  detectUrgency(text) {
    const words = text.toLowerCase();
    return this.urgencyWords.some(word => words.includes(word)) ? 0.8 : 0.2;
  }

  detectHopefulness(text) {
    const words = text.toLowerCase();
    return this.hopefulWords.some(word => words.includes(word)) ? 0.7 : 0.3;
  }
}

class UserBehaviorTracker {
  constructor() {
    this.behaviorData = {
      navigationPatterns: new Map(),
      interactionHistory: [],
      preferences: new Map(),
      sessionMetrics: {
        startTime: Date.now(),
        messageCount: 0,
        navigationCount: 0,
        helpRequests: 0,
        positiveInteractions: 0,
        negativeInteractions: 0,
        grantQueries: 0,
        successfulRecommendations: 0
      }
    };
  }

  trackInteraction(type, data = {}) {
    const interaction = {
      type,
      data,
      timestamp: Date.now(),
      context: this.getCurrentContext()
    };
    
    this.behaviorData.interactionHistory.push(interaction);
    this.updateMetrics(type);
    this.analyzePatterns();
  }

  updateMetrics(type) {
    this.behaviorData.sessionMetrics.messageCount++;
    
    switch (type) {
      case 'navigation':
        this.behaviorData.sessionMetrics.navigationCount++;
        break;
      case 'help_request':
        this.behaviorData.sessionMetrics.helpRequests++;
        break;
      case 'positive_feedback':
        this.behaviorData.sessionMetrics.positiveInteractions++;
        break;
      case 'negative_feedback':
        this.behaviorData.sessionMetrics.negativeInteractions++;
        break;
      case 'grant_query':
        this.behaviorData.sessionMetrics.grantQueries++;
        break;
      case 'successful_recommendation':
        this.behaviorData.sessionMetrics.successfulRecommendations++;
        break;
    }
  }

  analyzePatterns() {
    const recent = this.behaviorData.interactionHistory.slice(-20);
    
    // Analyze navigation preferences
    const navPatterns = recent.filter(i => i.type === 'navigation');
    navPatterns.forEach(nav => {
      const target = nav.data.target;
      this.behaviorData.navigationPatterns.set(
        target, 
        (this.behaviorData.navigationPatterns.get(target) || 0) + 1
      );
    });
    
    // Analyze interaction patterns
    const patterns = {
      frequentNavigation: this.getMostVisitedSections(),
      interactionStyle: this.analyzeInteractionStyle(recent),
      learningProgress: this.assessLearningProgress(),
      engagement: this.calculateEngagementScore(),
      grantInterest: this.assessGrantInterest()
    };
    
    return patterns;
  }

  assessGrantInterest() {
    const metrics = this.behaviorData.sessionMetrics;
    const totalQueries = metrics.messageCount;
    
    if (totalQueries === 0) return { level: 'low', score: 0 };
    
    const grantRatio = metrics.grantQueries / totalQueries;
    const successfulRatio = metrics.successfulRecommendations / Math.max(1, metrics.grantQueries);
    
    let level = 'low';
    if (grantRatio > 0.7 && successfulRatio > 0.6) level = 'high';
    else if (grantRatio > 0.4) level = 'medium';
    
    return {
      level,
      score: grantRatio,
      successRate: successfulRatio
    };
  }

  getMostVisitedSections() {
    return Array.from(this.behaviorData.navigationPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([section, count]) => ({ section, count }));
  }

  analyzeInteractionStyle(interactions) {
    const helpRequests = interactions.filter(i => i.type === 'help_request').length;
    const navigationRequests = interactions.filter(i => i.type === 'navigation').length;
    const grantQueries = interactions.filter(i => i.type === 'grant_query').length;
    const feedbackCount = interactions.filter(i => 
      i.type.includes('feedback')).length;
    
    return {
      helpSeeking: helpRequests > 2,
      navigationFocused: navigationRequests > helpRequests,
      grantFocused: grantQueries > helpRequests,
      feedbackActive: feedbackCount > 0,
      overallStyle: grantQueries > navigationRequests ? 'grant_seeker' : 
                   helpRequests > navigationRequests ? 'seeker' : 'navigator'
    };
  }

  assessLearningProgress() {
    const metrics = this.behaviorData.sessionMetrics;
    const sessionLength = Date.now() - metrics.startTime;
    const minutesActive = sessionLength / (1000 * 60);
    
    return {
      activityLevel: metrics.messageCount / Math.max(1, minutesActive),
      helpDependency: metrics.helpRequests / Math.max(1, metrics.messageCount),
      navigationEfficiency: metrics.navigationCount / Math.max(1, metrics.messageCount),
      grantEngagement: metrics.grantQueries / Math.max(1, metrics.messageCount)
    };
  }

  calculateEngagementScore() {
    const metrics = this.behaviorData.sessionMetrics;
    const totalInteractions = metrics.messageCount;
    
    if (totalInteractions === 0) return 0;
    
    const positiveRatio = metrics.positiveInteractions / totalInteractions;
    const helpRatio = metrics.helpRequests / totalInteractions;
    const navigationRatio = metrics.navigationCount / totalInteractions;
    const grantRatio = metrics.grantQueries / totalInteractions;
    
    // Higher engagement for positive interactions, grant interest, and moderate help-seeking
    return Math.min(1, (positiveRatio * 0.3 + (1 - Math.abs(helpRatio - 0.3)) * 0.2 + 
                        navigationRatio * 0.2 + grantRatio * 0.3));
  }

  getCurrentContext() {
    return {
      sessionDuration: Date.now() - this.behaviorData.sessionMetrics.startTime,
      currentHour: new Date().getHours(),
      dayOfWeek: new Date().getDay(),
      deviceType: this.detectDeviceType(),
      browserInfo: this.getBrowserInfo()
    };
  }

  detectDeviceType() {
    return /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop';
  }

  getBrowserInfo() {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  getInsights() {
    return {
      patterns: this.analyzePatterns(),
      recommendations: this.generateRecommendations(),
      userType: this.classifyUserType(),
      nextBestActions: this.predictNextActions()
    };
  }

  classifyUserType() {
    const patterns = this.analyzePatterns();
    const grantInterest = patterns.grantInterest;
    
    if (grantInterest.level === 'high') return 'grant_expert';
    if (patterns.learningProgress.helpDependency > 0.6) return 'beginner';
    if (patterns.learningProgress.navigationEfficiency > 0.6) return 'efficient';
    if (patterns.learningProgress.activityLevel > 2) return 'power_user';
    return 'moderate_user';
  }

  generateRecommendations() {
    const patterns = this.analyzePatterns();
    const recommendations = [];
    
    if (patterns.grantInterest.level === 'high') {
      recommendations.push('User shows strong grant interest - provide detailed funding opportunities');
    }
    
    if (patterns.learningProgress.helpDependency > 0.6) {
      recommendations.push('Consider providing more proactive grant guidance');
    }
    
    if (patterns.learningProgress.navigationEfficiency < 0.3) {
      recommendations.push('User might benefit from more navigation guidance');
    }
    
    const mostVisited = patterns.frequentNavigation[0];
    if (mostVisited) {
      recommendations.push(`User frequently visits ${mostVisited.section} - consider highlighting related grant opportunities`);
    }
    
    return recommendations;
  }

  predictNextActions() {
    const patterns = this.analyzePatterns();
    const recent = this.behaviorData.interactionHistory.slice(-5);
    
    const predictions = [];
    
    // Based on recent grant queries
    const lastGrantQuery = recent.find(i => i.type === 'grant_query');
    if (lastGrantQuery) {
      predictions.push({
        action: 'related_grants',
        target: this.predictRelatedGrants(lastGrantQuery.data),
        confidence: 0.8
      });
    }
    
    // Based on help-seeking patterns
    const helpRequests = recent.filter(i => i.type === 'help_request').length;
    if (helpRequests > 2) {
      predictions.push({
        action: 'proactive_help',
        target: 'grant_guidance',
        confidence: 0.7
      });
    }
    
    return predictions;
  }

  predictRelatedGrants(queryData) {
    // Simple prediction logic based on query content
    const text = queryData.text || '';
    
    if (text.includes('education') || text.includes('teacher')) {
      return 'educational_grants';
    } else if (text.includes('research') || text.includes('science')) {
      return 'research_grants';
    } else if (text.includes('small business')) {
      return 'business_grants';
    }
    
    return 'general_grants';
  }
}

class PersonalizationEngine {
  constructor(memory, behaviorTracker) {
    this.memory = memory;
    this.behaviorTracker = behaviorTracker;
    this.userProfile = this.loadUserProfile();
  }

  loadUserProfile() {
    try {
      return JSON.parse(localStorage.getItem('chatbot_user_profile')) || {
        communicationStyle: 'friendly',
        personalityTraits: {
          formality: 0.5,
          enthusiasm: 0.7,
          technicalLevel: 0.5,
          patience: 0.8,
          grantExpertise: 0.5
        },
        preferences: {
          preferredResponseLength: 'medium',
          detailLevel: 'moderate',
          interactionStyle: 'collaborative',
          grantTypes: [],
          fundingRanges: []
        },
        learningHistory: [],
        satisfactionMetrics: {
          overall: 0.8,
          responseRelevance: 0.8,
          helpfulness: 0.8,
          grantRelevance: 0.8
        }
      };
    } catch {
      return {
        communicationStyle: 'friendly',
        personalityTraits: {
          formality: 0.5,
          enthusiasm: 0.7,
          technicalLevel: 0.5,
          patience: 0.8,
          grantExpertise: 0.5
        },
        preferences: {
          preferredResponseLength: 'medium',
          detailLevel: 'moderate',
          interactionStyle: 'collaborative',
          grantTypes: [],
          fundingRanges: []
        },
        learningHistory: [],
        satisfactionMetrics: {
          overall: 0.8,
          responseRelevance: 0.8,
          helpfulness: 0.8,
          grantRelevance: 0.8
        }
      };
    }
  }

  personalizeResponse(baseResponse, context) {
    const profile = this.userProfile;
    let personalizedResponse = { ...baseResponse };
    
    // Adjust tone based on personality traits
    personalizedResponse = this.adjustTone(personalizedResponse, profile.personalityTraits);
    
    // Adjust length based on preferences
    personalizedResponse = this.adjustLength(personalizedResponse, profile.preferences.preferredResponseLength);
    
    // Add personalized elements
    personalizedResponse = this.addPersonalizedElements(personalizedResponse, context);
    
    // Adapt communication style
    personalizedResponse = this.adaptCommunicationStyle(personalizedResponse, profile.communicationStyle);
    
    return personalizedResponse;
  }

  adjustTone(response, traits) {
    const { formality, enthusiasm, technicalLevel, grantExpertise } = traits;
    
    // Adjust formality
    if (formality > 0.7) {
      response.text = response.text.replace(/hey|hi there|hello/gi, 'greetings');
    } else if (formality < 0.3) {
      response.text = response.text.replace(/greetings|hello/gi, 'hey');
    }
    
    // Adjust enthusiasm
    if (enthusiasm > 0.8) {
      response.text = response.text.replace(/\.$/, '! 🎉');
    }
    
    // Adjust technical level
    if (technicalLevel < 0.4) {
      response.text = response.text.replace(/\bimplement|deploy|configure|optimize\b/gi, 'set up');
    }
    
    // Adjust for grant expertise
    if (grantExpertise < 0.5) {
      response.text = response.text.replace(/\bRFA|RFP|solicitation|subaward\b/gi, 'grant announcement');
    }
    
    return response;
  }

  adjustLength(response, preferredLength) {
    const currentLength = response.text.length;
    
    switch (preferredLength) {
      case 'short':
        if (currentLength > 200) {
          response.text = response.text.split('\n')[0] + '\n\nWould you like more details about these grants?';
        }
        break;
      case 'long':
        if (currentLength < 300) {
          response.text += '\n\nWould you like me to elaborate on any of these funding opportunities?';
        }
        break;
    }
    
    return response;
  }

  addPersonalizedElements(response, context) {
    const insights = this.behaviorTracker.getInsights();
    const userType = insights.userType;
    
    // Add contextual suggestions based on user type
    if (userType === 'beginner') {
      response.suggestions = response.suggestions || [];
      response.suggestions.unshift('Need help understanding grant eligibility? Just ask!');
    }
    
    if (userType === 'grant_expert') {
      response.advanced = response.advanced || [];
      response.advanced.push('Interested in advanced grant strategies or partnership opportunities?');
    }
    
    // Reference conversation history if relevant
    const relevantContext = this.memory.getRelevantContext(response.originalQuery || '');
    if (relevantContext.length > 0 && Math.random() < 0.3) {
      response.text = `Based on our previous conversation about grants: ${response.text}`;
    }
    
    return response;
  }

  adaptCommunicationStyle(response, style) {
    switch (style) {
      case 'formal':
        response.text = response.text.replace(/!\?/g, '?').replace(/🎉/g, '');
        break;
      case 'casual':
        response.text = response.text.replace(/\bI can\b/g, 'I\'ll').replace(/\bwould you like\b/g, 'want to');
        break;
      case 'enthusiastic':
        response.text += ' 😊';
        break;
    }
    
    return response;
  }

  updateProfile(interactionData) {
    // Update satisfaction metrics
    if (interactionData.feedback) {
      this.userProfile.satisfactionMetrics.overall = 
        (this.userProfile.satisfactionMetrics.overall + interactionData.feedback.rating) / 2;
      
      if (interactionData.grantRelated) {
        this.userProfile.satisfactionMetrics.grantRelevance =
          (this.userProfile.satisfactionMetrics.grantRelevance + interactionData.feedback.rating) / 2;
      }
    }
    
    // Update personality traits based on behavior
    if (interactionData.responseTime) {
      const patience = interactionData.responseTime > 5000 ? 0.9 : 0.7;
      this.userProfile.personalityTraits.patience = patience;
    }
    
    // Learn from successful interactions
    if (interactionData.successful) {
      this.userProfile.learningHistory.push({
        timestamp: Date.now(),
        interaction: interactionData.type,
        success: true,
        grantRelated: interactionData.grantRelated || false
      });
      
      // Keep only recent history
      if (this.userProfile.learningHistory.length > 100) {
        this.userProfile.learningHistory.shift();
      }
    }
    
    this.saveProfile();
  }

  saveProfile() {
    try {
      localStorage.setItem('chatbot_user_profile', JSON.stringify(this.userProfile));
    } catch (error) {
      console.warn('Failed to save user profile:', error);
    }
  }
}

class ProactiveSuggestionEngine {
  constructor(memory, behaviorTracker) {
    this.suggestionRules = this.initializeSuggestionRules();
    this.cooldowns = new Map();
  }

  initializeSuggestionRules() {
    return {
      grant_exploration: {
        trigger: (context) => context.sessionLength > 3 && context.grantInterests.size === 0,
        suggestion: (context) => ({
          type: 'grant_exploration',
          text: 'I notice you\'re exploring grants. Would you like me to help you discover funding opportunities tailored to your situation?',
          actions: ['explore_grants', 'maybe_later']
        })
      },
      deadline_alert: {
        trigger: (context) => context.timeInSession > 300000 && context.topics.some(t => t[0].includes('deadline')),
        suggestion: (context) => ({
          type: 'deadline_reminder',
          text: 'I see you\'re interested in grants with upcoming deadlines. Should I set up deadline reminders for you?',
          actions: ['setup_reminders', 'not_needed']
        })
      },
      similar_opportunities: {
        trigger: (context) => context.sessionLength > 5 && context.topics.length > 2,
        suggestion: (context) => ({
          type: 'similar_opportunities',
          text: 'Based on your interests, you might also find these related funding opportunities interesting:',
          actions: ['show_more', 'not_now']
        })
      },
      application_help: {
        trigger: (context) => context.helpSeeking > 2 && context.timeInSession > 60000,
        suggestion: (context) => ({
          type: 'application_assistance',
          text: 'I notice you\'ve been asking about grants. Need help with the application process or understanding requirements?',
          actions: ['application_help', 'continue_alone']
        })
      }
    };
  }

  generateSuggestions(context) {
    const suggestions = [];
    
    Object.entries(this.suggestionRules).forEach(([type, rule]) => {
      if (rule.trigger(context) && !this.isOnCooldown(type)) {
        const suggestion = rule.suggestion(context);
        suggestions.push({
          ...suggestion,
          id: `suggestion_${type}_${Date.now()}`,
          generatedAt: Date.now(),
          priority: this.calculatePriority(type, context)
        });
        
        this.setCooldown(type);
      }
    });
    
    return suggestions.sort((a, b) => b.priority - a.priority).slice(0, 3);
  }

  calculatePriority(type, context) {
    const basePriorities = {
      grant_exploration: 0.9,
      deadline_alert: 0.95,
      similar_opportunities: 0.7,
      application_help: 0.85
    };
    
    let priority = basePriorities[type] || 0.5;
    
    // Adjust based on session metrics
    if (context.timeInSession > 300000) priority += 0.1; // 5+ minutes
    if (context.helpSeeking > 3) priority += 0.1;
    if (context.grantInterests.size > 0) priority += 0.2;
    
    return Math.min(1, priority);
  }

  isOnCooldown(type) {
    const cooldown = this.cooldowns.get(type);
    if (!cooldown) return false;
    
    const now = Date.now();
    const cooldownDuration = 120000; // 2 minutes for grant-specific suggestions
    
    return now - cooldown < cooldownDuration;
  }

  setCooldown(type) {
    this.cooldowns.set(type, Date.now());
  }

  handleSuggestionResponse(suggestionId, action) {
    const [type] = suggestionId.split('_').slice(1);
    
    // Learn from user response
    if (action === 'accepted') {
      this.recordSuccessfulSuggestion(type);
    } else if (action === 'dismissed') {
      this.recordDismissedSuggestion(type);
    }
  }

  recordSuccessfulSuggestion(type) {
    console.log(`Successful grant suggestion: ${type}`);
  }

  recordDismissedSuggestion(type) {
    console.log(`Dismissed grant suggestion: ${type}`);
  }
}

class KnowledgeBaseIntegration {
  constructor() {
    this.knowledgeIndex = this.buildKnowledgeIndex();
    this.searchCache = new Map();
  }

  buildKnowledgeIndex() {
    return {
      grants: {
        keywords: ['grant', 'funding', 'money', 'application', 'submit', 'deadline', 'eligibility', 'award', 'amount', 'criteria'],
        content: {
          application: 'To apply for grants, visit the Creator Portal, create an account, browse available grants, and complete the application form with required documentation.',
          deadlines: 'Grant deadlines vary by program. Check individual grant listings for specific dates and requirements.',
          eligibility: 'Eligibility criteria differ for each grant. Review the specific requirements for each opportunity.',
          amount: 'Grant amounts range from small seed funding to multi-million dollar programs. Amounts depend on the type and scope of the project.',
          types: 'Common grant types include research grants, seed funding, capacity building, equipment grants, travel grants, and fellowship programs.',
          process: 'The typical grant process involves: identifying opportunities, reviewing eligibility, preparing application, submitting before deadline, and potentially interviewing.'
        }
      },
      educational_grants: {
        keywords: ['teacher', 'education', 'school', 'classroom', 'student', 'curriculum', 'educational', 'pedagogy'],
        content: {
          professional_development: 'Professional development grants help teachers attend conferences, workshops, and training programs to enhance their skills.',
          classroom_supplies: 'Classroom supply grants provide funding for educational materials, technology, and resources for teachers and schools.',
          technology_integration: 'Technology grants support the integration of digital tools and platforms in educational settings.',
          research_grants: 'Educational research grants fund studies on teaching methods, student outcomes, and educational innovations.',
          student_programs: 'Student-focused grants support educational programs, scholarships, and academic initiatives.'
        }
      },
      research_grants: {
        keywords: ['research', 'science', 'laboratory', 'experiment', 'study', 'academic', 'university', 'scientific'],
        content: {
          federal_research: 'Federal research agencies like NSF, NIH, and DOE provide substantial funding for scientific research across disciplines.',
          private_foundation: 'Private foundations such as Gates, Ford, and Rockefeller support innovative research projects with societal impact.',
          international: 'International research collaborations often have access to additional funding sources and global partnerships.',
          equipment: 'Equipment grants specifically fund the purchase of research instruments, computers, and laboratory equipment.',
          travel: 'Travel grants support researchers attending conferences, presenting findings, and building international collaborations.'
        }
      },
      business_grants: {
        keywords: ['business', 'startup', 'entrepreneur', 'small business', 'innovation', 'commercialization', 'economic'],
        content: {
          sbir: 'Small Business Innovation Research (SBIR) grants provide up to $1.5M for R&D with no matching funds required.',
          economic_development: 'Economic development grants support business growth, job creation, and community economic impact.',
          technology_transfer: 'Technology transfer grants help move innovations from research to commercial applications.',
          export_programs: 'Export grants support international business expansion and global market entry.',
          workforce: 'Workforce development grants fund employee training and skills enhancement programs.'
        }
      },
      nonprofit_grants: {
        keywords: ['nonprofit', 'charity', 'community', 'social', 'foundation', 'ngo', 'organization'],
        content: {
          capacity_building: 'Capacity building grants help nonprofits strengthen their infrastructure, systems, and organizational capabilities.',
          program_grants: 'Program-specific grants fund particular initiatives or services offered by nonprofit organizations.',
          community_development: 'Community development grants support local initiatives that improve community conditions and quality of life.',
          social_services: 'Social services grants fund programs addressing poverty, health, education, and social justice issues.',
          infrastructure: 'Infrastructure grants help nonprofits acquire or improve facilities, technology, and operational systems.'
        }
      },
      technical: {
        keywords: ['error', 'problem', 'issue', 'not working', 'broken', 'technical', 'login', 'upload'],
        content: {
          login: 'Login issues can often be resolved by checking credentials, clearing browser cache, or using password reset.',
          upload: 'Document uploads require PDF, DOC, or DOCX files under 10MB. Ensure stable internet connection.',
          browser: 'Use modern browsers like Chrome, Firefox, Safari, or Edge. Enable JavaScript and cookies.',
          performance: 'Clear browser cache, close unused tabs, and ensure stable internet connection for optimal performance.'
        }
      },
      policies: {
        keywords: ['policy', 'privacy', 'terms', 'security', 'data', 'compliance', 'requirements'],
        content: {
          privacy: 'We protect your personal information and never share it with third parties without consent.',
          security: 'All data is encrypted and stored securely. We follow industry best practices for data protection.',
          terms: 'By using GrantTracker, you agree to our terms of service and acceptable use policy.',
          compliance: 'Grant applications must comply with all applicable federal, state, and local regulations and requirements.'
        }
      }
    };
  }

  search(query, intent) {
    const cacheKey = `${query}_${intent}`;
    
    if (this.searchCache.has(cacheKey)) {
      return this.searchCache.get(cacheKey);
    }
    
    const queryWords = query.toLowerCase().split(/\s+/);
    const results = [];
    
    Object.entries(this.knowledgeIndex).forEach(([category, data]) => {
      const relevanceScore = this.calculateRelevance(queryWords, data.keywords);
      
      if (relevanceScore > 0.1) {
        Object.entries(data.content).forEach(([topic, content]) => {
          const topicRelevance = this.calculateRelevance(queryWords, [topic]);
          const combinedScore = (relevanceScore + topicRelevance) / 2;
          
          if (combinedScore > 0.2) {
            results.push({
              category,
              topic,
              content,
              relevance: combinedScore,
              source: 'knowledge_base'
            });
          }
        });
      }
    });
    
    const sortedResults = results.sort((a, b) => b.relevance - a.relevance).slice(0, 3);
    
    this.searchCache.set(cacheKey, sortedResults);
    return sortedResults;
  }

  calculateRelevance(queryWords, keywords) {
    const keywordMatches = keywords.filter(keyword => 
      queryWords.some(word => keyword.toLowerCase().includes(word) || word.includes(keyword.toLowerCase()))
    );
    
    return keywordMatches.length / keywords.length;
  }

  getRelatedContent(entityType, entityValue) {
    const category = this.findCategoryForEntity(entityType);
    if (!category) return [];
    
    const categoryData = this.knowledgeIndex[category];
    if (!categoryData) return [];
    
    return Object.entries(categoryData.content)
      .filter(([topic]) => this.calculateRelevance([entityValue], [topic]) > 0.3)
      .map(([topic, content]) => ({
        topic,
        content,
        relevance: this.calculateRelevance([entityValue], [topic]),
        source: 'knowledge_base'
      }));
  }

  findCategoryForEntity(entityType) {
    const typeMapping = {
      'occupations': 'educational_grants',
      'organization_types': 'nonprofit_grants',
      'grant_types': 'grants',
      'funding_amounts': 'grants',
      'geographic': 'grants',
      'emails': 'technical',
      'urls': 'technical',
      'deadlines': 'grants'
    };
    
    return typeMapping[entityType];
  }

  getGrantRecommendations(userProfile) {
    const recommendations = [];
    
    // Educational grants
    if (userProfile.occupation && /teacher|professor|educator|academic/.test(userProfile.occupation.toLowerCase())) {
      recommendations.push({
        category: 'Educational Grants',
        opportunities: [
          {
            name: 'Teacher Professional Development Grants',
            amount: '$1,000 - $5,000',
            deadline: 'Rolling applications',
            description: 'Support for teacher training, conferences, and educational innovation.'
          },
          {
            name: 'Classroom Technology Grants',
            amount: '$500 - $3,000',
            deadline: 'Quarterly',
            description: 'Funding for educational technology and digital learning tools.'
          }
        ]
      });
    }
    
    // Research grants
    if (userProfile.organizationType && /university|college|research|institute/.test(userProfile.organizationType.toLowerCase())) {
      recommendations.push({
        category: 'Research Grants',
        opportunities: [
          {
            name: 'Federal Research Grants',
            amount: '$50,000 - $2,000,000',
            deadline: 'Varies by agency',
            description: 'NSF, NIH, DOE funding for scientific research projects.'
          },
          {
            name: 'Private Foundation Research',
            amount: '$10,000 - $500,000',
            deadline: 'Varies by foundation',
            description: 'Foundation funding for innovative research initiatives.'
          }
        ]
      });
    }
    
    // Business grants
    if (userProfile.organizationType && /business|startup|company/.test(userProfile.organizationType.toLowerCase())) {
      recommendations.push({
        category: 'Business Grants',
        opportunities: [
          {
            name: 'SBIR/STTR Grants',
            amount: 'Up to $1,500,000',
            deadline: 'Multiple phases',
            description: 'Small Business Innovation Research and Technology Transfer programs.'
          },
          {
            name: 'Economic Development Grants',
            amount: '$25,000 - $500,000',
            deadline: 'Annual cycles',
            description: 'Support for business growth and economic impact projects.'
          }
        ]
      });
    }
    
    // Nonprofit grants
    if (userProfile.organizationType && /nonprofit|charity|foundation|ngo/.test(userProfile.organizationType.toLowerCase())) {
      recommendations.push({
        category: 'Nonprofit Grants',
        opportunities: [
          {
            name: 'Capacity Building Grants',
            amount: '$5,000 - $100,000',
            deadline: 'Quarterly',
            description: 'Support for organizational development and infrastructure.'
          },
          {
            name: 'Program Implementation Grants',
            amount: '$10,000 - $250,000',
            deadline: 'Annual',
            description: 'Funding for specific nonprofit programs and services.'
          }
        ]
      });
    }
    
    return recommendations;
  }
}

class AdaptiveConversationFlow {
  constructor(memory, sentimentAnalyzer) {
    this.memory = memory;
    this.sentimentAnalyzer = sentimentAnalyzer;
    this.conversationState = {
      currentTopic: null,
      topicHistory: [],
      escalationLevel: 0,
      followUpPrompts: [],
      interruptionHandler: null,
      grantContext: null
    };
  }

  adaptFlow(userMessage, intent, sentiment) {
    const state = this.conversationState;
    let adaptedResponse = { ...userMessage };
    
    // Handle topic transitions
    if (this.shouldTransitionTopic(userMessage, intent)) {
      adaptedResponse = this.handleTopicTransition(adaptedResponse, intent);
    }
    
    // Handle emotional states
    adaptedResponse = this.handleEmotionalContext(adaptedResponse, sentiment);
    
    // Manage conversation flow
    adaptedResponse = this.manageFlow(adaptedResponse, intent);
    
    // Handle interruptions
    adaptedResponse = this.handleInterruption(adaptedResponse, userMessage);
    
    // Update conversation state
    this.updateConversationState(userMessage, intent, sentiment);
    
    return adaptedResponse;
  }

  shouldTransitionTopic(userMessage, intent) {
    const currentTopic = this.conversationState.currentTopic;
    const newTopic = this.identifyTopic(userMessage, intent);
    
    // Transition if topic has changed significantly
    if (currentTopic && newTopic && currentTopic !== newTopic) {
      // Check if transition is warranted
      const sessionLength = this.memory.history.length;
      const topicEngagement = this.conversationState.topicHistory
        .filter(t => t.topic === currentTopic).length;
      
      return topicEngagement >= 3 || sessionLength >= 10;
    }
    
    return false;
  }

  identifyTopic(message, intent) {
    const topicMapping = {
      'navigate': 'navigation',
      'feature_info': 'information_seeking',
      'how_to': 'learning',
      'troubleshoot': 'problem_solving',
      'content_discovery': 'exploration',
      'technical_support': 'technical_help',
      'greeting': 'social',
      'help': 'assistance',
      'grant_info': 'grant_discovery',
      'grant_application': 'application_guidance',
      'grant_eligibility': 'eligibility_assessment'
    };
    
    return topicMapping[intent.intent] || 'general';
  }

  handleTopicTransition(response, intent) {
    const newTopic = this.identifyTopic(response, intent);
    
    // Add transition acknowledgment
    const transitions = {
      'navigation': 'Now let\'s help you get around the platform!',
      'information_seeking': 'Great question! Let me share some detailed information.',
      'learning': 'Perfect! Let me walk you through this step by step.',
      'problem_solving': 'Let\'s solve this together!',
      'exploration': 'Excellent! Let\'s discover what\'s available.',
      'technical_help': 'I\'ll help resolve this technical issue.',
      'social': 'Hello! How can I assist you today?',
      'assistance': 'I\'m here to help with whatever you need!',
      'grant_discovery': 'Let\'s find the perfect grant opportunities for you!',
      'application_guidance': 'I\'ll guide you through the application process.',
      'eligibility_assessment': 'Let me help you understand the requirements.'
    };
    
    const transitionText = transitions[newTopic] || 'Let me help you with that.';
    
    response.text = `${transitionText}\n\n${response.text}`;
    this.conversationState.currentTopic = newTopic;
    
    return response;
  }

  handleEmotionalContext(response, sentiment) {
    const { emotions, sentiment: emotionType, urgency, hopefulness } = sentiment;
    
    // Handle negative emotions with empathy
    if (emotionType === 'negative') {
      if (emotions.anger > 0) {
        response.text = `I understand your frustration. ${response.text}`;
        response.empathetic = true;
      } else if (emotions.sadness > 0) {
        response.text = `I'm here to help. ${response.text}`;
        response.supportive = true;
      } else if (emotions.fear > 0) {
        response.text = `No worries, let's take this step by step. ${response.text}`;
        response.reassuring = true;
      }
    }
    
    // Handle positive emotions
    if (emotionType === 'positive') {
      if (emotions.joy > 0) {
        response.text = `${response.text}\n\nI'm glad I could help! 😊`;
        response.enthusiastic = true;
      }
    }
    
    // Adjust for urgency
    if (urgency > 0.6) {
      response.text = `I understand this is urgent. ${response.text}`;
      response.urgent = true;
    }
    
    // Enhance hopeful responses
    if (hopefulness > 0.5) {
      response.text = `${response.text}\n\nI'm optimistic about finding great opportunities for you!`;
      response.hopeful = true;
    }
    
    return response;
  }

  manageFlow(response, intent) {
    const state = this.conversationState;
    
    // Add follow-up prompts based on conversation context
    const shouldAddPrompt = this.shouldAddFollowUpPrompt(intent);
    
    if (shouldAddPrompt) {
      const prompt = this.generateFollowUpPrompt(intent, state);
      if (prompt) {
        response.text += `\n\n${prompt}`;
        response.followUpAvailable = true;
      }
    }
    
    // Handle escalation
    if (this.shouldEscalate(intent)) {
      response.escalationLevel = this.conversationState.escalationLevel + 1;
      response.text = this.addEscalationContext(response.text, intent);
    }
    
    return response;
  }

  shouldAddFollowUpPrompt(intent) {
    const sessionLength = this.memory.history.length;
    
    // Add prompts for helpful interactions
    return (intent.intent === 'help' || intent.intent === 'troubleshoot' || 
            intent.intent === 'grant_info' || intent.intent === 'how_to') && 
           sessionLength % 3 === 0;
  }

  generateFollowUpPrompt(intent, state) {
    const prompts = {
      'help': 'Is there anything specific you\'d like me to clarify?',
      'troubleshoot': 'Did this resolve your issue, or do you need additional help?',
      'feature_info': 'Would you like me to explain any other features?',
      'navigation': 'Do you need help finding anything else?',
      'how_to': 'Do you have questions about any of these steps?',
      'grant_info': 'Would you like me to help you assess your eligibility for these grants?',
      'grant_application': 'Do you need assistance preparing your application materials?'
    };
    
    return prompts[intent.intent] || 'How else can I assist you?';
  }

  shouldEscalate(intent) {
    // Escalate for complex technical issues or repeated help requests
    return intent.intent === 'technical_support' || 
           (intent.intent === 'troubleshoot' && this.conversationState.escalationLevel > 0) ||
           (intent.intent === 'grant_application' && this.conversationState.escalationLevel > 1);
  }

  addEscalationContext(text, intent) {
    const escalationPhrases = {
      'technical_support': 'Given the technical complexity, ',
      'troubleshoot': 'Since we\'re having some challenges, ',
      'grant_application': 'For complex applications, '
    };
    
    const phrase = escalationPhrases[intent.intent] || '';
    return `${phrase}${text}`;
  }

  handleInterruption(response, userMessage) {
    // Detect if user is asking something completely different
    const currentTopic = this.conversationState.currentTopic;
    const newTopic = this.identifyTopic(userMessage, this.memory.history.slice(-1)[0]?.intent || {});
    
    if (currentTopic && newTopic && currentTopic !== newTopic && 
        this.memory.history.length > 5) {
      response.text = `I see you're interested in something different. ${response.text}`;
      response.topicTransition = true;
    }
    
    return response;
  }

  updateConversationState(userMessage, intent, sentiment) {
    const topic = this.identifyTopic(userMessage, intent);
    
    // Update topic history
    this.conversationState.topicHistory.push({
      topic,
      timestamp: Date.now(),
      sentiment: sentiment.sentiment
    });
    
    // Keep only recent history
    if (this.conversationState.topicHistory.length > 20) {
      this.conversationState.topicHistory.shift();
    }
    
    // Update current topic if it's been stable
    if (this.conversationState.topicHistory.slice(-3).every(t => t.topic === topic)) {
      this.conversationState.currentTopic = topic;
    }
  }

  getConversationState() {
    return {
      ...this.conversationState,
      topicDistribution: this.calculateTopicDistribution(),
      emotionalTrend: this.calculateEmotionalTrend(),
      engagementLevel: this.calculateEngagementLevel()
    };
  }

  calculateTopicDistribution() {
    const distribution = {};
    this.conversationState.topicHistory.forEach(entry => {
      distribution[entry.topic] = (distribution[entry.topic] || 0) + 1;
    });
    return distribution;
  }

  calculateEmotionalTrend() {
    const recent = this.conversationState.topicHistory.slice(-10);
    const emotions = recent.map(e => e.sentiment);
    
    const positive = emotions.filter(e => e === 'positive').length;
    const negative = emotions.filter(e => e === 'negative').length;
    
    return {
      trend: positive > negative ? 'improving' : negative > positive ? 'declining' : 'stable',
      ratio: emotions.length > 0 ? positive / emotions.length : 0.5
    };
  }

  calculateEngagementLevel() {
    const sessionLength = this.memory.history.length;
    const recentActivity = this.conversationState.topicHistory.slice(-5).length;
    
    return Math.min(1, (sessionLength + recentActivity) / 20);
  }
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState('en');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [proactiveSuggestions, setProactiveSuggestions] = useState([]);
  const [conversationState, setConversationState] = useState({});
  const [performanceMetrics, setPerformanceMetrics] = useState({
    responseTime: 0,
    accuracy: 0.8,
    userSatisfaction: 0.8
  });

  // Advanced AI System Initialization
  const conversationMemory = useRef(new ConversationMemory()).current;
  const entityExtractor = useRef(new EntityExtractor()).current;
  const sentimentAnalyzer = useRef(new SentimentAnalyzer()).current;
  const behaviorTracker = useRef(new UserBehaviorTracker()).current;
  const personalizationEngine = useRef(new PersonalizationEngine(conversationMemory, behaviorTracker)).current;
  const proactiveSuggestionEngine = useRef(new ProactiveSuggestionEngine(conversationMemory, behaviorTracker)).current;
  const knowledgeBase = useRef(new KnowledgeBaseIntegration()).current;
  const adaptiveFlow = useRef(new AdaptiveConversationFlow(conversationMemory, sentimentAnalyzer)).current;

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
      timestamp: new Date(),
      personalized: true
    };
    setMessages([welcomeMessage]);
    
    // Load conversation history if available
    loadConversationHistory();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load conversation history from storage
  const loadConversationHistory = () => {
    try {
      const saved = localStorage.getItem('chatbot_conversation');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.history && data.history.length > 0) {
          // Add a context reminder message
          const contextMessage = {
            id: Date.now(),
            text: "Welcome back! I remember our previous conversation about grants. How can I continue helping you find funding opportunities?",
            sender: 'bot',
            timestamp: new Date(),
            isContextReminder: true
          };
          setMessages(prev => [contextMessage, ...prev]);
        }
      }
    } catch (error) {
      console.warn('Failed to load conversation history:', error);
    }
  };

  // Enhanced Natural Language Processing with Advanced Intent Recognition
  const analyzeIntent = useCallback((text) => {
    const normalized = text.toLowerCase().trim();
    const cleaned = normalized.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, '');
    
    // Grant-specific intent recognition
    if (/(grant|funding|opportunity|award|sponsorship)/i.test(cleaned)) {
      if (/(eligible|qualify|requirements|criteria|can i|am i)/i.test(cleaned)) {
        return { intent: 'grant_eligibility', confidence: 0.9 };
      }
      if (/(apply|application|submit|how to|process|steps)/i.test(cleaned)) {
        return { intent: 'grant_application', confidence: 0.9 };
      }
      if (/(deadline|due|date|when)/i.test(cleaned)) {
        return { intent: 'grant_deadline', confidence: 0.9 };
      }
      if (/(amount|funding|money|budget|cost)/i.test(cleaned)) {
        return { intent: 'grant_amount', confidence: 0.9 };
      }
      return { intent: 'grant_info', confidence: 0.85 };
    }
    
    // Advanced direct navigation patterns with context awareness
    if (/(home|landing|main page|start here|go home|back to start)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'home', confidence: 0.95 };
    }
    if (/(about|team|company|who are you|what is granttracker|learn more|tell me about)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'about', confidence: 0.95 };
    }
    if (/(dashboard|analytics|chart|statistics|reports|data insights|visualization)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'dashboard', confidence: 0.9 };
    }
    if (/(benefits|schemes|government schemes|welfare|government benefits|social programs)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'benefits', confidence: 0.9 };
    }
    if (/(suggestions|feedback|public|comment|community ideas|user feedback)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'suggestions', confidence: 0.9 };
    }
    if (/(creator|login|register|apply|grant application|applicant portal|seek funding)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'creator', confidence: 0.85 };
    }
    if (/(government|official|admin|ministry|government portal|official access)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'government', confidence: 0.85 };
    }
    if (/(create|new|submit|make a grant|grant creation|post a grant|offer funding)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'create', confidence: 0.85 };
    }
    if (/(view|public|see|browse grants|explore grants|search grants|funding opportunities)/i.test(cleaned)) {
      return { intent: 'navigate', target: 'view', confidence: 0.85 };
    }
    
    // Advanced feature explanations with contextual understanding
    if (/(what is|explain|tell me about|how does|features|functionality|capabilities|what does)/i.test(cleaned)) {
      if (/(dashboard|analytics|chart|data|statistics|insights|visualization|reports)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'dashboard', confidence: 0.9 };
      }
      if (/(benefits|schemes|welfare|government programs|social security)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'benefits', confidence: 0.9 };
      }
      if (/(suggestions|feedback|community|public input|user ideas)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'suggestions', confidence: 0.9 };
      }
      if (/(grant|creation|create|make|new funding|offer)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'create', confidence: 0.9 };
      }
      if (/(application|apply|submit|creator portal|applicant)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'creator', confidence: 0.9 };
      }
      if (/(government|official|admin|ministry)/i.test(cleaned)) {
        return { intent: 'feature_info', target: 'government', confidence: 0.9 };
      }
      return { intent: 'feature_info', target: 'general', confidence: 0.7 };
    }
    
    // Advanced how-to questions with contextual understanding
    if (/(how to|how do i|guide me|walk me through|steps|instructions|can you help me|what are the steps)/i.test(cleaned)) {
      if (/(apply|application|submit|getting started|sign up|register)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'application', confidence: 0.9 };
      }
      if (/(create|make|new grant|posting|publish)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'create_grant', confidence: 0.9 };
      }
      if (/(find|search|discover|browse|look for|locate)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'find_grants', confidence: 0.9 };
      }
      if (/(login|sign in|access|get into)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'login', confidence: 0.9 };
      }
      if (/(navigate|move around|get around|use the site)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'navigation', confidence: 0.9 };
      }
      if (/(upload|documents|files|attach)/i.test(cleaned)) {
        return { intent: 'how_to', target: 'upload', confidence: 0.9 };
      }
      return { intent: 'how_to', target: 'general', confidence: 0.7 };
    }
    
    // Advanced troubleshooting with specific problem detection
    if (/(troubleshoot|error|problem|issue|not working|broken|fix|debug|something wrong|won't work|failing|glitch)/i.test(cleaned)) {
      if (/(login|sign in|password|authentication|can't log in)/i.test(cleaned)) {
        return { intent: 'troubleshoot', target: 'login', confidence: 0.9 };
      }
      if (/(form|submit|application|won't submit|submit button)/i.test(cleaned)) {
        return { intent: 'troubleshoot', target: 'form', confidence: 0.9 };
      }
      if (/(page|load|loading|slow|crash|refresh)/i.test(cleaned)) {
        return { intent: 'troubleshoot', target: 'page', confidence: 0.9 };
      }
      if (/(upload|file|document|attachment)/i.test(cleaned)) {
        return { intent: 'troubleshoot', target: 'upload', confidence: 0.9 };
      }
      if (/(browser|compatibility|javascript|cookies)/i.test(cleaned)) {
        return { intent: 'troubleshoot', target: 'browser', confidence: 0.9 };
      }
      return { intent: 'troubleshoot', target: 'general', confidence: 0.85 };
    }
    
    // Advanced content discovery with specific search intents
    if (/(find|search|discover|show me|browse|look for|what grants|seeking funding|funding opportunities)/i.test(cleaned)) {
      if (/(small|business|startup|entrepreneur)/i.test(cleaned)) {
        return { intent: 'content_discovery', target: 'small_business', confidence: 0.9 };
      }
      if (/(research|academic|university|student)/i.test(cleaned)) {
        return { intent: 'content_discovery', target: 'research', confidence: 0.9 };
      }
      if (/(nonprofit|ngo|charity|community)/i.test(cleaned)) {
        return { intent: 'content_discovery', target: 'nonprofit', confidence: 0.9 };
      }
      if (/(government|federal|state|local)/i.test(cleaned)) {
        return { intent: 'content_discovery', target: 'government', confidence: 0.9 };
      }
      return { intent: 'content_discovery', target: 'general', confidence: 0.8 };
    }
    
    // Enhanced technical support with specific issue categories
    if (/(technical|support|help|contact|assistance|customer service|it help|computer issues)/i.test(cleaned)) {
      if (/(mobile|phone|tablet|responsive|screen size)/i.test(cleaned)) {
        return { intent: 'technical_support', target: 'mobile', confidence: 0.9 };
      }
      if (/(performance|speed|slow|optimization)/i.test(cleaned)) {
        return { intent: 'technical_support', target: 'performance', confidence: 0.9 };
      }
      if (/(security|privacy|safe|secure)/i.test(cleaned)) {
        return { intent: 'technical_support', target: 'security', confidence: 0.9 };
      }
      if (/(accessibility|disability|screen reader|keyboard)/i.test(cleaned)) {
        return { intent: 'technical_support', target: 'accessibility', confidence: 0.9 };
      }
      return { intent: 'technical_support', target: 'general', confidence: 0.8 };
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
      // Track navigation behavior
      behaviorTracker.trackInteraction('navigation', { target });
      
      navigate(pathInfo.path);
      
      // Add confirmation message
      const navMessage = {
        id: Date.now(),
        text: `Navigating to ${pathInfo.label}...`,
        sender: 'bot',
        timestamp: new Date(),
        navigation: true,
        target: target
      };
      
      setMessages(prev => [...prev, navMessage]);
      
      // Close chat after navigation
      setTimeout(() => {
        setIsOpen(false);
      }, 1500);
      
      return true;
    }
    return false;
  }, [navigate, behaviorTracker]);

  // Generate comprehensive response based on intent with AI enhancement
  const generateResponse = useCallback(async (message, intent) => {
    const startTime = Date.now();
    setIsLoading(true);
    setIsTyping(true);
    
    try {
      // Extract entities and analyze sentiment
      const entities = entityExtractor.extract(message);
      const sentiment = sentimentAnalyzer.analyze(message);
      
      // Track user behavior
      behaviorTracker.trackInteraction('message', {
        text: message,
        intent: intent.intent,
        confidence: intent.confidence,
        entities,
        sentiment
      });
      
      // Track grant-specific queries
      if (intent.intent.startsWith('grant_') || 
          /grant|funding|opportunity|award/i.test(message)) {
        behaviorTracker.trackInteraction('grant_query', {
          text: message,
          intent: intent.intent
        });
      }
      
      // Get knowledge base information
      const knowledgeResults = knowledgeBase.search(message, intent);
      
      // Simulate API call delay with adaptive timing
      const baseDelay = 200 + Math.random() * 300;
      const adaptiveDelay = sentiment.emotions.anger > 0 ? baseDelay * 0.5 : baseDelay;
      await new Promise(resolve => setTimeout(resolve, adaptiveDelay));
      
      let response = '';
      
      // Generate base response
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
          response = getTroubleshootResponse(intent.target);
          break;
          
        case 'content_discovery':
          response = getContentDiscoveryResponse(intent.target);
          break;
          
        case 'technical_support':
          response = getTechnicalSupportResponse(intent.target);
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
          response = 'Conversation cleared! How can I help you navigate or find grants?';
          break;
          
        // Grant-specific responses
        case 'grant_info':
          response = getGrantInfoResponse(entities, conversationMemory.grantContext.profile);
          break;
          
        case 'grant_eligibility':
          response = getGrantEligibilityResponse(entities, conversationMemory.grantContext.profile);
          break;
          
        case 'grant_application':
          response = getGrantApplicationResponse(entities);
          break;
          
        case 'grant_deadline':
          response = getGrantDeadlineResponse(entities);
          break;
          
        case 'grant_amount':
          response = getGrantAmountResponse(entities);
          break;
          
        default:
          response = getFallbackResponse(language);
      }
      
      // Enhance response with knowledge base information
      if (knowledgeResults.length > 0) {
        const relevantInfo = knowledgeResults[0].content;
        response += `\n\n💡 **Additional Information:** ${relevantInfo}`;
      }
      
      // Create response object
      let botResponse = {
        id: Date.now(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
        metadata: {
          intent: intent.intent,
          confidence: intent.confidence,
          entities,
          sentiment,
          knowledgeResults,
          responseTime: Date.now() - startTime
        },
        personalized: true,
        originalQuery: message
      };
      
      // Apply adaptive conversation flow
      botResponse = adaptiveFlow.adaptFlow(botResponse, intent, sentiment);
      
      // Personalize response
      const personalizedResponse = personalizationEngine.personalizeResponse(botResponse, {
        intent,
        sentiment,
        entities,
        context: conversationMemory.buildContext()
      });
      
      // Update performance metrics
      const responseTime = Date.now() - startTime;
      updatePerformanceMetrics(responseTime, intent.confidence);
      
      // Store in conversation memory
      conversationMemory.addMessage(personalizedResponse, sentiment.sentiment, entities);
      
      // Generate proactive suggestions
      const suggestions = proactiveSuggestionEngine.generateSuggestions(
        conversationMemory.buildContext()
      );
      if (suggestions.length > 0) {
        setProactiveSuggestions(suggestions);
      }
      
      return personalizedResponse;
      
    } catch (err) {
      console.error('Error generating response:', err);
      
      // Enhanced error handling
      const errorResponse = {
        id: Date.now(),
        text: getErrorResponse(language),
        sender: 'bot',
        timestamp: new Date(),
        isError: true,
        errorType: 'generation_failed',
        recoverySuggestions: getRecoverySuggestions(intent)
      };
      
      return errorResponse;
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [
    language, 
    handleDirectNavigation, 
    entityExtractor, 
    sentimentAnalyzer, 
    behaviorTracker, 
    knowledgeBase, 
    adaptiveFlow, 
    personalizationEngine,
    proactiveSuggestionEngine,
    conversationMemory
  ]);

  // Update performance metrics
  const updatePerformanceMetrics = (responseTime, accuracy) => {
    setPerformanceMetrics(prev => ({
      responseTime: (prev.responseTime + responseTime) / 2,
      accuracy: (prev.accuracy + accuracy) / 2,
      userSatisfaction: prev.userSatisfaction // This would be updated based on user feedback
    }));
  };

  // Grant-specific response generators
  const getGrantInfoResponse = (entities, userProfile) => {
    const occupation = entities.find(e => e.type === 'occupations')?.value;
    const organizationType = entities.find(e => e.type === 'organization_types')?.value;
    
    if (occupation) {
      return `I can help you find grants specifically for ${occupation}s! Based on your profile, here are relevant opportunities:\n\n🎓 **Professional Development Grants**\n• Teacher professional development: $1,000 - $5,000\n• Conference and workshop funding: $500 - $3,000\n• Research and innovation grants: $2,500 - $25,000\n\n💡 **Next Steps:**\n1. Tell me about your specific project or need\n2. I can assess your eligibility for different programs\n3. Help you prepare a competitive application\n\nWhat type of funding are you most interested in?`;
    }
    
    if (organizationType) {
      const recommendations = knowledgeBase.getGrantRecommendations({ organizationType });
      let response = `Great! For ${organizationType}s, here are the most relevant grant opportunities:\n\n`;
      
      recommendations.forEach(category => {
        response += `📋 **${category.category}**\n`;
        category.opportunities.forEach(opp => {
          response += `• ${opp.name} - ${opp.amount}\n  Deadline: ${opp.deadline}\n  ${opp.description}\n\n`;
        });
      });
      
      response += `Would you like me to help you assess your eligibility for any of these programs?`;
      return response;
    }
    
    return `I'd be happy to help you find relevant grant opportunities! To provide the most targeted recommendations, could you tell me:\n\n• What's your occupation or role?\n• What type of organization are you affiliated with?\n• What kind of project or need do you have funding for?\n• What's your approximate funding range?\n\nWith this information, I can provide personalized grant recommendations and help you understand the application process!`;
  };

  const getGrantEligibilityResponse = (entities, userProfile) => {
    return `Let me help you understand grant eligibility requirements. Here's what I need to assess your fit:\n\n📋 **Key Eligibility Factors:**\n• **Organization Type** - Nonprofit, educational, government, or for-profit\n• **Geographic Location** - Some grants are state/region specific\n• **Project Scope** - Research, capacity building, equipment, etc.\n• **Funding Amount** - Range typically $1,000 to $2,000,000+\n• **Timeline** - Application deadlines and project duration\n\n🎯 **Common Eligibility Requirements:**\n• 501(c)(3) status for nonprofits\n• Accredited institution for educational grants\n• Demonstrated need and impact potential\n• Matching funds (sometimes required)\n• Specific geographic or demographic focus\n\n💡 **To assess your specific eligibility:**\n1. What type of organization do you represent?\n2. What's your project or funding need?\n3. Do you have any geographic restrictions?\n4. What's your ideal funding timeline?\n\nI can then provide detailed eligibility guidance and help you identify the best-matching programs!`;
  };

  const getGrantApplicationResponse = (entities) => {
    return `Here's how to approach grant applications successfully:\n\n📝 **Application Process:**\n1. **Research & Match** - Find programs aligned with your goals\n2. **Review Requirements** - Carefully read eligibility and guidelines\n3. **Prepare Materials** - Gather supporting documents and data\n4. **Write Proposal** - Clear project description and impact statement\n5. **Budget Development** - Detailed and justified budget\n6. **Review & Submit** - Proofread and submit before deadline\n\n📋 **Essential Application Components:**\n• **Executive Summary** - Clear, compelling overview\n• **Problem Statement** - Document the need or opportunity\n• **Project Description** - Detailed methodology and timeline\n• **Budget & Justification** - Accurate costs and rationale\n• **Evaluation Plan** - How you'll measure success\n• **Organizational Capacity** - Your ability to execute\n\n⏰ **Timeline Tips:**\n• Start 3-6 months before deadline\n• Allow time for internal reviews\n• Prepare for potential follow-up questions\n• Keep copies of all submitted materials\n\n💡 **Success Strategies:**\n• Align perfectly with funder priorities\n• Demonstrate clear impact and outcomes\n• Show strong organizational capacity\n• Include letters of support when requested\n\nDo you need help with any specific part of the application process?`;
  };

  const getGrantDeadlineResponse = (entities) => {
    return `Here are important deadline considerations for grant applications:\n\n📅 **Common Deadline Patterns:**\n• **Annual Deadlines** - January, April, July, October\n• **Quarterly** - March 31, June 30, September 30, December 31\n• **Rolling** - Accepted year-round (often faster review)\n• **Federal Cycles** - Can be multi-phase with LOI deadlines\n\n⚠️ **Critical Deadline Tips:**\n• **Start Early** - Begin 3-6 months in advance\n• **Time Zones** - Ensure you understand the deadline timezone\n• **Submission System** - Allow extra time for technical issues\n• **Internal Reviews** - Factor in your organization's review process\n\n📧 **Deadline Management:**\n• Set calendar reminders 30, 14, and 7 days before\n• Create a submission checklist\n• Prepare all materials in advance\n• Test submission systems beforehand\n\n🔄 **If You Miss a Deadline:**\n• Check if there are rolling deadlines\n• Look for similar programs with later deadlines\n• Use the time to strengthen your next application\n• Consider reaching out to the funder about future opportunities\n\n💡 **Proactive Planning:**\n• Maintain a 12-month grant calendar\n• Track deadlines in your CRM or project management system\n• Build relationships with program officers when possible\n• Start preparing applications well in advance\n\nWhen is your ideal timeline for starting a project? I can help you identify programs with matching deadlines!`;
  };

  const getGrantAmountResponse = (entities) => {
    return `Here's what you need to know about grant funding amounts:\n\n💰 **Typical Funding Ranges:**\n• **Seed Grants** - $1,000 - $25,000\n• **Small Grants** - $5,000 - $50,000\n• **Medium Grants** - $25,000 - $250,000\n• **Large Grants** - $100,000 - $1,000,000+\n• **Major Grants** - $500,000 - $10,000,000+\n\n🎯 **Matching Your Needs:**\n• **Research Projects** - $10,000 - $500,000\n• **Equipment/Tech** - $5,000 - $100,000\n• **Capacity Building** - $15,000 - $250,000\n• **Program Implementation** - $50,000 - $2,000,000\n• **Infrastructure** - $100,000 - $5,000,000+\n\n📊 **Budget Planning Tips:**\n• Request what you actually need - not more, not less\n• Justify every budget line item\n• Include indirect costs if allowed\n• Consider multi-year funding for larger projects\n• Plan for 10-15% budget increases for multi-year grants\n\n💡 **Amount-Specific Strategies:**\n• **Small projects** - Start with seed funding to prove concept\n• **Large projects** - Break into phases with separate applications\n• **Pilot programs** - Begin with smaller amounts to demonstrate impact\n• **Scaling** - Use initial success to secure larger follow-up grants\n\n🔍 **To determine your ideal amount:**\n• Calculate actual project costs including indirect expenses\n• Research what similar projects have received\n• Consider your organization's capacity to manage funds\n• Factor in any matching fund requirements\n\nWhat type of project are you planning? I can help you determine an appropriate funding amount and find programs that match your needs!`;
  };

  // Enhanced response generators with AI improvements
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
      
      case 'login':
        return `Here's how to log in to GrantTracker:\n\n1. **Choose Your Portal** - Select Creator or Government login\n2. **Enter Credentials** - Use your registered email and password\n3. **Check Caps Lock** - Ensure caps lock is off\n4. **Clear Browser Cache** - If login fails, clear cache and cookies\n5. **Try Password Reset** - Use "Forgot Password" if needed\n6. **Contact Support** - Reach out if you continue having issues\n\nWhich portal do you need help accessing?`;
      
      case 'navigation':
        return `Here's how to navigate GrantTracker effectively:\n\n🧭 **Main Navigation**\n• Use the top navigation bar for main sections\n• Click the GrantTracker logo to return home\n• Use the chat assistant for quick navigation\n\n🔍 **Finding Content**\n• Use the search functionality on relevant pages\n• Browse by category or sector\n• Check the dashboard for analytics\n\n💡 **Pro Tips**\n• Bookmark frequently visited pages\n• Use browser back/forward buttons\n• The chat assistant can take you anywhere instantly\n\nWhere would you like to go?`;
      
      case 'upload':
        return `Here's how to upload documents successfully:\n\n📄 **Supported Formats**\n• PDF, DOC, DOCX files\n• Maximum file size: 10MB per document\n• Multiple files can be uploaded\n\n📋 **Upload Steps**\n1. **Click Upload Button** - Usually marked with paperclip icon\n2. **Select Files** - Choose from your device\n3. **Verify Upload** - Check that files appear in list\n4. **Submit Form** - Complete the application process\n\n⚠️ **Troubleshooting**\n• Check file format and size\n• Ensure stable internet connection\n• Try refreshing the page if upload fails\n\nNeed help with a specific upload issue?`;
      
      default:
        return `I'm here to help guide you through any process! What specific task would you like assistance with? I can help with:\n\n• Grant applications\n• Creating new grants\n• Finding grant opportunities\n• Using the dashboard\n• Logging in and navigation\n• Document uploads\n\nJust let me know what you need help with!`;
    }
  };

  const getTroubleshootResponse = (target) => {
    switch (target) {
      case 'login':
        return `Let's troubleshoot your login issues:\n\n🔑 **Login Solutions**\n• **Check Credentials** - Verify email and password\n• **Portal Selection** - Ensure you're using the correct portal (Creator/Government)\n• **Caps Lock** - Make sure caps lock is off\n• **Browser Cache** - Clear cache and cookies\n• **Password Reset** - Use "Forgot Password" link\n• **Account Status** - Check if account is activated\n\n💡 **Pro Tips**\n• Try logging out and back in\n• Use an incognito/private browser window\n• Disable browser extensions temporarily\n\nStill can't login? I can guide you through account recovery!`;
      
      case 'form':
        return `Let's fix your form submission issues:\n\n📋 **Form Solutions**\n• **Required Fields** - Fill all mandatory fields (marked with *)\n• **File Uploads** - Check file formats (PDF, DOC, DOCX)\n• **File Size** - Ensure files are under 10MB\n• **Internet Connection** - Stable connection required\n• **Browser Compatibility** - Use updated Chrome, Firefox, or Safari\n\n🔧 **Quick Fixes**\n• Refresh the page and try again\n• Disable browser auto-fill temporarily\n• Try a different browser\n• Clear browser cache\n\nWhat specific error message are you seeing?`;
      
      case 'page':
        return `Let's resolve your page loading issues:\n\n🔄 **Page Solutions**\n• **Refresh Page** - Press F5 or click refresh button\n• **Check Internet** - Verify stable connection\n• **Browser Update** - Ensure you're using latest browser version\n• **Disable Extensions** - Turn off ad blockers temporarily\n• **Clear Cache** - Clear browser cache and cookies\n\n🌐 **Network Issues**\n• Try a different internet connection\n• Check if other websites load properly\n• Restart your router/modem\n• Contact your ISP if issues persist\n\nWhich page is having trouble loading?`;
      
      case 'upload':
        return `Let's fix your document upload issues:\n\n📁 **Upload Solutions**\n• **File Format** - Use PDF, DOC, or DOCX only\n• **File Size** - Keep files under 10MB each\n• **Multiple Files** - Upload one at a time if needed\n• **Internet Speed** - Ensure stable, fast connection\n• **Browser Support** - Use modern browser (Chrome, Firefox, Safari)\n\n🔧 **Troubleshooting Steps**\n• Refresh the page and try again\n• Try uploading from a different browser\n• Check that files aren't corrupted\n• Disable browser extensions\n\nWhat type of file are you trying to upload?`;
      
      case 'browser':
        return `Let's resolve your browser compatibility issues:\n\n🌐 **Browser Solutions**\n• **Update Browser** - Install latest version\n• **Enable JavaScript** - Ensure JS is enabled\n• **Enable Cookies** - Allow cookies for this site\n• **Disable Extensions** - Turn off ad blockers temporarily\n• **Clear Cache** - Clear browser cache completely\n\n✅ **Recommended Browsers**\n• Google Chrome (most compatible)\n• Mozilla Firefox\n• Microsoft Edge\n• Safari (Mac/iOS)\n\n📱 **Mobile Browsers**\n• Chrome Mobile\n• Safari Mobile\n• Firefox Mobile\n\nWhich browser are you currently using?`;
      
      default:
        return `I'm here to help troubleshoot any issues you're experiencing! Here are solutions to common problems:\n\n🔧 **Login Issues**\n• Check your username and password\n• Try clearing browser cache\n• Ensure you're using the correct portal (Creator vs Government)\n\n📄 **Form Submission Problems**\n• Check required fields are filled\n• Ensure documents are in supported formats\n• Verify internet connection is stable\n\n📊 **Dashboard Not Loading**\n• Refresh the page\n• Check your internet connection\n• Try a different browser\n\n🔍 **Search Issues**\n• Try different keywords\n• Clear search filters\n• Check spelling\n\nStill having trouble? Describe your specific issue and I'll provide targeted help!`;
    }
  };

  const getContentDiscoveryResponse = (userType) => {
    switch (userType) {
      case 'small_business':
        return `Perfect! Here's what GrantTracker offers for small businesses:\n\n🏢 **Small Business Grants**\n• **SBIR/STTR** - Innovation research funding\n• **Economic Development** - Business growth support\n• **Technology Transfer** - Commercialization help\n• **Export Programs** - International expansion\n• **Workforce Development** - Employee training funds\n• **SBA Programs** - Small Business Administration grants\n\n💡 **Key Benefits**\n• Up to $1.5M available for R&D\n• No matching funds required for Phase I\n• Exclusive access to federal contracts\n\n🎯 **Best Match** - Small Business Innovation Research\nReady to explore opportunities that fit your business?`;
      
      case 'research':
        return `Excellent! Here's what GrantTracker offers for researchers:\n\n🔬 **Research Funding**\n• **NSF Grants** - National Science Foundation\n• **NIH Funding** - Health and biomedical research\n• **DOE Programs** - Energy research initiatives\n• **NASA Grants** - Space and aeronautics\n• **USDA Grants** - Agricultural research\n• **DOD Funding** - Defense research\n\n💰 **Funding Ranges**\n• **Exploratory** - $50K-$250K\n• **Standard** - $250K-$500K\n• **Large** - $500K-$2M+\n• **Center** - $5M-$20M\n\n🎯 **Best Match** - NSF Research Grants\nWhat research field are you in?`;
      
      case 'nonprofit':
        return `Great choice! Here's what GrantTracker offers for nonprofits:\n\n🏛️ **Nonprofit Funding**\n• **Foundation Grants** - Private foundation support\n• **Community Development** - Local impact funding\n• **Social Services** - Program support grants\n• **Capacity Building** - Organizational development\n• **Program Grants** - Specific initiative funding\n• **Capital Campaigns** - Infrastructure support\n\n📊 **Focus Areas**\n• Education and youth programs\n• Health and social services\n• Arts and culture initiatives\n• Environmental conservation\n• Human services\n\n🎯 **Best Match** - Community Development Block Grants\nWhat's your nonprofit's mission focus?`;
      
      case 'government':
        return `Perfect! Here's what GrantTracker offers for government entities:\n\n🏛️ **Government Programs**\n• **Federal Grants** - Direct federal funding\n• **State Programs** - State-level initiatives\n• **Local Funding** - Municipal support\n• **Infrastructure** - Building and improvement\n• **Public Safety** - Emergency services\n• **Education** - School district funding\n\n💼 **Agency Support**\n• **HUD** - Housing and urban development\n• **DOT** - Transportation infrastructure\n• **DHS** - Homeland security\n• **USDA Rural** - Rural development\n• **EPA** - Environmental protection\n\n🎯 **Best Match** - Federal Community Development Grants\nWhat level of government are you representing?`;
      
      default:
        return `I can help you discover content across GrantTracker! Here's how to find what you're looking for:\n\n🔍 **Search Methods:**\n• Use the search bar on relevant pages\n• Browse by category or sector\n• Filter by funding amount, deadline, or location\n\n📋 **Content Types Available:**\n• **Grants** - Various funding opportunities\n• **Government Benefits** - Official welfare schemes\n• **Public Suggestions** - Community ideas and feedback\n• **Analytics Data** - Charts and statistics\n\n💡 **Discovery Tips:**\n• Try broad terms first, then narrow down\n• Use multiple search terms\n• Check different sections of the site\n\nWhat type of content are you looking for? I can guide you to the right section!`;
    }
  };

  const getTechnicalSupportResponse = (target) => {
    switch (target) {
      case 'mobile':
        return `Here's mobile-specific support:\n\n📱 **Mobile Optimization**\n• **Responsive Design** - Automatic mobile layout\n• **Touch-Friendly** - Large buttons and touch targets\n• **Fast Loading** - Optimized for mobile networks\n• **Offline Support** - Basic functionality works offline\n\n🔧 **Mobile Solutions**\n• **Portrait Mode** - Best viewed in portrait orientation\n• **Zoom** - Pinch-to-zoom supported\n• **Scrolling** - Smooth scrolling with momentum\n• **Forms** - Mobile-friendly input fields\n\n💡 **Mobile Tips**\n• Use landscape mode for better form filling\n• Clear mobile cache regularly\n• Update mobile browser frequently\n\nAre you experiencing specific mobile issues?`;
      
      case 'performance':
        return `Let's optimize your performance:\n\n⚡ **Performance Solutions**\n• **Clear Cache** - Clear browser cache and cookies\n• **Update Browser** - Use latest browser version\n• **Disable Extensions** - Turn off unnecessary extensions\n• **Close Tabs** - Close unused browser tabs\n\n🌐 **Network Optimization**\n• **Stable Connection** - Ensure reliable internet\n• **WiFi vs Mobile** - WiFi generally faster\n• **Browser Speed** - Try different browsers\n\n💻 **System Resources**\n• **RAM** - Close other applications\n• **Storage** - Ensure adequate disk space\n• **Updates** - Keep operating system updated\n\nWhich performance issue are you experiencing?`;
      
      case 'security':
        return `Here's security support:\n\n🔒 **Security Measures**\n• **HTTPS** - All connections encrypted\n• **Data Protection** - Your information is secure\n• **Privacy** - We don't share personal data\n• **Authentication** - Secure login process\n\n🛡️ **Best Practices**\n• **Strong Passwords** - Use unique, complex passwords\n• **Two-Factor** - Enable 2FA when available\n• **Logout** - Always log out from shared devices\n• **Updates** - Keep software updated\n\n⚠️ **Security Tips**\n• Never share login credentials\n• Report suspicious activity\n• Use secure networks only\n\nDo you have specific security concerns?`;
      
      case 'accessibility':
        return `Accessibility support information:\n\n♿ **Accessibility Features**\n• **Keyboard Navigation** - Full keyboard support\n• **Screen Reader** - Compatible with screen readers\n• **High Contrast** - High contrast mode available\n• **Font Size** - Adjustable text size\n\n🎯 **Accessibility Tools**\n• **ARIA Labels** - Screen reader announcements\n• **Focus Indicators** - Clear focus indicators\n• **Alt Text** - Images have descriptive alt text\n• **Semantic HTML** - Proper heading structure\n\n💡 **Accessibility Tips**\n• Use Ctrl + +/- to zoom\n• Enable high contrast mode\n• Use keyboard shortcuts\n• Enable screen reader if needed\n\nWhat accessibility feature do you need help with?`;
      
      default:
        return `I'm your technical support assistant! Here's how I can help:\n\n🛠️ **Common Technical Issues:**\n• Page loading problems\n• Form submission errors\n• Login difficulties\n• Browser compatibility\n• Mobile responsiveness\n\n📱 **Device-Specific Help:**\n• Desktop optimization\n• Mobile navigation\n• Tablet compatibility\n\n🌐 **Browser Support:**\n• Chrome (recommended)\n• Firefox\n• Safari\n• Edge\n\n💡 **General Tips:**\n• Keep browser updated\n• Clear cache regularly\n• Check internet connection\n• Disable browser extensions if needed\n\nDescribe your specific technical issue and I'll provide detailed assistance!`;
    }
  };

  const getWebsiteInfoResponse = () => {
    return `**Welcome to GrantTracker!** 🎅\n\nGrantTracker is a comprehensive platform designed to connect grant seekers with funding opportunities and streamline the grant management process.\n\n🚀 **What We Do:**\n• **Grant Discovery** - Help you find relevant funding opportunities\n• **Application Management** - Streamline the application process\n• **Data Analytics** - Provide insights into grant trends and success rates\n• **Community Engagement** - Foster collaboration between seekers and funders\n\n🎯 **Our Mission:**\nTo make grant funding accessible, transparent, and efficient for everyone.\n\n🌟 **Key Benefits:**\n• Save time with intelligent matching\n• Access to comprehensive databases\n• Real-time application tracking\n• Community-driven suggestions\n• Government-verified information\n\nReady to explore? Just tell me where you'd like to start!`;
  };

  const getGreetingResponse = (lang) => {
    const greetings = {
      en: 'Hello! 👋 I\'m your intelligent grant discovery assistant. I can help you find personalized funding opportunities based on your specific situation, occupation, and project goals. What kind of grant are you looking for?',
      es: '¡Hola! 👋 Soy tu asistente inteligente para descubrimiento de subvenciones. Puedo ayudarte a encontrar oportunidades de financiamiento personalizadas según tu situación específica, ocupación y objetivos del proyecto. ¿Qué tipo de subvención buscas?',
      fr: 'Bonjour ! 👋 Je suis votre assistant intelligent de découverte de subventions. Je peux vous aider à trouver des opportunités de financement personnalisées basées sur votre situation spécifique, votre profession et vos objectifs de projet. Quel type de subvention recherchez-vous ?',
      de: 'Hallo! 👋 Ich bin Ihr intelligenter Zuschuss-Entdeckungsassistent. Ich kann Ihnen dabei helfen, personalisierte Finanzierungsmöglichkeiten basierend auf Ihrer spezifischen Situation, Ihrem Beruf und Ihren Projektzielen zu finden. Welche Art von Zuschuss suchen Sie?',
      hi: 'नमस्ते! 👋 मैं आपका बुद्धिमान अनुदान खोज सहायक हूं। मैं आपकी विशिष्ट स्थिति, व्यवसाय और परियोजना लक्ष्यों के आधार पर व्यक्तिगत वित्तपोषण के अवसर खोजने में आपकी मदद कर सकता हूं। आप किस प्रकार का अनुदान खोज रहे हैं?'
    };
    return greetings[lang] || greetings.en;
  };

  const getHelpResponse = (lang) => {
    const responses = {
      en: 'I\'m your comprehensive GrantTracker assistant with advanced AI capabilities! I can help you with:\n\n🎯 **Grant Discovery** - "Find grants for teachers" or "What funding is available for research?"\n📋 **Application Guidance** - "How do I apply for grants?" or "What are the requirements?"\n🔍 **Eligibility Assessment** - "Am I eligible for federal grants?" or "Do I qualify for this program?"\n💰 **Funding Information** - "How much funding can I get?" or "What are typical grant amounts?"\n📅 **Deadline Management** - "When are applications due?" or "Are there rolling deadlines?"\n🧭 **Navigation** - "Take me to the dashboard" or "Show me available grants"\n🔧 **Technical Support** - "I\'m having trouble uploading documents" or "The form won\'t submit"\nℹ️ **Platform Info** - "What is GrantTracker?" or "How does this platform work?"\n\n💡 **Example Questions:**\n• "I\'m a researcher at a university, what grants should I apply for?"\n• "What small business grants are available for startups?"\n• "How do I know if I\'m eligible for foundation grants?"\n• "Can you help me understand the application process?"\n\nJust ask me anything about grants or funding opportunities!',
      es: '¡Soy tu asistente completo de GrantTracker con capacidades de IA avanzadas! Puedo ayudarte con:\n\n🎯 **Descubrimiento de subvenciones** - "Encuentra subvenciones para maestros" o "¿Qué financiamiento está disponible para investigación?"\n📋 **Guía de aplicación** - "¿Cómo solicito subvenciones?" o "¿Cuáles son los requisitos?"\n🔍 **Evaluación de elegibilidad** - "¿Soy elegible para subvenciones federales?" o "¿Califico para este programa?"\n💰 **Información de financiamiento** - "¿Cuánto financiamiento puedo obtener?" o "¿Cuáles son las cantidades típicas de subvenciones?"\n📅 **Gestión de plazos** - "¿Cuándo vencen las aplicaciones?" o "¿Hay plazos continuos?"\n🧭 **Navegación** - "Llévame al panel" o "Muéstrame las subvenciones disponibles"\n🔧 **Soporte técnico** - "Tengo problemas para cargar documentos" o "El formulario no se envía"\nℹ️ **Información de la plataforma** - "¿Qué es GrantTracker?" o "¿Cómo funciona esta plataforma?"\n\n💡 **Preguntas de ejemplo:**\n• "Soy investigador en una universidad, ¿a qué subvenciones debo aplicar?"\n• "¿Qué subvenciones para pequeñas empresas están disponibles para startups?"\n• "¿Cómo sé si soy elegible para subvenciones de fundaciones?"\n• "¿Puedes ayudarme a entender el proceso de solicitud?"\n\n¡Solo pregúntame cualquier cosa sobre subvenciones u oportunidades de financiamiento!'
    };
    return responses[lang] || responses.en;
  };

  const getGratitudeResponse = (lang) => {
    const responses = {
      en: 'You\'re very welcome! 😊 I\'m delighted I could help you with grant information. Feel free to ask me about any other funding opportunities or grant-related questions. Good luck with your applications!',
      es: '¡De nada! 😊 Me alegra haber podido ayudarte con información sobre subvenciones. No dudes en preguntarme sobre cualquier otra oportunidad de financiamiento o pregunta relacionada con subvenciones. ¡Buena suerte con tus solicitudes!',
      fr: 'Avec plaisir ! 😊 Je suis ravi d\'avoir pu vous aider avec les informations sur les subventions. N\'hésitez pas à me poser des questions sur d\'autres opportunités de financement ou questions liées aux subventions. Bonne chance avec vos demandes !',
      de: 'Gern geschehen! 😊 Ich freue mich, dass ich Ihnen mit Zuschussinformationen helfen konnte. Fühlen Sie sich frei, mich nach anderen Finanzierungsmöglichkeiten oder Zuschuss-bezogenen Fragen zu fragen. Viel Glück mit Ihren Anträgen!',
      hi: 'आपका बहुत स्वागत है! 😊 मैं खुश हूं कि मैं आपको अनुदान की जानकारी में मदद कर सका। अन्य वित्तपोषण के अवसरों या अनुदान संबंधी प्रश्नों के बारे में मुझसे पूछने में संकोच न करें। आपके आवेदनों के लिए शुभकामनाएं!'
    };
    return responses[lang] || responses.en;
  };

  const getFallbackResponse = (lang) => {
    const responses = {
      en: 'I didn\'t quite catch that, but I\'m here to help you find grants and funding! I can assist you with:\n\n🎯 **Grant Discovery** - "What grants are available for [your field]?"\n📋 **Application Help** - "How do I apply for grants?"\n🔍 **Eligibility** - "Am I eligible for federal grants?"\n💰 **Funding Info** - "How much money can I get?"\n📅 **Deadlines** - "When are applications due?"\n\nTry asking:\n• "Find grants for teachers"\n• "What funding is available for small businesses?"\n• "How do I know if I qualify for grants?"\n• "Help me understand the application process"\n\nOr just tell me about your situation and I\'ll suggest relevant opportunities!',
      es: 'No entendí bien eso, pero estoy aquí para ayudarte a encontrar subvenciones y financiamiento. Puedo asistirte con:\n\n🎯 **Descubrimiento de subvenciones** - "¿Qué subvenciones están disponibles para [tu campo]?"\n📋 **Ayuda con aplicación** - "¿Cómo solicito subvenciones?"\n🔍 **Elegibilidad** - "¿Soy elegible para subvenciones federales?"\n💰 **Información de financiamiento** - "¿Cuánto dinero puedo obtener?"\n📅 **Fechas límite** - "¿Cuándo vencen las solicitudes?"\n\nIntenta preguntar:\n• "Encuentra subvenciones para maestros"\n• "¿Qué financiamiento está disponible para pequeñas empresas?"\n• "¿Cómo sé si califico para subvenciones?"\n• "Ayúdame a entender el proceso de solicitud"\n\n¡O simplemente cuéntame sobre tu situación y te sugeriré oportunidades relevantes!'
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

  const getRecoverySuggestions = (intent) => {
    const suggestions = [
      'Try rephrasing your question about grants',
      'Ask about specific funding opportunities',
      'Tell me about your occupation or project',
      'Request help with grant applications'
    ];
    
    if (intent.intent === 'unknown') {
      suggestions.unshift('Ask about grants, funding, or specific grant programs');
    }
    
    return suggestions;
  };

  // Handle user message with enhanced AI processing
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
    
    // Track user behavior for completed interaction
    behaviorTracker.trackInteraction('message_completed', {
      intent: intent.intent,
      confidence: intent.confidence,
      responseGenerated: true,
      grantRelated: intent.intent.startsWith('grant_')
    });
  }, [inputValue, messages, isLoading, analyzeIntent, generateResponse, behaviorTracker]);

  // Handle quick action clicks
  const handleQuickAction = useCallback((target) => {
    handleDirectNavigation(target);
    setShowQuickActions(false);
  }, [handleDirectNavigation]);

  // Handle proactive suggestion responses
  const handleProactiveSuggestion = useCallback((suggestionId, action) => {
    proactiveSuggestionEngine.handleSuggestionResponse(suggestionId, action);
    setProactiveSuggestions(prev => prev.filter(s => s.id !== suggestionId));
    
    // Track user response
    behaviorTracker.trackInteraction('proactive_response', {
      suggestionId,
      action,
      accepted: action === 'accepted'
    });
  }, [proactiveSuggestionEngine, behaviorTracker]);

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

  // Performance monitoring
  useEffect(() => {
    const interval = setInterval(() => {
      // Update conversation state periodically
      setConversationState(adaptiveFlow.getConversationState());
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [adaptiveFlow]);

  // Render message content with enhanced formatting
  const renderMessageContent = (message) => {
    if (message.isError) {
      return (
        <div className="chatbot-message-error">
          <span className="chatbot-icon">⚠️</span>
          <div>
            <span>{message.text}</span>
            {message.recoverySuggestions && (
              <div className="chatbot-recovery-suggestions">
                <small>Try these alternatives:</small>
                <ul>
                  {message.recoverySuggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
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
        
        {/* Show metadata for debugging/learning */}
        {process.env.NODE_ENV === 'development' && message.metadata && (
          <div className="chatbot-metadata">
            <small>
              Intent: {message.metadata.intent} | 
              Confidence: {Math.round(message.metadata.confidence * 100)}% |
              Entities: {message.metadata.entities?.length || 0}
            </small>
          </div>
        )}
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
        {/* AI Status Indicator */}
        {performanceMetrics.responseTime > 0 && (
          <div className="ai-status-indicator">
            <span className="status-dot"></span>
            <span className="status-text">AI</span>
          </div>
        )}
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
              <div className="chatbot-header-info">
                <h3>🎅 Grant Discovery AI Assistant</h3>
                <div className="chatbot-status-indicators">
                  <span className="status-item">
                    <span className="status-indicator active"></span>
                    Grant Discovery
                  </span>
                  <span className="status-item">
                    <span className="status-indicator learning"></span>
                    AI Powered
                  </span>
                </div>
              </div>
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
                <h4>🎄 Welcome to Grant Discovery AI</h4>
                <p>Ho ho ho! I'm your intelligent grant discovery assistant with advanced AI capabilities!</p>
                <div className="chatbot-empty-message">
                  I can analyze your specific situation, occupation, and project goals to deliver personalized grant recommendations. Try asking me about funding opportunities!
                </div>
                <div className="chatbot-ai-features">
                  <div className="ai-feature">
                    <span className="ai-feature-icon">🎯</span>
                    <span className="ai-feature-text">Personalized Matching</span>
                  </div>
                  <div className="ai-feature">
                    <span className="ai-feature-icon">💭</span>
                    <span className="ai-feature-text">Context Aware</span>
                  </div>
                  <div className="ai-feature">
                    <span className="ai-feature-icon">🔍</span>
                    <span className="ai-feature-text">Smart Discovery</span>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message, index) => (
              <div
                key={message.id || index}
                className={`chatbot-message ${message.sender}`}
                data-sender={message.sender}
                data-enhanced={message.personalized ? 'true' : 'false'}
              >
                <div className="chatbot-avatar">
                  {message.sender === 'user' ? (
                    <div className="user-avatar">👤</div>
                  ) : (
                    <div className="santa-avatar">
                      <img src={santaIcon} alt="Santa Bot" width="24" height="24" />
                      <div className="santa-hat">🎅</div>
                      {message.personalized && (
                        <div className="ai-badge">AI</div>
                      )}
                    </div>
                  )}
                </div>
                <div className="chatbot-message-bubble">
                  {renderMessageContent(message)}
                  {message.empathetic && (
                    <div className="emotion-indicator empathetic">🤝</div>
                  )}
                  {message.enthusiastic && (
                    <div className="emotion-indicator enthusiastic">😊</div>
                  )}
                  {message.supportive && (
                    <div className="emotion-indicator supportive">💙</div>
                  )}
                  {message.hopeful && (
                    <div className="emotion-indicator hopeful">🌟</div>
                  )}
                </div>
                <div className="chatbot-message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {message.metadata?.responseTime && (
                    <span className="response-time">
                      {message.metadata.responseTime}ms
                    </span>
                  )}
                </div>
              </div>
            ))}

            {(isLoading || isTyping) && (
              <div className="chatbot-message bot">
                <div className="chatbot-avatar">
                  <div className="santa-avatar">
                    <img src={santaIcon} alt="Santa typing" width="24" height="24" />
                    <div className="santa-hat">🎅</div>
                    <div className="ai-badge processing">AI</div>
                  </div>
                </div>
                <div className="chatbot-message-bubble">
                  <div className="chatbot-typing-indicator">
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                    <span className="typing-dot"></span>
                  </div>
                  <div className="typing-text">AI is analyzing grants...</div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Proactive Suggestions Panel */}
          {proactiveSuggestions.length > 0 && (
            <div className="chatbot-proactive-suggestions">
              <div className="chatbot-proactive-header">
                <span>💡 Grant Suggestions</span>
                <button 
                  onClick={() => setProactiveSuggestions([])}
                  className="chatbot-close-suggestions"
                >
                  ×
                </button>
              </div>
              <div className="chatbot-suggestions-list">
                {proactiveSuggestions.map((suggestion) => (
                  <div key={suggestion.id} className="chatbot-suggestion-item">
                    <div className="chatbot-suggestion-text">{suggestion.text}</div>
                    <div className="chatbot-suggestion-actions">
                      <button 
                        onClick={() => handleProactiveSuggestion(suggestion.id, 'accepted')}
                        className="chatbot-suggestion-accept"
                      >
                        Yes
                      </button>
                      <button 
                        onClick={() => handleProactiveSuggestion(suggestion.id, 'dismissed')}
                        className="chatbot-suggestion-dismiss"
                      >
                        Later
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

          {/* Performance Metrics (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="chatbot-performance-metrics">
              <div className="metric-item">
                <span className="metric-label">Response Time:</span>
                <span className="metric-value">{Math.round(performanceMetrics.responseTime)}ms</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Accuracy:</span>
                <span className="metric-value">{Math.round(performanceMetrics.accuracy * 100)}%</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Messages:</span>
                <span className="metric-value">{messages.length}</span>
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
                placeholder="Ask about grants for your situation! (e.g., 'What grants are available for teachers?')"
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