import { Request, Response } from 'express';
import { generateContent } from '../services/gemini.service';
import { AutocompletionRequest, AutocompletionResponse, SuggestionItem } from '../types/autocompletion.types';
import { randomUUID as uuidv4 } from 'node:crypto';
import { AuthRequest } from '../types/auth.types';
import { CREDIT_COSTS, withCreditTransaction } from '../utils/credit.utils';


export const getAutocompletionSuggestions = async (req: AuthRequest, res: Response) => {
  const startTime = Date.now();

  try {
    // Check if user is authenticated
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        data: null
      });
    }

    const {
      text,
      cursorPosition = text?.length || 0,
      context = '',
      documentType = 'general',
      maxSuggestions = 5,
      strategy = 'ai'
    }: AutocompletionRequest = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Text is required and must be a string',
        data: null
      });
    }

    if (text.length > 10000) {
      return res.status(400).json({
        success: false,
        message: 'Text is too long. Maximum 10,000 characters allowed',
        data: null
      });
    }

    // Execute autocompletion with credit transaction
    const { result: suggestions, remainingCredits } = await withCreditTransaction(
      req.user.userId,
      CREDIT_COSTS.AUTOCOMPLETION,
      async () => {
        return await generateTextPredictions(
          text,
          cursorPosition,
          context,
          documentType,
          maxSuggestions
        );
      }
    );

    const processingTime = Date.now() - startTime;

    const response: AutocompletionResponse = {
      suggestions,
      strategy: strategy || 'ai',
      processingTime,
      hasMore: false
    };

    res.json({
      success: true,
      message: 'Autocompletion suggestions generated successfully',
      data: response,
      creditsUsed: CREDIT_COSTS.AUTOCOMPLETION,
      remainingCredits
    });

  } catch (error: any) {
    console.error('Autocompletion error:', error);

    const processingTime = Date.now() - startTime;

    if (error.message?.includes('Insufficient credits')) {
      return res.status(402).json({
        success: false,
        message: 'Insufficient credits',
        data: {
          suggestions: [],
          strategy: 'ai',
          processingTime,
          hasMore: false
        },
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to generate autocompletion suggestions',
      data: {
        suggestions: [],
        strategy: 'ai',
        processingTime,
        hasMore: false
      }
    });
  }
};

async function generateTextPredictions(
  text: string,
  cursorPosition: number,
  context: string,
  documentType: string,
  maxSuggestions: number
): Promise<SuggestionItem[]> {
  try {
    console.log('Starting text prediction generation...');
    const beforeCursor = text.substring(0, cursorPosition);
    const afterCursor = text.substring(cursorPosition);

    console.log('Creating prompt...');
    const prompt = createAutocompletionPrompt(beforeCursor, afterCursor, context, documentType, maxSuggestions);
    console.log('Prompt created, length:', prompt.length);

    console.log('Calling Gemini API...');
    const geminiResponse = await generateContent(prompt, 'gemini-1.5-flash');
    console.log('Gemini response received, length:', geminiResponse.length);

    console.log('Parsing response...');
    const suggestions = parseGeminiResponse(geminiResponse, maxSuggestions);
    console.log('Generated suggestions count:', suggestions.length);

    return suggestions;
  } catch (error: any) {
    console.error('Error generating text predictions:', error.message);

    if (error.status === 429 || error.message?.includes('quota')) {
      console.log('Quota exceeded, returning fallback suggestions');
      return createQuotaExceededSuggestions(text.substring(0, cursorPosition));
    }

    console.log('API error, returning fallback suggestions');
    return createDefaultSuggestions();
  }
}


