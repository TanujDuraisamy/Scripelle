import { NextFunction, Response } from "express";
import { AuthRequest } from "../types/auth.types";
import { genAI } from "../initializers";
import prisma from "../db/prisma";
import { humanizeText } from "../utils/humanize.utils";
import { CREDIT_COSTS, withCreditTransaction, getUserCredits } from "../utils/credit.utils";

async function verifyDocumentOwnership(documentId: string, userId: number) {
  const document = await prisma.documents.findUnique({
    where: {
      id: parseInt(documentId),
      createdBy: userId
    }
  });

  if (!document) {
    throw new Error('Document not found or access denied');
  }

  return document;
}

async function updateDocumentChatHistory(documentId: string, userMessage: string, aiResponse: string, currentHistory: string[] = []) {
  const updatedChatHistory = [
    ...currentHistory,
    `User: ${userMessage}`,
    `AI: ${aiResponse}`
  ];

  await prisma.documents.update({
    where: { id: parseInt(documentId) },
    data: {
      chatHistory: updatedChatHistory,
      updatedAt: new Date()
    }
  });

  return updatedChatHistory;
}

export const generateText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const {
      prompt,
      context = "",
      maxTokens = 500,
      chatHistory = [],
      mode = "auto",
      documentId
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const validModes = ["agent", "ask", "auto"];
    if (!validModes.includes(mode)) {
      return res.status(400).json({
        error: "Invalid mode. Must be one of: agent, ask, auto"
      });
    }

    let document = null;
    let documentChatHistory: string[] = [];

    if (documentId) {
      try {
        document = await verifyDocumentOwnership(documentId, req.user.userId);
        documentChatHistory = document.chatHistory || [];
      } catch (error: any) {
        return res.status(404).json({ error: error.message });
      }
    }

    const { result: generationResult, remainingCredits } = await withCreditTransaction(
      req.user.userId,
      CREDIT_COSTS.TEXT_GENERATION,
      async () => {
        const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || "" });

        let fullPrompt = "";
        let temperature = 0.7;

        switch (mode) {
          case "agent":
            fullPrompt += "You are a writing assistant that generates content to be inserted directly into documents. ";
            fullPrompt += "Generate ONLY the requested content without any explanatory text, introductions, or phrases like 'Here is the answer' or 'Here's what you requested'. ";
            fullPrompt += "Your response should be ready to paste directly into the document. ";
            fullPrompt += "Be concise and precise. Do not add any meta-commentary about your response.\n\n";
            temperature = 0.5;
            break;

          case "ask":
            fullPrompt += "You are a helpful AI assistant answering questions. ";
            fullPrompt += "Provide clear, informative answers with explanations when needed. ";
            fullPrompt += "You may include introductory phrases and structure your response for clarity.\n\n";
            temperature = 0.7;
            break;

          case "makeChanges":
            fullPrompt += "You are a versatile AI assistant. ";
            fullPrompt += "Adapt your response style based on the context and type of request. ";
            fullPrompt += "For content generation requests, be direct. For questions, be explanatory.\n\n";
            temperature = 0.7;
            break;
        }

        if (context) {
          fullPrompt += `Context: ${context}\n`;
        }

        if (document && document.title &&
          document.title.trim() !== '' &&
          document.title.toLowerCase() !== 'untitled document' &&
          document.title.toLowerCase() !== 'untitled') {
          fullPrompt += `Document Title: ${document.title}\n`;
        }

        const effectiveChatHistory = document ? documentChatHistory : chatHistory;

        if (effectiveChatHistory.length > 0) {
          fullPrompt += "Chat History:\n";

          if (typeof effectiveChatHistory[0] === 'string') {
            effectiveChatHistory.forEach((message: string, index: number) => {
              const role = index % 2 === 0 ? 'User' : 'Assistant';
              fullPrompt += `${role}: ${message}\n`;
            });
          } else {
            effectiveChatHistory.forEach((msg: any) => {
              fullPrompt += `${msg.role || 'User'}: ${msg.content || msg}\n`;
            });
          }

          fullPrompt += "\n";
        }

        fullPrompt += `Request: ${prompt}`;

        if (mode === "agent") {
          fullPrompt += "\n\nRemember: Respond with ONLY the content requested, no explanatory text or introductions.";
        }

        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: temperature,
          },
        });

        let text = result.response.text();
        let shouldInsert = false;
        let detectedIntent = mode;

        if (mode === "agent") {
          text = cleanAgentResponse(text);
          shouldInsert = true;
        } else if (mode === "auto") {
          const isContentGeneration = detectContentGenerationIntent(prompt);

          if (isContentGeneration) {
            text = cleanAgentResponse(text);
            shouldInsert = true;
            detectedIntent = "agent";
          } else {
            shouldInsert = false;
            detectedIntent = "ask";
          }
        }

        let chatHistoryLength = null;
        if (document) {
          const updatedChatHistory = await updateDocumentChatHistory(
            documentId,
            prompt,
            text,
            document.chatHistory || []
          );
          chatHistoryLength = updatedChatHistory.length;
        }

        return {
          text,
          shouldInsert,
          detectedIntent,
          chatHistoryLength
        };
      }
    );

    return res.status(200).json({
      success: true,
      text: generationResult.text,
      model: process.env.GEMINI_MODEL || "",
      mode: mode,
      shouldInsert: generationResult.shouldInsert,
      detectedIntent: generationResult.detectedIntent,
      userId: req.user.userId,
      documentId: documentId || null,
      documentTitle: document?.title || null,
      chatHistoryLength: generationResult.chatHistoryLength,
      creditsUsed: CREDIT_COSTS.TEXT_GENERATION,
      remainingCredits
    });
  } catch (error: any) {
    console.error("Error generating text:", error);

    if (error.message?.includes('Insufficient credits')) {
      return res.status(402).json({
        error: "Insufficient credits",
        details: error.message
      });
    }

    if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
      return res.status(401).json({
        error: "Invalid API key. Please check your GEMINI_API_KEY in .env file"
      });
    }

    if (error.status === 429 || error.message?.includes('quota')) {
      return res.status(429).json({
        error: "API quota exceeded. Please try again later.",
        details: "Daily quota limit reached for Gemini API"
      });
    }

    return res.status(500).json({
      error: "Failed to generate text",
      details: error.message
    });
  }
};

