import { Router } from 'express';
import {
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
} from '../controllers/DocumentController';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
router.param('id', (_req, res, next, id) => {
    if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) {
        res.status(400).json({ error: 'Invalid document ID' });
        return;
    }
    next();
});
router.use((req, res, next) => {
    if (req.method === 'POST' || req.method === 'PUT') {
        const { title, content, context, chatHistory } = req.body || {};
        if ((title !== undefined && (typeof title !== 'string' || title.length > 500)) ||
            (content !== undefined && typeof content !== 'string') ||
            (context !== undefined && typeof context !== 'string') ||
            (chatHistory !== undefined && (!Array.isArray(chatHistory) || chatHistory.some((item: unknown) => typeof item !== 'string')))) {
            res.status(400).json({ error: 'Invalid document fields' });
            return;
        }
    }
    next();
});
router.post('/', authenticateToken, createDocument);
router.get('/', authenticateToken, getAllDocuments);
router.get('/:id', authenticateToken, getDocumentById);
router.put('/:id', authenticateToken, updateDocument);
router.delete('/:id', authenticateToken, deleteDocument);

export default router;
