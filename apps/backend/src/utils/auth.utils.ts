import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import { TokenPayload, RefreshTokenPayload } from '../types/auth.types';

import { jwtSecret, refreshSecret } from "../config/env";
const JWT_SECRET = jwtSecret;
const JWT_REFRESH_SECRET = refreshSecret;
const JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN: string | number = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}
/**
 * Compare a plain text password with a hashed password
 */
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Generate an access token (JWT)
 */
export function generateAccessToken(payload: TokenPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_SECRET, options);
}

/**
 * Generate a refresh token (JWT)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = {
    expiresIn: JWT_REFRESH_EXPIRES_IN as any,
  };
  return jwt.sign(payload, JWT_REFRESH_SECRET, options);
}

/**
 * Verify an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
  try {
    return jwt.verify(token, JWT_SECRET, { algorithms: ["HS256"] }) as TokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify a refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, { algorithms: ["HS256"] }) as RefreshTokenPayload;
  } catch (error) {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Generate both access and refresh tokens
 */
export function generateTokens(userId: number, email: string, tokenVersion: number) {
  const accessToken = generateAccessToken({ userId, email, tokenVersion });
  const refreshToken = generateRefreshToken({ userId, email, tokenVersion });

  return {
    accessToken,
    refreshToken,
  };
}

/**
 * Generate a secure reset token
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate reset token expiry (1 hour from now)
 */
export function generateResetTokenExpiry(): Date {
  const expiry = new Date();
  expiry.setHours(expiry.getHours() + 1); // 1 hour from now
  return expiry;
}

/**
 * Check if reset token is valid (not expired)
 */
export function isResetTokenValid(expiry: Date | null): boolean {
  if (!expiry) return false;
  return new Date() < expiry;
}
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
