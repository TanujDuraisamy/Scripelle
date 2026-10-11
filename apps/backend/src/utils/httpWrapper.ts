import { NextFunction, Response, Request } from "express";
import { IError, IErrorContainer } from "../types";

export const sendResponse = (
  res: Response,
  data: any,
  additional_data: any = {}
) => {
  return res.status(200).json({
    success: true,
    data: data,
    message: "success",
    ...additional_data,
  });
};

export const sendError = (
  res: Response,
  status_code: number,
  message: string,
  data: any,
  additional_data: any = {}
) => {
  return res.status(status_code).json({
    data: data,
    message: message,
    ...additional_data,
  });
};

export const catchAsync =
  (fn: (_req: Request, _res: Response, _next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch((err) => {

      if (err.type) {
        return res.status(err.errno || 400).json({
          success: false,
          message: err.message,
          type: err.type,
          errno: err.errno,
        });
      } else {
        return res.status(500).json({
          success: false,
          message: "Something went wrong",
          type: "INTERNAL_ERROR",
          errno: 500,
        });
      }
    });
  };

export const throwError = (message: string, error_type: IError) => {

  const error: any = new Error(message);
  error.type = error_type.type;
  error.errno = error_type.status_code;
  return error;
};

export const error_codes: IErrorContainer = {
  NOT_FOUND: {
    type: "Resource not found",
    status_code: 404,
  },
  BAD_REQUEST: {
    type: "Bad Request",
    status_code: 400,
  },
  UNAUTHORIZED: {
    type: "Unauthorized",
    status_code: 401,
  },
  FORBIDDEN: {
    type: "Forbidden",
    status_code: 403,
  },
  INTERNAL_SERVER_ERROR: {
    type: "Internal Server Error",
    status_code: 500,
  },
  SERVICE_UNAVAILABLE: {
    type: "Service Unavailable",
    status_code: 503,
  },
  METHOD_NOT_ALLOWED: {
    type: "Method Not Allowed",
    status_code: 405,
  },
  CONFLICT: {
    type: "Conflict",
    status_code: 409,
  },
  GONE: {
    type: "Gone",
    status_code: 410,
  },
  PRECONDITION_FAILED: {
    type: "Precondition Failed",
    status_code: 412,
  },
  UNPROCESSABLE_ENTITY: {
    type: "Unprocessable Entity",
    status_code: 422,
  },
};
