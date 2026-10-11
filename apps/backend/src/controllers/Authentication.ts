import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import {
  hashPassword,
  comparePassword,
  generateTokens,
  verifyRefreshToken,
  generateResetToken,
  generateResetTokenExpiry,
  hashResetToken,
  verifyAccessToken,
  isResetTokenValid
} from '../utils/auth.utils';
import {
  RegisterRequest,
  LoginRequest,
  AuthRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  CreateAdminRequest,
  AdminLoginRequest
} from '../types/auth.types';
import { catchAsync } from '../utils/httpWrapper';
import { EmailService } from '../services/email.service';
import passport, { googleEnabled } from '../utils/passport';

export async function register(req: Request<{}, {}, RegisterRequest>, res: Response) {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(409).json({ error: 'User with this email already exists' });
      return;
    }

    const betaAccess = await prisma.betaAccessList.findUnique({
      where: { email }
    });

    const isBetaApproved = betaAccess?.approved || false;
    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        plan: 'free',
        betaMember: isBetaApproved,
        status: isBetaApproved ? 'approved' : 'pending'
      }
    });

    if (!isBetaApproved) {
      return res.status(201).json({
        message: "You're added to the waiting list. We'll notify you when approved.",
        waitingList: true,
        user: {
          id: newUser.id,
          email: newUser.email,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          status: newUser.status,
          betaMember: newUser.betaMember
        }
      });
    }

    const { accessToken, refreshToken } = generateTokens(newUser.id, newUser.email, newUser.tokenVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        plan: newUser.plan,
        availableCredits: Number(newUser.availableCredits),
        betaMember: newUser.betaMember,
        status: newUser.status,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}


export async function login(req: Request<{}, {}, LoginRequest>, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password || "");

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    if (user.status === 'pending' && !user.betaMember) {
      res.status(403).json({
        error: "Your account is pending approval. You're on the waiting list. We'll notify you when approved.",
        waitingList: true,
        status: user.status,
        message: 'pending'
      });
      return;
    }

    if (user.status === 'rejected') {
      res.status(403).json({
        error: 'Your beta access request has been rejected.',
        status: user.status
      });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.tokenVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token and user info
    res.status(200).json({
      message: 'Login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        availableCredits: Number(user.availableCredits),
        betaMember: user.betaMember,
        status: user.status,
        createdAt: user.createdAt,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Refresh access token using refresh token from cookie
 * POST /auth/refresh
 */
export async function refreshToken(req: Request, res: Response): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ error: 'Refresh token required' });
      return;
    }

    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        availableCredits: true,
        status: true,
        tokenVersion: true,
        isAdmin: true
      }
    });

    if (!user || user.status !== 'approved' || !Number.isInteger(payload.tokenVersion) || user.tokenVersion !== payload.tokenVersion) {
      res.status(401).json({ error: 'User unavailable or not approved' });
      return;
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, user.email, user.tokenVersion);

    // Set new refresh token as HTTP-only cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return new access token
    res.status(200).json({
      message: 'Token refreshed successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        availableCredits: Number(user.availableCredits),
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(403).json({ error: 'Invalid or expired refresh token' });
  }
}

/**
 * Logout user by clearing refresh token cookie
 * POST /auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  try {
    const cookieToken = req.cookies?.refreshToken;
    const bearer = req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : undefined;
    let payload;
    try {
      payload = cookieToken ? verifyRefreshToken(cookieToken) : bearer ? verifyAccessToken(bearer) : undefined;
    } catch { /* An invalid token cannot revoke another user's sessions. */ }
    if (payload && Number.isInteger(payload.tokenVersion)) {
      await prisma.user.updateMany({
        where: { id: payload.userId, tokenVersion: payload.tokenVersion },
        data: { tokenVersion: { increment: 1 } },
      });
    }
    // Logout revokes all sessions for this account, then clears this browser cookie.
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Get current user info (protected route example)
 * GET /auth/me
 */
export async function getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        plan: true,
        availableCredits: true,
        createdAt: true,
        isAdmin: true
      }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        availableCredits: Number(user.availableCredits),
        createdAt: user.createdAt,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}