function createAutocompletionPrompt(
  beforeCursor: string,
  afterCursor: string,
  context: string,
  documentType: string,
  maxSuggestions: number
): string {
  const contextInfo = context ? `\nContext: ${context}` : '';
  const afterCursorInfo = afterCursor ? `\nText after cursor: "${afterCursor}"` : '';

  const documentTypeInstructions = getDocumentTypeInstructions(documentType);

  return `You are an advanced text completion AI. Your task is to predict and suggest the most appropriate text continuation.

Text before cursor: "${beforeCursor}"${afterCursorInfo}${contextInfo}
Document type: ${documentType}
${documentTypeInstructions}

Please provide ${maxSuggestions} different text completion suggestions that would naturally continue from where the cursor is positioned. Each suggestion should:
1. Be contextually appropriate and grammatically correct
2. Flow naturally from the existing text
3. Be between 1-15 words long
4. Be relevant to the document type
5. Offer variety in completion style (short phrases, longer continuations, different directions)

Format your response as a JSON array with objects containing:
- "text": the suggested completion text
- "type": one of "completion", "continuation", or "replacement"
- "confidence": a number between 0 and 1 representing your confidence
- "preview": a brief description of what the suggestion does

Example format:
[
  {
    "text": "suggested completion text",
    "type": "continuation",
    "confidence": 0.9,
    "preview": "Continues the sentence about..."
  }
]

Respond ONLY with the JSON array, no additional text or explanations.`;
}

function getDocumentTypeInstructions(documentType: string): string {
  switch (documentType) {
    case 'email':
      return 'Focus on professional, clear, and courteous language appropriate for email communication.';
    case 'article':
      return 'Use engaging, informative language suitable for article writing with good flow and readability.';
    case 'code':
      return 'Suggest code completions that are syntactically correct and follow best practices.';
    case 'general':
    default:
      return 'Provide natural, contextually appropriate text completions.';
  }
}

function parseGeminiResponse(geminiResponse: string, maxSuggestions: number): SuggestionItem[] {
  try {
    let parsedResponse: any[];

    try {
      const cleanedResponse = geminiResponse
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();

      parsedResponse = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.warn('Failed to parse Gemini JSON response, creating fallback suggestions');
      return createFallbackSuggestions(geminiResponse, maxSuggestions);
    }

    if (!Array.isArray(parsedResponse)) {
      throw new Error('Response is not an array');
    }

    const suggestions: SuggestionItem[] = parsedResponse
      .slice(0, maxSuggestions)
      .map((item, index) => ({
        id: uuidv4(),
        text: item.text || `Suggestion ${index + 1}`,
        type: validateSuggestionType(item.type),
        confidence: Math.max(0, Math.min(1, item.confidence || 0.7)),
        preview: item.preview || 'AI generated suggestion',
        context: item.context || undefined
      }))
      .filter(suggestion => suggestion.text && suggestion.text.length > 0);

    return suggestions.length > 0 ? suggestions : createDefaultSuggestions();

  } catch (error) {
    console.error('Error parsing Gemini response:', error);
    return createFallbackSuggestions(geminiResponse, maxSuggestions);
  }
}

function validateSuggestionType(type: string): 'completion' | 'continuation' | 'replacement' {
  const validTypes = ['completion', 'continuation', 'replacement'];
  return validTypes.includes(type) ? type as any : 'continuation';
}

/**
 * Create fallback suggestions when JSON parsing fails
 */
function createFallbackSuggestions(response: string, maxSuggestions: number): SuggestionItem[] {
  // Split response into lines and use them as suggestions
  const lines = response
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('[') && !line.startsWith('{'))
    .slice(0, maxSuggestions);

  if (lines.length === 0) {
    return createDefaultSuggestions();
  }

  return lines.map((line, index) => ({
    id: uuidv4(),
    text: line,
    type: 'continuation' as const,
    confidence: 0.6 - (index * 0.1),
    preview: `AI suggestion ${index + 1}`
  }));
}

/**
 * Create quota exceeded suggestions with context-aware fallbacks
 */
function createQuotaExceededSuggestions(beforeCursor: string): SuggestionItem[] {
  const contextualSuggestions = generateContextualSuggestions(beforeCursor);

  return contextualSuggestions.map((suggestion, index) => ({
    id: uuidv4(),
    text: suggestion.text,
    type: suggestion.type as 'completion' | 'continuation' | 'replacement',
    confidence: 0.7 - (index * 0.1),
    preview: suggestion.preview + ' (Offline suggestion)'
  }));
}

/**
 * Generate contextual suggestions based on the text before cursor
 */
