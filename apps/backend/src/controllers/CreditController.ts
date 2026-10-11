import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { getUserCredits, addCredits } from "../utils/credit.utils";
import prisma from "../db/prisma";

/**
 * Get user's credit balance
 */
export const getUserCreditBalance = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const credits = await getUserCredits(req.user.userId);

    return res.status(200).json({
      success: true,
      userId: req.user.userId,
      availableCredits: credits
    });
  } catch (error: any) {
    console.error("Get credit balance error:", error);
    return res.status(500).json({
      error: "Failed to get credit balance",
      details: error.message
    });
  }
};

/**
 * Add credits to user account (Admin only)
 */
export const addCreditsToUser = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    // Check if the user is an admin
    const adminUser = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: { isAdmin: true }
    });

    if (!adminUser?.isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const { userId, credits } = req.body;

    if (!userId || typeof userId !== 'number') {
      return res.status(400).json({ error: "Valid user ID is required" });
    }

    if (!credits || typeof credits !== 'number' || credits <= 0) {
      return res.status(400).json({ error: "Valid credit amount is required (must be positive)" });
    }

    const newBalance = await addCredits(userId, credits);

    return res.status(200).json({
      success: true,
      message: `Successfully added ${credits} credits to user ${userId}`,
      userId,
      creditsAdded: credits,
      newBalance
    });
  } catch (error: any) {
    console.error("Add credits error:", error);

    if (error.message?.includes('User not found')) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    return res.status(500).json({
      error: "Failed to add credits",
      details: error.message
    });
  }
};

/**
 * Get credit usage statistics for current user
 */
export const getCreditUsageStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        availableCredits: true,
        plan: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      success: true,
      userId: req.user.userId,
      availableCredits: user.availableCredits,
      plan: user.plan,
      memberSince: user.createdAt
    });
  } catch (error: any) {
    console.error("Get credit usage stats error:", error);
    return res.status(500).json({
      error: "Failed to get credit usage statistics",
      details: error.message
    });
  }
};
