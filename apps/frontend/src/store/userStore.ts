import type { RegisterCredentials } from "../types/customTypes";
import { create } from "zustand";
import type { IStatus, IUser, IUserCreds } from "../types/customTypes";
import { getAboutMe, loginUser, logout, refreshToken, registerUser } from "../utils/userUtils";

interface IUserStore {
  user: IUser | null;
  loading: boolean;
  jwtToken: string | undefined;

  refreshJwt: () => Promise<IStatus>;
  refreshJwtNonLoad: () => Promise<IStatus>;
  login: (creds: IUserCreds) => Promise<IStatus>;
  register: (creds: RegisterCredentials) => Promise<IStatus>;
  logout: () => Promise<IStatus>;
  fetchUser: () => Promise<IStatus>;
}

const useUserStore = create<IUserStore>((set, get) => ({
  user: null,
  loading: false,
  jwtToken: undefined,
  refreshJwt: async () => {
    set((state) => ({ ...state, loading: true }));
    const res = await refreshToken();
    set((state) => ({ ...state, loading: false }));
    set((state) => ({ ...state, jwtToken: (res.type === "success" ? res.data.accessToken : undefined) }));
    if (res.type === "success") {
      await get().fetchUser();
    }
    return res;
  },
  refreshJwtNonLoad: async () => {
    const res = await refreshToken();
    set((state) => ({ ...state, jwtToken: (res.type === "success" ? res.data.accessToken : undefined) }));
    if (res.type === "success") {
      const abt = await getAboutMe();
      if (abt.type === "success") {
        set((state) => ({ ...state, user: abt.data.user ?? null }));
      }
    }
    return res;
  },
  login: async (creds) => {
    set((state) => ({ ...state, loading: true }));
    const res = await loginUser(creds);
    set((state) => ({ ...state, loading: false }));
    set((state) => ({ ...state, jwtToken: (res.type === "success" ? res.data.accessToken : undefined) }));
    if (res.type === "success") {
      await get().fetchUser();
    }
    return res;
  },
  register: async (creds) => {
    set((state) => ({ ...state, loading: true }));
    const res = await registerUser(creds);
    set((state) => ({ ...state, loading: false }));
    set((state) => ({ ...state, jwtToken: (res.type === "success" ? res.data.accessToken : undefined) }));
    if (res.type === "success" && res.data.accessToken) {
      await get().fetchUser();
    }
    return res;
  },
  fetchUser: async () => {
    set((state) => ({ ...state, loading: true }));
    const res = await getAboutMe();
    set((state) => ({ ...state, loading: false }));
    if (res.type === "success") {
      set((state) => ({ ...state, user: res.data.user ?? null }));
    }
    return res;
  },
  logout: async () => {
    set((state) => ({ ...state, loading: true }));
    const res = await logout();
    set((state) => ({ ...state, loading: false }));
    if (res.type === "success") {
      set((state) => ({ ...state, user: null, jwtToken: undefined }));
    }
    return res;
  },
}));

export default useUserStore;
