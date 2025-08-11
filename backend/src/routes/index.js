import userRouter from './user.js';
import authRouter from './authRoutes.js'
import chatRouter from './chatRoutes.js'
import docRouter from './docsRoutes.js'
import { Router } from 'express';
import completionRouter from './completionRoutes.js'
const router = Router();
router.use('/user', userRouter);
router.use('/auth',authRouter)
router.use('/docs',docRouter);
router.use('/chat',chatRouter);
router.use('/', completionRouter);
export default router;