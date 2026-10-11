import { Router } from 'express';
import {
    addBetaEmail,
    addMultipleBetaEmails,
    approveUser,
    getWaitlist,
    getBetaAccessList,
    rejectUser,
    removeBetaEmail,
    getUserAccessList
} from '../controllers/AdminController';
import { createAdmin, adminLogin } from '../controllers/Authentication';
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware';

const router = Router();

// router.post('/create', createAdmin);

router.post('/login', adminLogin);

router.use(authenticateToken, requireAdmin);

router.post('/beta/add', addBetaEmail);

router.post('/beta/add-multiple', addMultipleBetaEmails);

router.post('/beta/approve/:userId', approveUser);

router.post('/beta/reject/:userId', rejectUser);

router.get('/beta/waitlist', getWaitlist);

router.get('/beta/list', getBetaAccessList);

router.get('/user/list', getUserAccessList);

router.delete('/beta/remove/:email', removeBetaEmail);

export default router;
