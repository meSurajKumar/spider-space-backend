import {MongoDBAtlasVectorSearch} from '@langchain/mongodb';
import {ChatPromptTemplate , MessagesPlaceholder} from '@langchain/core/prompts';
import {createHistoryAwareRetriever} from 'langchain/chains/history_aware_retriever';
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { HumanMessage, AIMessage } from "@langchain/core/messages";

import AppError from "../../middlewares/AppError.js";
import {apiResponse , errorMessages} from '../../common/apiResponse.js';
import {model , embedings , client , connectDb, customSearch , refineWithWeb} from '../../common/utils.js'
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
            const {question , chatHistoryData , websearch} = body;

            const chatHistory = [];
            if(chatHistoryData.length!=0){
                chatHistoryData.forEach(({User , AI})=>{
                    chatHistory.push(new HumanMessage(User));
                    chatHistory.push(new AIMessage(AI));
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
                [
                  "system",
                  `You are Galactus, an AI assistant.  
              1) You have access to the full chat history (past user questions and your answers).  
              2) If the user’s question refers to or depends on something they said earlier—e.g. “What was my last question?”, “Can you clarify what I just asked?”, or “Why did I ask that?”—you must answer *directly from the chat history*.  
              3) If the user’s question is a normal information request, ignore the chat history and answer using the provided {context} (from vector store).  
              4) You must only reveal your name if explicitly asked, and only mention “Galactus-1.0” when asked which model you are.  
              5) If you cannot find an answer, reply exactly: “I don’t know.”`
                ],
                new MessagesPlaceholder("chat_history"),
                new MessagesPlaceholder("context"),
                ["user", "{input}"],
              ]);

            const chain = await createStuffDocumentsChain({
                llm: model,
                prompt:prompt
            });

            const conversationChain = await createRetrievalChain({
                combineDocsChain : chain,
                retriever : retriverChain
            });
          
            let finalAnswer;
            if(websearch){
                console.log('here')
                const webResult = await customSearch(question);
                console.log('web result >> ', webResult)
                // refine with llm
                finalAnswer = await refineWithWeb(webResult , "");
                return { message: apiResponse.RESPONSE_RECEIVED.message, statusCode: apiResponse.RESPONSE_RECEIVED.statusCode, apiCode:apiResponse.RESPONSE_RECEIVED.apiCode , data : finalAnswer} 
            }
            const response = await conversationChain.invoke({
                chat_history : chatHistory,
                input : question
            });  
            finalAnswer = response.answer || "";

            if(!response.answer || response.answer.toLowerCase().includes("i don't know")){
                finalAnswer =  "I don't know about this.";
                return { message: apiResponse.RESPONSE_RECEIVED.message, statusCode: apiResponse.RESPONSE_RECEIVED.statusCode, apiCode:apiResponse.RESPONSE_RECEIVED.apiCode , data : finalAnswer} 
            }
            return { message: apiResponse.RESPONSE_RECEIVED.message, statusCode: apiResponse.RESPONSE_RECEIVED.statusCode, apiCode:apiResponse.RESPONSE_RECEIVED.apiCode , data : finalAnswer} 
        } catch (error) {
            throw new AppError(error.message, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.apiCode, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.statusCode);
        }finally{
            await client.close();
        }
    };




}


const botService = new BotService();
export default botService;
