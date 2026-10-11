import { AxiosRequestConfig } from "axios";

export interface IUserCreds {
    email: string;
    password: string;
}

export interface IUser {
    isAdmin: boolean;
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    plan: "free" | "pro" | "enterprise";
    availableCredits: number;
    createdAt: Date;
    updatedAt: Date;
}
export interface AuthPayload {
  accessToken?: string;
  user?: IUser;
  success?: boolean;
  waitingList?: boolean;
  message?: string;
}
export type IStatus<T = AuthPayload> =
  | { type: "success"; data: T }
  | { type: "error"; data: string };
export interface RegisterCredentials extends IUserCreds {
  firstName: string;
  lastName: string;
}

export interface AuthOptions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    data?: object;
    options?: AxiosRequestConfig;
}

export interface NoAuthOptions {
    method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
    url: string;
    data?: object;
    options?: AxiosRequestConfig;
}

export interface ApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface IForgotPasswordRequest {
    email: string;
}

export interface IForgotPasswordResponse {
    success: boolean;
    message: string;
}

export interface IResetPasswordRequest {
    token: string;
    newPassword: string;
}
