import AppError from "../../middlewares/AppError.js";
import {apiResponse , errorMessages} from '../../common/apiResponse.js';
import {model , embedings , client , connectDb} from '../../common/utils.js'
import envVariables from "../../common/envConfig.js";
const {MONGODB_COLLECTION_NAME} = envVariables;


class BotService {

    createVectorEmbedings = async(request)=>{
        try {
            const {body} = request;
            const {rawData} = body;
            const db = await connectDb();
            const collection = db.collection(MONGODB_COLLECTION_NAME);
            const createStore = await embedings.embedQuery(rawData);
            const doc = {
                indexName : 'vector_index',
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
    }


}


const botService = new BotService();
export default botService;
