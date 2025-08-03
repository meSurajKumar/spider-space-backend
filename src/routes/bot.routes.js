import express from 'express';
const router = express.Router();
import botController from '../controllers/bot.contoller/bot.contoller.js';



router.post('/create-embedings' , botController.createEmbeddings);
router.post('/get-response' , botController.getBotResponse);

export default router;