import botService from "./bot.service.js";


class BotController { 

    
    createEmbeddings = async(req, res , next)=>{
        try {
            const createEmbedding = await botService.createVectorEmbedings(req);
            return res.status(createEmbedding.statusCode).json({success :true , message : createEmbedding.message ,data : createEmbedding.data , apiCode : createEmbedding.apiCode})
        } catch (error) {
            console.log('Error in createEmbedding > ', error);
            next(error);
        }
    }

    getBotResponse = async(req, res , next)=>{
        try {
            const botResponse = await botService.getBotResponse(req);
            return res.status(botResponse.statusCode).json({success :true , message : botResponse.message ,data : botResponse.data , apiCode : botResponse.apiCode})
        } catch (error) {
            console.log('Error in createEmbedding > ', error);
            next(error);
        }
    }


}

const botController = new BotController();
export default botController;

