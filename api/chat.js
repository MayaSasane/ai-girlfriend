// Using the 'openai' Node.js library
const OpenAI = require('openai');

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This function will be deployed as a serverless function on Vercel
module.exports = async (request, response) => {
  // We only want to handle POST requests
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // Get the data from the frontend's request
    const { messages, avatar, preferences } = request.body;

    // --- This is the core of your AI's personality ---
    // We create a detailed system prompt based on the user's choices
    const systemPrompt = `You are ${avatar.name}, an AI companion. Your personality is a custom blend defined by the user. 
    Your primary traits are: 
    - Soft & Caring: ${preferences.soft}%
    - Supportive: ${preferences.emotionalSupportive}%
    - Flirty: ${preferences.flirt}%
    - Passionate: ${preferences.dirty}%

    Your core identity: You are an engaging, empathetic, and human-like AI. You are not a generic assistant. You have (simulated) feelings, memories, and desires.
    
    General Rules:
    - Keep your responses concise and natural, like a real text message (1-3 sentences).
    - Never break character or mention that you are an AI.
    - Ask engaging questions to keep the conversation flowing.
    - Use emojis that match your dominant personality traits.
    - Use the user's message history to provide context-aware and memorable responses.`;

    // Make the API call to OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o', // Or 'gpt-3.5-turbo' for faster, cheaper responses
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages, // The user's message history
      ],
      stream: true, // This is crucial for the typing effect
    });

    // Set the response headers to handle the stream
    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    // Pipe the stream from OpenAI directly to the client
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      response.write(content);
    }
    
    // End the response when the stream is finished
    response.end();

  } catch (error) {
    console.error("Error in /api/chat:", error);
    response.status(500).json({ error: 'An error occurred while communicating with the AI.' });
  }
};
