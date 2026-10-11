import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { AuthRequest, AddBetaEmailRequest } from '../types/auth.types';
import { EmailService } from '../services/email.service';

/**
 * Add multiple emails to the beta access list (admin-only)
 * POST /api/admin/beta/add-multiple
 */
export async function addMultipleBetaEmails(req: Request<{}, {}, { emails: string[] }>, res: Response) {
    try {
        const { emails } = req.body;
        const adminUser = (req as AuthRequest).user;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ error: 'Emails array is required and must not be empty' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = emails.filter(email => !emailRegex.test(email));

        if (invalidEmails.length > 0) {
            return res.status(400).json({
                error: 'Invalid email format',
                invalidEmails
            });
        }

        const results = {
            added: [] as any[],
            updated: [] as any[],
            autoApproved: [] as any[],
            errors: [] as any[]
        };

        // Process each email
        for (const email of emails) {
            try {
                // Check if email already exists in beta access list
                const existingBetaEmail = await prisma.betaAccessList.findUnique({
                    where: { email }
                });

                if (existingBetaEmail) {
                    // Update to approved if it exists
                    const updatedBetaEmail = await prisma.betaAccessList.update({
                        where: { email },
                        data: {
                            approved: true,
                            addedBy: adminUser?.userId?.toString() || 'admin'
                        }
                    });

                    results.updated.push({
                        id: updatedBetaEmail.id,
                        email: updatedBetaEmail.email,
                        approved: updatedBetaEmail.approved
                    });
                } else {
                    // Create new beta access entry
                    const betaEmail = await prisma.betaAccessList.create({
                        data: {
                            email,
                            approved: true,
                            addedBy: adminUser?.userId?.toString() || 'admin'
                        }
                    });

                    results.added.push({
                        id: betaEmail.id,
                        email: betaEmail.email,
                        approved: betaEmail.approved
                    });
                }

                // Check if user already exists with this email
                const existingUser = await prisma.user.findUnique({
                    where: { email }
                });

                // If user exists and is pending, auto-approve them
                if (existingUser && existingUser.status === 'pending') {
                    await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            betaMember: true,
                            status: 'approved'
                        }
                    });

                    results.autoApproved.push({
                        userId: existingUser.id,
                        email: existingUser.email
                    });

                    // Optional: Send approval notification email
                    try {
                        // await EmailService.sendBetaApprovalEmail(email);
                    } catch (emailError) {
                        console.error(`Error sending approval email to ${email}:`, emailError);
                    }
                }
            } catch (emailError) {
                console.error(`Error processing email ${email}:`, emailError);
                results.errors.push({
                    email,
                    error: emailError instanceof Error ? emailError.message : 'Unknown error'
                });
            }
        }

        return res.status(201).json({
            message: 'Bulk email operation completed',
            summary: {
                totalProcessed: emails.length,
                added: results.added.length,
                updated: results.updated.length,
                autoApproved: results.autoApproved.length,
                errors: results.errors.length
            },
            data: results
        });
    } catch (error) {
        console.error('Add multiple beta emails error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Add an email to the beta access list (admin-only)
 * POST /api/admin/beta/add
 */
export async function addBetaEmail(req: Request<{}, {}, AddBetaEmailRequest>, res: Response) {
    try {
        const { email } = req.body;
        const adminUser = (req as AuthRequest).user;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Check if email already exists in beta access list
        const existingBetaEmail = await prisma.betaAccessList.findUnique({
            where: { email }
        });

        if (existingBetaEmail) {
            // Update to approved if it exists
            const updatedBetaEmail = await prisma.betaAccessList.update({
                where: { email },
                data: {
                    approved: true,
                    addedBy: adminUser?.userId?.toString() || 'admin'
                }
            });

            return res.status(200).json({
                message: 'Email already exists. Updated to approved status.',
                data: {
                    id: updatedBetaEmail.id,
                    email: updatedBetaEmail.email,
                    approved: updatedBetaEmail.approved,
                    addedBy: updatedBetaEmail.addedBy,
                    createdAt: updatedBetaEmail.createdAt
                }
            });
        }

        // Create new beta access entry
        const betaEmail = await prisma.betaAccessList.create({
            data: {
                email,
                approved: true,
                addedBy: adminUser?.userId?.toString() || 'admin'
            }
        });

        // Check if user already exists with this email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        // If user exists and is pending, auto-approve them
        if (existingUser && existingUser.status === 'pending') {
            await prisma.user.update({
                where: { id: existingUser.id },
                data: {
                    betaMember: true,
                    status: 'approved'
                }
            });

            // Optional: Send approval notification email
            try {
                // You can implement this method in email.service.ts
                // await EmailService.sendBetaApprovalEmail(email);
            } catch (emailError) {
                console.error('Error sending approval email:', emailError);
            }
        }

        return res.status(201).json({
            message: 'Email added to beta access list successfully',
            data: {
                id: betaEmail.id,
                email: betaEmail.email,
                approved: betaEmail.approved,
                addedBy: betaEmail.addedBy,
                createdAt: betaEmail.createdAt
            }
        });
    } catch (error) {
        console.error('Add beta email error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Approve a user from the waiting list (admin-only)
 * POST /api/admin/beta/approve/:userId
 */
export async function approveUser(req: Request<{ userId: string }>, res: Response) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const userIdNumber = parseInt(userId);
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userIdNumber }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Check if user is already approved
        if (user.betaMember && user.status === 'approved') {
            return res.status(200).json({
                message: 'User is already approved',
                data: {
                    id: user.id,
                    email: user.email,
                    betaMember: user.betaMember,
                    status: user.status
                }
            });
        }

        // Update user to approved status
        const updatedUser = await prisma.user.update({
            where: { id: userIdNumber },
            data: {
                betaMember: true,
                status: 'approved'
            }
        });

        // Add email to beta access list if not already there
        const betaEmail = await prisma.betaAccessList.findUnique({
            where: { email: user.email }
        });

        if (!betaEmail) {
            const adminUser = (req as AuthRequest).user;
            await prisma.betaAccessList.create({
                data: {
                    email: user.email,
                    approved: true,
                    addedBy: adminUser?.userId?.toString() || 'admin'
                }
            });
        } else if (!betaEmail.approved) {
            await prisma.betaAccessList.update({
                where: { email: user.email },
                data: { approved: true }
            });
        }

        // Optional: Send approval notification email
        try {
            // You can implement this method in email.service.ts
            // await EmailService.sendBetaApprovalEmail(user.email);
        } catch (emailError) {
            console.error('Error sending approval email:', emailError);
        }

        return res.status(200).json({
            message: 'User approved successfully',
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                betaMember: updatedUser.betaMember,
                status: updatedUser.status
            }
        });
    } catch (error) {
        console.error('Approve user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Get all users on the waiting list (admin-only)
 * GET /api/admin/beta/waitlist
 */
export async function getWaitlist(req: Request, res: Response) {
    try {
        // Get all pending users
        const waitlistUsers = await prisma.user.findMany({
            where: {
                status: 'pending',
                betaMember: false
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                status: true,
                betaMember: true,
                createdAt: true
            },
            orderBy: {
                createdAt: 'asc' // First-come, first-served
            }
        });

        return res.status(200).json({
            message: 'Waitlist retrieved successfully',
            count: waitlistUsers.length,
            data: waitlistUsers
        });
    } catch (error) {
        console.error('Get waitlist error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Get all emails in the beta access list (admin-only)
 * GET /api/admin/beta/list
 */
export async function getBetaAccessList(req: Request, res: Response) {
    try {
        const betaEmails = await prisma.betaAccessList.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            message: 'Beta access list retrieved successfully',
            count: betaEmails.length,
            data: betaEmails
        });
    } catch (error) {
        console.error('Get beta access list error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

export async function getUserAccessList(req: Request, res: Response) {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, email: true, firstName: true, lastName: true, isAdmin: true, betaMember: true, status: true, plan: true, availableCredits: true, createdAt: true, updatedAt: true },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return res.status(200).json({
            message: 'User list retrieved successfully',
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error('Get user list error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Reject a user from the waiting list (admin-only)
 * POST /api/admin/beta/reject/:userId
 */
export async function rejectUser(req: Request<{ userId: string }>, res: Response) {
    try {
        const { userId } = req.params;

        if (!userId) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        const userIdNumber = parseInt(userId);
        if (isNaN(userIdNumber)) {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }

        // Find the user
        const user = await prisma.user.findUnique({
            where: { id: userIdNumber }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user to rejected status
        const updatedUser = await prisma.user.update({
            where: { id: userIdNumber },
            data: {
                betaMember: false,
                status: 'rejected'
            }
        });

        return res.status(200).json({
            message: 'User rejected successfully',
            data: {
                id: updatedUser.id,
                email: updatedUser.email,
                firstName: updatedUser.firstName,
                lastName: updatedUser.lastName,
                betaMember: updatedUser.betaMember,
                status: updatedUser.status
            }
        });
    } catch (error) {
        console.error('Reject user error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

/**
 * Remove an email from the beta access list (admin-only)
 * DELETE /api/admin/beta/remove/:email
 */
export async function removeBetaEmail(req: Request<{ email: string }>, res: Response) {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        // Decode the email parameter (in case it's URL encoded)
        const decodedEmail = decodeURIComponent(email);

        // Check if email exists in beta access list
        const betaEmail = await prisma.betaAccessList.findUnique({
            where: { email: decodedEmail }
        });

        if (!betaEmail) {
            return res.status(404).json({ error: 'Email not found in beta access list' });
        }

        // Delete the beta access entry
        await prisma.betaAccessList.delete({
            where: { email: decodedEmail }
        });

        return res.status(200).json({
            message: 'Email removed from beta access list successfully',
            email: decodedEmail
        });
    } catch (error) {
        console.error('Remove beta email error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
