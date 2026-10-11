import { Router } from "express";
import { signupController , signinController, getProfileController} from "../controllers/userController.js";
import { validateSignUp ,validateSignIn, authenticateJWT } from "../middleware/middleware.js";

const router = Router();

router.post('/signup', validateSignUp, signupController);
router.post('/signin', validateSignIn, signinController);
router.get('/profile',authenticateJWT,getProfileController)

export default router;
