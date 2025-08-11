// This floating visual shows the see-through (ghost) suggestion near the cursor
// Key Words: overlay, ghost text, caret box, aria-hidden, pointer-events none

import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { subscribe, getCompletionState } from '../state/completionStore';

export default function GhostTextOverlay() {
  const overlayRef = useRef(null);
  
  // We track suggestion state for the new overlay approach
  const [suggestion, setLocalSuggestion] = useState(() => {
    const s = getCompletionState();
    console.log('GhostTextOverlay: Initial state:', s.suggestion);
    return s.suggestion;
  });

  useEffect(() => {
    // Listen for store changes to update the overlay
    const unsub = subscribe((s) => {
      console.log('GhostTextOverlay: Store update received:', s.suggestion);
      setLocalSuggestion(s.suggestion);
    });
    return unsub;
  }, []);

  // Don't render if no suggestion
  if (!suggestion.text || !suggestion.range) {
    console.log('GhostTextOverlay: No suggestion to render - text:', suggestion.text, 'range:', suggestion.range);
    return null;
  }
  
  console.log('GhostTextOverlay: Rendering suggestion:', suggestion.text);

  // Get the computed styles from the range's container with better font size detection
  const getComputedStyles = () => {
    try {
      const range = suggestion.range;
      if (!range) {
        console.log('GhostTextOverlay: No range for styles');
        return null;
      }
      
      // Get the exact text node where the cursor is
      let node = range.startContainer;
      let textNode = null;
      
      // If we're at a text node, use it directly for font size
      if (node.nodeType === Node.TEXT_NODE) {
        textNode = node;
        node = node.parentNode;
      }
      
      if (node && node.nodeType === Node.ELEMENT_NODE) {
        const computed = window.getComputedStyle(node);
        
        // For font size, try to get it from the text node's parent if available
        let fontSize = computed.fontSize;
        if (textNode && textNode.parentNode) {
          const textParentComputed = window.getComputedStyle(textNode.parentNode);
          fontSize = textParentComputed.fontSize;
        }
        
        const styles = {
          fontSize: fontSize,
          fontFamily: computed.fontFamily,
          fontWeight: computed.fontWeight,
          lineHeight: computed.lineHeight,
          letterSpacing: computed.letterSpacing,
          color: computed.color,
        };
        console.log('GhostTextOverlay: Computed styles:', styles);
        return styles;
      } else {
        console.log('GhostTextOverlay: Invalid node for styles:', node);
      }
    } catch (e) {
      console.warn('Failed to get computed styles:', e);
    }
    return null;
  };

  // Get position from range with improved line alignment
  const getPosition = () => {
    try {
      const range = suggestion.range;
      if (!range) {
        console.log('GhostTextOverlay: No range for position');
        return null;
      }
      
      // For collapsed ranges (caret position), get the exact caret position
      if (range.collapsed) {
        const rects = range.getClientRects();
        console.log('GhostTextOverlay: Collapsed range rects:', rects);
        if (rects.length === 0) {
          console.log('GhostTextOverlay: No rects for collapsed range');
          return null;
        }
        
        // Use the last rect for collapsed ranges
        const rect = rects[rects.length - 1];
        
        // Get the document container for relative positioning
        const documentContainer = document.querySelector('.document-container');
        const containerRect = documentContainer ? documentContainer.getBoundingClientRect() : null;
        
        // Calculate position with precise baseline alignment
        const position = {
          left: rect.left - (containerRect ? containerRect.left : 0),
          top: rect.top - (containerRect ? containerRect.top : 0),
          height: rect.height,
          width: rect.width,
          // Store the original rect for baseline calculations
          originalRect: rect,
        };
        console.log('GhostTextOverlay: Collapsed position:', position);
        return position;
      } else {
        // For non-collapsed ranges, position at the end
        const rects = range.getClientRects();
        console.log('GhostTextOverlay: Non-collapsed range rects:', rects);
        if (rects.length === 0) {
          console.log('GhostTextOverlay: No rects for non-collapsed range');
          return null;
        }
        
        const rect = rects[rects.length - 1];
        
        // Get the document container for relative positioning
        const documentContainer = document.querySelector('.document-container');
        const containerRect = documentContainer ? documentContainer.getBoundingClientRect() : null;
        
        const position = {
          left: rect.right - (containerRect ? containerRect.left : 0),
          top: rect.top - (containerRect ? containerRect.top : 0),
          height: rect.height,
          width: 0,
          // Store the original rect for baseline calculations
          originalRect: rect,
        };
        console.log('GhostTextOverlay: Non-collapsed position:', position);
        return position;
      }
    } catch (e) {
      console.warn('Failed to get range position:', e);
      return null;
    }
  };

  const styles = getComputedStyles();
  const position = getPosition();
  
  if (!position || !styles) {
    console.log('GhostTextOverlay: Missing position or styles - position:', position, 'styles:', styles);
    return null;
  }

  // Calculate overlay position with precise line alignment
  const overlayStyle = {
    position: 'absolute', // Keep as absolute for proper document positioning
    top: `${position.top}px`,
    left: `${position.left + position.width}px`,
    fontSize: styles.fontSize, // This should now match the preceding text exactly
    fontFamily: styles.fontFamily,
    fontWeight: styles.fontWeight,
    lineHeight: '1.2', // Use consistent line height that matches CSS rule
    letterSpacing: styles.letterSpacing,
    color: 'rgba(0, 255, 200, 0.8)', // Keep the bright teal color
    pointerEvents: 'none',
    zIndex: 2147483647,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    userSelect: 'none',
    // Ensure the ghost text appears on the same line as the actual text
    display: 'inline-block', // Changed from 'inline' to 'inline-block' for better positioning control
    verticalAlign: 'baseline',
    // Remove any margin/padding that could affect line alignment
    margin: 0,
    padding: 0,
    // Ensure the ghost text sits exactly on the same line
    transform: 'translateY(0)', // Force no vertical offset
  };

  console.log('GhostTextOverlay: Final overlay style:', overlayStyle);

  const node = (
    <div
      ref={overlayRef}
      className="ghost-text-overlay"
      style={overlayStyle}
      aria-hidden="true"
    >
      {suggestion.text}
    </div>
  );

  console.log('GhostTextOverlay: Creating portal with text:', suggestion.text);
  // Render to document container for proper positioning relative to document
  const documentContainer = document.querySelector('.document-container');
  const targetContainer = documentContainer || document.body;
  return createPortal(node, targetContainer);
}


