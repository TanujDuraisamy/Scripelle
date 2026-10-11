import type { IUserCreds, IForgotPasswordRequest, IResetPasswordRequest } from "../types/customTypes.ts";
import { auth, noAuth } from "./handleHttp.ts";

export const loginUser = async (credientials: IUserCreds) => {
  const url = "auth/admin/login";
  const res = await auth({
    method: "POST",
    url,
    data: credientials,
  });
  return res;
};

export const refreshToken = async () => {
  const url = `auth/refresh`;
  const res = await auth({
    method: "POST",
    url,
  });
  return res;
};

export const getAboutMe = async () => {
  const url = "auth/me";
  const res = await auth({
    method: "GET",
    url,
  });
  return res;
};

export const logout = async () => {
  const url = "auth/logout";
  const res = await auth({
    method: "POST",
    url,
  });
  return res;
};

export const forgotPassword = async (email: IForgotPasswordRequest) => {
  const url = "auth/forgot-password";
  const res = await noAuth({
    method: "POST",
    url,
    data: email,
  });
  return res;
};

export const resetPassword = async (resetData: IResetPasswordRequest) => {
  const url = "auth/reset-password";
  const res = await noAuth({
    method: "POST",
    url,
    data: resetData,
  });
  return res;
};
