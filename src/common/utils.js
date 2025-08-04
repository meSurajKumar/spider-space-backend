import { GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { MongoClient } from 'mongodb';
import axios from "axios";
import envVariables from "./envConfig.js";



const { GEMINI_API_KEY, GEMINI_MODEL_NAME, MONGODB_URI, MONGODB_DATABASE_NAME, GOOGLE_SEARCH_APIKEY, SEARCH_ENGINE_ID, SEARCH_ENGINE_URL, SEARCH_ENGINE_NAME } = envVariables


const model = new ChatGoogleGenerativeAI({
    apiKey: GEMINI_API_KEY,
    model: GEMINI_MODEL_NAME,
    temperature: 1,
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
    // Render chatHistory as plain text:
    const historyText = chatHistory.length
      ? chatHistory.map(m => `${m.sender}: ${m.content}`).join("\n")
      : "No prior conversation.";
  
    const prompt =  `
    You are Galactus, an AI assistant with full chat memory:
    
    1. **Greetings & Small-Talk**  
       - If the user greets you (e.g. “hi”, “hello”, “hey”, “how are you” , “who are you”), respond immediately with:  
         “I’m good, I am Galactus thank you! How can I help you today?”  
       - Do **not** perform any web-search or retrieval for greetings.
    
    2. **User Corrections & Re-asks**  
       - Always treat the user’s **latest** statement as ground truth.  
       - If the user repeats or re-asks something, answer based on that most recent user turn (no retrieval needed).
    
    3. **Web-Search Branch**  
       - Otherwise, use the provided web results to answer:  
         **Raw web results** (JSON array):  
         ${JSON.stringify(results)}
    
    4. **Output Format**  
       - Output exactly **one** JSON object literal **and nothing else**:  
         {
           "answer": <string>,
           "imageUrl": <string|null>,
           "otherUrl": <string|null>
         }  
       - No markdown, no code fences, no extra commentary.
    
    5. **Fallback**  
       - If you cannot find an answer, reply with: “I don’t know.”
    
    Here is the conversation so far:
    ${historyText}
    
    Existing answer (if any): ${existingAnswer || "N/A"}
    `.trim();
  
    const res = await model.invoke(prompt);
    const text = res.content.trim();
  
    // 2. Parse into actual JSON
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      console.error("Failed to parse JSON:", text);
      // Fallback minimal object
      parsed = { answer: text, imageUrl: null, otherUrl: null };
    }
    return parsed;
  };
  



export { model, embedings, client, connectDb, customSearch, refineWithWeb };


// const prompt = `
// You are Galactus. You will be given a JSON array of raw web-search results. 

// Task:
// 1. Analyze these results.
// 2. Produce ONLY a JSON object (no markdown, no code fences, no explanations) with exactly these keys:
//    • "answer": a concise, accurate answer to the user's question.
//    • "imageUrl": a single relevant image URL if present, otherwise null.
//    • "otherUrl": the single most relevant webpage URL, otherwise null.

// Existing answer (if any): ${existingAnswer || "N/A"}

// Here are the web results:
// ${JSON.stringify(results)}
// `;