import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MongoClient } from 'mongodb';
import axios from "axios";
import envVariables from "./envConfig.js";



const { GEMINI_API_KEY, GEMINI_MODEL_NAME, MONGODB_URI, MONGODB_DATABASE_NAME, GOOGLE_SEARCH_APIKEY, SEARCH_ENGINE_ID, SEARCH_ENGINE_URL, SEARCH_ENGINE_NAME } = envVariables


const model = new ChatGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
    model: GEMINI_MODEL_NAME,
    temperature: 0.7,
})

const embedings = new GoogleGenerativeAIEmbeddings({
    apiKey: GEMINI_API_KEY,
    modelName: 'embedding-001'
});

const client = new MongoClient(MONGODB_URI || undefined);

let db;

const connectDb = async () => {
    await client.connect();
    db = client.db(MONGODB_DATABASE_NAME)
    return db;
}

const customSearch = async (query) => {
    const cx = SEARCH_ENGINE_ID;
    const apiKey = GOOGLE_SEARCH_APIKEY;
    const params = { q: query, cx: cx, key: apiKey, num: 5 }; // num are the result of the result count;
    const response = await axios.get(SEARCH_ENGINE_URL, { params });
    return response.data.items || [];

}

const refineWithWeb = async (results, existingAnswer, chatHistory) => {
    const prompt = `
  Here is the conversation so far:
  ${chatHistory.length ? chatHistory : "No prior conversation."}
  
  Now you will be given a JSON array of raw web-search results.
  
  Task:
  1. Use the conversation context above (including any corrections) and the web-search results.
  2. Always treat the user's **latest statements** as the ground truth—even if they contradict earlier context or answers.  
  3. If the user re-asks or refers to something they said before , answer based on that most recent user turn. 
  4. Output exactly one JSON object **and nothing else**:
     {
       "answer": <string>,
       "imageUrl": <string|null>,
       "otherUrl": <string|null>
     }
  
  Do NOT wrap your output in markdown, code fences, or any explanatory text—just the JSON.
  
  Existing answer (if any): ${existingAnswer || "N/A"}
  
  Web results:
  ${JSON.stringify(results)}
    `.trim();  // to avoid leading/trailing whitespace
  
    const res = await model.invoke(prompt);
    return res.content;  // should now be raw JSON only
  };



export { model, embedings, client, connectDb, customSearch, refineWithWeb };