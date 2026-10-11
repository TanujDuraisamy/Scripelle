import { Router } from 'express';

import { deepseekController } from '../controllers/chatController.js'

const router = Router()

router.post('/deepseek', deepseekController)

export default router;