function cleanAgentResponse(text: string): string {
  const prefixesToRemove = [
    /^(Here is|Here's|Here are)\s+/i,
    /^(The answer is|The response is|The text is)\s*:?\s*/i,
    /^(I'll|I will|Let me)\s+.*?:\s*/i,
    /^(Based on|According to).*?,\s*/i,
    /^(Sure|Certainly|Of course)[,!.]\s*/i,
    /^(Here you go|There you go)[,!.]\s*/i,
    /^(As requested)[,!.]\s*/i
  ];

  let cleanText = text.trim();

  for (const prefix of prefixesToRemove) {
    cleanText = cleanText.replace(prefix, '');
  }

  const suffixesToRemove = [
    /\s+(Hope this helps!?|Let me know if you need.*|Feel free to.*|Is there anything else.*)\s*$/i,
    /\s+(I hope this is what you were looking for.*|Does this meet your needs.*)\s*$/i
  ];

  for (const suffix of suffixesToRemove) {
    cleanText = cleanText.replace(suffix, '');
  }

  cleanText = cleanText.replace(/\n\n\n+/g, '\n\n');

  return cleanText.trim();
}

function detectContentGenerationIntent(prompt: string): boolean {
  const lowerPrompt = prompt.toLowerCase().trim();

  const contentGenerationIndicators = [
    'write', 'create', 'generate', 'compose', 'draft', 'make', 'build',
    'design', 'develop', 'craft', 'produce', 'formulate',

    'paragraph', 'sentence', 'story', 'article', 'essay', 'letter', 'email',
    'report', 'summary', 'description', 'content', 'text', 'copy',
    'introduction', 'conclusion', 'heading', 'title', 'subject line',
    'bullet points', 'list', 'outline', 'script', 'dialogue',

    'give me a', 'provide a', 'show me a', 'come up with',
    'help me write', 'help me create', 'i need a', 'i want a'
  ];

  const questionIndicators = [
    'what', 'how', 'why', 'when', 'where', 'who', 'which', 'whose',

    'can you explain', 'what is', 'what are', 'how do', 'how does',
    'why do', 'why does', 'when should', 'where can', 'who is',
    'is it', 'are there', 'do you', 'does it', 'will it', 'would it',
    'should i', 'could you', 'tell me about', 'explain'
  ];

  const hasContentGeneration = contentGenerationIndicators.some(indicator =>
    lowerPrompt.includes(indicator)
  );

  const hasQuestionPattern = questionIndicators.some(indicator =>
    lowerPrompt.includes(indicator)
  );

  const endsWithQuestionMark = lowerPrompt.endsWith('?');

  if (hasContentGeneration && !endsWithQuestionMark) {
    return true;
  }

  if (hasQuestionPattern || endsWithQuestionMark) {
    return false;
  }

  if (lowerPrompt.length < 50 && hasContentGeneration) {
    return true;
  }

  return false;
}

export const getDocumentChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    try {
      const document = await verifyDocumentOwnership(documentId, req.user.userId);

      return res.status(200).json({
        success: true,
        documentId,
        documentTitle: document.title,
        chatHistory: document.chatHistory || [],
        chatHistoryLength: document.chatHistory?.length || 0,
        lastUpdated: document.updatedAt
      });
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  } catch (error: any) {
    console.error('Get document chat history error:', error);
    return res.status(500).json({
      error: 'Failed to get document chat history',
      details: error.message
    });
  }
};

export const clearDocumentChatHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { documentId } = req.params;

    if (!documentId) {
      return res.status(400).json({ error: 'Document ID is required' });
    }

    try {
      await verifyDocumentOwnership(documentId, req.user.userId);

      await prisma.documents.update({
        where: { id: parseInt(documentId) },
        data: {
          chatHistory: [],
          updatedAt: new Date()
        }
      });

      return res.status(200).json({
        success: true,
        documentId,
        message: 'Chat history cleared successfully'
      });
    } catch (error: any) {
      return res.status(404).json({ error: error.message });
    }
  } catch (error: any) {
    console.error('Clear document chat history error:', error);
    return res.status(500).json({
      error: 'Failed to clear document chat history',
      details: error.message
    });
  }
};

