export { backend_url as API_BASE_URL } from "./backend";

export const API_ENDPOINTS = {
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },
  ACCESS: {
    ADD_EMAIL: '/access/email',
    IMPORT_CSV: '/access/import',
    LIST: '/access',
  },
};