export const googleSignin = catchAsync(async (req, res) => {
  if (!googleEnabled) return res.status(503).json({ error: "Google sign-in is not configured" });
  passport.authenticate("google", { session: false, scope: ["profile", "email"] })(req, res);
});

export async function googleCallbackHandler(req: Request, res: Response) {
  try {
    const user = req.user as any;
    if (!user || user.status !== 'approved') {
      return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthFailed`);
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.tokenVersion);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
  } catch (error) {
    console.error("Google OAuth callback error:", error);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=OAuthInternalError`);
  }
}

/**
 * Send password reset email
 * POST /auth/forgot-password
 */
export async function forgotPassword(req: Request<{}, {}, ForgotPasswordRequest>, res: Response) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists in our system, you will receive a password reset link shortly.'
      });
    }

    const resetToken = generateResetToken();
    const resetTokenExpiry = generateResetTokenExpiry();

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashResetToken(resetToken),
        resetTokenExpiry,
      },
    });

    try {
      await EmailService.sendPasswordResetEmail(user.email, resetToken);

      return res.status(200).json({
        success: true,
        message: 'If the email exists in our system, you will receive a password reset link shortly.',
      });
    } catch (emailError) {
      console.error('Password reset delivery failed');

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null,
        },
      });

      return res.status(500).json({
        success: false,
        error: 'Failed to send reset email. Please try again later.'
      });
    }
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Reset password using reset token
 * POST /auth/reset-password
 */
export async function resetPassword(req: Request<{}, {}, ResetPasswordRequest>, res: Response) {
  try {
    const { token, newPassword } = req.body;

    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) ||
        typeof newPassword !== 'string' || newPassword.length < 8 || Buffer.byteLength(newPassword) > 72) {
      return res.status(400).json({ error: 'A valid reset token and password of 8–72 bytes are required' });
    }
    const hashedPassword = await hashPassword(newPassword);
    // A single conditional update consumes the reset token and revokes every session.
    const changed = await prisma.user.updateMany({
      where: { resetToken: hashResetToken(token), resetTokenExpiry: { gt: new Date() } },
      data: {
        password: hashedPassword, resetToken: null, resetTokenExpiry: null,
        tokenVersion: { increment: 1 },
      },
    });
    if (changed.count !== 1) return res.status(400).json({ error: 'Invalid or expired reset token' });

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Create admin user
 * POST /auth/admin/create
 */
export async function createAdmin(req: Request<{}, {}, CreateAdminRequest>, res: Response) {
  try {
    const { email, password, firstName, lastName, adminSecret } = req.body;

    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'Email, password, firstName, and lastName are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Route requires an authenticated existing administrator.

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await hashPassword(password);

    // Create admin user with approved beta status
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        plan: 'free',
        isAdmin: true,
        betaMember: true,
        status: 'approved'
      }
    });

    // Also add to beta access list
    await prisma.betaAccessList.create({
      data: {
        email,
        approved: true,
        addedBy: 'system'
      }
    }).catch(() => {
      // Ignore if already exists
    });

    const { accessToken, refreshToken } = generateTokens(newAdmin.id, newAdmin.email, newAdmin.tokenVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return res.status(201).json({
      message: 'Admin user created successfully',
      accessToken,
      user: {
        id: newAdmin.id,
        email: newAdmin.email,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        plan: newAdmin.plan,
        isAdmin: newAdmin.isAdmin,
        availableCredits: Number(newAdmin.availableCredits),
        betaMember: newAdmin.betaMember,
        status: newAdmin.status,
        createdAt: newAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error('Create admin error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Admin login
 * POST /auth/admin/login
 */
export async function adminLogin(req: Request<{}, {}, AdminLoginRequest>, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Verify user is an admin
    if (!user.isAdmin) {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
      return;
    }

    const isPasswordValid = await comparePassword(password, user.password || "");

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.tokenVersion);

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Return access token and user info
    res.status(200).json({
      message: 'Admin login successful',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        plan: user.plan,
        isAdmin: user.isAdmin,
        availableCredits: Number(user.availableCredits),
        betaMember: user.betaMember,
        status: user.status,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