function generateContextualSuggestions(beforeCursor: string): Array<{ text: string, type: string, preview: string }> {
  const text = beforeCursor.toLowerCase().trim();
  const lastWord = text.split(' ').pop() || '';
  const lastSentence = text.split(/[.!?]/).pop() || '';

  // Email-specific suggestions
  if (text.includes('dear') || text.includes('hi') || text.includes('hello')) {
    return [
      { text: ', I hope this email finds you well.', type: 'continuation', preview: 'Polite email opening' },
      { text: ', I wanted to reach out regarding', type: 'continuation', preview: 'Professional inquiry' },
      { text: ', thank you for your time.', type: 'continuation', preview: 'Appreciation' }
    ];
  }

  // Question completions
  if (lastSentence.includes('what') || lastSentence.includes('how') || lastSentence.includes('when') || lastSentence.includes('where')) {
    return [
      { text: ' do you think?', type: 'completion', preview: 'Question completion' },
      { text: ' would be best?', type: 'completion', preview: 'Choice question' },
      { text: ' should we proceed?', type: 'completion', preview: 'Action question' }
    ];
  }

  // Common word completions
  const wordCompletions: { [key: string]: Array<{ text: string, type: string, preview: string }> } = {
    'the': [
      { text: ' best way to', type: 'continuation', preview: 'Superlative phrase' },
      { text: ' main reason', type: 'continuation', preview: 'Explanation starter' },
      { text: ' most important', type: 'continuation', preview: 'Priority phrase' }
    ],
    'i': [
      { text: ' believe that', type: 'continuation', preview: 'Opinion statement' },
      { text: ' would like to', type: 'continuation', preview: 'Polite request' },
      { text: ' think we should', type: 'continuation', preview: 'Suggestion' }
    ],
    'we': [
      { text: ' need to', type: 'continuation', preview: 'Necessity statement' },
      { text: ' should consider', type: 'continuation', preview: 'Proposal' },
      { text: ' can work together', type: 'continuation', preview: 'Collaboration' }
    ]
  };

  if (wordCompletions[lastWord]) {
    return wordCompletions[lastWord];
  }

  // Default contextual suggestions
  return [
    { text: ' and', type: 'completion', preview: 'Connect ideas' },
    { text: ' that', type: 'completion', preview: 'Specify subject' },
    { text: ' to', type: 'completion', preview: 'Purpose or direction' },
    { text: '.', type: 'completion', preview: 'End sentence' },
    { text: ' with', type: 'completion', preview: 'Add accompaniment' }
  ];
}

/**
 * Create default suggestions as last resort
 */
function createDefaultSuggestions(): SuggestionItem[] {
  const defaultSuggestions = [
    { text: ' and', preview: 'Connect with "and"' },
    { text: ' that', preview: 'Continue with "that"' },
    { text: ' to', preview: 'Continue with "to"' },
    { text: '.', preview: 'End sentence' },
    { text: ' with', preview: 'Continue with "with"' }
  ];

  return defaultSuggestions.map((suggestion, index) => ({
    id: uuidv4(),
    text: suggestion.text,
    type: 'completion' as const,
    confidence: 0.5 - (index * 0.05),
    preview: suggestion.preview
  }));
}

/**
 * Alternative function for simple text prediction (without complex formatting)
 */
export const predictNextText = async (inputText: string, context?: string): Promise<string> => {
  try {
    const textAnalysis = analyzeTextForPrediction(inputText);

    const prompt = `You are an advanced text completion AI assistant. Analyze the following text and provide the most natural and contextually appropriate continuation.

INPUT TEXT: "${inputText}"${context ? `\nADDITIONAL CONTEXT: ${context}` : ''}

TEXT ANALYSIS:
- Last sentence: "${textAnalysis.lastSentence}"
- Writing style: ${textAnalysis.style}
- Likely completing: ${textAnalysis.completionType}

INSTRUCTIONS:
1. Provide ONLY the next logical continuation (2-12 words)
2. Match the writing style and tone of the input
3. Ensure grammatical correctness and natural flow
4. If the text appears incomplete (ending with "the", "a", "an", etc.), complete the phrase
5. If it's mid-sentence, continue the thought naturally
6. If it ends with punctuation, start a new related sentence
7. DO NOT repeat the input text
8. DO NOT add explanations or quotes
9. Respond with ONLY the continuation text

CONTINUATION:`;

    const prediction = await generateContent(prompt, 'gemini-2.0-flash-exp');

    const cleanedPrediction = cleanPrediction(prediction, inputText);

    return cleanedPrediction;
  } catch (error: any) {
    console.error('Error predicting next text:', error.message);

    if (error.status === 429 || error.message?.includes('quota')) {
      return generateAdvancedFallback(inputText, context);
    }

    return generateAdvancedFallback(inputText, context);
  }
};

