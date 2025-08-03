import envVariables from "../../common/envConfig.js";
import AppError from "../../middlewares/AppError.js";
import {apiResponse , errorMessages} from '../../common/apiResponse.js';



class BotService {

    createVectorEmbedings = async(request)=>{
        try {
            const {body} = request;
            return { message: apiResponse.EMBEDDINGS_GENERATED.message, statusCode: apiResponse.EMBEDDINGS_GENERATED.statusCode, apiCode:apiResponse.EMBEDDINGS_GENERATED.apiCode , data : body} 
        } catch (error) {
            throw new AppError(error.message, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.apiCode, errorMessages.ERROR_IN_EMBEDDINGS_GENERATION.statusCode);
        }
    }



}


const botService = new BotService();
export default botService;