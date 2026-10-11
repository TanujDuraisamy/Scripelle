import { RequestHandler } from "express";
export function rateLimit(max: number, windowMs = 60_000): RequestHandler {
  const clients = new Map<string, { count: number; expires: number }>();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, value] of clients) if (value.expires <= now) clients.delete(key);
    const key = req.ip || "unknown";
    const value = clients.get(key) || { count: 0, expires: now + windowMs };
    value.count += 1;
    clients.set(key, value);
    if (value.count > max) {
      res.setHeader("Retry-After", Math.ceil((value.expires - now) / 1000));
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    next();
  };
}
