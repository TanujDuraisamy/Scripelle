/**
 * Extracts the target tag from an AI response and returns the target type
 * @param response - The AI response string that may contain a target tag
 * @returns "document" | "sidebar" - The target where the response should be rendered
 */
export function extractTargetTag(response: string): "document" | "sidebar" {
  // Default to sidebar if no tag is found
  const defaultTarget: "document" | "sidebar" = "sidebar";
  
  if (!response || typeof response !== 'string') {
    return defaultTarget;
  }

  // Search for the target tag pattern
  const targetMatch = response.match(/<<TARGET:(document|sidebar)>>/);
  
  if (!targetMatch) {
    return defaultTarget;
  }

  const target = targetMatch[1] as "document" | "sidebar";
  
  // Remove the target tag from the response
  const cleanResponse = response.replace(/<<TARGET:(document|sidebar)>>/g, '').trim();
  
  return target;
}

/**
 * Cleans an AI response by removing target tags
 * @param response - The AI response string that may contain target tags
 * @returns The cleaned response without target tags
 */
export function cleanResponse(response: string): string {
  if (!response || typeof response !== 'string') {
    return '';
  }
  
  return response.replace(/<<TARGET:(document|sidebar)>>/g, '').trim();
}

/**
 * Processes an AI response and returns both the target and cleaned content
 * @param response - The AI response string
 * @returns Object containing target and cleaned content
 */
export function processAIResponse(response: string): {
  target: "document" | "sidebar";
  content: string;
} {
  const target = extractTargetTag(response);
  const content = cleanResponse(response);
  
  return { target, content };
}

// BuildPrompt types
export type Message = { role: "user" | "assistant", content: string };

export interface BuildPromptArgs {
  messages: Message[];
  currentPrompt: string;
  docText: string;
  selectedText?: string | null;
  systemPrompt: string;
}

/**
 * Builds the messages array for LLM with system, chat, document, and selection context.
 */
export function buildPrompt({
  messages,
  currentPrompt,
  docText,
  selectedText,
  systemPrompt,
}: BuildPromptArgs): { role: "system" | "user" | "assistant"; content: string }[] {
  let systemContent = systemPrompt.trim() + "\n\n<document_context>\n" + docText + "\n</document_context>";
  if (selectedText && selectedText.trim()) {
    systemContent += "\n\n<selected_text>\n" + selectedText + "\n</selected_text>";
  }
  const result: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: systemContent }
  ];
  for (const msg of messages) {
    result.push({ role: msg.role, content: msg.content });
  }
  result.push({ role: "user", content: currentPrompt });
  return result;
} 