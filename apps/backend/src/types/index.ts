export interface IError {
  type: string;
  status_code: number;
}

export interface IErrorContainer {
  BAD_REQUEST: IError;
  NOT_FOUND: IError;
  UNAUTHORIZED: IError;
  FORBIDDEN: IError;
  CONFLICT: IError;
  GONE: IError;
  INTERNAL_SERVER_ERROR: IError;
  SERVICE_UNAVAILABLE: IError;
  METHOD_NOT_ALLOWED: IError;
  PRECONDITION_FAILED: IError;
  UNPROCESSABLE_ENTITY: IError;
}
