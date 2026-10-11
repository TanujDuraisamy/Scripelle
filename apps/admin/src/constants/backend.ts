export const backend_url = `${(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000").replace(/\/$/, "")}/api/v1`;
