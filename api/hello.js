// This is a Node.js serverless function using ES Module syntax.
// It will be deployed at the URL: /api/hello

export default function handler(request, response) {
  // The function receives a request and sends a response.
  
  // Set the status to 200 (OK) and send a JSON object back.
  response.status(200).json({
    message: "Hello from the Vercel backend! 👋",
    timestamp: new Date().toISOString(),
  });
};