/**
 * Generate a simple fallback prediction when API is unavailable
 */
function generateSimpleFallback(text: string): string {
  const words = text.trim().split(' ');
  const lastWord = words[words.length - 1]?.toLowerCase() || '';

  // Simple rule-based completions
  const completions: { [key: string]: string[] } = {
    'the': ['best way', 'main reason', 'most important thing'],
    'i': ['think', 'believe', 'would like to'],
    'we': ['need to', 'should', 'can'],
    'you': ['can', 'should', 'might want to'],
    'it': ['is', 'was', 'will be'],
    'this': ['is', 'will', 'should'],
    'that': ['is', 'was', 'will']
  };

  if (completions[lastWord]) {
    const options = completions[lastWord];
    return options[Math.floor(Math.random() * options.length)];
  }

  // If no specific completion, return common connectors
  const connectors = ['and', 'but', 'so', 'that', 'with', 'for'];
  return connectors[Math.floor(Math.random() * connectors.length)];
}

/**
 * Analyze text to understand context for better predictions
 */
function analyzeTextForPrediction(text: string): {
  lastSentence: string;
  style: string;
  completionType: string;
} {
  const trimmedText = text.trim();
  const sentences = trimmedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
  const lastSentence = sentences[sentences.length - 1]?.trim() || trimmedText;
  const words = trimmedText.split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase() || '';

  // Detect writing style
  let style = 'casual';
  if (trimmedText.includes('Dear') || trimmedText.includes('Sincerely') || trimmedText.includes('regards')) {
    style = 'formal/professional';
  } else if (trimmedText.includes('Additionally') || trimmedText.includes('Furthermore') || trimmedText.includes('Moreover')) {
    style = 'academic/formal';
  } else if (trimmedText.match(/[!]{2,}/) || trimmedText.match(/[?]{2,}/)) {
    style = 'informal/excited';
  }

  // Detect completion type
  let completionType = 'sentence continuation';
  const incompleteTriggers = ['the', 'a', 'an', 'this', 'that', 'these', 'those', 'my', 'your', 'his', 'her', 'their', 'our'];

  if (incompleteTriggers.includes(lastWord)) {
    completionType = 'phrase/noun completion';
  } else if (lastSentence.match(/\b(what|where|when|why|how|who)\b/i)) {
    completionType = 'question completion';
  } else if (lastWord.match(/[,;:]$/)) {
    completionType = 'list or clause continuation';
  } else if (lastWord.match(/[.!?]$/)) {
    completionType = 'new sentence';
  } else if (lastWord.match(/^(is|are|was|were|will|would|could|should|can|may|might)$/i)) {
    completionType = 'predicate completion';
  }

  return {
    lastSentence: lastSentence.substring(Math.max(0, lastSentence.length - 100)),
    style,
    completionType
  };
}


