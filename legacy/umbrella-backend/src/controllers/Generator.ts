import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { genAI } from "../initializers";

export const generateText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { prompt, context = "", maxTokens = 500, chatHistory = [] } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

    let fullPrompt = "";

    if (context) {
      fullPrompt += `Context: ${context}\n`;
    }

    if (chatHistory.length > 0) {
      fullPrompt +=
        "Chat History:\n" +
        chatHistory.map((msg: any) => `${msg.role}: ${msg.content}`).join("\n") +
        "\n";
    }

    fullPrompt += `User: ${prompt}`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature: 0.7,
      },
    });

    const text = result.response.text();

    return res.status(200).json({
      success: true,
      text,
      model: "gemini-2.0-flash-exp"
    });
  } catch (error: any) {
    console.error("Error generating text:", error);

    // Better error handling
    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      return res.status(401).json({
        error: "Invalid API key. Please check your GEMINI_API_KEY in .env file"
      });
    }

    return res.status(500).json({
      error: "Failed to generate text",
      details: error.message
    });
  }
};
