// Using the 'openai' Node.js library with ES Module syntax
import OpenAI from 'openai';
console.log("Loading OpenAI client...");

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});
console.log("OpenAI client initialized.");
console.log("API Key:", process.env.OPENAI_API_KEY ? "Loaded" : "Not Loaded");

// This function will be deployed as a serverless function on Vercel
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, avatar, preferences } = request.body;
    console.log("Received request body:", request.body);
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

    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages,
      ],
      stream: true,
    });

    response.setHeader('Content-Type', 'text/event-stream');
    response.setHeader('Cache-Control', 'no-cache');
    response.setHeader('Connection', 'keep-alive');

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      response.write(content);
    }
    
    response.end();

  } catch (error) {
    console.error("Error in /api/chat:", error);
    response.status(500).json({ error: 'An error occurred while communicating with the AI.' });
  }
};