function cleanPrediction(prediction: string, originalText: string): string {
  let cleaned = prediction.trim();

  cleaned = cleaned.replace(/^["']|["']$/g, '');
  cleaned = cleaned.replace(/^CONTINUATION:\s*/i, '');
  cleaned = cleaned.replace(/^Here's?\s+(the|a)\s+continuation:?\s*/i, '');
  cleaned = cleaned.replace(/^The\s+continuation\s+is:?\s*/i, '');

  const lastWords = originalText.trim().split(/\s+/).slice(-5).join(' ').toLowerCase();
  if (cleaned.toLowerCase().startsWith(lastWords)) {
    cleaned = cleaned.substring(lastWords.length).trim();
  }

  if (cleaned.match(/^[,;:]/) && !originalText.trim().endsWith(' ')) {
    cleaned = ' ' + cleaned;
  }

  const words = cleaned.split(/\s+/);
  if (words.length > 15) {
    cleaned = words.slice(0, 15).join(' ');
    if (!cleaned.match(/[.!?]$/)) {
      cleaned += '...';
    }
  }

  return cleaned;
}


function generateAdvancedFallback(text: string, context?: string): string {
  const trimmedText = text.trim();
  const words = trimmedText.split(/\s+/);
  const lastWord = words[words.length - 1]?.toLowerCase() || '';
  const lastTwoWords = words.slice(-2).join(' ').toLowerCase();
  const lastSentence = trimmedText.split(/[.!?]/).pop()?.trim() || '';

  const advancedCompletions: { [key: string]: string[] } = {
    'the': ['best way to', 'most important', 'main reason', 'next step', 'following information'],
    'a': ['new approach', 'better solution', 'great opportunity', 'simple way', 'good idea'],
    'an': ['important aspect', 'interesting perspective', 'excellent example', 'effective method', 'ideal solution'],

    'i': ['believe that', 'think we should', 'would like to', 'am confident that', 'hope to'],
    'we': ['need to', 'should consider', 'can achieve', 'will work on', 'are planning to'],
    'you': ['can see that', 'should know', 'might want to', 'will find', 'may notice'],
    'it': ['is important to', 'will help', 'can be', 'should be', 'has been'],

    'in': ['order to', 'the future', 'this case', 'my opinion', 'recent years'],
    'on': ['the other hand', 'this topic', 'behalf of', 'schedule', 'time'],
    'at': ['the same time', 'this point', 'the moment', 'least', 'first'],
    'to': ['be honest', 'make sure', 'achieve this', 'clarify', 'summarize'],

    'is': ['important to note', 'essential that', 'clear that', 'necessary to', 'worth mentioning'],
    'are': ['working on', 'looking forward to', 'pleased to', 'committed to', 'ready to'],
    'will': ['be able to', 'help you', 'continue to', 'provide', 'ensure that'],
    'can': ['help you', 'be found', 'see that', 'provide', 'ensure'],
    'have': ['been working on', 'the opportunity to', 'noticed that', 'completed', 'received'],

    'then': ['we can', 'it will', 'you should', 'the next step is', 'proceed with'],
    'now': ['we can', 'it is', 'let\'s', 'you should', 'that we'],
    'next': ['step is to', 'we will', 'time', 'few days', 'week'],
    'first': ['of all', 'we need to', 'let me', 'thing to consider', 'step is'],
  };

  const twoWordPatterns: { [key: string]: string[] } = {
    'looking forward': ['to hearing from you', 'to working with', 'to the meeting', 'to your response'],
    'thank you': ['for your time', 'for your consideration', 'for reaching out', 'for your help'],
    'i would': ['like to', 'appreciate', 'be happy to', 'recommend'],
    'we are': ['pleased to', 'working on', 'excited to', 'committed to'],
    'this is': ['a great opportunity', 'important because', 'why we', 'how we'],
    'that is': ['why we', 'how we', 'the reason', 'what makes'],
    'in order': ['to achieve', 'to ensure', 'to provide', 'to complete'],
  };

  if (twoWordPatterns[lastTwoWords]) {
    const options = twoWordPatterns[lastTwoWords];
    return options[Math.floor(Math.random() * options.length)];
  }

  if (advancedCompletions[lastWord]) {
    const options = advancedCompletions[lastWord];
    return options[Math.floor(Math.random() * options.length)];
  }

  if (context) {
    if (context.toLowerCase().includes('email') || lastSentence.toLowerCase().includes('dear')) {
      return ['I hope this message finds you well', 'Thank you for your time', 'I look forward to hearing from you'][Math.floor(Math.random() * 3)];
    }
    if (context.toLowerCase().includes('question')) {
      return ['would be', 'should we', 'do you think'][Math.floor(Math.random() * 3)];
    }
  }

  if (lastWord.match(/[.!?]$/)) {
    const starters = ['Additionally,', 'Furthermore,', 'Moreover,', 'However,', 'Therefore,', 'In conclusion,'];
    return starters[Math.floor(Math.random() * starters.length)];
  }

  if (lastSentence.match(/\b(what|where|when|why|how|who)\b/i)) {
    return ['would you', 'do you think', 'can we', 'should we'][Math.floor(Math.random() * 4)];
  }

  const smartConnectors = [
    'and', 'that', 'to', 'for', 'with', 'in',
    'which', 'because', 'so that', 'as well as'
  ];

  return smartConnectors[Math.floor(Math.random() * smartConnectors.length)];
}
