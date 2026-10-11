import { Router } from 'express';
import { createCompletion } from '../controllers/completionController.js';

const router = Router();

// POST /api/v1/completions
router.post('/completions', createCompletion);

export default router;


