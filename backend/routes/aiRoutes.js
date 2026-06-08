import express from 'express';
import { sendMessage, getChatHistory, getSuggestion } from '../controllers/aiController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/chat', sendMessage);
router.get('/chats', getChatHistory);
router.get('/suggestion', getSuggestion);

export default router;