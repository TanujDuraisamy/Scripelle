// These helpers clean and limit text for safe requests and inserts
// Key Words: trim, sentence, whitespace, clamp

export function trimToOneSentence(text) {
  if (!text) return '';
  const m = text.match(/^[\s\S]*?[\.\?\!]/);
  return (m ? m[0] : text).trim();
}

export function ensureSingleSpaceJoin(prefixEndsWithSpace, suggestion) {
  if (!suggestion) return '';
  const s = suggestion.replace(/^\s+/, '');
  return (prefixEndsWithSpace ? '' : ' ') + s;
}


