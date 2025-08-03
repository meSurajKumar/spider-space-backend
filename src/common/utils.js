import {GoogleGenerativeAIEmbeddings, ChatGoogleGenerativeAI} from '@langchain/google-genai';
import {MongoClient} from 'mongodb';
import envVariables from "./envConfig.js";

const geminiApiKey = envVariables.GEMINI_API_KEY;
const googleModelName = envVariables.GEMINI_MODEL_NAME;
const mongodbUri = envVariables.MONGODB_URI;
const mongodbDatabase = envVariables.MONGODB_DATABASE_NAME;

const model = new ChatGoogleGenerativeAI({
    apiKey : geminiApiKey,
    model : googleModelName,
    temperature : 1, 
})

const embedings = new GoogleGenerativeAIEmbeddings({
    apiKey : geminiApiKey,
    modelName :'embedding-001'
});

const client = new MongoClient(mongodbUri || undefined);

let db;

const connectDb = async()=>{
    await client.connect();
    db = client.db(mongodbDatabase)
    return db;
}

export {model , embedings , client , connectDb};