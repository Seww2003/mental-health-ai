import express from 'express';
import { createJournal, getUserJournals, getMoodTrends } from '../controllers/journalController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);
router.post('/', createJournal);
router.get('/', getUserJournals);
router.get('/trends', getMoodTrends);

export default router;