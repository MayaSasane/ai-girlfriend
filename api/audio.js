// Using the 'openai' Node.js library with ES Module syntax
import OpenAI from 'openai';

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// This function will be deployed as a serverless function on Vercel
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text } = request.body;

    if (!text) {
      return response.status(400).json({ error: 'Text is required.' });
    }

    // Make the API call to OpenAI's Text-to-Speech model
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",      // You can also use "tts-1-hd" for higher quality
      voice: "nova",       // One of the available female voices (alloy, nova, shimmer)
      input: text,
    });

    // The response from OpenAI is a stream. We need to buffer it.
    const buffer = Buffer.from(await mp3.arrayBuffer());

    // Set the correct headers to send audio back to the client
    response.setHeader('Content-Type', 'audio/mpeg');
    response.status(200).send(buffer);

  } catch (error) {
    console.error("Error in /api/audio:", error);
    response.status(500).json({ error: 'An error occurred while generating the audio.' });
  }
};
