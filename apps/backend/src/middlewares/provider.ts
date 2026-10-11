import { RequestHandler } from "express";
export const requireGemini: RequestHandler = (_req, res, next) => {
  if (!process.env.GEMINI_API_KEY || !process.env.GEMINI_MODEL) {
    res.status(503).json({ error: "AI is not configured" });
    return;
  }
  next();
};
