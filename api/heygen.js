// pages/api/heygen.js

const HEYGEN_API_KEY = process.env.HEYGEN_API_KEY;
const HEYGEN_API_BASE = "https://api.heygen.com";

// Helper function to handle API requests to Heygen
async function fetchHeygenAPI(endpoint, method, body = null) {
  const headers = {
    'Content-Type': 'application/json',
    'x-api-key': HEYGEN_API_KEY,
  };
  const options = { method, headers };
  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${HEYGEN_API_BASE}${endpoint}`, options);

  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    let errorBody;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      errorBody = await response.json();
    } else {
      const errorText = await response.text();
      errorBody = { message: `Received non-JSON response (e.g., HTML page). Status: ${response.status}. Body: ${errorText}` };
    }
    
    console.error(`Heygen API Error (${endpoint}):`, JSON.stringify(errorBody, null, 2));
    throw new Error(errorBody.message || `API request failed with status ${response.status}`);
  }

  // Handle responses that might be empty
  const text = await response.text();
  return text ? JSON.parse(text) : { success: true };
}

export default async function handler(request, response) {
  if (!HEYGEN_API_KEY) {
    return response.status(500).json({ error: 'Heygen API key is not configured.' });
  }

  const { type, payload } = request.body;

  try {
    switch (type) {
      case 'CREATE_SESSION': {
        const { avatarId } = payload;
        const sessionData = await fetchHeygenAPI('/v1/streaming.new', 'POST', {
          quality: "high",
          avatar_id: avatarId,
        });
        return response.status(200).json(sessionData.data);
      }

      case 'START_SESSION': {
        const { sessionId, sdpAnswer } = payload;
        await fetchHeygenAPI('/v1/streaming.start', 'POST', {
          session_id: sessionId,
          sdp: sdpAnswer,
        });
        return response.status(200).json({ success: true });
      }

      // UPDATED: Using the correct endpoint and payload for speaking
      case 'SPEAK': {
        const { sessionId, text } = payload;
        console.log("Submitting text to Heygen for session:", { sessionId, text });
        await fetchHeygenAPI('/v1/streaming.task', 'POST', {
          session_id: sessionId,
          text: text,
          task_type: "repeat" 
        });
        return response.status(200).json({ success: true });
      }

      // UPDATED: Using the correct endpoint for closing the session
      case 'CLOSE_SESSION': {
        const { sessionId } = payload;
        await fetchHeygenAPI('/v1/streaming.stop', 'POST', {
          session_id: sessionId,
        });
        return response.status(200).json({ success: true });
      }

      default:
        return response.status(400).json({ error: 'Invalid request type' });
    }
  } catch (error) {
    console.error(`Error in heygen.js for type ${type}:`, error.message);
    response.status(500).json({ error: error.message || 'Heygen API interaction failed.' });
  }
}