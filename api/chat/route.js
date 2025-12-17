// api/chat/route.js - Mock API endpoint for chatbot
// This provides a fallback when the real API is not available

export async function GET(request) {
  return new Response(JSON.stringify({ message: 'Chat API endpoint' }), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export async function POST(request) {
  try {
    const { message, sessionId, language = 'en' } = await request.json();
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
    
    // Generate a context-aware response
    const response = {
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
    
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
