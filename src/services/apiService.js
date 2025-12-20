// Simple API service for Vite environment
// This replaces the Next.js API routes with a frontend service

import GrantDataExtractor from '../components/GrantDataExtractor.js';

// Mock API responses
const MOCK_RESPONSES = {
  chat: {
    POST: (message, sessionId = 'default', language = 'en') => ({
      text: `I received your message: "${message}". This is a mock response for the chatbot. In a real implementation, this would connect to your actual backend service.`,
      timestamp: new Date().toISOString(),
      sessionId,
      language,
      metadata: {
        processed: true,
        intent: 'general',
        confidence: 0.85
      }
    })
  },
  
  'advanced-chat': {
    POST: async (query, userId = 'anonymous', sessionId = 'default') => {
      // Initialize grant data extractor
      const extractor = new GrantDataExtractor();
      const grantDatabase = await extractor.extractAllGrantData();
      
      // Simple intent recognition
      const intent = extractIntent(query);
      let response = '';
      let grants = [];
      
      switch (intent.primary) {
        case 'grant_search':
          grants = grantDatabase.filter(grant => 
            query.toLowerCase().includes(grant.title.toLowerCase()) ||
            query.toLowerCase().includes(grant.agency.toLowerCase()) ||
            query.toLowerCase().includes(grant.sector.toLowerCase())
          ).slice(0, 3);
          
          response = `I found ${grants.length} grant${grants.length > 1 ? 's' : ''} that match your criteria:\n\n`;
          grants.forEach((grant, index) => {
            response += `**${index + 1}. ${grant.title}**\n`;
            response += `🏛️ Agency: ${grant.agency}\n`;
            response += `💰 Amount: ${grant.amount}\n`;
            response += `📅 Deadline: ${grant.deadline}\n\n`;
          });
          break;
          
        default:
          response = `I can help you with grant-related questions! Try asking about:\n\n• Available grants\n• Eligibility requirements\n• Application deadlines\n• Funding amounts\n\nWhat specific area interests you?`;
      }
      
      return {
        success: true,
        response,
        suggestions: [
          'Show me available grants',
          'What are the eligibility requirements?',
          'Tell me about deadlines'
        ],
        grants,
        metadata: {
          intent: intent.primary,
          confidence: intent.confidence,
          processingTime: Date.now() % 1000 + 200,
          grantsFound: grants.length,
          personalization: false
        }
      };
    }
  }
};

// Simple intent extraction
function extractIntent(query) {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('find') || queryLower.includes('search') || queryLower.includes('grant')) {
    return { primary: 'grant_search', confidence: 0.8 };
  }
  if (queryLower.includes('eligible') || queryLower.includes('qualify')) {
    return { primary: 'eligibility_check', confidence: 0.7 };
  }
  if (queryLower.includes('deadline') || queryLower.includes('due date')) {
    return { primary: 'deadline_inquiry', confidence: 0.8 };
  }
  if (queryLower.includes('amount') || queryLower.includes('money') || queryLower.includes('funding')) {
    return { primary: 'amount_inquiry', confidence: 0.7 };
  }
  if (queryLower.includes('apply') || queryLower.includes('application')) {
    return { primary: 'application_help', confidence: 0.8 };
  }
  
  return { primary: 'general', confidence: 0.5 };
}

// API Service Class
class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3001'; // Mock server URL
    this.requestDelay = 300; // Simulate network delay
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const { method = 'GET', data, ...otherOptions } = options;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.requestDelay));
    
    try {
      const url = `${this.baseUrl}/api/${endpoint}`;
      const config = {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...otherOptions.headers
        },
        ...otherOptions
      };
      
      if (data && method !== 'GET') {
        config.body = JSON.stringify(data);
      }
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // Return mock data for development
      return this.getMockResponse(endpoint, method, data);
    }
  }

  // Get mock response when API fails
  getMockResponse(endpoint, method, data) {
    const mockResponse = MOCK_RESPONSES[endpoint];
    
    if (!mockResponse || !mockResponse[method]) {
      throw new Error(`No mock response available for ${method} ${endpoint}`);
    }
    
    return mockResponse[method](...Object.values(data || {}));
  }

  // Chat endpoints
  async chat(message, sessionId, language) {
    return this.request('chat', {
      method: 'POST',
      data: { message, sessionId, language }
    });
  }

  async advancedChat(query, userId, sessionId) {
    return this.request('advanced-chat', {
      method: 'POST',
      data: { query, userId, sessionId }
    });
  }

  // Health check
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '2.0',
      message: 'API service is running'
    };
  }
}

// Export singleton instance
const apiService = new ApiService();
export default apiService;

// Also export individual methods for convenience
export const chatAPI = {
  sendMessage: (message, sessionId, language) => apiService.chat(message, sessionId, language),
  advancedQuery: (query, userId, sessionId) => apiService.advancedChat(query, userId, sessionId),
  healthCheck: () => apiService.healthCheck()
};