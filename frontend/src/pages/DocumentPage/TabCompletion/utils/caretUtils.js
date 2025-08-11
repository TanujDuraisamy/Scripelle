// These helpers find text before the cursor and where the cursor sits
// Key Words: caret, prefix, rect, insert text, range, selection

export function isSelectionInEditor(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  const anchorNode = sel.anchorNode;
  return editorEl && anchorNode && editorEl.contains(anchorNode);
}

export function getCaretClientRect() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const baseRange = sel.getRangeAt(0).cloneRange();
  baseRange.collapse(true);

  // Insert invisible measuring span to get baseline top/left aligned with caret
  const marker = document.createElement('span');
  marker.style.display = 'inline-block';
  marker.style.width = '1px';
  marker.style.height = '1em';
  marker.style.opacity = '0';
  marker.style.verticalAlign = 'baseline';
  marker.appendChild(document.createTextNode('\u200b'));
  baseRange.insertNode(marker);

  // Now append another invisible span containing the ghost text to measure width
  const r = marker.getBoundingClientRect();
  // Snapshot rect values before cleanup (DOMRect can be live in some engines)
  const markerRect = {
    top: r.top,
    left: r.left,
    bottom: r.bottom,
    right: r.right,
    width: r.width,
    height: r.height,
  };

  // Cleanup
  marker.remove();

  return markerRect;
}

// New overlay-based utilities
export function getCurrentRange() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  return sel.getRangeAt(0).cloneRange();
}

export function isCaretInPageContent(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  
  const range = sel.getRangeAt(0);
  let node = range.startContainer;
  
  // If it's a text node, get its parent
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  // Check if we're inside a .page-content element
  while (node && node !== editorEl) {
    if (node.classList && node.classList.contains('page-content')) {
      return true;
    }
    node = node.parentNode;
  }
  
  return false;
}

export function isCaretInTitle(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return false;
  
  const range = sel.getRangeAt(0);
  let node = range.startContainer;
  
  // If it's a text node, get its parent
  if (node.nodeType === Node.TEXT_NODE) {
    node = node.parentNode;
  }
  
  // Check if we're inside an H1 element (title)
  while (node && node !== editorEl) {
    if (node.nodeName === 'H1') {
      return true;
    }
    node = node.parentNode;
  }
  
  return false;
}

export function getBlockTypeAtSelection(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 'paragraph';
  let node = sel.anchorNode;
  while (node && node !== editorEl) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = node.nodeName;
      if (tag === 'H1') return 'title';
      if (tag === 'LI') return 'list';
      if (tag === 'PRE' || tag === 'CODE') return 'code';
      if (tag === 'BLOCKQUOTE') return 'quote';
    }
    node = node.parentNode;
  }
  return 'paragraph';
}

export function getCurrentBlockElement(editorEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  let node = range.commonAncestorContainer;
  while (node && node !== editorEl && node.nodeType !== Node.ELEMENT_NODE) {
    node = node.parentNode;
  }
  while (node && node !== editorEl) {
    if (/^(P|H1|LI|PRE|BLOCKQUOTE)$/i.test(node.nodeName)) return node;
    node = node.parentNode;
  }
  return editorEl;
}

export function getComputedTextStyleAtCaret() {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  let node = sel.anchorNode;
  if (!node) return null;
  if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
  if (node && node.nodeType === Node.ELEMENT_NODE) {
    const cs = window.getComputedStyle(node);
    return {
      fontSize: cs.fontSize,
      fontFamily: cs.fontFamily,
      fontWeight: cs.fontWeight,
      letterSpacing: cs.letterSpacing,
      lineHeight: cs.lineHeight,
    };
  }
  return null;
}

export function extractPrefixUpToCaret(editorEl, maxLen = 500) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';
  const range = sel.getRangeAt(0);
  if (!range.collapsed) return '';

  const blockEl = getCurrentBlockElement(editorEl);
  if (!blockEl) return '';

  const blockRange = document.createRange();
  blockRange.setStart(blockEl, 0);
  blockRange.setEnd(range.startContainer, range.startOffset);
  const container = document.createElement('div');
  container.appendChild(blockRange.cloneContents());
  const text = container.textContent || '';
  return text.slice(-maxLen);
}

export function measureDocSnippetAroundCaret(editorEl, before = 600, after = 200) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return '';
  const range = sel.getRangeAt(0);
  const fullRange = document.createRange();
  fullRange.selectNodeContents(editorEl);

  const preRange = document.createRange();
  preRange.setStart(editorEl, 0);
  preRange.setEnd(range.startContainer, range.startOffset);

  const postRange = document.createRange();
  postRange.setStart(range.endContainer, range.endOffset);
  postRange.setEnd(editorEl, editorEl.childNodes.length);

  const containerPre = document.createElement('div');
  containerPre.appendChild(preRange.cloneContents());
  const containerPost = document.createElement('div');
  containerPost.appendChild(postRange.cloneContents());

  const preText = (containerPre.textContent || '').slice(-before);
  const postText = (containerPost.textContent || '').slice(0, after);
  return `${preText}${postText}`;
}

export function insertTextAtCaret(text) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const range = sel.getRangeAt(0);
  range.deleteContents();
  const textNode = document.createTextNode(text);
  range.insertNode(textNode);
  // Move caret to after the inserted text
  const newRange = document.createRange();
  newRange.setStartAfter(textNode);
  newRange.collapse(true);
  sel.removeAllRanges();
  sel.addRange(newRange);
}

// Create an inline anchor that renders ghost text via CSS ::after. Returns anchor element.
export function createGhostAnchorAtCaret(ghostText, forceNextLine = false) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0).cloneRange();
  // If we need next line, add a space and rely on wrapping; otherwise insert zero-width char.
  const anchor = document.createElement('span');
  anchor.className = 'ghost-anchor';
  anchor.setAttribute('aria-hidden', 'true');
  anchor.setAttribute('data-ghost', ghostText || '');
  // Use a zero-width no-break space to keep anchor inline but invisible to selection
  anchor.appendChild(document.createTextNode('\uFEFF'));

  // If forcing new line, insert a normal space before anchor; browser will wrap naturally.
  const liveRange = sel.getRangeAt(0);
  if (forceNextLine) {
    anchor.classList.add('force-break');
  }
  liveRange.insertNode(anchor);
  // Keep caret where user is; do not move it into the anchor
  const after = document.createRange();
  after.setStartAfter(anchor);
  after.collapse(true);
  sel.removeAllRanges();
  sel.addRange(after);
  return anchor;
}

export function removeGhostAnchor(anchor) {
  if (anchor && anchor.parentNode) {
    anchor.parentNode.removeChild(anchor);
  }
}


