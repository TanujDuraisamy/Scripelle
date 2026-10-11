import { GoogleGenerativeAI } from '@google/generative-ai';

import { genAI } from "../initializers";

/**
 * Get Gemini model instance
 * @param modelName - Model to use (default: gemini-2.0-flash-exp)
 */
export function getModel(modelName: string = 'gemini-2.0-flash-exp') {
  return genAI.getGenerativeModel({ model: modelName });
}

/**
 * Generate content using Gemini AI
 * @param prompt - The text prompt to send
 * @param modelName - Optional model name
 */
export async function generateContent(prompt: string, modelName?: string) {
  try {
    const model = getModel(modelName);
    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
}

/**
 * Generate content with streaming
 * @param prompt - The text prompt to send
 * @param modelName - Optional model name
 */
export async function generateContentStream(prompt: string, modelName?: string) {
  try {
    const model = getModel(modelName);
    const result = await model.generateContentStream(prompt);
    return result.stream;
  } catch (error) {
    console.error('Gemini API Stream Error:', error);
    throw error;
  }
}

/**
 * Chat with Gemini (maintains conversation history)
 */
export function startChat(history: any[] = [], modelName?: string) {
  const model = getModel(modelName);
  return model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 1000,
    },
  });
}

export default {
  generateContent,
  generateContentStream,
  startChat,
  getModel,
};
