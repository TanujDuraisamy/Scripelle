// This is a tiny state box to hold ghost text and where to draw it
// Key Words: store, ghost text, caret box, in-flight, cancel

let subscribers = new Set();

// The little state we need for ghost text
const state = {
  // New overlay-based suggestion state
  suggestion: {
    text: '',              // the suggestion text to show
    range: null,           // the Range object where suggestion should appear
    requestId: null,       // unique ID to ignore stale responses
  },
  generationId: 0,          // increases each time we ask for a new idea
  inFlight: false,          // true when waiting for the backend
  // Legacy fields for backward compatibility during transition
  ghostText: '',            // the light gray suggestion words
  anchorRect: null,         // the box on screen where the caret is
  targetNode: null,         // the DOM node where we plan to insert
  textStyle: null,          // computed style to match font sizing/line-height
  forceNewLine: false,      // hint to start suggestion at next line start
  anchorId: null,           // id of inline ghost anchor
};

export function getCompletionState() {
  return state;
}

export function subscribe(fn) {
  subscribers.add(fn);
  return () => subscribers.delete(fn);
}

function emit() {
  subscribers.forEach((fn) => {
    try { fn(state); } catch {}
  });
}

// New overlay-based methods
export function setSuggestion(text, range, requestId) {
  console.log('completionStore.setSuggestion called with:', { text, range, requestId });
  state.suggestion = {
    text: text || '',
    range: range || null,
    requestId: requestId || null,
  };
  console.log('completionStore: Updated state.suggestion to:', state.suggestion);
  emit();
}

export function clearSuggestion() {
  state.suggestion = {
    text: '',
    range: null,
    requestId: null,
  };
  emit();
}

export function getSuggestion() {
  return state.suggestion;
}

// Legacy methods for backward compatibility
export function setGhostText(ghostText, anchorRect, targetNode, textStyle, forceNewLine = false) {
  state.ghostText = ghostText || '';
  state.anchorRect = anchorRect || null;
  state.targetNode = targetNode || null;
  state.textStyle = textStyle || state.textStyle || null;
  state.forceNewLine = !!forceNewLine;
  emit();
}

export function clearGhost() {
  state.ghostText = '';
  state.anchorRect = null;
  state.targetNode = null;
  state.textStyle = null;
  state.forceNewLine = false;
  state.anchorId = null;
  // Also clear the new suggestion state
  clearSuggestion();
  emit();
}

export function setInFlight(flag) {
  state.inFlight = !!flag;
  emit();
}

export function bumpGeneration() {
  state.generationId += 1;
  emit();
  return state.generationId;
}


