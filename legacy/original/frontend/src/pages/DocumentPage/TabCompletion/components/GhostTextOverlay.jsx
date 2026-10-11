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

  // Force re-render when window resizes or layout changes (like sidebar toggle)
  useEffect(() => {
    const handleResize = () => {
      // Force a re-render by updating the suggestion with a timestamp
      if (suggestion.text && suggestion.range) {
        setLocalSuggestion(prev => ({ ...prev, _timestamp: Date.now() }));
      }
    };

    window.addEventListener('resize', handleResize);
    
    // Also listen for layout changes that might indicate sidebar toggle
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
          const target = mutation.target;
          if (target.classList?.contains('container') || 
              target.classList?.contains('editor-wrapper') ||
              target.classList?.contains('document-container')) {
            handleResize();
          }
        }
      });
    });

    const container = document.querySelector('.container');
    const editorWrapper = document.querySelector('.editor-wrapper');
    if (container) observer.observe(container, { attributes: true, subtree: false });
    if (editorWrapper) observer.observe(editorWrapper, { attributes: true, subtree: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  }, [suggestion.text, suggestion.range]);

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

  // Get position from range with improved line alignment and boundary checking
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
        // Use the actual container that holds the pages, accounting for sidebar state
        const documentContainer = document.querySelector('.document-container');
        const editorWrapper = document.querySelector('.editor-wrapper') || document.querySelector('.container');
        
        // Use the most appropriate container for positioning reference
        const referenceContainer = documentContainer || editorWrapper;
        const containerRect = referenceContainer ? referenceContainer.getBoundingClientRect() : null;
        
        // Find the specific page element that contains this range
        let pageElement = range.startContainer;
        while (pageElement && !pageElement.classList?.contains('document-page')) {
          pageElement = pageElement.parentNode;
        }
        
        // Get page bounds for boundary checking
        const pageRect = pageElement ? pageElement.getBoundingClientRect() : null;
        const pageContentElement = pageElement ? pageElement.querySelector('.page-content') : null;
        const pageContentRect = pageContentElement ? pageContentElement.getBoundingClientRect() : null;
        
        // Calculate position with precise baseline alignment, accounting for container offset
        const position = {
          left: rect.left - (containerRect ? containerRect.left : 0),
          top: rect.top - (containerRect ? containerRect.top : 0),
          height: rect.height,
          width: rect.width,
          // Store the original rect for baseline calculations
          originalRect: rect,
          // Store container rect for repositioning
          containerRect: containerRect,
          // Store page bounds for overflow checking
          pageRect: pageRect ? {
            left: pageRect.left - (containerRect ? containerRect.left : 0),
            right: pageRect.right - (containerRect ? containerRect.left : 0),
            top: pageRect.top - (containerRect ? containerRect.top : 0),
            bottom: pageRect.bottom - (containerRect ? containerRect.top : 0),
            width: pageRect.width,
            height: pageRect.height
          } : null,
          pageContentRect: pageContentRect ? {
            left: pageContentRect.left - (containerRect ? containerRect.left : 0),
            right: pageContentRect.right - (containerRect ? containerRect.left : 0),
            top: pageContentRect.top - (containerRect ? containerRect.top : 0),
            bottom: pageContentRect.bottom - (containerRect ? containerRect.top : 0),
            width: pageContentRect.width,
            height: pageContentRect.height
          } : null,
        };
        console.log('GhostTextOverlay: Collapsed position with bounds:', position);
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
        // Use the actual container that holds the pages, accounting for sidebar state
        const documentContainer = document.querySelector('.document-container');
        const editorWrapper = document.querySelector('.editor-wrapper') || document.querySelector('.container');
        
        // Use the most appropriate container for positioning reference
        const referenceContainer = documentContainer || editorWrapper;
        const containerRect = referenceContainer ? referenceContainer.getBoundingClientRect() : null;
        
        // Find the specific page element that contains this range
        let pageElement = range.startContainer;
        while (pageElement && !pageElement.classList?.contains('document-page')) {
          pageElement = pageElement.parentNode;
        }
        
        // Get page bounds for boundary checking
        const pageRect = pageElement ? pageElement.getBoundingClientRect() : null;
        const pageContentElement = pageElement ? pageElement.querySelector('.page-content') : null;
        const pageContentRect = pageContentElement ? pageContentElement.getBoundingClientRect() : null;
        
        const position = {
          left: rect.right - (containerRect ? containerRect.left : 0),
          top: rect.top - (containerRect ? containerRect.top : 0),
          height: rect.height,
          width: 0,
          // Store the original rect for baseline calculations
          originalRect: rect,
          // Store container rect for repositioning
          containerRect: containerRect,
          // Store page bounds for overflow checking
          pageRect: pageRect ? {
            left: pageRect.left - (containerRect ? containerRect.left : 0),
            right: pageRect.right - (containerRect ? containerRect.left : 0),
            top: pageRect.top - (containerRect ? containerRect.top : 0),
            bottom: pageRect.bottom - (containerRect ? containerRect.top : 0),
            width: pageRect.width,
            height: pageRect.height
          } : null,
          pageContentRect: pageContentRect ? {
            left: pageContentRect.left - (containerRect ? containerRect.left : 0),
            right: pageContentRect.right - (containerRect ? containerRect.left : 0),
            top: pageContentRect.top - (containerRect ? containerRect.top : 0),
            bottom: pageContentRect.bottom - (containerRect ? containerRect.top : 0),
            width: pageContentRect.width,
            height: pageContentRect.height
          } : null,
        };
        console.log('GhostTextOverlay: Non-collapsed position with bounds:', position);
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

  // Calculate position for next line display with proper alignment
  const calculateBoundedPosition = () => {
    // Use page content bounds if available, otherwise fallback to page bounds
    const bounds = position.pageContentRect || position.pageRect;
    
    if (!bounds) {
      console.log('GhostTextOverlay: No bounds available, using basic positioning');
      return {
        left: position.left,
        top: position.top + (position.height || 20), // Move to next line
        maxWidth: 400 // Default max width
      };
    }
    
    // Calculate line height from the current position
    const lineHeight = position.height || 20; // Fallback to 20px if no height
    
    // For better alignment, use the current text's left position instead of bounds.left
    // This ensures the ghost text aligns with the actual text indentation
    const nextLineLeft = position.left; // Align with current cursor position horizontally
    const nextLineTop = position.top + lineHeight + 2; // Add small gap
    
    // Calculate available width from current position to right edge
    const availableWidth = bounds.right - nextLineLeft - 20; // Subtract right padding
    
    console.log('GhostTextOverlay: Next line positioning - left:', nextLineLeft, 'top:', nextLineTop, 'width:', availableWidth);
    
    // Ensure we have reasonable space
    if (availableWidth < 200) {
      console.log('GhostTextOverlay: Insufficient space for next line, hiding ghost text');
      return null;
    }
    
    return {
      left: nextLineLeft,
      top: nextLineTop,
      maxWidth: availableWidth
    };
  };

  const boundedPosition = calculateBoundedPosition();
  if (!boundedPosition) {
    console.log('GhostTextOverlay: Bounded position calculation failed, hiding overlay');
    return null;
  }

  // Calculate overlay position for next-line display with boundary constraints
  const overlayStyle = {
    position: 'absolute',
    top: `${boundedPosition.top}px`,
    left: `${boundedPosition.left}px`,
    fontSize: styles.fontSize,
    fontFamily: styles.fontFamily,
    fontWeight: styles.fontWeight,
    lineHeight: '1.2', // Match document line height
    letterSpacing: styles.letterSpacing,
    // CSS will handle color, display, and other visual properties
    pointerEvents: 'none',
    zIndex: 2147483647,
    userSelect: 'none',
    // Constrain width to prevent overflow
    maxWidth: boundedPosition.maxWidth ? `${boundedPosition.maxWidth}px` : 'none',
    // Width for better text layout
    width: boundedPosition.maxWidth ? `${boundedPosition.maxWidth}px` : 'auto',
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


