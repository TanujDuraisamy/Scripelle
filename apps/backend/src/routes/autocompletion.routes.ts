import { requireGemini } from "../middlewares/provider";
import { AuthRequest } from "../types/auth.types";
import { CREDIT_COSTS, withCreditTransaction } from "../utils/credit.utils";
import { Router } from 'express';
import { getAutocompletionSuggestions, predictNextText } from '../controllers/AutocompletionController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();

router.post('/suggestions', authenticateToken, requireGemini, getAutocompletionSuggestions);
router.post('/predict', authenticateToken, requireGemini, async (req, res) => {
    try {
        const { text, context } = req.body;

        if (!text || typeof text !== 'string') {
            return res.status(400).json({
                success: false,
                message: 'Text is required and must be a string',
                data: null
            });
        }

        if (text.length > 10000) return res.status(400).json({ error: "Text too long" });
        const { result: prediction } = await withCreditTransaction((req as AuthRequest).user!.userId, CREDIT_COSTS.AUTOCOMPLETION, () => predictNextText(text, context));

        res.json({
            success: true,
            message: 'Text prediction generated successfully',
            data: {
                originalText: text,
                prediction,
                context: context || null
            }
        });
    } catch (error) {
        console.error('Text prediction error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate text prediction',
            data: null
        });
    }
});

export default router;
