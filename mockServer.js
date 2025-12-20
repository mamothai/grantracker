// Simple mock server for API endpoints
// This provides basic API responses for development

import { createServer } from 'http';
import { URL } from 'url';

const PORT = 3001;

// Mock grant data
const MOCK_GRANTS = [
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

// Helper functions
function extractIntent(query) {
  const queryLower = query.toLowerCase();
  
  // Check for holiday mode first
  if (queryLower.includes('santa') || queryLower.includes('christmas') || 
      queryLower.includes('holiday') || queryLower.includes('festive')) {
    return { primary: 'greeting_holiday', confidence: 0.98 };
  }
  
  if (queryLower.includes('find') || queryLower.includes('search') || queryLower.includes('grant') || 
      queryLower.includes('small business') || queryLower.includes('innovation') || queryLower.includes('research')) {
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
  if (queryLower.includes('hello') || queryLower.includes('hi') || queryLower.includes('hey') || 
      queryLower.includes('hola') || queryLower.includes('bonjour')) {
    
    // Multi-language support (excluding holiday which is handled above)
    if (queryLower.includes('hola')) {
      return { primary: 'greeting_spanish', confidence: 0.95 };
    }
    if (queryLower.includes('bonjour')) {
      return { primary: 'greeting_french', confidence: 0.95 };
    }
    
    return { primary: 'greeting', confidence: 0.9 };
  }
  if (queryLower.includes('help')) {
    return { primary: 'help', confidence: 0.8 };
  }
  
  return { primary: 'general', confidence: 0.5 };
}

function processAdvancedChat(query) {
  const intent = extractIntent(query);
  let response = '';
  let grants = [];
  
  switch (intent.primary) {
    case 'grant_search':
      grants = MOCK_GRANTS.filter(grant => {
        const searchTerms = query.toLowerCase().split(' ');
        const searchableText = `${grant.title} ${grant.agency} ${grant.sector} ${grant.keywords?.join(' ')}`.toLowerCase();
        return searchTerms.some(term => 
          term.length > 2 && searchableText.includes(term)
        );
      }).slice(0, 3);
      
      response = `I found ${grants.length} grant${grants.length > 1 ? 's' : ''} that match your criteria:\n\n`;
      grants.forEach((grant, index) => {
        response += `**${index + 1}. ${grant.title}**\n`;
        response += `🏛️ Agency: ${grant.agency}\n`;
        response += `💰 Amount: ${grant.amount}\n`;
        response += `📅 Deadline: ${grant.deadline}\n\n`;
      });
      break;
      
    case 'eligibility_check':
      response = 'Based on your query, here\'s the eligibility information for relevant grants:\n\n';
      MOCK_GRANTS.forEach(grant => {
        if (grant.eligibility && grant.eligibility.length > 0) {
          response += `**${grant.title}:**\n`;
          grant.eligibility.forEach(req => {
            response += `• ${req}\n`;
          });
          response += '\n';
        }
      });
      break;
      
    case 'amount_inquiry':
      response = 'Here\'s the funding information for relevant grants:\n\n';
      MOCK_GRANTS.forEach(grant => {
        response += `**${grant.title}:** ${grant.amount}\n`;
        if (grant.applicationComplexity) {
          response += `💡 Application Complexity: ${Math.round(grant.applicationComplexity * 100)}%\n`;
        }
        response += '\n';
      });
      break;
      
    case 'deadline_inquiry':
      response = 'Here are the upcoming deadlines for relevant grants:\n\n';
      MOCK_GRANTS.forEach(grant => {
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
      break;
      
    case 'greeting_holiday':
      response = '🎅 Ho ho ho! Santa here to help you find the perfect grants for your projects! What grant would you like to discover? 🎄';
      break;
      
    case 'greeting_spanish':
      response = '¡Hola! Soy tu asistente avanzado de descubrimiento de subvenciones. Puedo ayudarte a encontrar subvenciones, verificar elegibilidad, entender requisitos y navegar por la plataforma. ¿Qué te gustaría explorar?';
      break;
      
    case 'greeting_french':
      response = 'Bonjour! Je suis votre assistant avancé de découverte de subventions. Je peux vous aider à trouver des subventions, vérifier l\'éligibilité, comprendre les exigences et naviguer sur la plateforme. Que souhaitez-vous explorer?';
      break;
      
    case 'greeting':
      response = 'Hello! I\'m your advanced grant discovery assistant. I can help you find grants, check eligibility, understand requirements, and navigate the platform. What would you like to explore?';
      break;
      
    case 'help':
      response = 'I can help you with:\n\n• Finding grants and funding opportunities\n• Checking eligibility requirements\n• Understanding application processes\n• Navigating to different sections\n• Information about deadlines and amounts\n\nWhat specific area interests you?';
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
      processingTime: Math.floor(Math.random() * 500) + 200,
      grantsFound: grants.length,
      personalization: false
    }
  };
}

// Request handler
async function handleRequest(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  try {
    let response;
    
    if (pathname === '/api/chat' && req.method === 'POST') {
      // Handle chat endpoint
      const body = await getRequestBody(req);
      const { message, sessionId = 'default', language = 'en' } = body;
      
      response = {
        text: `I received your message: "${message}". This is a mock response for the chatbot. In a real implementation, this would connect to your actual backend service.`,
        timestamp: new Date().toISOString(),
        sessionId,
        language,
        metadata: {
          processed: true,
          intent: 'general',
          confidence: 0.85
        }
      };
      
    } else if (pathname === '/api/advanced-chat' && req.method === 'POST') {
      // Handle advanced chat endpoint
      const body = await getRequestBody(req);
      const { query, userId = 'anonymous', sessionId = 'default' } = body;
      
      response = processAdvancedChat(query);
      
    } else if (pathname === '/api/health' && req.method === 'GET') {
      // Health check
      response = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0',
        message: 'Mock API server is running'
      };
      
    } else {
      // Unknown endpoint
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
      return;
    }
    
    // Send response
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(response));
    
  } catch (error) {
    console.error('Request handling error:', error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

// Helper to get request body
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

// Start server
const server = createServer(handleRequest);

server.listen(PORT, () => {
  console.log(`🚀 Mock API server running on http://localhost:${PORT}`);
  console.log(`📡 Available endpoints:`);
  console.log(`   POST http://localhost:${PORT}/api/chat`);
  console.log(`   POST http://localhost:${PORT}/api/advanced-chat`);
  console.log(`   GET  http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Shutting down mock server...');
  server.close(() => {
    console.log('✅ Mock server stopped');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Shutting down mock server...');
  server.close(() => {
    console.log('✅ Mock server stopped');
    process.exit(0);
  });
});

export default server;