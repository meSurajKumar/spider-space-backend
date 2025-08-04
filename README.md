# Galactus Backend

A Node.js backend service that provides a chatbot API powered by Google's Gemini AI model with MongoDB vector database for context-aware responses.

## Features

- AI-powered chatbot using Google's Gemini model
- Vector embeddings for semantic search capabilities
- MongoDB Atlas Vector Search integration
- Web search integration for enhanced responses
- Chat history awareness for contextual conversations

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **AI Model**: Google Gemini
- **Database**: MongoDB Atlas (with Vector Search)
- **Vector Embeddings**: Google Generative AI Embeddings
- **External APIs**: Google Custom Search

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account with Vector Search capability
- Google API Key for Gemini AI
- Google Custom Search API Key (for web search functionality)

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
IS_DEV=true

# Gemini AI Configuration
GEMINI_MODEL_NAME=gemini-pro
GEMINI_API_KEY=your_gemini_api_key

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string
MONGODB_DATABASE_NAME=your_database_name
MONGODB_COLLECTION_NAME=your_collection_name
MONGODB_SEARCH_INDEX_NAME=your_search_index_name

# Google Search Configuration (optional, for web search)
GOOGLE_SEARCH_APIKEY=your_google_search_api_key
SEARCH_ENGINE_ID=your_search_engine_id
SEARCH_ENGINE_NAME=your_search_engine_name
SEARCH_ENGINE_URL=https://www.googleapis.com/customsearch/v1
```

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd spider-backend
```

2. Install dependencies

```bash
npm install
```

3. Start the development server

```bash
npm run dev
```

The server will start on the port specified in your `.env` file (default: 3000).

## API Endpoints

### Health Check
- **GET** `/health` - Check if the service is running

### Bot Endpoints
- **POST** `/api/v1/botresponse/create-embedings` - Create vector embeddings for text data
  - Request Body: `{ "rawData": "your text data" }`

- **POST** `/api/v1/botresponse/get-response` - Get AI response to a question
  - Request Body: 
  ```json
  { 
    "question": "your question", 
    "chatHistoryData": [], 
    "websearch": false 
  }
  ```
  - `chatHistoryData`: Array of previous conversation turns (format: `[{"User": "user message", "AI": "ai response"}]`)
  - `websearch`: Boolean flag to enable web search for enhanced responses

## How It Works

1. **Vector Embeddings**: The system converts text data into vector embeddings using Google's embedding model.

2. **MongoDB Vector Search**: These embeddings are stored in MongoDB with vector search capabilities for semantic retrieval.

3. **Context-Aware Responses**: When a question is asked, the system:
   - Retrieves relevant context from the vector database
   - Considers chat history for continuity
   - Optionally performs web search for additional information
   - Generates a response using the Gemini AI model

## Development

- The application uses nodemon for automatic server restarts during development.
- Error handling is implemented through a custom AppError class and middleware.
- API responses follow a standardized format for consistency.

## License

ISC