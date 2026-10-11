// This controller handles small completion requests from the editor
// It enforces one-sentence limit and delegates to an existing AI provider
// Key Words: backend, endpoint, completion, one sentence

import fetch from 'node-fetch';

function toOneSentence(text) {
  if (!text) return '';
  const m = text.match(/^[\s\S]*?[\.\?\!]/);
  return (m ? m[0] : text).trim();
}

export async function createCompletion(req, res) {
  try {
    const { prefix = '', context = {} } = req.body || {};

    // Check if API key is available
    if (!process.env.RAPID_API_KEY) {
      console.log('RAPID_API_KEY not found, returning fallback suggestion');
      // Return a fallback suggestion for testing
      const fallbackSuggestions = [
        'This is a test completion.',
        'The quick brown fox jumps over the lazy dog.',
        'In the beginning, there was light.',
        'She walked down the street with purpose.',
        'The weather today is quite pleasant.'
      ];
      const randomSuggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
      return res.status(200).json({ suggestion: randomSuggestion });
    }

    // Build a minimal prompt for the upstream model
    // We do not expose this to the client; this is server-only.
    const system = 'You write a single, short, helpful next sentence as a continuation. No extra spaces.';
    const userParts = [];
    if (context && context.title) userParts.push(`Title: ${context.title}`);
    if (context && context.blockType) userParts.push(`Block: ${context.blockType}`);
    if (context && context.docSnippet) userParts.push(`Context: ${context.docSnippet}`);
    if (prefix) userParts.push(`Prefix: ${prefix}`);
    const user = userParts.join('\n');

    console.log('Making completion request with:', { prefix, context });

    // Reuse existing Deepseek provider pathway for simplicity
    const response = await fetch('https://deepseek-v31.p.rapidapi.com/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': 'deepseek-v31.p.rapidapi.com',
        'x-rapidapi-key': process.env.RAPID_API_KEY,
      },
      body: JSON.stringify({
        model: 'deepseek-v3',
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
      }),
    });

    if (!response.ok) {
      console.error('Upstream completion failed with status:', response.status);
      return res.status(500).json({ error: 'Upstream completion failed' });
    }
    const data = await response.json();
    const raw = data?.choices?.[0]?.message?.content || '';
    const suggestion = toOneSentence(raw);
    if (!suggestion) return res.status(200).json({ suggestion: '...' });
    return res.status(200).json({ suggestion });
  } catch (err) {
    console.error('Completion error:', err);
    return res.status(500).json({ error: 'Failed to create completion' });
  }
}


