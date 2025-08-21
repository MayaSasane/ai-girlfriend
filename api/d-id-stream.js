// api/d-id-stream.js

/**
 * This is a secure proxy to the D-ID API, running as a serverless function.
 */

/**
 * Removes emoji characters from a string.
 * @param {string} text The input string that might contain emojis.
 * @returns {string} The sanitized string with emojis removed.
 */
function removeEmojis(text) {
  if (!text) return "";
  // This regex covers most emoji ranges, symbols, and pictographs
  return text.replace(/([\u2700-\u27BF]|[\uE000-\uF8FF]|\uD83C[\uDC00-\uDFFF]|\uD83D[\uDC00-\uDFFF]|[\u2011-\u26FF]|\uD83E[\uDD10-\uDDFF])/g, '');
}
export default async function handler(request, response) {
  const D_ID_KEY = process.env.D_ID_API_KEY;

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { type, payload } = request.body;

    // Route 1: Create a new streaming session
    if (type === 'CREATE_STREAM') {
      // Reverted to dynamic URL from payload, which is the correct final implementation
    //   const { avatarImageUrl } = payload;
    const avatarImageUrl = "https://ai-girlfriend-lilac.vercel.app/pamela.png";
      console.log("Creating D-ID stream with avatar image URL:", avatarImageUrl);
      const apiResponse = await fetch('https://api.d-id.com/talks/streams', {
        method: 'POST',
        headers: { 'Authorization': `Basic ${D_ID_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ source_url: avatarImageUrl }),
      });
      const data = await apiResponse.json();
      console.log("D-ID stream created:", data);
      return response.status(apiResponse.status).json(data);
    }

    // Route 2: Start the stream connection
    if (type === 'START_STREAM') {
      const { streamId, answer, sessionId } = payload;
      const apiResponse = await fetch(`https://api.d-id.com/talks/streams/${streamId}/sdp`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${D_ID_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer, session_id: sessionId }),
      });
     
      const data = await apiResponse.json();
      console.log("D-ID stream started:", data);
      return response.status(apiResponse.status).json(data);
    }
    
    // --- NEW: Route to handle ICE candidates for WebRTC ---
    if (type === 'ADD_ICE_CANDIDATE') {
        const { streamId, candidate, sessionId } = payload;
        const apiResponse = await fetch(`https://api.d-id.com/talks/streams/${streamId}/ice`, {
            method: 'POST',
            headers: { 'Authorization': `Basic ${D_ID_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ candidate, session_id: sessionId }),
        });
        const data = await apiResponse.json();
        console.log("D-ID ICE candidate added:", data);
        return response.status(apiResponse.status).json(data);
    }


    // Route 4: Send text for the avatar to speak
    if (type === 'SUBMIT_TALK') {
      const { streamId, text, sessionId } = payload;
        const cleanText = removeEmojis(text).trim(); // Also trim whitespace
      console.log("Submitting talk to D-ID stream:", { streamId, cleanText, sessionId });
      const apiResponse = await fetch(`https://api.d-id.com/talks/streams/${streamId}`, {
        method: 'POST',
        headers: { 'Authorization': `Basic ${D_ID_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: cleanText,
            voice: 'en-US-EmmaNeural'
          },
          config: { stitch: true },
          session_id: sessionId,
        }),
      });

      const data = await apiResponse.json();
      console.log("D-ID talk submitted:", data);
      return response.status(apiResponse.status).json(data);
    }

    return response.status(400).json({ error: 'Invalid request type' });

  } catch (error) {
    console.error('Error in D-ID serverless function:', error.message);
    response.status(500).json({ error: 'D-ID API interaction failed' });
  }
}