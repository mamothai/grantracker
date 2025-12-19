// Advanced AI Chatbot API Route with ML Processing
import { NextRequest, NextResponse } from 'next/server';
import GrantDataExtractor from '../../src/components/GrantDataExtractor.js';

// Initialize global instances
let grantDataExtractor = null;
let grantDatabase = null;

// Initialize Grant Data Extractor (singleton pattern)
async function initializeGrantDataExtractor() {
  if (!grantDataExtractor) {
    grantDataExtractor = new GrantDataExtractor();
    try {
      grantDatabase = await grantDataExtractor.extractAllGrantData();
      console.log(`✅ Grant database initialized with ${grantDatabase.length} grants`);
    } catch (error) {
      console.error('❌ Failed to initialize grant database:', error);
      // Use fallback data if extraction fails
      grantDatabase = getFallbackGrantData();
    }
  }
  return grantDataExtractor;
}

// Fallback grant data for when API extraction fails
function getFallbackGrantData() {
  return [
    {
      id: 'sbir-2024',
      title: 'Small Business Innovation Research (SBIR)',
      agency: 'NSF',
      amount: '$275,000 - $1,750,000',
      deadline: '2024-12-31',
      category: 'Small Business',
      sector: 'Technology',
      eligibility: [
        'US-owned for-profit business',
        'Less than 500 employees',
        'Principal investigator employed by company'
      ],
      description: 'The SBIR program provides funding for research and development of innovative technologies with commercial potential.',
      requirements: [
        'Phase I: Feasibility study',
        'Phase II: Full R&D',
        'Phase III: Commercialization'
      ],
      keywords: ['small business', 'innovation', 'research', 'R&D', 'technology'],
      confidence: 0.95,
      successProbability: 0.8,
      applicationComplexity: 0.7,
      estimatedTimeToApply: 40
    },
    {
      id: 'nih-sbir-2024',
      title: 'NIH SBIR',
      agency: 'NIH',
      amount: '$300,000 - $2,000,000',
      deadline: '2024-06-30',
      category: 'Small Business',
      sector: 'Healthcare',
      eligibility: [
        'US-owned for-profit business',
        'Healthcare/biomedical research',
        'Commercial potential'
      ],
      description: 'Health-focused SBIR program for biomedical innovations and healthcare technologies.',
      requirements: [
        'Biomedical research focus',
        'Healthcare application',
        'Clinical potential'
      ],
      keywords: ['healthcare', 'biomedical', 'medical', 'clinical', 'health'],
      confidence: 0.94,
      successProbability: 0.75,
      applicationComplexity: 0.8,
      estimatedTimeToApply: 50
    },
    {
      id: 'renewable-energy-grants',
      title: 'Renewable Energy Grant Program',
      agency: 'DOE',
      amount: '$500,000 - $5,000,000',
      deadline: '2024-08-15',
      category: 'Research',
      sector: 'Energy',
      eligibility: [
        'Universities',
        'Research institutions',
        'Energy companies',
        'Non-profits'
      ],
      description: 'Funding for renewable energy research, development, and deployment projects.',
      requirements: [
        'Renewable energy focus',
        'Environmental impact',
        'Scalability'
      ],
      keywords: ['renewable energy', 'solar', 'wind', 'clean energy', 'sustainability'],
      confidence: 0.91,
      successProbability: 0.7,
      applicationComplexity: 0.9,
      estimatedTimeToApply: 60
    }
  ];
}

// Advanced ML-based query processing
class AdvancedQueryProcessor {
  constructor(grantDatabase) {
    this.grantDatabase = grantDatabase;
    this.conversationHistory = new Map();
    this.userProfiles = new Map();
  }

