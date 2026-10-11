import type { AxiosRequestConfig } from "axios";

export interface IUserCreds {
  email: string;
  password: string;
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

export interface IResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface IUser {
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

export interface IFaculty {
  user: IUser;
  phoneNumber: string;
  department: string;
  qualification: string;
  yearOfJoining: Date;
  facultyNumber: string;
  campus: ICampus;
}

export interface ICampus {
  unitName: string;
  email: string;
  user: IUser;
  unitCode: string;
  isEvalutionCenter: boolean;
  id: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IFacultiesStore {
  faculties: IFaculty[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  fetchFaculties: () => Promise<IStatus | undefined>;
  bulkUploadFaculties: (file: File) => Promise<IStatus>;
  addFaculty: (
    data: Partial<IFaculty>,
    userData: Partial<IUser>
  ) => Promise<IStatus>;
}

export interface ICampusStore {
  campuses: ICampus[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  fetchCampuses: () => Promise<IStatus | undefined>;
  bulkUploadCampuses: (file: File) => Promise<IStatus>;
  addCampus: (campus: Partial<ICampus>) => Promise<IStatus>;
}

export interface IStudent {
  id: number;
  registerNumber: string;
  examNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  campus: ICampus;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentStore {
  students: IStudent[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  fetchStudents: () => Promise<IStatus | undefined>;
  addStudent: (student: Partial<IStudent>) => Promise<IStatus>;
  updateStudent: (id: number, student: Partial<IStudent>) => Promise<IStatus>;
  deleteStudent: (id: number) => Promise<IStatus>;
  bulkUploadStudents: (file: File) => Promise<IStatus>;
}

export interface IDashboardStats {
  totalCampuses: number;
  totalStudents: number;
  totalFaculties: number;
  recentActivity: unknown[];
}

export interface AIResponse { response?: string; text?: string; shouldInsert?: boolean; }
export interface SuggestionsResponse { data: { suggestions: Array<{ text: string }> }; }
export interface StoredChatMessage { id?: string; role?: string; content?: string; timestamp?: string; }
export interface StoredDocument {
  id: string; title: string; content: string; context?: string;
  createdAt: string; updatedAt: string;
  owner?: { firstName: string; lastName: string };
  chatHistory?: string | string[] | StoredChatMessage[];
}
