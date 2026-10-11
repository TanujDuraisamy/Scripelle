import axios from "axios";
import { toast } from "react-toastify";
import type { AuthOptions, IStatus, NoAuthOptions, AuthPayload } from "../types/customTypes";
import useUserStore from "../store/userStore";
import { backend_url } from "@/constants/backend";

export const noAuth = async <T = AuthPayload>({
  method,
  url,
  data = {},
  options = {},
}: NoAuthOptions): Promise<IStatus<T>> => {
  try {
    const headers = options?.headers || {};
    delete options.headers;

    const res = await axios<T>({
      method,
      url: `${backend_url}/${url}`,
      data,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...options,
      withCredentials: false,
    });


    return { data: res.data, type: "success" };
  } catch (err: unknown) {
    const errorMessage =
      axios.isAxiosError<{ message?: string; error?: string }>(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : err instanceof Error ? err.message : "Something went wrong!";
    if (errorMessage !== "Token not provided") {
      toast.error(errorMessage);
    }
    return { data: errorMessage, type: "error" };
  }
};

export const auth = async <T = AuthPayload>({
  method,
  url,
  data = {},
  options = {},
}: AuthOptions): Promise<IStatus<T>> => {
  try {
    const headers = options?.headers || {};
    delete options.headers;
    const { jwtToken } = useUserStore.getState();

    const res = await axios<T>({
      method,
      url: `${backend_url}/${url}`,
      data,
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
        ...headers,
      },
      ...options,
      withCredentials: true,
    });

    // if (res?.data?.message != "success") {
    //   throw new Error(res?.data?.message || "API request failed");
    // }

    return { data: res.data, type: "success" };
  } catch (err: unknown) {
    const errorMessage =
      axios.isAxiosError<{ message?: string; error?: string }>(err)
        ? err.response?.data?.message || err.response?.data?.error || err.message
        : err instanceof Error ? err.message : "Something went wrong!";
    toast.error(errorMessage);
    return { type: "error", data: errorMessage };
  }
};
