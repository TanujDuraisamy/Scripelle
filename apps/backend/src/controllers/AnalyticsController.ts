import { Response } from "express";
import { AuthRequest } from "../types/auth.types";
import prisma from "../db/prisma";

/**
 * Get analytics data
 * Returns:
 * - total users
 * - active user (users with status 'approved')
 * - new signups (last 7 days)
 * - active sessions (placeholder as session tracking is not implemented)
 */
export const getAnalytics = async (req: AuthRequest, res: Response) => {
    try {
        // Ensure user is admin
        if (!req.user) {
            return res.status(401).json({ error: "Authentication required" });
        }

        // Check if user is admin (double check, though middleware should handle it)
        const adminUser = await prisma.user.findUnique({
            where: { id: req.user.userId },
            select: { isAdmin: true }
        });

        if (!adminUser?.isAdmin) {
            return res.status(403).json({ error: "Admin access required" });
        }

        // 1. Total Users
        const totalUsers = await prisma.user.count();

        // 2. Active Users (Users with status 'approved')
        // Note: A better metric might be users who logged in recently, but we don't track lastLogin yet.
        const activeUsers = await prisma.user.count({
            where: {
                status: "approved"
            }
        });

        // 3. New Signups (Last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const newSignups = await prisma.user.count({
            where: {
                createdAt: {
                    gte: sevenDaysAgo
                }
            }
        });

        const activeSessions = 0;

        return res.status(200).json({
            success: true,
            data: {
                totalUsers,
                activeUsers,
                newSignups,
                activeSessions,
                period: "7d" // For newSignups
            }
        });

    } catch (error: any) {
        console.error("Get analytics error:", error);
        return res.status(500).json({
            error: "Failed to get analytics data",
            details: error.message
        });
    }
};
