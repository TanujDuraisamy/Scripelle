import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware";
import {
  getUserCreditBalance,
  addCreditsToUser,
  getCreditUsageStats
} from "../controllers/CreditController";

const router = Router();

// Get current user's credit balance
router.get("/balance", authenticateToken, getUserCreditBalance);

// Get credit usage statistics
router.get("/stats", authenticateToken, getCreditUsageStats);

// Add credits to a user (Admin only)
router.post("/add", authenticateToken, addCreditsToUser);

export default router;
