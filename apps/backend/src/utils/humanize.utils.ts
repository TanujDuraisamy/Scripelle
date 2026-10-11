interface HumanizeRequest {
  text: string;
  model?: string;
  words?: boolean;
  costs?: boolean;
  language?: string;
}

interface HumanizeResponse {
  humanized_text?: string;
  credits_used?: number;
  cost?: number;
  error?: string;
  message?: string;
}

/**
 * Humanize AI-generated text to make it sound more natural and human-like
 * @param text - The text to humanize
 * @param apiKey - Rephrasy API key
 * @param options - Optional configuration for humanization
 * @returns Promise with humanized text and usage information
 */
export async function humanizeText(
  text: string,
  apiKey: string,
  options: Omit<HumanizeRequest, 'text'> = {}
): Promise<HumanizeResponse> {
  const url = "https://v2-humanizer.rephrasy.ai/api";

  const headers = {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  };

  const data: HumanizeRequest = {
    text,
    model: options.model || "undetectable",
    words: options.words !== undefined ? options.words : true,
    costs: options.costs !== undefined ? options.costs : true,
    language: options.language || "English",
    ...options
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const result: HumanizeResponse = await response.json();
    return result;
  } catch (error: any) {
    console.error('Error humanizing text:', error);
    throw new Error(`Failed to humanize text: ${error.message}`);
  }
}
