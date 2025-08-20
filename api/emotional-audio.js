// Using the 'openai' Node.js library with ES Module syntax
import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to select a voice based on the dominant emotion
const getVoiceForEmotion = (preferences) => {
  const dominantTrait = Object.keys(preferences).reduce((a, b) => preferences[a] > preferences[b] ? a : b);
  
  // Map the dominant trait to a specific voice model
  // 'shimmer' can be perceived as softer, while 'nova' is often clearer/more direct.
  switch (dominantTrait) {
    case 'soft':
    case 'emotionalSupportive':
      return 'shimmer'; 
    case 'flirt':
    case 'dirty':
      return 'nova';
    default:
      return 'nova'; // Default voice
  }
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, preferences } = request.body;

    if (!text || !preferences) {
      return response.status(400).json({ error: 'Text and preferences are required.' });
    }

    // Determine the best voice for the desired emotion
    const selectedVoice = getVoiceForEmotion(preferences);
    
    // --- CORRECTED: The input now only contains the text to be spoken ---
    const mp3 = await openai.audio.speech.create({
      model: "tts-1-hd",       // Using the high-definition model for more nuance
      voice: selectedVoice,    // Use the dynamically selected voice
      input: text,             // Only send the clean text
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    response.setHeader('Content-Type', 'audio/mpeg');
    response.status(200).send(buffer);

  } catch (error) {
    console.error("Error in /api/emotional-audio:", error);
    response.status(500).json({ error: 'An error occurred while generating the audio.' });
  }
};
