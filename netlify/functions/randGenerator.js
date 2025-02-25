exports.handler = async function(event, context) {
    // Set CORS headers
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };
  
    // Handle preflight OPTIONS request
    if (event.httpMethod === "OPTIONS") {
      return {
        statusCode: 200,
        headers
      };
    }
  
    try {
      let words = [];
      
      // Check HTTP method
      if (event.httpMethod === "GET") {
        // For GET requests, check for query parameters
        const params = event.queryStringParameters;
        if (params && params.words) {
          words = params.words.split(",").map(word => word.trim());
        }
      } else if (event.httpMethod === "POST") {
        // For POST requests, parse the body
        if (event.body) {
          const body = JSON.parse(event.body);
          if (Array.isArray(body.words)) {
            words = body.words;
          } else if (typeof body.words === "string") {
            words = body.words.split(",").map(word => word.trim());
          }
        }
      }
  
      // If no words provided, return an error
      if (words.length === 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: "Please provide a list of words" })
        };
      }
  
      // Shuffle the words using Fisher-Yates algorithm
      for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
      }
  
      // Return the shuffled words
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ 
          shuffledWords: words,
          originalCount: words.length
        })
      };
    } catch (error) {
      // Handle errors
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "Failed to process the request" })
      };
    }
  };