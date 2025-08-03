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


}

const botController = new BotController();
export default botController;