export const humanizeAIText = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const {
      text,
      model = "undetectable",
      words = true,
      costs = true,
      language = "English"
    } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        error: 'Text is required and must be a string'
      });
    }

    if (text.trim().length === 0) {
      return res.status(400).json({
        error: 'Text cannot be empty'
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        error: 'Text is too long. Maximum 10,000 characters allowed'
      });
    }

    const apiKey = process.env.REPHRASY_API_KEY;

    if (!apiKey) {
      console.error('REPHRASY_API_KEY not found in environment variables');
      return res.status(500).json({
        error: 'Humanization service is not configured. Please contact administrator.'
      });
    }

    // Execute humanization with credit transaction
    const { result, remainingCredits } = await withCreditTransaction(
      req.user.userId,
      CREDIT_COSTS.HUMANIZATION,
      async () => {
        const humanizeResult = await humanizeText(text, apiKey, {
          model,
          words,
          costs,
          language
        });

        if (humanizeResult.error) {
          throw new Error(humanizeResult.message || humanizeResult.error);
        }

        return humanizeResult;
      }
    );

    return res.status(200).json({
      success: true,
      humanized_text: result.humanized_text,
      credits_used: result.credits_used,
      cost: result.cost,
      model,
      language,
      userId: req.user.userId,
      creditsUsed: CREDIT_COSTS.HUMANIZATION,
      remainingCredits
    });

  } catch (error: any) {
    console.error('Humanize text error:', error);

    if (error.message?.includes('Insufficient credits')) {
      return res.status(402).json({
        error: "Insufficient credits",
        details: error.message
      });
    }

    if (error.message?.includes('HTTP error! status: 401')) {
      return res.status(401).json({
        error: 'Invalid API key for humanization service'
      });
    }

    if (error.message?.includes('HTTP error! status: 429')) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.'
      });
    }

    if (error.message?.includes('HTTP error! status: 402')) {
      return res.status(402).json({
        error: 'Insufficient credits for humanization service'
      });
    }

    return res.status(500).json({
      error: 'Failed to humanize text',
      details: error.message
    });
  }
};
