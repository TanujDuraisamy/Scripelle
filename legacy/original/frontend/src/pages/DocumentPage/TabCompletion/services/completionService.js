// This file talks to the backend to get a writing suggestion
// Key Words: service, backend, fetch, suggestion, AI, completion

/**
 * Ask the backend for a completion. The backend talks to the AI.
 * We pass in the text before the cursor (prefix) and some context.
 * We also pass an AbortSignal to cancel if the kid (user) keeps typing.
 */
export async function requestCompletion({ prefix, context, signal }) {
  console.log('requestCompletion: Called with prefix:', prefix, 'context:', context);
  
  // Simple safety: make sure inputs are strings/objects
  const safePrefix = typeof prefix === 'string' ? prefix : '';
  const safeContext = context && typeof context === 'object' ? context : {};

  console.log('requestCompletion: Making fetch request to /api/v1/completions');
  const res = await fetch('/api/v1/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prefix: safePrefix, context: safeContext }),
    signal,
    credentials: 'include',
  });

  console.log('requestCompletion: Response status:', res.status);

  if (!res.ok) {
    // If the request failed (not because of abort), we throw so caller can silently ignore.
    console.error('requestCompletion: Request failed with status:', res.status);
    throw new Error(`Completion request failed with status ${res.status}`);
  }

  const data = await res.json();
  console.log('requestCompletion: Response data:', data);
  
  // The backend guarantees a non-empty, one-sentence string, but we still trim here.
  const suggestion = (data && typeof data.suggestion === 'string') ? data.suggestion.trim() : '';
  console.log('requestCompletion: Final suggestion:', suggestion);
  return { suggestion };
}


