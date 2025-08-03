import {MongoDBAtlasVectorSearch} from '@langchain/mongodb';
import {ChatPromptTemplate , MessagesPlaceholder} from '@langchain/core/prompts';
import {createHistoryAwareRetriever} from 'langchain/chains/history_aware_retriever';
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import AppError from "../../middlewares/AppError.js";
import {apiResponse , errorMessages} from '../../common/apiResponse.js';
import {model , embedings , client , connectDb} from '../../common/utils.js'
import envVariables from "../../common/envConfig.js";
const {MONGODB_COLLECTION_NAME , MONGODB_SEARCH_INDEX_NAME} = envVariables;


class BotService {

    createVectorEmbedings = async(request)=>{
        try {
            const {body} = request;
            const {rawData} = body;
            const db = await connectDb();
            const collection = db.collection(MONGODB_COLLECTION_NAME);
            const createStore = await embedings.embedQuery(rawData);
            const doc = {
                indexName : MONGODB_SEARCH_INDEX_NAME,
                textKey : rawData,
                embeddingKey : createStore
            }
            const result = await collection.insertOne(doc);
            return { message: apiResponse.EMBEDDINGS_GENERATED.message, statusCode: apiResponse.EMBEDDINGS_GENERATED.statusCode, apiCode:apiResponse.EMBEDDINGS_GENERATED.apiCode , data : rawData} 
        } catch (error) {
            throw new AppError(error.message, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.apiCode, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.statusCode);
        }finally{
            await client.close();
        }
    };

    getBotResponse = async(request)=>{
        try {
            const db = await connectDb();
            const collection = db.collection(MONGODB_COLLECTION_NAME);
            const {body} = request;
            const {question , chatHistoryData} = body;

            const chatHistory = [];
            if(chatHistoryData.length!=0){
                await chatHistoryData.map((element)=>{
                    chatHistory.push(new HumanMessage(element.User))
                    chatHistory.push(new AIMessage(element.AI))
                })
            };

            const verctorStore = new MongoDBAtlasVectorSearch(embedings,{
                collection : collection,
                indexName : MONGODB_SEARCH_INDEX_NAME, // The name of the Atlas search index. Defaults to "default"
                textKey : "textKey", // The name of the collection field containing the raw content. Defaults to "text"
                embeddingKey : "embeddingKey"
            });

            const retriever = verctorStore.asRetriever({k:1})  //return only the single most similar result.
            const retriverPrompt = ChatPromptTemplate.fromMessages([
                new MessagesPlaceholder("chat_history"),
                ["user","{input}"],
                [
                    "user",
                    "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation."
                ]
            ]);
            const retriverChain = await createHistoryAwareRetriever({
                llm : model,
                retriever,
                rephrasePrompt:retriverPrompt
            });

            const prompt = ChatPromptTemplate.fromMessages([
                ["system",
                "Your name is Galactus and answer the user's question based on the following {context} , But you only tell your name when asked or when you are giving your brief description. If any anyone asked about the which model is used then the model Name is Galactus-1.0"],
                new MessagesPlaceholder("chat_history"),
                ["user","{input}"],
            ]);

            const chain = await createStuffDocumentsChain({
                llm: model,
                prompt:prompt
            });

            const conversationChain = await createRetrievalChain({
                combineDocsChain : chain,
                retriever : retriverChain
            });
          
            const response = await conversationChain.invoke({
                chat_history : chatHistory,
                input : question
            });          
            const answer = response.answer            
            return { message: apiResponse.RESPONSE_RECEIVED.message, statusCode: apiResponse.RESPONSE_RECEIVED.statusCode, apiCode:apiResponse.RESPONSE_RECEIVED.apiCode , data : answer} 
        } catch (error) {
            throw new AppError(error.message, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.apiCode, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.statusCode);
        }finally{
            await client.close();
        }
    };




}


const botService = new BotService();
export default botService;
