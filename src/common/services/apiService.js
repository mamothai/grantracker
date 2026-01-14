// Simple API service for Vite environment
// This replaces the Next.js API routes with a frontend service

import GrantDataExtractor from '../components/GrantDataExtractor.js';

// --- OpenAI Integration ---
// Add your OpenAI API key below (or set via environment variable)
const OPENAI_API_KEY = process.env.REACT_APP_OPENAI_API_KEY || 'AIzaSyAdU52wJ4z3sWP5PMIoKi2YUQMiED0O_70';

export async function askOpenAI(message, sessionId = 'default', language = 'en') {
  if (!OPENAI_API_KEY) {
    // No key, fallback to mock
    return MOCK_RESPONSES.chat.POST(message, sessionId, language);
  }
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a helpful grant discovery assistant for a government portal. Answer clearly and concisely.' },
          { role: 'user', content: message }
        ],
        user: sessionId,
        temperature: 0.7
      })
    });
    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'Sorry, I could not get a response.';
    return {
      text,
      timestamp: new Date().toISOString(),
      sessionId,
      language,
      metadata: {
        processed: true,
        intent: 'ai',
        confidence: 0.99
      }
    };
  } catch (error) {
    return {
      text: 'Sorry, there was an error connecting to the AI service.',
      timestamp: new Date().toISOString(),
      sessionId,
      language,
      metadata: { processed: false, error: true }
    };
  }
}

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
      let navigationPath = null;
      
      switch (intent.primary) {
        case 'grant_search':
          grants = grantDatabase.filter(grant => 
            query.toLowerCase().includes(grant.title.toLowerCase()) ||
            query.toLowerCase().includes(grant.agency.toLowerCase()) ||
            query.toLowerCase().includes(grant.sector.toLowerCase()) ||
            (grant.keywords && grant.keywords.some(k => query.toLowerCase().includes(k)))
          ).slice(0, 3);
          
          if (grants.length > 0) {
            response = `I found ${grants.length} grant${grants.length > 1 ? 's' : ''} that match your criteria:\n\n`;
            grants.forEach((grant, index) => {
              response += `**${index + 1}. ${grant.title}**\n`;
              response += `🏛️ Agency: ${grant.agency}\n`;
              response += `💰 Amount: ${grant.amount}\n`;
              response += `📅 Deadline: ${grant.deadline}\n\n`;
            });
            navigationPath = '/public-view';
          } else {
            response = "I couldn't find any specific grants matching your search. However, you can browse all available grants in our Public View section.";
            navigationPath = '/public-view';
          }
          break;

        case 'navigation':
          if (query.toLowerCase().includes('home')) {
            response = "Navigating you to the Home page.";
            navigationPath = '/';
          } else if (query.toLowerCase().includes('about')) {
            response = "Taking you to the About Us page.";
            navigationPath = '/about';
          } else if (query.toLowerCase().includes('creator') || query.toLowerCase().includes('login')) {
            response = "Redirecting you to the Creator Login page.";
            navigationPath = '/creator-login';
          } else if (query.toLowerCase().includes('gov') || query.toLowerCase().includes('dashboard')) {
            response = "Taking you to the Government Dashboard login.";
            navigationPath = '/gov-login';
          } else if (query.toLowerCase().includes('suggestion')) {
            response = "Opening the Suggestion Box for you.";
            navigationPath = '/suggestion-box';
          } else if (query.toLowerCase().includes('public') || query.toLowerCase().includes('view')) {
            response = "Taking you to the Public View where you can see all grants.";
            navigationPath = '/public-view';
          } else if (query.toLowerCase().includes('create') || query.toLowerCase().includes('new grant')) {
             response = "Taking you to the Create Grant page.";
             navigationPath = '/create-grant';
          } else if (query.toLowerCase().includes('benefits')) {
             response = "Taking you to the Benefits Scheme page.";
             navigationPath = '/benefits-scheme';
          } else {
            response = "I can help you navigate to: Home, About, Creator Login, Government Dashboard, Suggestion Box, Public View, Create Grant, and Benefits Scheme. Where would you like to go?";
          }
          break;

        case 'website_info':
            if (query.toLowerCase().includes('what is this') || query.toLowerCase().includes('about')) {
                response = "GranTracker is a platform designed to help users find and apply for government grants. It connects grant seekers with funding opportunities across various sectors like Agriculture, Education, Health, and more.";
            } else if (query.toLowerCase().includes('contact') || query.toLowerCase().includes('support')) {
                response = "You can reach out to our support team through the Suggestion Box page or email us at support@grantracker.com.";
                navigationPath = '/suggestion-box';
            } else {
                 response = "I can answer questions about GranTracker, its features, and how to use it. feel free to ask!";
            }
            break;
          
        default:
          response = `I can help you with grant-related questions and navigating the website! Try asking about:\n\n• Available grants (e.g., "Find agriculture grants")\n• Navigation (e.g., "Go to dashboard")\n• Website Info (e.g., "What is this website?")\n\nWhat specific area interests you?`;
      }
      
      return {
        success: true,
        response,
        suggestions: [
          'Show me available grants',
          'Go to Public View',
          'What is this website?'
        ],
        grants,
        navigationPath,
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
  
  if (queryLower.includes('go to') || queryLower.includes('navigate') || queryLower.includes('take me') || queryLower.includes('open page')) {
    return { primary: 'navigation', confidence: 0.9 };
  }
  if (queryLower.includes('find') || queryLower.includes('search') || queryLower.includes('grant') || queryLower.includes('funding')) {
    return { primary: 'grant_search', confidence: 0.8 };
  }
  if (queryLower.includes('website') || queryLower.includes('app') || queryLower.includes('what is') || queryLower.includes('contact') || queryLower.includes('support')) {
      return { primary: 'website_info', confidence: 0.8 };
  }
  
  // existing checks as fallback/additional context
  if (queryLower.includes('eligible') || queryLower.includes('qualify')) {
    return { primary: 'eligibility_check', confidence: 0.7 };
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
  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey')) {
    return { primary: 'greeting', confidence: 0.9 };
  }
  if (queryLower.includes('help')) {
    return { primary: 'help', confidence: 0.8 };
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