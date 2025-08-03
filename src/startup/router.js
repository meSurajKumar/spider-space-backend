import botRoutes from '../routes/bot.routes.js';

export default function(app){
    app.get('/health',(req ,res)=>{
        return res.status(201).send({message : 'Resume-Enhancer Service is Running'})
    })
    app.use('/api/v1/botresponse', botRoutes)
}