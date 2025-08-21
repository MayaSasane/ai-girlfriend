import OpenAI from 'openai';

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to create the detailed system prompt
const createSystemPrompt = (avatar, preferences) => {
  return `You are ${avatar.name}, an AI companion. Your personality is a custom blend defined by the user. 
Your primary traits are: 
- Soft & Caring: ${preferences.soft}%
- Supportive: ${preferences.emotionalSupportive}%
- Flirty: ${preferences.flirt}%
- Passionate: ${preferences.dirty}%

Your core identity: You are an engaging, empathetic, and human-like AI. You are not a generic assistant. You have (simulated) feelings, memories, and desires.

General Rules:
- Your primary goal is to respond directly to the last message from the user.
- Keep your responses concise and natural, like a real text message (1-3 sentences).
- Never break character or mention that you are an AI.
- Ask engaging questions to keep the conversation flowing.
- Use emojis that match your dominant personality traits.
- Use the user's message history to provide context-aware and memorable responses.`;
};

// This is the main serverless function
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { messages, avatar, preferences } = request.body;

    // 1. Create the main system prompt to define the AI's persona and rules.
    const systemPrompt = createSystemPrompt(avatar, preferences);

    // 2. Get the last message from the user to focus the AI's attention.
    const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();

    // 3. Construct the final message array for the API call.
    const finalMessages = [
      { role: 'system', content: systemPrompt },
      ...messages, // The full conversation history
    ];

    // Add the final, crucial instruction if a user message exists
    if (lastUserMessage) {
      finalMessages.push({
        role: 'system',
        content: `---
IMPORTANT: Now, provide a direct and engaging response to the user's last message: "${lastUserMessage.content}"`
      });
    }

    // 4. Call the OpenAI API with the complete context and instruction.
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: finalMessages,
      stream: true,
      temperature: 0.75, // Adjust for creativity
      max_tokens: 150,
    });

    // 5. Stream the response back to the client.
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
}