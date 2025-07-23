import userRouter from './user.js';
import authRouter from './authRoutes.js'
import chatRouter from './chatRoutes.js'
import docRouter from './docsRoutes.js'
import { Router } from 'express';
const router = Router();
router.use('/user', userRouter);
router.use('/auth',authRouter)
router.use('/docs',docRouter);
router.use('/chat',chatRouter);
export default router;