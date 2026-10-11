import { Request } from 'express';

export interface User {
  id: number;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  plan: string;
  availableCredits: number;
  isAdmin: boolean;
  betaMember: boolean;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  plan: string;
  availableCredits: number;
  betaMember?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  plan?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AddBetaEmailRequest {
  email: string;
}

export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  adminSecret?: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  isAdmin?: boolean;
  tokenVersion: number;
}

export interface RefreshTokenPayload {
  userId: number;
  email: string;
  tokenVersion: number;
}

export interface AuthRequest extends Request {
  user?: any;
}
