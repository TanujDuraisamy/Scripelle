import { Request, Response } from 'express';
import { generateContent, generateContentStream, startChat } from '../services/gemini.service';
import { AuthRequest } from '../types/auth.types';

/**
 * Generate AI content
 * POST /ai/generate
 */
export async function generate(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    const response = await generateContent(prompt, model);

    res.status(200).json({
      success: true,
      response,
      model: model || 'gemini-2.0-flash-exp'
    });
  } catch (error: any) {
    console.error('Generate error:', error);

    if (error.message?.includes('API key')) {
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    });
  }
}

/**
 * Generate AI content with streaming
 * POST /ai/generate-stream
 */
export async function generateStream(req: Request, res: Response): Promise<void> {
  try {
    const { prompt, model } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const stream = await generateContentStream(prompt, model);

    for await (const chunk of stream) {
      const chunkText = chunk.text();
      res.write(`data: ${JSON.stringify({ text: chunkText })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error: any) {
    console.error('Generate stream error:', error);
    res.status(500).json({
      error: 'Failed to generate content stream',
      details: error.message
    });
  }
}

/**
 * Chat with AI (maintains conversation)
 * POST /ai/chat
 */
export async function chat(req: Request, res: Response): Promise<void> {
  try {
    const { message, history, model } = req.body;

    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }

    const chatSession = startChat(history || [], model);
    const result = await chatSession.sendMessage(message);
    const response = result.response.text();

    res.status(200).json({
      success: true,
      response,
      model: model || 'gemini-2.0-flash-exp'
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to process chat',
      details: error.message
    });
  }
}

/**
 * Protected AI endpoint - requires authentication
 * POST /ai/generate-protected
 */
export async function generateProtected(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { prompt, model } = req.body;

    if (!prompt) {
      res.status(400).json({ error: 'Prompt is required' });
      return;
    }

    // You can add credit check here
    // const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    // if (user.availableCredits <= 0) {
    //   res.status(403).json({ error: 'Insufficient credits' });
    //   return;
    // }

    const response = await generateContent(prompt, model);

    // Deduct credits here if needed
    // await prisma.user.update({
    //   where: { id: req.user.userId },
    //   data: { availableCredits: user.availableCredits - 1 }
    // });

    res.status(200).json({
      success: true,
      response,
      model: model || 'gemini-2.0-flash-exp',
      userId: req.user.userId
    });
  } catch (error: any) {
    console.error('Generate protected error:', error);
    res.status(500).json({
      error: 'Failed to generate content',
      details: error.message
    });
  }
}
