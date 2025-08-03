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

const refineWithWeb = async (results, existingAnswer) => {
    const prompt = `
You are Galactus. You will be given a JSON array of raw web-search results. 

Task:
1. Analyze these results.
2. Produce ONLY a JSON object (no markdown, no code fences, no explanations) with exactly these keys:
   • "answer": a concise, accurate answer to the user's question.
   • "imageUrl": a single relevant image URL if present, otherwise null.
   • "otherUrl": the single most relevant webpage URL, otherwise null.

Existing answer (if any): ${existingAnswer || "N/A"}

Here are the web results:
${JSON.stringify(results)}
`;

    const res = await model.invoke(prompt);
    return res.content || res;

}



export { model, embedings, client, connectDb, customSearch, refineWithWeb };