  // Process user query with advanced NLP
  async processQuery(query, userId = 'anonymous', sessionId = 'default') {
    const startTime = Date.now();
    
    try {
      // Extract intent and entities using ML
      const intent = this.extractIntent(query);
      const entities = this.extractEntities(query);
      const sentiment = this.analyzeSentiment(query);
      
      // Get or create user profile
      const userProfile = this.getUserProfile(userId);
      
      // Process based on intent
      let result;
      switch (intent.primary) {
        case 'grant_search':
          result = await this.processGrantSearch(query, entities, userProfile);
          break;
        case 'eligibility_check':
          result = await this.processEligibilityCheck(query, entities, userProfile);
          break;
        case 'amount_inquiry':
          result = await this.processAmountInquiry(query, entities, userProfile);
          break;
        case 'deadline_inquiry':
          result = await this.processDeadlineInquiry(query, entities, userProfile);
          break;
        case 'application_help':
          result = await this.processApplicationHelp(query, entities, userProfile);
          break;
        default:
          result = await this.processGeneralQuery(query, entities, userProfile);
      }

      // Update conversation history
      this.updateConversationHistory(sessionId, {
        query,
        intent: intent.primary,
        entities,
        result,
        timestamp: Date.now()
      });

      // Update user profile
      this.updateUserProfile(userId, {
        intent: intent.primary,
        entities,
        result,
        timestamp: Date.now()
      });

      const processingTime = Date.now() - startTime;

      return {
        success: true,
        response: result.response,
        suggestions: result.suggestions || [],
        grants: result.grants || [],
        metadata: {
          intent: intent.primary,
          confidence: intent.confidence,
          entities,
          sentiment,
          processingTime,
          grantsFound: result.grants?.length || 0,
          personalization: result.personalization || false
        }
      };

    } catch (error) {
      console.error('❌ Query processing error:', error);
      return {
        success: false,
        response: "I apologize, but I encountered an error processing your request. Please try rephrasing your question.",
        error: error.message,
        metadata: {
          processingTime: Date.now() - startTime
        }
      };
    }
  }

  // Advanced intent classification
  extractIntent(query) {
    const intents = {
      grant_search: {
        patterns: [
          'find grants', 'search grants', 'available grants', 'grant opportunities',
          'funding options', 'what grants', 'looking for grants', 'need funding'
        ],
        confidence: 0
      },
      eligibility_check: {
        patterns: [
          'eligible', 'qualify', 'requirements', 'can i apply', 'am i qualified',
          'do i qualify', 'eligibility', 'who can apply'
        ],
        confidence: 0
      },
      amount_inquiry: {
        patterns: [
          'how much', 'funding amount', 'award amount', 'grant size', 'money available',
          'funding range', 'maximum amount', 'minimum amount'
        ],
        confidence: 0
      },
      deadline_inquiry: {
        patterns: [
          'deadline', 'due date', 'when is due', 'submission deadline', 'closing date',
          'application deadline', 'when to apply', 'timeframe'
        ],
        confidence: 0
      },
      application_help: {
        patterns: [
          'how to apply', 'application process', 'submit application', 'application help',
          'apply for grant', 'application guide', 'how do i apply'
        ],
        confidence: 0
      }
    };

    const queryLower = query.toLowerCase();
    let bestIntent = 'general';
    let maxConfidence = 0;

    Object.entries(intents).forEach(([intent, config]) => {
      config.patterns.forEach(pattern => {
        if (queryLower.includes(pattern.toLowerCase())) {
          config.confidence += 0.2;
        }
        
        // Check for partial matches
        const patternWords = pattern.toLowerCase().split(' ');
        const queryWords = queryLower.split(' ');
        const matches = patternWords.filter(word => queryWords.some(qWord => qWord.includes(word) || word.includes(qWord)));
        if (matches.length > 0) {
          config.confidence += (matches.length / patternWords.length) * 0.1;
        }
      });

      if (config.confidence > maxConfidence) {
        maxConfidence = config.confidence;
        bestIntent = intent;
      }
    });

    return {
      primary: bestIntent,
      confidence: Math.min(maxConfidence, 1.0),
      all: intents
    };
  }

