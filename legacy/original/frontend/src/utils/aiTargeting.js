/**
 * Extracts the target tag from an AI response and returns the target type
 * @param {string} response - The AI response string that may contain a target tag
 * @returns {"document" | "sidebar"} - The target where the response should be rendered
 */
export function extractTargetTag(response) {
  // Default to sidebar if no tag is found
  const defaultTarget = "sidebar";
  
  if (!response || typeof response !== 'string') {
    return defaultTarget;
  }

  // Search for the target tag pattern
  const targetMatch = response.match(/<<TARGET:(document|sidebar)>>/);
  
  if (!targetMatch) {
    return defaultTarget;
  }

  const target = targetMatch[1];
  
  return target;
}

/**
 * Cleans an AI response by removing target tags
 * @param {string} response - The AI response string that may contain target tags
 * @returns {string} The cleaned response without target tags
 */
export function cleanResponse(response) {
  if (!response || typeof response !== 'string') {
    return '';
  }
  
  return response.replace(/<<TARGET:(document|sidebar)>>/g, '').trim();
}

/**
 * Processes an AI response and returns both the target and cleaned content
 * @param {string} response - The AI response string
 * @returns {Object} Object containing target and cleaned content
 */
export function processAIResponse(response) {
  const target = extractTargetTag(response);
  const content = cleanResponse(response);
  
  return { target, content };
}

/**
 * Builds the messages array for LLM with system, chat, document, and selection context.
 * @param {Object} args
 * @param {{role: 'user'|'assistant', content: string}[]} args.messages
 * @param {string} args.currentPrompt
 * @param {string} args.docText
 * @param {string|null|undefined} args.selectedText
 * @param {string} args.systemPrompt
 * @returns {{role: 'system'|'user'|'assistant', content: string}[]}
 */
export function buildPrompt({ messages, currentPrompt, docText, selectedText, systemPrompt }) {
  let systemContent = systemPrompt.trim() + "\n\n<document_context>\n" + docText + "\n</document_context>";
  if (selectedText && selectedText.trim()) {
    systemContent += "\n\n<selected_text>\n" + selectedText + "\n</selected_text>";
  }
  const result = [
    { role: "system", content: systemContent }
  ];
  for (const msg of messages) {
    result.push({ role: msg.role, content: msg.content });
  }
  result.push({ role: "user", content: currentPrompt });
  return result;
} 