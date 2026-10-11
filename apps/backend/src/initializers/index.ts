import { GoogleGenerativeAI } from "@google/generative-ai";
export const genAI = {
  getGenerativeModel(options: Parameters<GoogleGenerativeAI["getGenerativeModel"]>[0]) {
    const key = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL;
    if (!key || !model) throw new Error("Configure GEMINI_API_KEY and GEMINI_MODEL to enable AI");
    return new GoogleGenerativeAI(key).getGenerativeModel({ ...options, model });
  }
};
