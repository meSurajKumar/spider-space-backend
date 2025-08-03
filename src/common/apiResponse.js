const apiResponse = {
    EMBEDDINGS_GENERATED:    { message: 'Embeddings Generated successfully', statusCode: 200, apiCode: 201 },
    QUERY_SUBMITTED:        { message: 'Your question was sent successfully', statusCode: 200, apiCode: 202 },
    RESPONSE_RECEIVED:      { message: 'Answer received from AI',         statusCode: 200, apiCode: 203 },
    SESSION_CLEARED:        { message: 'Chat session has been reset',        statusCode: 200, apiCode: 204 },
    STREAMING_STARTED:      { message: 'Streaming response initialized',     statusCode: 200, apiCode: 205 }
  };
  
  const errorMessages = {
    SOMETHING_WENT_WRONG:   { message: 'Something went wrong. Please try again.', apiCode: 4001, statusCode: 500 },
    INVALID_QUERY:          { message: 'Invalid or empty query',               apiCode: 4002, statusCode: 400 },
    RATE_LIMIT_EXCEEDED:    { message: 'Rate limit exceeded. Slow down please.', apiCode: 4003, statusCode: 429 },
    API_KEY_MISSING:        { message: 'API key not provided or invalid',        apiCode: 4004, statusCode: 401 },
    STREAMING_NOT_SUPPORTED:{ message: 'Streaming not supported for this model', apiCode: 4005, statusCode: 400 },
    SESSION_NOT_FOUND:      { message: 'Chat session not found',                apiCode: 4006, statusCode: 404 },
    ERROR_IN_EMBEDDINGS_GENERATION:  { message: 'Error in  Embeddings Generation',  apiCode: 4007, statusCode: 404 },
  };
  
  export { apiResponse, errorMessages };
  