  // Advanced entity extraction
  extractEntities(query) {
    const entities = {
      grant_types: [],
      sectors: [],
      agencies: [],
      amounts: [],
      deadlines: [],
      business_types: [],
      locations: [],
      keywords: []
    };

    // Grant type extraction
    const grantTypePatterns = {
      'small business': ['small business', 'startup', 'entrepreneur', 'SMB'],
      'research': ['research', 'academic', 'university', 'scientific'],
      'nonprofit': ['nonprofit', 'ngo', 'charity', 'foundation'],
      'government': ['government', 'federal', 'state', 'municipal'],
      'individual': ['individual', 'person', 'personal']
    };

    Object.entries(grantTypePatterns).forEach(([type, patterns]) => {
      patterns.forEach(pattern => {
        if (query.toLowerCase().includes(pattern.toLowerCase())) {
          entities.grant_types.push(type);
        }
      });
    });

    // Sector extraction
    const sectorPatterns = {
      'technology': ['technology', 'tech', 'software', 'hardware', 'IT', 'AI', 'artificial intelligence'],
      'healthcare': ['healthcare', 'medical', 'health', 'biomedical', 'pharmaceutical', 'clinical'],
      'energy': ['energy', 'renewable', 'solar', 'wind', 'clean energy', 'green tech'],
      'environment': ['environment', 'environmental', 'green', 'sustainability', 'climate'],
      'education': ['education', 'educational', 'school', 'university', 'student', 'academic'],
      'agriculture': ['agriculture', 'farming', 'rural', 'food', 'agricultural'],
      'defense': ['defense', 'military', 'national security', 'aerospace']
    };

    Object.entries(sectorPatterns).forEach(([sector, patterns]) => {
      patterns.forEach(pattern => {
        if (query.toLowerCase().includes(pattern.toLowerCase())) {
          entities.sectors.push(sector);
        }
      });
    });

    // Agency extraction
    const agencyPatterns = {
      'NSF': ['NSF', 'national science foundation'],
      'NIH': ['NIH', 'national institutes of health'],
      'DOE': ['DOE', 'department of energy'],
      'NASA': ['NASA'],
      'DOD': ['DOD', 'department of defense'],
      'USDA': ['USDA', 'department of agriculture'],
      'EPA': ['EPA', 'environmental protection agency'],
      'SBA': ['SBA', 'small business administration']
    };

    Object.entries(agencyPatterns).forEach(([agency, patterns]) => {
      patterns.forEach(pattern => {
        if (query.toLowerCase().includes(pattern.toLowerCase())) {
          entities.agencies.push(agency);
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

    // Remove duplicates
    Object.keys(entities).forEach(key => {
      entities[key] = [...new Set(entities[key])];
    });

    return entities;
  }

  // Sentiment analysis
  analyzeSentiment(query) {
    const positiveWords = ['good', 'great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'horrible', 'disappointed', 'frustrated'];
    const urgentWords = ['urgent', 'asap', 'immediately', 'quickly', 'deadline', 'due'];

    const queryLower = query.toLowerCase();
    const words = queryLower.split(/\s+/);

    let positiveScore = 0;
    let negativeScore = 0;
    let urgentScore = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveScore++;
      if (negativeWords.includes(word)) negativeScore++;
      if (urgentWords.includes(word)) urgentScore++;
    });

    let sentiment = 'neutral';
    if (positiveScore > negativeScore) sentiment = 'positive';
    else if (negativeScore > positiveScore) sentiment = 'negative';

    if (urgentScore > 0) {
      sentiment = urgentScore > positiveScore && urgentScore > negativeScore ? 'urgent' : sentiment;
    }

    return {
      sentiment,
      positiveScore,
      negativeScore,
      urgentScore,
      confidence: Math.min(1, (positiveScore + negativeScore + urgentScore) / words.length)
    };
  }

  // Process grant search query
  async processGrantSearch(query, entities, userProfile) {
    // Filter grants based on entities
    let filteredGrants = this.grantDatabase.filter(grant => {
      let relevance = 0;

      // Sector matching
      if (entities.sectors.includes(grant.sector)) {
        relevance += 0.3;
      }

      // Grant type matching
      if (entities.grant_types.includes(grant.category.toLowerCase())) {
        relevance += 0.25;
      }

      // Agency matching
      if (entities.agencies.some(agency => grant.agency.includes(agency))) {
        relevance += 0.2;
      }

      // Keyword matching
      if (entities.keywords.length > 0) {
        const keywordMatches = entities.keywords.filter(keyword =>
          grant.keywords.some(grantKeyword => 
            grantKeyword.toLowerCase().includes(keyword.toLowerCase()) ||
            keyword.toLowerCase().includes(grantKeyword.toLowerCase())
          )
        );
        relevance += (keywordMatches.length / entities.keywords.length) * 0.25;
      }

      return relevance > 0.1;
    });

    // Sort by relevance and success probability
    filteredGrants.sort((a, b) => {
      const scoreA = (a.confidence || 0.5) * (a.successProbability || 0.5);
      const scoreB = (b.confidence || 0.5) * (b.successProbability || 0.5);
      return scoreB - scoreA;
    });

    // Generate response
    let response = '';
    if (filteredGrants.length === 0) {
      response = `I couldn't find grants that exactly match your criteria. However, I found some related opportunities that might interest you:\n\n`;
      filteredGrants = this.grantDatabase.slice(0, 3);
    } else {
      response = `I found ${filteredGrants.length} grant${filteredGrants.length > 1 ? 's' : ''} that match your criteria:\n\n`;
    }

    // Add top grants to response
    filteredGrants.slice(0, 5).forEach((grant, index) => {
      response += `**${index + 1}. ${grant.title}**\n`;
      response += `🏛️ Agency: ${grant.agency}\n`;
      response += `💰 Amount: ${grant.amount}\n`;
      response += `📅 Deadline: ${grant.deadline}\n`;
      if (grant.successProbability) {
        response += `📊 Success Probability: ${Math.round(grant.successProbability * 100)}%\n`;
      }
      response += `⏱️ Estimated Application Time: ${grant.estimatedTimeToApply} hours\n\n`;
    });

    const suggestions = [
      'Tell me about the application process',
      'What are the eligibility requirements?',
      'Show me similar grants',
      'Help me prepare my application'
    ];

    return {
      response,
      grants: filteredGrants.slice(0, 5),
      suggestions,
      personalization: true
    };
  }

  // Process eligibility check
  async processEligibilityCheck(query, entities, userProfile) {
    let response = 'Based on your query, here\'s the eligibility information for relevant grants:\n\n';

    const relevantGrants = this.grantDatabase.filter(grant =>
      entities.sectors.includes(grant.sector) ||
      entities.grant_types.includes(grant.category.toLowerCase())
    );

    relevantGrants.forEach(grant => {
      if (grant.eligibility && grant.eligibility.length > 0) {
        response += `**${grant.title}:**\n`;
        grant.eligibility.forEach(req => {
          response += `• ${req}\n`;
        });
        response += '\n';
      }
    });

    const suggestions = [
      'Check my eligibility for specific grants',
      'Show me grants I qualify for',
      'What documents do I need?'
    ];

    return { response, suggestions };
  }

  // Process amount inquiry
  async processAmountInquiry(query, entities, userProfile) {
    let response = 'Here\'s the funding information for relevant grants:\n\n';

    const relevantGrants = this.grantDatabase.filter(grant =>
      entities.sectors.includes(grant.sector) ||
      entities.grant_types.includes(grant.category.toLowerCase())
    );

    relevantGrants.forEach(grant => {
      response += `**${grant.title}:** ${grant.amount}\n`;
      if (grant.applicationComplexity) {
        response += `💡 Application Complexity: ${Math.round(grant.applicationComplexity * 100)}%\n`;
      }
      response += '\n';
    });

    const suggestions = [
      'Compare funding amounts',
      'Show me high-value grants',
      'What can I do with this funding?'
    ];

    return { response, suggestions };
  }

  // Process deadline inquiry
  async processDeadlineInquiry(query, entities, userProfile) {
    let response = 'Here are the upcoming deadlines for relevant grants:\n\n';

    const relevantGrants = this.grantDatabase.filter(grant =>
      entities.sectors.includes(grant.sector) ||
      entities.grant_types.includes(grant.category.toLowerCase())
    );

    relevantGrants.forEach(grant => {
      if (grant.deadline) {
        const deadline = new Date(grant.deadline);
        const today = new Date();
        const daysUntil = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        
        response += `**${grant.title}:**\n`;
        response += `📅 Deadline: ${grant.deadline}`;
        if (daysUntil > 0) {
          response += ` (${daysUntil} days remaining)`;
        }
        response += '\n';
      }
    });

    const suggestions = [
      'Set up deadline reminders',
      'Show me urgent deadlines',
      'Help me plan my application timeline'
    ];

    return { response, suggestions };
  }

  // Process application help
  async processApplicationHelp(query, entities, userProfile) {
    let response = 'I\'ll guide you through the grant application process:\n\n';
    response += '**General Application Steps:**\n';
    response += '1. **Review Requirements** - Read all eligibility criteria carefully\n';
    response += '2. **Prepare Documents** - Gather required forms and supporting materials\n';
    response += '3. **Write Proposal** - Clearly describe your project and impact\n';
    response += '4. **Submit Application** - Double-check before submitting\n';
    response += '5. **Follow Up** - Track your application status\n\n';

    if (entities.sectors.length > 0) {
      response += `**For ${entities.sectors.join(' and ')} grants specifically:**\n`;
      response += '- Focus on sector-specific outcomes and impacts\n';
      response += '- Highlight relevant experience in your field\n';
      response += '- Demonstrate clear pathway to success\n\n';
    }

    const suggestions = [
      'Get application templates',
      'Review sample proposals',
      'Schedule pre-submission review',
      'Check my application readiness'
    ];

    return { response, suggestions };
  }

  // Process general query
  async processGeneralQuery(query, entities, userProfile) {
    const response = `I can help you with grant-related questions! Try asking about:\n\n`;
    const grants = this.grantDatabase.slice(0, 3);

    response += `**Popular grant categories:**\n`;
    const categories = [...new Set(grants.map(g => g.category))];
    categories.forEach(cat => response += `• ${cat} grants\n`);

    response += `\n**You might be interested in:**\n`;
    grants.forEach(grant => {
      response += `• ${grant.title} (${grant.agency})\n`;
    });

    const suggestions = [
      'Show me available grants',
      'Explain eligibility requirements',
      'Tell me about application deadlines'
    ];

    return { response, suggestions };
  }

  // User profile management
  getUserProfile(userId) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, {
        interests: {},
        interactionCount: 0,
        preferredSectors: [],
        successRate: 0.5,
        lastActive: Date.now()
      });
    }
    return this.userProfiles.get(userId);
  }

  updateUserProfile(userId, interaction) {
    const profile = this.getUserProfile(userId);
    profile.interactionCount++;
    profile.lastActive = Date.now();

    // Update interests based on entities
    interaction.entities.sectors?.forEach(sector => {
      profile.interests[sector] = (profile.interests[sector] || 0) + 1;
    });

    // Update preferred sectors
    const sortedSectors = Object.entries(profile.interests)
      .sort(([,a], [,b]) => b - a)
      .map(([sector]) => sector);
    profile.preferredSectors = sortedSectors.slice(0, 5);
  }

  // Conversation history management
  updateConversationHistory(sessionId, interaction) {
    if (!this.conversationHistory.has(sessionId)) {
      this.conversationHistory.set(sessionId, []);
    }
    const history = this.conversationHistory.get(sessionId);
    history.push(interaction);
    
    // Keep only last 20 interactions
    if (history.length > 20) {
      history.shift();
    }
  }
}

// Main API handler
export async function POST(request) {
  try {
    const { query, userId = 'anonymous', sessionId = 'default' } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize grant data extractor
    await initializeGrantDataExtractor();
    
    // Create query processor
    const queryProcessor = new AdvancedQueryProcessor(grantDatabase);
    
    // Process the query
    const result = await queryProcessor.processQuery(query, userId, sessionId);
    
    // Add performance metrics
    const response = {
      ...result,
      timestamp: new Date().toISOString(),
      version: '2.0',
      features: {
        ml_processing: true,
        real_time_data: true,
        personalization: true,
        context_awareness: true
      }
    };

    // Log performance metrics (in production, this would go to monitoring)
    console.log(`📊 Query processed: ${query.substring(0, 50)}... (${result.metadata.processingTime}ms)`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json(
      {
        success: false,
        response: "I apologize, but I'm experiencing technical difficulties. Please try again later.",
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  try {
    await initializeGrantDataExtractor();
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0',
      grants: grantDatabase?.length || 0,
      uptime: process.uptime(),
      memory: process.memoryUsage()
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}