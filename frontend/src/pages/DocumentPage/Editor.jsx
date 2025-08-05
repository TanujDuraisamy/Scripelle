import Page from "./Page.jsx";
import React, { useRef, useState, useEffect, useCallback } from "react";
import "../../index.css";
import { Bold, Italic, Underline, Strikethrough, Heading1, List, ListOrdered, AlignLeft, Plus, X, Sparkles, ClipboardList, Text, ChevronUp, ChevronDown, AlignCenter, AlignRight, AlignJustify, Type, HelpCircle, Heading2, Quote, Code, Minus, Undo, Redo, History, ArrowUp, Trash2 } from "lucide-react"; // Import HelpCircle icon, plus new icons
import {DocumentTextIcon,ArrowsUpDownIcon,H1Icon,AdjustmentsHorizontalIcon} from '@heroicons/react/24/outline';
import { extractTargetTag, cleanResponse, processAIResponse } from "../../utils/aiTargeting";
import { useFuzzySearch } from '../../utils/useFuzzySearch.js';
// TODO: Restore Google Docs import functionality - removed temporarily
// import GoogleDocsList from "./GoogleDocsList";
import LoginButton from "../../LoginButton";
import Toolbar from "./Toolbar.jsx";
import Sidebar from "./Sidebar.jsx";
// TODO: Restore Google Docs import functionality - removed temporarily
// import GoogleDocsWrapper from "./GoogleDocsWrapper";


 
let skipNextSelectionChange = false;
 
const isCommandActive = (cmd) => {
  try {
    return document.queryCommandState(cmd.command);
  } catch {
    return false;
  }
};

const COMMAND_GROUPS = [
  {
    title: "Text Formatting",
    commands: [
      { icon: <Bold size={16} />, label: "Bold", command: "bold" },
      { icon: <Italic size={16} />, label: "Italic", command: "italic" },
      { icon: <Underline size={16} />, label: "Underline", command: "underline" }
    ]
  },
  {
    title: "Headings",
    commands: [
      { icon: <Heading1 size={16} />, label: "Heading 1", command: "formatBlock", value: "h1" },
      { icon: <Heading2 size={16} />, label: "Heading 2", command: "formatBlock", value: "h2" },
      { icon: <Text size={16} />, label: "Paragraph", command: "formatBlock", value: "p" }
    ]
  },
  {
    title: "Lists & Blocks",
    commands: [
      { icon: <List size={16} />, label: "Bullet List", command: "insertUnorderedList" },
      { icon: <ListOrdered size={16} />, label: "Numbered List", command: "insertOrderedList" },
      { icon: <Quote size={16} />, label: "Block Quote", command: "formatBlock", value: "blockquote" },
      { icon: <Code size={16} />, label: "Code Block", command: "formatBlock", value: "pre" },
      { icon: <Minus size={16} />, label: "Divider", command: "insertHorizontalRule" },
      { icon: <Undo size={16} />, label: "Undo", command: "undo" },
      { icon: <Redo size={16} />, label: "Redo", command: "redo" }
    ]
  }
];

const INLINE_COMMANDS = [
  { icon: <HelpCircle size={16} />, label: "Explain", command: "explain", className: "toolbar-button-with-text" },
  { icon: <Sparkles size={16} />, label: "Quick Edit", command: "enhanceWithAI", className: "toolbar-button-with-text" },
  { type: "separator" },
  { icon: <Bold size={16} />, label: "Bold", command: "bold" },
  { icon: <Italic size={16} />, label: "Italic", command: "italic" },
  { icon: <Underline size={16} />, label: "Underline", command: "underline" },
  { icon: <Strikethrough size={16} />, label: "Strikethrough", command: "strikeThrough" },
  {
  icon: <H1Icon style={{ width: 16, height: 16 }} />,
  label: "Heading",
  command: "formatBlock",
  value: "h1"
},
{
  icon: <span style={{ fontWeight: 'italics', fontSize: '13px' }}>p</span>,
  label: "Paragraph",
  command: "formatBlock",
  value: "p"
},

{
  icon: <ArrowsUpDownIcon style={{ width: 16, height: 16 }} />,
  label: "Font Size",
  type: "dropdown",
  options: [
    { icon: <ChevronUp size={14} />, label: "Increase Size", command: "increaseFontSize" },
    { icon: <ChevronDown size={14} />, label: "Decrease Size", command: "decreaseFontSize" }
  ]
},
{
  icon: <AdjustmentsHorizontalIcon style={{ width: 16, height: 16 }} />,
  label: "Font Family",
  type: "dropdown",
  options: [
    { label: "Arial", command: "fontName", value: "Arial" },
    { label: "Verdana", command: "fontName", value: "Verdana" },
    { label: "Times New Roman", command: "fontName", value: "Times New Roman" },
    { label: "Courier New", command: "fontName", value: "Courier New" },
    { label: "Georgia", command: "fontName", value: "Georgia" },
    { label: "Palatino Linotype", command: "fontName", value: "Palatino Linotype" },
    { label: "Tahoma", command: "fontName", value: "Tahoma" }
  ]
},

  {
  icon: <span style={{ fontSize: '14px', fontWeight: 'etalics' }}>Lists</span>,
  label: "List",
  type: "dropdown",
  options: [
    { label: "Bullet List", command: "insertUnorderedList" },
    { label: "Numbered List", command: "insertOrderedList" }
  ]
}
,
  {
    icon: <AlignLeft size={16} />,
    label: "Alignment",
    type: "dropdown",
    options: [
      { icon: <AlignLeft size={14} />, label: "Left", command: "justifyLeft" },
      { icon: <AlignCenter size={14} />, label: "Center", command: "justifyCenter" },
      { icon: <AlignRight size={14} />, label: "Right", command: "justifyRight" },
      { icon: <AlignJustify size={14} />, label: "Justify", command: "justifyFull" }
    ]
  },
  {
    icon: <span style={{ fontSize: '14px', fontWeight: 'bold' }}>AI</span>,
    label: "AI Changes",
    type: "dropdown",
    options: [
      { icon: <span style={{ fontSize: '12px' }}>👁️</span>, label: "Toggle Changes", command: "toggleDiffHighlights" },
      { icon: <span style={{ fontSize: '12px' }}>✅</span>, label: "Accept All Changes", command: "acceptAllDiffChanges" },
    { icon: <span style={{ fontSize: '12px' }}>🧪</span>, label: "Demo Diff Block", command: "createDemoDiff" }
    ]
  }
];

const App = () => {
  const editorRef = useRef(null);
  const aiInputRef = useRef(null);
  // Remember caret position when opening sidebar
  const sidebarCaretRangeRef = useRef(null);
  const imageInputRef = useRef(null);
  const selectedRef = useRef(null);
  const selectedTextRef = useRef("");
  const selectedRangeRef = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [popupPos, setPopupPos] = useState({ top: 0, left: 0 });
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inlineToolbarPos, setInlineToolbarPos] = useState(null);
  const flatCommands = COMMAND_GROUPS.flatMap(g => g.commands);
  
  // Fuzzy search for slash commands
  const fuzzySearch = useFuzzySearch(COMMAND_GROUPS);
  const [placeholderVisible, setPlaceholderVisible] = useState(true);
  const [fileName, setFileName] = useState("Untitled");
  // naman changes sidebar and this is the part that gets repeated
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // change this to true to show the sidebar when the page loads up
  const [showPopupAI, setShowPopupAI] = useState(false);
  const [popupInput, setPopupInput] = useState(""); // For the inline popup input
  const [chatTitle, setChatTitle] = useState("New chat");
  const [popupOutput, setPopupOutput] = useState("");
  const [sidebarInput, setSidebarInput] = useState("");
  // naman changes sidebar
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);
  const [pages, setPages] = useState([
    { id: 1, content: '<h1 style="text-align: center;"><br></h1>', isNew: false } // Start with a center-aligned H1 tag for title
  ]);
  const [currentPageId, setCurrentPageId] = useState(1);
  const [messages, setMessages] = useState([]);
  
  // State for managing diff highlights visibility
  const [diffHighlightsVisible, setDiffHighlightsVisible] = useState(true);
  const [showAlignDropdown, setShowAlignDropdown] = useState(false);
  const [documentVersions, setDocumentVersions] = useState([]);
  const [showTimeline, setShowTimeline] = useState(false);
  const [initialSaveDone, setInitialSaveDone] = useState(false);
  const initialSaveTimeoutRef = useRef(null);

  // Refs for other dropdowns
  const [showFontSizeDropdown, setShowFontSizeDropdown] = useState(false);
  const [showFontFamilyDropdown, setShowFontFamilyDropdown] = useState(false);

  // New state for reference text in input
  const [currentReferenceText, setCurrentReferenceText] = useState("");

  // New state for help modal visibility
  const [showHelpModal, setShowHelpModal] = useState(false);

  // New state for managing the custom highlight span
  const [highlightSpan, setHighlightSpan] = useState(null);

  // New state for image resizing
  const [resizingImage, setResizingImage] = useState(null);

  // TODO: Restore Google Docs import functionality - removed temporarily
  // Handle imported document
  // useEffect(() => {
  //   if (importedDoc && importedDoc.plainText) {
  //     console.log("Setting imported document content:", importedDoc.plainText);
  //     // Set the document title from the imported doc
  //     if (importedDoc.fullDoc && importedDoc.fullDoc.title) {
  //       setFileName(importedDoc.fullDoc.title);
  //     }
  //     
  //     // Convert plain text to HTML and set as page content
  //     const htmlContent = importedDoc.plainText.replace(/\n/g, '<br>');
  //     setPages([{ id: 1, content: htmlContent, isNew: false }]);
  //     setCurrentPageId(1);
  //   }
  // }, [importedDoc]);

  // Helper to wrap selected text with a span for visual highlight
  const wrapSelectionWithHighlight = React.useCallback((range) => {
    if (!range || range.collapsed) return null;

    const span = document.createElement('span');
    span.className = 'popup-highlight';
    span.style.backgroundColor = '#555555'; // Use the same color as the new selection color
    span.style.color = '#ffffff'; // Keep text white

    try {
      const clonedRange = range.cloneRange();
      clonedRange.surroundContents(span);
      return span; // Return the created span for later removal
    } catch (e) {
      console.warn("Could not surround contents with highlight span:", e);
      return null;
    }
  }, []);

  // Helper to remove the highlight span
  const unwrapHighlight = React.useCallback((span) => {
    if (span && span.parentNode) {
      const parent = span.parentNode;
      while (span.firstChild) {
        parent.insertBefore(span.firstChild, span);
      }
      parent.removeChild(span);
    }
  }, []);

  // Helper to position cursor in title at default spot
  const positionCursorInTitle = React.useCallback((titleElement) => {
    if (!titleElement) return;
    
    const selection = window.getSelection();
    const range = document.createRange();
    
    // If title is empty or just has a <br>, position at the beginning
    if (titleElement.innerHTML === '<br>' || titleElement.innerHTML === '' || titleElement.textContent.trim() === '') {
      range.setStart(titleElement, 0);
      range.collapse(true);
    } else {
      // If title has content, position at the end
      range.selectNodeContents(titleElement);
      range.collapse(false); // false = to the end
    }
    
    selection.removeAllRanges();
    selection.addRange(range);
    titleElement.focus();
  }, []);

  // Flag to prevent input handling during Enter key operations
  const skipNextInputHandling = useRef(false);


  // Ref for the toolbar show timeout
  const toolbarShowTimeoutRef = useRef(null);

  const getTimestamp = () => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // AI Content Diff Highlighting System
  // This system provides visual feedback for AI-generated content changes:
  // - Green highlights (ai-highlight-added) for new content added by AI
  // - Red highlights with strikethrough (ai-highlight-removed) for content replaced by AI
  // - Toggle functionality to show/hide highlights
  // - Accept all changes functionality to clear all highlights
  
  // Generate unique ID for diff blocks
  const generateDiffId = () => `diff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const wrapContentWithAIHighlight = (content, type = 'added') => {
    const className = type === 'added' ? 'ai-highlight-added' : 'ai-highlight-removed';
    
    // Handle empty or whitespace-only content
    if (!content || content.trim() === '') {
      return content;
    }
    
    // For simple text content, just wrap it
    if (!content.includes('<br>') && !content.includes('<')) {
      return `<span class="${className}">${content}</span>`;
    }
    
    // For content with HTML/line breaks, wrap the entire content
    // This ensures the highlighting works across multiple lines
    return `<span class="${className}">${content}</span>`;
  };

  const createDiffBlock = (content, type = 'added', diffId = null) => {
    const id = diffId || generateDiffId();
    const highlightedContent = wrapContentWithAIHighlight(content, type);
    
    return `<div class="ai-diff-block" data-diff-id="${id}" data-diff-type="${type}" onclick="focusDiffBlock('${id}')"><div class="ai-diff-actions"><button class="ai-diff-btn accept" onclick="event.stopPropagation(); acceptDiffChange('${id}')" title="Accept change (Ctrl+Enter)">✓ Accept</button><button class="ai-diff-btn reject" onclick="event.stopPropagation(); rejectDiffChange('${id}')" title="Reject change (Ctrl+Shift+Enter)">✕ Reject</button></div>${highlightedContent}</div>`;
  };

  const prependContentWithDiff = (currentContent, newContent) => {
    const diffBlock = createDiffBlock(newContent, 'added');
    
    // If page is empty or just has a title, create the body structure
    if (!currentContent.includes('document-body')) {
      return currentContent + '<div class="document-body"><div class="content-flow">' + diffBlock + '</div></div>';
    }

    // If body exists, find it and prepend the new content
    const bodyStartIndex = currentContent.indexOf('<div class="document-body">');
    if (bodyStartIndex !== -1) {
      const openingTag = '<div class="document-body">';
      const insertPosition = bodyStartIndex + openingTag.length;
      const newFlow = '<div class="content-flow">' + diffBlock + '</div>';
      return currentContent.slice(0, insertPosition) + newFlow + currentContent.slice(insertPosition);
    }
    
    // Fallback: append if body structure is weird
    return appendContentWithDiff(currentContent, newContent, true);
  };

  const appendContentWithDiff = (currentContent, newContent, showAsAddition = true) => {
    const diffBlock = createDiffBlock(newContent, showAsAddition ? 'added' : 'removed');
    const newContentFlow = `<div class="content-flow">${diffBlock}</div>`;

    // If there's no document-body yet, create it.
    if (!currentContent.includes('document-body')) {
      const h1EndIndex = currentContent.lastIndexOf('</h1>');
      const insertionPoint = h1EndIndex !== -1 ? h1EndIndex + '</h1>'.length : currentContent.length;
      const before = currentContent.slice(0, insertionPoint);
      const after = currentContent.slice(insertionPoint);
      return `${before}<div class="document-body">${newContentFlow}</div>${after}`;
    }

    // If body exists, insert before its closing tag, assuming it's the last element.
    if (currentContent.trim().endsWith('</div>')) {
      return currentContent.replace(/<\/div>$/, `${newContentFlow}</div>`);
    }

    // Fallback for unusual structures.
    return currentContent + newContentFlow;
  };

  const replaceContentWithDiff = (originalContent, newContent) => {
    // Create a combined diff block showing both removed and added content
    const diffId = generateDiffId();
    const removedContent = wrapContentWithAIHighlight(originalContent, 'removed');
    const addedContent = wrapContentWithAIHighlight(newContent, 'added');
    
    return `
      <div class="ai-diff-block" data-diff-id="${diffId}" data-diff-type="replace" data-original="${encodeURIComponent(originalContent)}" data-new="${encodeURIComponent(newContent)}" onclick="focusDiffBlock('${diffId}')">
        ${removedContent}${addedContent}
        <div class="ai-diff-actions">
          <button class="ai-diff-btn accept" onclick="event.stopPropagation(); acceptDiffChange('${diffId}')" title="Accept change (Ctrl+Enter)">
            ✓ Accept
          </button>
          <button class="ai-diff-btn reject" onclick="event.stopPropagation(); rejectDiffChange('${diffId}')" title="Reject change (Ctrl+Shift+Enter)">
            ✕ Reject
          </button>
        </div>
      </div>
    `;
  };

  const clearAIHighlights = (content) => {
    // Remove AI highlight classes and diff blocks from content
    let cleanContent = content
      .replace(/<span class="ai-highlight-added">/g, '')
      .replace(/<span class="ai-highlight-removed">/g, '')
      .replace(/<\/span>/g, '');
    
    // Remove diff blocks and keep only the added content
    cleanContent = cleanContent.replace(
      /<div class="ai-diff-block"[^>]*>(.*?)<\/div>/gs, 
      (match, innerContent) => {
        // Extract only the added content from diff blocks
        const addedMatch = innerContent.match(/<span class="ai-highlight-added">(.*?)<\/span>/s);
        if (addedMatch) {
          return addedMatch[1];
        }
        // If no added content found, remove the entire block
        return '';
      }
    );
    
    // Clean up any remaining diff action buttons
    cleanContent = cleanContent.replace(/<div class="ai-diff-actions">.*?<\/div>/gs, '');
    
    return cleanContent;
  };

  const toggleDiffHighlights = () => {
    setDiffHighlightsVisible(!diffHighlightsVisible);
  };

  const acceptAllDiffChanges = () => {
    // Clear all AI highlights from all pages
    setPages(prev => prev.map(page => ({
      ...page,
      content: clearAIHighlights(page.content)
    })));
  };

  // Individual diff change handlers
  const acceptDiffChange = (diffId) => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const diffBlock = editorElement.querySelector(`[data-diff-id="${diffId}"]`);
    if (!diffBlock) return;

    const diffType = diffBlock.getAttribute('data-diff-type');
    let contentToInsert = '';

    if (diffType === 'replace') {
      contentToInsert = decodeURIComponent(diffBlock.getAttribute('data-new') || '');
    } else { // 'added'
      const addedSpans = diffBlock.querySelectorAll('.ai-highlight-added');
      contentToInsert = Array.from(addedSpans).map(span => span.innerHTML).join('');
    }

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentToInsert;
    const fragment = document.createDocumentFragment();
    while (tempDiv.firstChild) {
      fragment.appendChild(tempDiv.firstChild);
    }

    const currentSelection = window.getSelection();
    const parentNode = diffBlock.parentNode;
    // const nextSibling = diffBlock.nextSibling; // Not needed with new logic

    diffBlock.parentNode.replaceChild(fragment, diffBlock);

    const newRange = document.createRange();
    if (fragment.lastChild) {
        newRange.setStartAfter(fragment.lastChild);
    } else {
        // Fallback if fragment is empty, place at parentNode's end
        newRange.selectNodeContents(parentNode);
        newRange.collapse(false);
    }
    newRange.collapse(true); // Collapse to the end of the range
    currentSelection.removeAllRanges();
    currentSelection.addRange(newRange);

    // After accepting, update the sidebar caret ref to the new position
    sidebarCaretRangeRef.current = newRange.cloneRange();

    setPages(prev => prev.map(page => {
      if (page.id === currentPageId) {
        return { ...page, content: editorElement.innerHTML };
      }
      return page;
    }));
  };

  const rejectDiffChange = (diffId) => {
    const editorElement = editorRef.current;
    if (!editorElement) return;

    const diffBlock = editorElement.querySelector(`[data-diff-id="${diffId}"]`);
    if (!diffBlock) return;

    const diffType = diffBlock.getAttribute('data-diff-type');
    let contentToInsert = '';
    let shouldRemove = false;

    if (diffType === 'replace') {
      contentToInsert = decodeURIComponent(diffBlock.getAttribute('data-original') || '');
    } else { // 'added'
      shouldRemove = true;
    }

    const currentSelection = window.getSelection();
    const parentNode = diffBlock.parentNode;
    const nextSibling = diffBlock.nextSibling;

    if (shouldRemove) {
      diffBlock.remove();
    } else {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = contentToInsert;
      const fragment = document.createDocumentFragment();
      while (tempDiv.firstChild) {
        fragment.appendChild(tempDiv.firstChild);
      }
      diffBlock.parentNode.replaceChild(fragment, diffBlock);
    }

    const newRange = document.createRange();
    if (shouldRemove) {
        // If content was removed, place cursor at the original position of the diff block
        if (nextSibling) {
            newRange.setStartBefore(nextSibling);
        } else {
            newRange.selectNodeContents(parentNode);
            newRange.collapse(false); // End of parent
        }
    } else {
        // If original content was restored, place cursor at the end of the restored content
        if (fragment.lastChild) {
            newRange.setStartAfter(fragment.lastChild);
        } else {
            newRange.selectNodeContents(parentNode);
            newRange.collapse(false);
        }
    }
    newRange.collapse(true);
    currentSelection.removeAllRanges();
    currentSelection.addRange(newRange);

    // After rejecting, update the sidebar caret ref to the new position
    sidebarCaretRangeRef.current = newRange.cloneRange();

    setPages(prev => prev.map(page => {
      if (page.id === currentPageId) {
        return { ...page, content: editorElement.innerHTML };
      }
      return page;
    }));
  };

  // Focus management for diff blocks
  const focusDiffBlock = (diffId) => {
    // Remove focus from all diff blocks
    document.querySelectorAll('.ai-diff-block.focused').forEach(block => {
      block.classList.remove('focused');
    });
    
    // Focus the specified diff block
    const targetBlock = document.querySelector(`[data-diff-id="${diffId}"]`);
    if (targetBlock) {
      targetBlock.classList.add('focused');
      targetBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Make functions globally available for onclick handlers
  React.useEffect(() => {
    window.acceptDiffChange = acceptDiffChange;
    window.rejectDiffChange = rejectDiffChange;
    window.focusDiffBlock = focusDiffBlock;
    
    // Add click listeners to diff blocks for focus management
    const handleDiffBlockClick = (e) => {
      const diffBlock = e.target.closest('.ai-diff-block');
      if (diffBlock) {
        const diffId = diffBlock.getAttribute('data-diff-id');
        if (diffId) {
          focusDiffBlock(diffId);
        }
      }
    };
    
    document.addEventListener('click', handleDiffBlockClick);
    
    return () => {
      delete window.acceptDiffChange;
      delete window.rejectDiffChange;
      delete window.focusDiffBlock;
      document.removeEventListener('click', handleDiffBlockClick);
    };
  }, [acceptDiffChange, rejectDiffChange, focusDiffBlock]);

  const removeAllDiffBlocks = () => {
    const editorElement = editorRef.current;
    if (editorElement) {
      editorElement.querySelectorAll('.ai-diff-block').forEach(block => {
        block.remove();
      });
    }
  };

  const handleSidebarAIQuery = async (userPrompt) => {
    // Save current caret position just before sending the AI query
    const sel = window.getSelection();
    if (editorRef.current && editorRef.current.contains(sel.anchorNode) && sel.rangeCount > 0) {
      sidebarCaretRangeRef.current = sel.getRangeAt(0).cloneRange();
    }

    // Add user message to chat
    // Add user message and "Thinking..." to chat in a single state update
    setMessages(prev => [
      ...prev,
      { role: "user", content: userPrompt, timestamp: getTimestamp() },
      { role: "assistant", content: "Thinking...", timestamp: getTimestamp() }
    ]);
    setSidebarInput(""); // Clear input
  
    // Get document text (strip HTML tags from current page)
    const currentPage = pages.find(p => p.id === currentPageId);
    const docText = currentPage ? currentPage.content.replace(/<[^>]+>/g, '') : "";
    // If you have selected text, get it here (otherwise pass null)
    const selectedText = null; // You can wire this up later
  
    // Build the messages array (without system prompt - backend handles it)
    const promptMessages = messages.map(({ role, content }) => ({ role, content }));
  
    try {
      const response = await fetch('http://localhost:3000/api/v1/chat/deepseek', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: promptMessages,
          docText: docText,
          selectedText: selectedText
        })
      });
      let rawResponse = "No response generated.";
      if (response.ok) {
        const data = await response.json();
        rawResponse = data?.choices?.[0]?.message?.content || rawResponse;
        rawResponse = rawResponse.replace(/\*\*/g, '').replace(/—/g, '-');
        const isGreeting = /^(hi|hello|hey|greetings|hi there)$/i.test(userPrompt.trim());
        if (isGreeting) rawResponse = rawResponse.replace(/!/g, ',');
        const { target, content } = processAIResponse(rawResponse);
        // Robust split on any line containing ---END LEAD-IN--- (with optional whitespace or punctuation)
        const delimiterRegex = /^\s*-{3,}\s*END LEAD-IN\s*-{3,}\s*:?\s*$/im;
        let leadIn = '';
        let mainContent = content;
        if (delimiterRegex.test(content)) {
          const parts = content.split(delimiterRegex);
          leadIn = parts[0].trim();
          mainContent = (parts[1] || '').trim();
        }
        if (target === "document") {

          const newContentWithBreaks = mainContent.replace(/\n/g, '<br>');
          const diffBlockHtml = createDiffBlock(newContentWithBreaks, 'added');

          const currentSelection = window.getSelection();
          let insertionRange = sidebarCaretRangeRef.current || (currentSelection.rangeCount > 0 ? currentSelection.getRangeAt(0) : null);

          if (insertionRange) {
            let targetElementForInsertion = insertionRange.commonAncestorContainer;
            if (targetElementForInsertion.nodeType === Node.TEXT_NODE) {
              targetElementForInsertion = targetElementForInsertion.parentNode;
            }

            let h1Element = null;
            let tempNode = targetElementForInsertion;
            while (tempNode && tempNode !== editorRef.current) {
              if (tempNode.nodeName === 'H1') {
                h1Element = tempNode;
                break;
              }
              tempNode = tempNode.parentNode;
            }

            if (h1Element) {
              // If the cursor was in an H1, insert content after the H1 in a new paragraph
              const newParagraph = document.createElement('p');
              newParagraph.innerHTML = '<br>'; // Ensure it has content for cursor placement
              
              // Insert the new paragraph after the H1
              if (h1Element.nextSibling) {
                h1Element.parentNode.insertBefore(newParagraph, h1Element.nextSibling);
              } else {
                h1Element.parentNode.appendChild(newParagraph);
              }

              // Set the insertion range to the new paragraph
              insertionRange = document.createRange();
              insertionRange.setStart(newParagraph, 0);
              insertionRange.collapse(true);
            }

            currentSelection.removeAllRanges();
            currentSelection.addRange(insertionRange);

            const fragment = document.createRange().createContextualFragment(diffBlockHtml);
            const range = currentSelection.getRangeAt(0);
            range.deleteContents();
            range.insertNode(fragment);

            // After inserting, set the cursor to the end of the inserted content
            const lastInsertedNode = fragment.lastChild;
            let newRange = document.createRange();
            if (lastInsertedNode) {
                newRange.setStartAfter(lastInsertedNode);
            } else {
                newRange.setStart(range.endContainer, range.endOffset);
            }
            newRange.collapse(false);
            currentSelection.removeAllRanges();
            currentSelection.addRange(newRange);

            // Update the sidebar caret ref to the new position for subsequent insertions
            sidebarCaretRangeRef.current = newRange.cloneRange();

            setPages(prev => prev.map(page => {
              if (page.id === currentPageId) {
                return { ...page, content: editorRef.current.innerHTML };
              }
              return page;
            }));

            if (leadIn) {
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: leadIn, timestamp: getTimestamp() }
              ]);
            } else {
              setMessages(prev => prev.slice(0, -1));
            }
          } else {
            // Fallback if sidebarCaretRangeRef.current is not available
            setPages(prev => prev.map(page => {
              if (page.id === currentPageId) {
                const currentContent = page.content;
                const updatedContent = appendContentWithDiff(currentContent, newContentWithBreaks, true);
                return { ...page, content: updatedContent };
              }
              return page;
            }));
            if (leadIn) {
              setMessages(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: leadIn, timestamp: getTimestamp() }
              ]);
            } else {
              setMessages(prev => prev.slice(0, -1));
            }
          }
        } else {
          // Sidebar response as chat
          if (leadIn) {
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: "assistant", content: leadIn, timestamp: getTimestamp() },
              { role: "assistant", content: mainContent, timestamp: getTimestamp() }
            ]);
          } else {
            setMessages(prev => [
              ...prev.slice(0, -1),
              { role: "assistant", content: content, timestamp: getTimestamp() }
            ]);
          }
        }
      } else {
        // For demo purposes, provide a mock response when API fails
        const mockResponse = "This is a mock AI response for demonstration purposes. The diff highlighting system is now working with Accept/Reject buttons!";
        const { target, content } = processAIResponse(mockResponse);
        
        setPages(prev => prev.map(page => {
          if (page.id === currentPageId) {
            const currentContent = page.content;
            const newContentWithBreaks = mockResponse.replace(/\n/g, '<br>');
            
            // Smart content insertion - use the same logic as above
            let updatedContent;
            const currentPageElement = document.getElementById(`page-${currentPageId}`);
            const selection = window.getSelection();
            
            if (currentPageElement && sidebarCaretRangeRef.current) {
              const sel = window.getSelection();
              sel.removeAllRanges();
              sel.addRange(sidebarCaretRangeRef.current); // Restore the saved range

              const range = sel.getRangeAt(0);
              const diffBlockHtml = createDiffBlock(newContentWithBreaks, 'added');
              const fragment = document.createRange().createContextualFragment(diffBlockHtml);

              range.deleteContents();
              range.insertNode(fragment);

              // After inserting, set the cursor to the end of the inserted content
              const lastInsertedNode = fragment.lastChild;
              let newRange = document.createRange(); // Declare newRange here
              if (lastInsertedNode) {
                  newRange.setStartAfter(lastInsertedNode);
              } else {
                  // Fallback if fragment is empty, collapse to the original range's end
                  newRange.setStart(range.endContainer, range.endOffset);
              }
              newRange.collapse(false); // Collapse to the end
              sel.removeAllRanges();
              sel.addRange(newRange);

              updatedContent = currentPageElement.innerHTML;
            } else {
              // Fallback to append method if caret position not available
              updatedContent = appendContentWithDiff(currentContent, newContentWithBreaks, true);
            }
            
            return { ...page, content: updatedContent };
          }
          return page;
        }));
        
        setMessages(prev => [
          ...prev.slice(0, -1),
          { role: "assistant", content: "Mock content inserted for demo (API Error " + response.status + ")", timestamp: getTimestamp() }
        ]);
      }
    } catch (error) {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: `Error: ${error.message}`, timestamp: getTimestamp() }
      ]);
    }
  };

  const execCmd = (cmd) => {
    // Custom commands (Enhance with AI, Give reference)
    if (cmd.command === "enhanceWithAI") {
      const sel = window.getSelection();
      if (sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
        const range = sel.getRangeAt(0).cloneRange();
        selectedRangeRef.current = range;
        selectedTextRef.current = sel.toString();

        const rect = range.getBoundingClientRect();
        setPopupPos({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
        setShowPopupAI(true);
        setInlineToolbarPos(null); // Hide inline toolbar when popup opens
      }
      return;
    }

    if (cmd.command === "explain") {
  const sel = window.getSelection();
  if (sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0) {
    const selectedText = sel.toString();
    setCurrentReferenceText(selectedText);
    setIsSidebarVisible(true);
  }
  setInlineToolbarPos(null); // Hide inline bar
  return;
}


    // Handle font size commands (rem-based for keyboard shortcuts)
    if (cmd.command === "increaseFontSizeRem" || cmd.command === "decreaseFontSizeRem") {
        const sel = window.getSelection();
        if (sel.rangeCount > 0 && !sel.isCollapsed) {
          const range = sel.getRangeAt(0);
          
          // Get current font size from the selected element
          let currentSize = 1.1; // Default font size in rem
          
          // Check if the selection has existing font size styling
          const commonAncestor = range.commonAncestorContainer;
          let parentElement = commonAncestor.nodeType === Node.TEXT_NODE ? 
            commonAncestor.parentNode : commonAncestor;
          
          // Traverse up to find font-size styling
          while (parentElement && parentElement !== document.body) {
            const computedStyle = window.getComputedStyle(parentElement);
            const fontSize = computedStyle.fontSize;
            
            if (fontSize && fontSize.includes('rem')) {
              currentSize = parseFloat(fontSize);
              break;
            } else if (fontSize && fontSize.includes('px')) {
              // Convert px to rem (assuming 16px = 1rem)
              currentSize = parseFloat(fontSize) / 16;
              break;
            }
            
            // Check inline style
            if (parentElement.style.fontSize) {
              const inlineSize = parentElement.style.fontSize;
              if (inlineSize.includes('rem')) {
                currentSize = parseFloat(inlineSize);
                break;
              } else if (inlineSize.includes('px')) {
                currentSize = parseFloat(inlineSize) / 16;
                break;
              }
            }
            
            parentElement = parentElement.parentNode;
          }
          
          // Calculate new size
          const increment = cmd.command === "increaseFontSizeRem" ? 1 : -1;
          const newSize = Math.max(0.5, currentSize + increment); // Minimum 0.5rem
          
          // Apply font size using document.execCommand with style
          const selectedContent = range.extractContents();
          const span = document.createElement('span');
          span.style.fontSize = `${newSize}rem`;
          span.appendChild(selectedContent);
          
          // Insert the wrapped content back
          range.insertNode(span);
          
          // Restore selection
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          sel.removeAllRanges();
          sel.addRange(newRange);
        }
        return;
    }

    // Handle font size commands (legacy document.execCommand approach for toolbar)
    if (cmd.command === "increaseFontSize" || cmd.command === "decreaseFontSize") {
        const FONT_SIZE_MAP = [1, 2, 3, 4, 5, 6, 7]; // Values for document.execCommand('fontSize')
        let currentSizeValue = parseInt(document.queryCommandValue('fontSize') || '3'); // Default to 3 (medium)

        let newSizeValue = currentSizeValue;
        const currentIndex = FONT_SIZE_MAP.indexOf(currentSizeValue);

        if (cmd.command === "increaseFontSize") {
            if (currentIndex < FONT_SIZE_MAP.length - 1) {
                newSizeValue = FONT_SIZE_MAP[currentIndex + 1];
            }
        } else { // decreaseFontSize
            if (currentIndex > 0) {
                newSizeValue = FONT_SIZE_MAP[currentIndex - 1];
            }
        }
        document.execCommand('fontSize', false, newSizeValue);
        setInlineToolbarPos(null);
        setShowFontSizeDropdown(false);
        return;
    }

    // Handle formatBlock specifically for "pre" (code block) toggle
    if (cmd.command === "formatBlock" && cmd.value === "pre") {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      while (node && node.nodeType !== 1) node = node.parentNode;
      if (node && node.nodeName === "PRE") {
        document.execCommand("formatBlock", false, "p"); // Toggle off code block
      } else {
        document.execCommand("formatBlock", false, "pre"); // Apply code block
      }
      setInlineToolbarPos(null); // Hide toolbar after command
      setShowMenu(false); // Close slash menu when code block is selected
      return;
    }

    // Handle AI diff highlighting commands
    if (cmd.command === "toggleDiffHighlights") {
      toggleDiffHighlights();
      return;
    }

    if (cmd.command === "acceptAllDiffChanges") {
      acceptAllDiffChanges();
      return;
    }

    if (cmd.command === "createDemoDiff") {
      // Create a demo diff block for testing
      const demoContent = "This is a demo AI-generated content with Accept/Reject buttons! Click on this block to focus it, then use Ctrl+Enter to accept or Ctrl+X to reject.";
      setPages(prev => prev.map(page => {
        if (page.id === currentPageId) {
          const currentContent = page.content;
          const updatedContent = appendContentWithDiff(currentContent, demoContent, true);
          return { ...page, content: updatedContent };
        }
        return page;
      }));
      return;
    }

    // Execute standard document commands
    document.execCommand(cmd.command, false, cmd.value || null);
    setShowMenu(false); // Close slash menu
    setSelectedIndex(0); // Reset slash menu selection
    setInlineToolbarPos(null); // Hide inline toolbar after command
    // Close any open dropdowns
    setShowAlignDropdown(false);
    setShowFontSizeDropdown(false);
    setShowFontFamilyDropdown(false);
  };

  // Helper function to extract search query from text after slash
  const getSearchQueryFromText = (text, position) => {
    const slashIndex = text.lastIndexOf('/', position);
    if (slashIndex === -1) return '';
    return text.slice(slashIndex + 1, position);
  };

  const handleKeyDown = (e) => {
    const sel = window.getSelection();
    const range = sel.getRangeAt(0);

    if (e.key === "/") {
      setTimeout(() => {
        const rect = range.getBoundingClientRect();
        let top = rect.bottom + window.scrollY;
        let left = rect.left + window.scrollX;

        if (rect.width === 0 && rect.height === 0) {
          const fallbackSpan = document.createElement("span");
          range.insertNode(fallbackSpan);
          const fallbackRect = fallbackSpan.getBoundingClientRect();
          top = fallbackRect.bottom + window.scrollY;
          left = fallbackRect.left + window.left;
          fallbackSpan.remove();
        }

        setMenuPos({ top, left });
        setShowMenu(true);
        setSelectedIndex(0);
        fuzzySearch.resetSearch(); // Reset search when opening menu
      }, 0);
    } else if (e.key === "Backspace" && showMenu) {
      const text = range.startContainer.textContent;
      const position = range.startOffset;
      
      // Check if we're deleting the slash itself
      if (text?.[position - 1] === "/") {
        setShowMenu(false);
        fuzzySearch.resetSearch();
      } else {
        // Update search query based on remaining text
        setTimeout(() => {
          const updatedText = range.startContainer.textContent;
          const query = getSearchQueryFromText(updatedText, range.startOffset);
          fuzzySearch.setSearchQuery(query);
          setSelectedIndex(0); // Reset selection to first item
        }, 0);
      }
    } else if (showMenu) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        const maxIndex = fuzzySearch.filteredCommands.length - 1;
        setSelectedIndex(i => Math.min(i + 1, maxIndex));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (fuzzySearch.filteredCommands.length > 0) {
          const cmd = fuzzySearch.filteredCommands[selectedIndex];
          
          // Remove the slash and search query from the text
          const textNode = range.startContainer;
          const text = textNode.textContent;
          const position = range.startOffset;
          const slashIndex = text.lastIndexOf('/', position);
          
          if (slashIndex !== -1) {
            const beforeSlash = text.slice(0, slashIndex);
            const afterQuery = text.slice(position);
            textNode.textContent = beforeSlash + afterQuery;
            
            const newRange = document.createRange();
            const sel = window.getSelection();
            newRange.setStart(textNode, slashIndex);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
          }
          
          execCmd(cmd);
          fuzzySearch.resetSearch();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        setShowMenu(false);
        fuzzySearch.resetSearch();

        // move cursor to new paragraph after slash command
        const br = document.createElement("br");
        const range = document.getSelection().getRangeAt(0);
        const p = document.createElement("p");
        p.appendChild(br);
        range.insertNode(p);

        // move caret inside the new paragraph
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        const sel = document.getSelection();
        sel.removeAllRanges();
        sel.addRange(newRange);
      } else if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        // User is typing - update search query
        setTimeout(() => {
          const text = range.startContainer.textContent;
          const position = range.startOffset;
          const query = getSearchQueryFromText(text, position);
          fuzzySearch.setSearchQuery(query);
          setSelectedIndex(0); // Reset selection to first item
        }, 0);
      }
    }
  };

  const handleSavePDF = () => {
    const allContent = pages.map(page => page.content).join('<div style="page-break-after: always;"></div>');
    const win = window.open("", "_blank");
    win.document.write(`<html><head><title>${fileName || "Document"}</title></head><body>${allContent}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleSaveDOC = () => {
    const allContent = pages.map(page => page.content).join('<div style="page-break-after: always;"></div>');
    const filename = prompt("Enter file name:", "document");
    if (!filename) return;

    const blob = new Blob(
      [`<html><head><meta charset='utf-8'></head><body>${allContent}</body></html>`],
      { type: "application/msword" }
    );
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${fileName || "document"}.doc`;
    link.click();
  };

const handlePopupSubmit = async () => {
  if (!selectedRangeRef.current) return;

  const range = selectedRangeRef.current;
  const originalSelectedText = selectedTextRef.current;
  const popupQuery = popupInput.trim();

  if (!popupQuery) {
    // If no query, just close the popup
    setShowPopupAI(false);
    return;
  }

  // Remove custom highlight before modifying content
  if (highlightSpan) {
    unwrapHighlight(highlightSpan);
    setHighlightSpan(null); // Clear the state
  }

  // Replace selected text with a temporary "Thinking..." message
  const tempTextNode = document.createTextNode("Thinking...");
  range.deleteContents();
  range.insertNode(tempTextNode);

  // Set cursor after the "Thinking..." message
  const sel = window.getSelection();
  sel.removeAllRanges();
  const newRange = document.createRange();
  newRange.setStartAfter(tempTextNode);
  newRange.collapse(false); // Collapse to the end
  sel.addRange(newRange);

  setPopupInput(""); // Clear popup input immediately
  setShowPopupAI(false); // Close popup immediately

  // Prepare payload for AI API call
  const effectivePayloadContents = [
    { role: "user", parts: [{ text: `Regarding "${originalSelectedText}", ${popupQuery}` }] }
  ];

  // Add existing chat history as context if available (optional, but good for continuity)
  const currentTabMessages = getActiveChatTab()?.messages || [];
  effectivePayloadContents.unshift(...currentTabMessages.map(msg => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.text }]
  })));

  if (currentReferenceText) {
      effectivePayloadContents.unshift({ role: "user", parts: [{ text: `Use this as context: "${currentReferenceText}"` }] });
  }

  try {
      // Convert Gemini format to standard messages format for backend
      const messages = effectivePayloadContents.map(item => ({
        role: item.role === 'model' ? 'assistant' : item.role,
        content: item.parts[0].text
      }));

      // Get document context
      const currentPage = pages.find(p => p.id === currentPageId);
      const docText = currentPage ? currentPage.content.replace(/<[^>]+>/g, '') : "";

      const response = await fetch('http://localhost:3000/api/v1/chat/deepseek', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            messages,
            docText: docText,
            selectedText: originalSelectedText
          })
      });



      const result = await response.json();
      let aiResponseText = "No response from AI.";
      if (result.choices && result.choices.length > 0 &&
          result.choices[0].message && result.choices[0].message.content) {
          aiResponseText = result.choices[0].message.content;
      }

      // Replace "Thinking..." with AI response in the editor
      // Get the current page's content
      const currentPageContent = pages.find(p => p.id === currentPageId)?.content || '';
      
      // Replace the original selected text with the AI response
      // This is a simplified replacement. For rich text, a more robust DOM manipulation
      // or a library function would be needed.
      // For now, we'll replace the entire content of the block where the selection was.
      // A better approach would be to use the range to replace only the selected text.
      // However, since we replaced the selected text with "Thinking...", we need to find that node.

      // Find the parent element of tempTextNode (which was inserted where the selection was)
      const parentElement = tempTextNode.parentNode;
      if (parentElement && parentElement.contains(tempTextNode)) {
        // Replace the tempTextNode with the AI response with diff highlighting
        const aiResponseHtml = aiResponseText.replace(/\n/g, '<br>'); // Convert newlines to <br> for HTML
        
        // Create highlighted content showing the replacement
        let highlightedContent;
        if (originalSelectedText && originalSelectedText.trim() !== '') {
          // Show original text as removed and new text as added
          highlightedContent = replaceContentWithDiff(originalSelectedText, aiResponseHtml);
        } else {
          // Just show new content as added
          highlightedContent = wrapContentWithAIHighlight(aiResponseHtml, 'added');
        }
        
        const fragment = document.createRange().createContextualFragment(highlightedContent);
        parentElement.replaceChild(fragment, tempTextNode);
      }

      // Update the pages state to reflect the change in the editor
      setPages(prevPages => prevPages.map(page => {
        if (page.id === currentPageId) {
          // This is a simplified update. In a real scenario, you'd parse the DOM
          // to get the updated content accurately.
          return { ...page, content: editorRef.current.innerHTML };
        }
        return page;
      }));

  } catch (error) {
      console.error("Error calling API from popup:", error);
      
      // For demo purposes, provide a mock response when API fails
      const mockAIResponse = `This is a revised version of "${originalSelectedText}" with improved clarity and enhanced diff visualization!`;
      
      // Replace "Thinking..." with AI response with diff highlighting
      const parentElement = tempTextNode.parentNode;
      if (parentElement && parentElement.contains(tempTextNode)) {
        // Create highlighted content showing the replacement
        let highlightedContent;
        if (originalSelectedText && originalSelectedText.trim() !== '') {
          // Show original text as removed and new text as added
          highlightedContent = replaceContentWithDiff(originalSelectedText, mockAIResponse);
        } else {
          // Just show new content as added
          highlightedContent = createDiffBlock(mockAIResponse, 'added');
        }
        
        const fragment = document.createRange().createContextualFragment(highlightedContent);
        parentElement.replaceChild(fragment, tempTextNode);
      }

      // Update the pages state to reflect the change in the editor
      setPages(prevPages => prevPages.map(page => {
        if (page.id === currentPageId) {
          return { ...page, content: editorRef.current.innerHTML };
        }
        return page;
      }));

  } finally {
      selectedTextRef.current = null;
      selectedRangeRef.current = null;
  }
};


  // TODO: Restore file import functionality - removed temporarily
  // const handleOpenFile = (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const reader = new FileReader();
  //   const ext = file.name.split(".").pop().toLowerCase();

  //   if (ext === "txt") {
  //     reader.onload = () => {
  //       setPages([{ id: 1, content: reader.result.replace(/\n/g, '<br>') }]);
  //       setCurrentPageId(1);
  //     };
  //     reader.readAsText(file);
  //   } else if (ext === "doc" || ext === "docx" || ext === "html") {
  //     reader.onload = () => {
  //       setPages([{ id: 1, content: reader.result }]);
  //       setCurrentPageId(1);
  //     };
  //     reader.readAsText(file);
  //   } else if (ext === "pdf") {
  //     alert("PDF loading is not supported directly. Please copy/paste its contents manually.");
  //   } else {
  //     alert("Unsupported file type.");
  //   }
  // };

  const insertImageIntoEditor = (imageUrl, file) => {
    const sel = window.getSelection();
    let targetElement = null;

    // Find the current page element
    if (sel.rangeCount > 0) {
      let node = sel.anchorNode;
      while (node && !node.classList?.contains('page-content')) {
        node = node.parentNode;
      }
      targetElement = node;
    }

    // If no selection or not in editor, use the current page
    if (!targetElement) {
      targetElement = document.getElementById(`page-${currentPageId}`);
    }

    if (targetElement) {
      const range = sel.rangeCount > 0 ? sel.getRangeAt(0) : null;

      const imageWrapper = document.createElement('div');
      imageWrapper.className = 'resizable-image-wrapper draggable-image';
      imageWrapper.style.position = 'relative';
      imageWrapper.style.display = 'inline-block';
      imageWrapper.style.margin = '10px';
      imageWrapper.style.maxWidth = '100%';
      imageWrapper.setAttribute('contenteditable', 'false');

      const img = document.createElement("img");
      const imageId = `image-${Date.now()}`;
      img.id = imageId;
      img.src = imageUrl;
      img.style.width = '300px'; // Initial size
      img.style.maxWidth = '100%';
      img.style.height = 'auto';
      img.style.display = "block";
      img.style.cursor = 'move';
      img.draggable = false; // Prevent native drag
      
      // Add file info as data attributes
      if (file) {
        imageWrapper.dataset.fileName = file.name;
        imageWrapper.dataset.fileSize = file.size;
      }

      imageWrapper.appendChild(img);

      // Add delete button
      const deleteBtn = document.createElement('div');
      deleteBtn.className = 'image-delete-btn';
      deleteBtn.innerHTML = '×';
      deleteBtn.title = 'Remove image';
      imageWrapper.appendChild(deleteBtn);

      // Add resize handles
      const handles = ['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se'];
      handles.forEach(handleName => {
        const handleDiv = document.createElement('div');
        handleDiv.className = `resize-handle ${handleName}`;
        imageWrapper.appendChild(handleDiv);

        handleDiv.addEventListener('mousedown', (e) => {
          e.preventDefault();
          e.stopPropagation();
          const rect = img.getBoundingClientRect();
          setResizingImage({
            elementId: imageId,
            handle: handleName,
            initialX: e.clientX,
            initialY: e.clientY,
            initialWidth: rect.width,
            initialHeight: rect.height,
          });
        });
      });

      // Insert image into editor
      if (range && targetElement.contains(range.commonAncestorContainer)) {
        range.deleteContents();
        range.insertNode(imageWrapper);
      } else {
        // Append to end of current page
        targetElement.appendChild(imageWrapper);
      }

      // Add paragraph after image
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      imageWrapper.after(p);

      // Set cursor after image
      const newRange = document.createRange();
      newRange.setStart(p, 0);
      newRange.collapse(true);
      sel.removeAllRanges();
      sel.addRange(newRange);

      // Add event listeners
      imageWrapper.addEventListener('click', (e) => {
        e.stopPropagation();
        document.querySelectorAll('.resizable-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
        imageWrapper.classList.add('selected');
      });

      // Delete button functionality
      deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('Remove this image?')) {
          imageWrapper.remove();
          // Update page content
          const pageId = parseInt(targetElement.id.split('-')[1]);
          setTimeout(() => {
            handlePageInput(pageId, targetElement.innerHTML);
          }, 0);
        }
      });

      // Make image draggable
      let isDragging = false;
      let dragStartX, dragStartY, initialLeft, initialTop;

      img.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resize-handle')) return;
        
        e.preventDefault();
        isDragging = true;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        
        const rect = imageWrapper.getBoundingClientRect();
        const parentRect = targetElement.getBoundingClientRect();
        initialLeft = rect.left - parentRect.left;
        initialTop = rect.top - parentRect.top;
        
        imageWrapper.style.position = 'absolute';
        imageWrapper.style.left = initialLeft + 'px';
        imageWrapper.style.top = initialTop + 'px';
        imageWrapper.style.zIndex = '1000';
        
        document.addEventListener('mousemove', handleDragMove);
        document.addEventListener('mouseup', handleDragEnd);
      });

      const handleDragMove = (e) => {
        if (!isDragging) return;
        
        const deltaX = e.clientX - dragStartX;
        const deltaY = e.clientY - dragStartY;
        
        const newLeft = Math.max(0, Math.min(initialLeft + deltaX, targetElement.clientWidth - imageWrapper.offsetWidth));
        const newTop = Math.max(0, Math.min(initialTop + deltaY, targetElement.clientHeight - imageWrapper.offsetHeight));
        
        imageWrapper.style.left = newLeft + 'px';
        imageWrapper.style.top = newTop + 'px';
      };

      const handleDragEnd = () => {
        isDragging = false;
        document.removeEventListener('mousemove', handleDragMove);
        document.removeEventListener('mouseup', handleDragEnd);
        
        // Update page content
        const pageId = parseInt(targetElement.id.split('-')[1]);
        setTimeout(() => {
          handlePageInput(pageId, targetElement.innerHTML);
        }, 0);
      };

      // Update page content
      const pageId = parseInt(targetElement.id.split('-')[1]);
      setTimeout(() => {
        handlePageInput(pageId, targetElement.innerHTML);
      }, 0);

    } else {
      alert("Please place your cursor in the editor to insert an image.");
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        insertImageIntoEditor(event.target.result, file);
      };
      reader.readAsDataURL(file);
    }
    e.target.value = null;
  };

  // Paste image from clipboard
  const handlePaste = (e) => {
    const items = Array.from(e.clipboardData?.items || []);
    const imageItems = items.filter(item => item.type.startsWith('image/'));
    
    if (imageItems.length > 0) {
      e.preventDefault();
      imageItems.forEach(item => {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            insertImageIntoEditor(event.target.result, file);
          };
          reader.readAsDataURL(file);
        }
      });
    }
  };

  // Drag and drop functionality
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (!e.currentTarget.contains(e.relatedTarget)) {
      e.currentTarget.classList.remove('drag-over');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length > 0) {
      imageFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (event) => {
          insertImageIntoEditor(event.target.result, file);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!resizingImage) return;
      
      const element = document.getElementById(resizingImage.elementId);
      if (!element) return;

      const { handle, initialX, initialY, initialWidth, initialHeight } = resizingImage;
      const dx = e.clientX - initialX;
      const dy = e.clientY - initialY;

      let newWidth = initialWidth;
      let newHeight = initialHeight;

      if (handle.includes('e')) {
        newWidth = initialWidth + dx;
      }
      if (handle.includes('w')) {
        newWidth = initialWidth - dx;
      }
      if (handle.includes('s')) {
        newHeight = initialHeight + dy;
      }
      if (handle.includes('n')) {
        newHeight = initialHeight - dy;
      }

      if (newWidth > 20) {
        element.style.width = `${newWidth}px`;
      }
      if (newHeight > 20) {
        element.style.height = `${newHeight}px`;
      }
    };

    const handleMouseUp = () => {
      if (resizingImage) {
        const element = document.getElementById(resizingImage.elementId);
        const pageElement = element?.closest('.page-content');
        if (pageElement) {
          const pageId = parseInt(pageElement.id.split('-')[1]);
          setTimeout(() => {
            handlePageInput(pageId, pageElement.innerHTML);
          }, 0);
        }
      }
      setResizingImage(null);
    };

    if (resizingImage) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      const getCursorStyle = (handle) => {
        const cursorMap = { n: 'ns-resize', s: 'ns-resize', e: 'ew-resize', w: 'ew-resize', ne: 'nesw-resize', sw: 'nesw-resize', nw: 'nwse-resize', se: 'nwse-resize' };
        return cursorMap[handle] || 'auto';
      };

      document.body.style.cursor = getCursorStyle(resizingImage.handle);
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [resizingImage]);

  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }, [selectedIndex]);

useEffect(() => {
  const handleClickOutside = (e) => {
    if (!e.target.closest('.resizable-image-wrapper')) {
        document.querySelectorAll('.resizable-image-wrapper.selected').forEach(w => w.classList.remove('selected'));
    }
    const isClickInsidePopup =
  e.target.closest(".popup-input-container") ||
  e.target.closest(".popup-input-box");
  if (
    editorRef.current &&
    !editorRef.current.contains(e.target) &&
    !e.target.closest(".inline-toolbar") &&
    !isClickInsidePopup &&
    !e.target.closest(".popup-input-container") &&
    // naman changes sidebar
    !e.target.closest(".ai-sidebar") &&
    !e.target.closest(".help-modal") && // Close help modal
    !e.target.closest(".help-button") // Don't close if clicking the help button itself
  ) {
    setInlineToolbarPos(null);
    setShowAlignDropdown(false);
    setShowFontSizeDropdown(false);
    setShowFontFamilyDropdown(false);
    setShowPopupAI(false);
    setShowHelpModal(false); // Close help modal
  }
};

  document.addEventListener('mousedown', handleClickOutside);
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, []);


useEffect(() => {
  // naman changes sidebar
  const toggleSidebar = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
      e.preventDefault();
      setIsSidebarVisible(prev => !prev);
    }
  };
  window.addEventListener('keydown', toggleSidebar);
  return () => window.removeEventListener('keydown', toggleSidebar);
}, []);

// Capture caret position and auto-focus the input field when sidebar becomes visible
useEffect(() => {
  if (isSidebarVisible) {
    // Save the current caret position (selection range) before focus shifts away
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      sidebarCaretRangeRef.current = sel.getRangeAt(0).cloneRange();
    }
  }
  if (isSidebarVisible && aiInputRef.current) {
    // Small delay to ensure the sidebar animation is complete
    setTimeout(() => {
      aiInputRef.current.focus();
    }, 350); // Slightly longer than the 0.3s CSS transition
  }
}, [isSidebarVisible]);

useEffect(() => {
  if (showPopupAI && aiInputRef.current) {
    setTimeout(() => {
      aiInputRef.current.focus();
      // Restore the selection after focusing the input
      if (selectedRangeRef.current) {
        const sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(selectedRangeRef.current);
      }
    }, 0); // Delay to ensure it's rendered and focus is applied
  }
}, [showPopupAI, unwrapHighlight, highlightSpan]); // Add dependencies

// Effect to clean up highlight when popup closes
useEffect(() => {
  if (!showPopupAI && highlightSpan) {
    unwrapHighlight(highlightSpan);
    setHighlightSpan(null);
  }
}, [showPopupAI, highlightSpan, unwrapHighlight]);



useEffect(() => {
  const currentPage = document.getElementById(`page-${currentPageId}`);
  if (currentPage) {
    setTimeout(() => {
      currentPage.focus({ preventScroll: true });
      
      // Position cursor inside the H1 element for title entry
      const h1Element = currentPage.querySelector('h1');
      if (h1Element) {
        const range = document.createRange();
        const selection = window.getSelection();
        
        // Place cursor inside the H1 element
        range.setStart(h1Element, 0);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }, 100);
  }
}, []);



useEffect(() => {
  const handleKey = (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "y") {
      e.preventDefault();
      const sel = window.getSelection();

      if (sel && sel.isCollapsed) {
        let currentNode = sel.anchorNode;
        let targetElement = null;

        // If the anchorNode is a text node, start from its parent
        if (currentNode.nodeType === Node.TEXT_NODE) {
          currentNode = currentNode.parentNode;
        }

        // First, try to find the closest UL or OL ancestor
        let listAncestor = currentNode;
        while (listAncestor && listAncestor !== editorRef.current) {
          if (listAncestor.nodeName === 'UL' || listAncestor.nodeName === 'OL') {
            targetElement = listAncestor;
            break;
          }
          listAncestor = listAncestor.parentNode;
        }

        if (!targetElement) {
          // If not inside a UL/OL, check for other block-level elements
          let blockElement = currentNode;
          while (blockElement && blockElement !== editorRef.current) {
            if (
              blockElement.nodeType === Node.ELEMENT_NODE && (
                blockElement.nodeName === 'P' ||
                blockElement.nodeName.match(/^H[1-6]$/) ||
                blockElement.nodeName === 'BLOCKQUOTE' ||
                blockElement.nodeName === 'PRE' ||
                blockElement.nodeName === 'DIV'
              )
            ) {
              targetElement = blockElement;
              break;
            }
            blockElement = blockElement.parentNode;
          }
        }

        if (targetElement) {
          const range = document.createRange();
          range.selectNodeContents(targetElement);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          // Fallback to paragraph selection if no specific block or list element is found
          sel.modify("move", "backward", "paragraph");
          sel.modify("extend", "forward", "paragraph");
        }
      }

      // Re-check selection, as it might have been extended
      const currentSel = window.getSelection();
      if (currentSel && !currentSel.isCollapsed && currentSel.toString().trim().length > 0) {
        const range = currentSel.getRangeAt(0).cloneRange();
        selectedRangeRef.current = range;
        selectedTextRef.current = currentSel.toString();

        const rect = range.getBoundingClientRect();
        setPopupPos({ top: rect.top + window.scrollY, left: rect.left + window.scrollX });
        setShowPopupAI(true);

        // Wrap the selection with a highlight span
        setHighlightSpan(wrapSelectionWithHighlight(range));
      }
    } else if (e.ctrlKey && e.key === "Enter") {
      // Accept focused diff change
      e.preventDefault();
      const focusedDiffBlock = document.querySelector('.ai-diff-block.focused');
      if (focusedDiffBlock) {
        const diffId = focusedDiffBlock.getAttribute('data-diff-id');
        if (diffId) {
          acceptDiffChange(diffId);
        }
      }
    } else if (e.ctrlKey && e.shiftKey && e.key === "Enter") {
      // Reject focused diff change
      e.preventDefault();
      const focusedDiffBlock = document.querySelector('.ai-diff-block.focused');
      if (focusedDiffBlock) {
        const diffId = focusedDiffBlock.getAttribute('data-diff-id');
        if (diffId) {
          rejectDiffChange(diffId);
        }
      }
    } else if (e.key === "Escape") {
      setShowPopupAI(false);
      setShowHelpModal(false); // Close help modal on Escape
    }
  };
  window.addEventListener("keydown", handleKey);
  return () => window.removeEventListener("keydown", handleKey);
}, [wrapSelectionWithHighlight, editorRef]); // Add editorRef to dependencies as it's used inside handleKey


  useEffect(() => {
  const menubarContainer = document.querySelector('.menubar-container');

  function handleMouseEnter() {
    document.body.classList.add('menubar-visible');
  }

  function handleMouseLeave() {
    document.body.classList.remove('menubar-visible');
  }

  menubarContainer?.addEventListener('mouseenter', handleMouseEnter);
  menubarContainer?.addEventListener('mouseleave', handleMouseLeave);

  return () => {
    menubarContainer?.removeEventListener('mouseenter', handleMouseEnter);
    menubarContainer?.removeEventListener('mouseleave', handleMouseLeave);
  };
}, []);

useEffect(() => {
  const handleSelectionChange = () => {
    if (skipNextSelectionChange) {
      skipNextSelectionChange = false;
      return;
    }

    const sel = window.getSelection();
    const isTextSelected = !sel.isCollapsed && sel.toString().trim().length > 0;

    // Clear any existing timeout
    if (toolbarShowTimeoutRef.current) {
      clearTimeout(toolbarShowTimeoutRef.current);
      toolbarShowTimeoutRef.current = null;
    }

    if (isTextSelected) {
      // Set a new timeout to show the toolbar after a brief delay
      toolbarShowTimeoutRef.current = setTimeout(() => {
        const range = sel.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        const containerRect = document.querySelector('.container').getBoundingClientRect();
        setInlineToolbarPos({
          top: rect.bottom + window.scrollY - containerRect.top + 8,
          left: rect.left + window.scrollX - containerRect.left + rect.width / 2 - 50, // Shift left by 50px
        });
      }, 150); // 150ms delay, similar to Notion
    } else {
      // Hide toolbar immediately if no text is selected or selection collapses
      setInlineToolbarPos(null);
      setShowAlignDropdown(false);
      setShowFontSizeDropdown(false); // Close font size dropdown
      setShowFontFamilyDropdown(false); // Close font family dropdown
    }
  };

  document.addEventListener("selectionchange", handleSelectionChange);
  return () => {
    document.removeEventListener("selectionchange", handleSelectionChange);
    // Cleanup timeout when component unmounts
    if (toolbarShowTimeoutRef.current) {
      clearTimeout(toolbarShowTimeoutRef.current);
    }
  };
}, []);



  useEffect(() => {
  const container = document.querySelector(".menubar-container");

  const show = () => document.body.classList.add("menubar-visible");
  const hide = () => document.body.classList.remove("menubar-visible");

  container.addEventListener("mouseenter", show);
  container.addEventListener("mouseleave", hide);

  return () => {
    container.removeEventListener("mouseenter", show);
    container.removeEventListener("mouseleave", hide);
  };
}, []);

// naman changes sidebar
const handleMouseDown = (e) => {
  setIsResizing(true);
  e.preventDefault();
};

// naman changes sidebar
const handleMouseMove = (e) => {
  if (!isResizing) return;
  
  const newWidth = window.innerWidth - e.clientX;
  if (newWidth >= 250 && newWidth <= 600) {
    // naman changes sidebar
    setSidebarWidth(newWidth);
  }
};

const handleMouseUp = () => {
  setIsResizing(false);
};

useEffect(() => {
  if (isResizing) {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  } else {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  };
}, [isResizing]);

const createNewPage = () => {
  const newPageId = (pages.length > 0 ? Math.max(...pages.map(p => p.id)) : 0) + 1;
  setPages(prev => [...prev, { id: newPageId, content: '<p><br></p>', isNew: true }]); // Add isNew flag
  setCurrentPageId(newPageId);
  return newPageId;
};

const checkAndHandlePageOverflow = (pageId) => {
  const pageElement = document.getElementById(`page-${pageId}`);
  if (!pageElement) return;

  // Get the exact dimensions
  const pageContainer = pageElement.parentElement; // .document-page
  const containerRect = pageContainer.getBoundingClientRect();
  const elementRect = pageElement.getBoundingClientRect();
  
  // Check if content overflows the container
  const overflowsVertically = elementRect.height > containerRect.height;
  
  if (overflowsVertically) {
    // Check if we're the last page in the document
    const currentPageIndex = pages.findIndex(p => p.id === pageId);
    const isLastPage = currentPageIndex === pages.length - 1;
    
    if (isLastPage) {
      // Extract overflow content
      const overflowContent = extractOverflowContentSimple(pageElement, containerRect.height);
      
      if (overflowContent.trim()) {
        // Create new page with overflow content
        const newPageId = (pages.length > 0 ? Math.max(...pages.map(p => p.id)) : 0) + 1;
        
        // Remove overflow from current page first
        removeOverflowContentSimple(pageElement, containerRect.height);
        
        // Update current page and create new page
        const updatedCurrentContent = pageElement.innerHTML;
        
        setPages(prev => [
          ...prev.map(page => 
            page.id === pageId ? { ...page, content: updatedCurrentContent } : page
          ),
          { id: newPageId, content: overflowContent, isNew: false }
        ]);
      }
    }
  }
};

const extractOverflowContentSimple = (pageElement, maxHeight) => {
  const children = Array.from(pageElement.children);
  if (children.length === 0) return '';
  
  // Find the last element that fits completely
  let fittingElements = [];
  let overflowElements = [];
  let totalHeight = 0;
  
  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    const elementRect = element.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    
    // Check if element fits within the page bounds
    if (elementRect.bottom <= pageRect.top + maxHeight) {
      fittingElements.push(element);
    } else {
      // This element and all following are overflow
      overflowElements = children.slice(i);
      break;
    }
  }
  
  return overflowElements.map(el => el.outerHTML).join('');
};

const removeOverflowContentSimple = (pageElement, maxHeight) => {
  const children = Array.from(pageElement.children);
  if (children.length === 0) return;
  
  // Find elements that overflow and remove them
  const elementsToRemove = [];
  
  for (let i = 0; i < children.length; i++) {
    const element = children[i];
    const elementRect = element.getBoundingClientRect();
    const pageRect = pageElement.getBoundingClientRect();
    
    // If element extends beyond page bounds, mark for removal
    if (elementRect.bottom > pageRect.top + maxHeight) {
      elementsToRemove.push(element);
    }
  }
  
  // Remove overflow elements
  elementsToRemove.forEach(element => {
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
};

const handlePageInput = (pageId, content) => {
  const temp = document.createElement("div");
  temp.innerHTML = content;
  const plainText = temp.textContent.trim();
  const hasImage = content.includes("<img");

  let updatedPage = null; // To hold the page after potential isNew update

  setPages(prev =>
    prev.map(page => {
      if (page.id === pageId) {
        // If it's a new page and content is no longer empty, mark it as not new
        if (page.isNew && plainText !== "") {
          updatedPage = { ...page, content, isNew: false };
          return updatedPage;
        }
        updatedPage = { ...page, content };
        return updatedPage;
      }
      return page;
    })
  );

  // Check for content overflow and create new page if needed
  setTimeout(() => {
    checkAndHandlePageOverflow(pageId);
  }, 100); // Slightly longer delay to allow DOM to update properly

  // Deletion logic:
  // Only delete if:
  // 1. It's not the first page
  // 2. It has no plain text content AND no images
  // 3. It's NOT a newly created page (i.e., isNew is false or undefined)
  // 4. There's more than one page in the document
  if (
    pageId !== 1 &&
    plainText === "" &&
    !hasImage &&
    !updatedPage?.isNew && // Check the isNew flag
    pages.length > 1 // Ensure we don't delete the very last page
  ) {
    const pageIndex = pages.findIndex(p => p.id === pageId);
    setPages(prev => prev.filter(p => p.id !== pageId));

    if (pageIndex > 0) {
      const prevPageId = pages[pageIndex - 1].id;
      setCurrentPageId(prevPageId);
      setTimeout(() => {
        const prevPageEl = document.getElementById(`page-${prevPageId}`);
        if (prevPageEl) {
          prevPageEl.focus({ preventScroll: true });
          const selection = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(prevPageEl);
          range.collapse(false); // To the end
          selection.removeAllRanges();
          selection.addRange(range);

          // Smoothly scroll the new cursor position into view
          const lastElement = prevPageEl.lastChild || prevPageEl;
          lastElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 0);
    }
    return;
  }
 
   if (pageId === 1) {
     setPlaceholderVisible(plainText === "");
   }
 };

 useEffect(() => {
  if (showPopupAI && aiInputRef.current) {
    setTimeout(() => {
      aiInputRef.current.focus();
    }, 0); // Delay to ensure it's rendered
  }
}, [showPopupAI]);

 
 useEffect(() => {
   // Clear any existing initial save timeout when content changes
   if (initialSaveTimeoutRef.current) {
     clearTimeout(initialSaveTimeoutRef.current);
   }
 
   if (!initialSaveDone) {
     // Set a new timeout for the initial save (1 minute)
     initialSaveTimeoutRef.current = setTimeout(() => {
       saveDocumentVersion();
       setInitialSaveDone(true);
       console.log("Initial document autosaved!");
     }, 60 * 1000); // 1 minute
   }
 
   return () => {
     if (initialSaveTimeoutRef.current) {
       clearTimeout(initialSaveTimeoutRef.current);
     }
   };
 }, [pages, initialSaveDone]); // Re-run when pages change or initialSaveDone status changes

const handleImmediatePageInput = (pageId) => {
  const pageElement = document.getElementById(`page-${pageId}`);
  if (pageElement && pageElement.scrollHeight > pageElement.clientHeight) {
    const isLastPage = pages.findIndex(p => p.id === pageId) === pages.length - 1;
    if (isLastPage) {
      const newPageId = createNewPage();
      setTimeout(() => {
        const newPageElement = document.getElementById(`page-${newPageId}`);
        if (newPageElement) {
          newPageElement.focus();
        }
      }, 0);
    }
  }
};


const isAtStartOfElement = (element, range) => {
  if (!range.collapsed) return false;
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  const firstTextNode = walker.nextNode();
  if (!firstTextNode) return true; // Empty element
  
  return range.startContainer === firstTextNode && range.startOffset === 0;
};

const isAtEndOfElement = (element, range) => {
  if (!range.collapsed) return false;
  
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let lastTextNode = null;
  let node;
  while (node = walker.nextNode()) {
    lastTextNode = node;
  }
  
  if (!lastTextNode) return true; // Empty element
  
  return range.startContainer === lastTextNode && 
         range.startOffset === lastTextNode.textContent.length;
};

const handlePageKeyDown = (e, pageId) => {
  // Handle slash commands and other existing functionality
  handleKeyDown(e);

  const sel = window.getSelection();
  if (sel.rangeCount > 0) {
    const range = sel.getRangeAt(0);
    let currentNode = range.commonAncestorContainer;
    
    // Check if we're in the title H1 element
    let isInTitleH1 = false;
    let titleElement = null;
    let checkNode = currentNode;
    
    // Traverse up to find if we're in an H1 (title)
    while (checkNode && checkNode !== editorRef.current) {
      if (checkNode.nodeType === Node.ELEMENT_NODE && checkNode.nodeName === 'H1') {
        isInTitleH1 = true;
        titleElement = checkNode;
        break;
      }
      checkNode = checkNode.parentNode;
    }
    
    // Handle title-specific behavior
    if (isInTitleH1 && titleElement) {
      if (e.key === 'Backspace') {
        // Prevent cursor repositioning in title, but allow text deletion
        const selection = window.getSelection();
        if (selection.rangeCount > 0) {
          const titleRange = selection.getRangeAt(0);
          // If at the very beginning of title, prevent backspace
          if (titleRange.startOffset === 0 && titleRange.collapsed) {
            // Check if we're at the very start of the H1
            let node = titleRange.startContainer;
            if (node === titleElement || (node.parentNode === titleElement && !node.previousSibling)) {
              e.preventDefault();
              return;
            }
          }
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
        
        // Set flag to skip next input handling
        skipNextInputHandling.current = true;
        
        // Create a new paragraph after the title
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>';
        
        // Insert after the title
        if (titleElement.nextSibling) {
          titleElement.parentNode.insertBefore(newParagraph, titleElement.nextSibling);
        } else {
          titleElement.parentNode.appendChild(newParagraph);
        }
        
        // Position cursor in the new paragraph immediately
        const newRange = document.createRange();
        newRange.setStart(newParagraph, 0);
        newRange.collapse(true);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        // Manually trigger the page input handler to update state
        // but without affecting cursor positioning
        setTimeout(() => {
          const currentPage = editorRef.current;
          if (currentPage) {
            const newContent = currentPage.innerHTML;
            handlePageInput(currentPageId, newContent);
          }
          skipNextInputHandling.current = false;
        }, 50); // Slightly longer delay to ensure all DOM operations complete
        
        return;
      }
    }
    
    // Traverse up to find a <pre> parent for code block handling
    currentNode = range.commonAncestorContainer;
    while (currentNode && currentNode !== editorRef.current && currentNode.nodeName !== 'PRE') {
      currentNode = currentNode.parentNode;
    }

    if (currentNode && currentNode.nodeName === 'PRE') {
      if (e.key === 'Enter') {
        e.preventDefault();
        // Insert a newline character. <pre> tags respect \n.
        document.execCommand('insertHTML', false, '\n');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        // Get the <pre> element
        const preElement = currentNode;
        
        // Create a new paragraph element
        const newParagraph = document.createElement('p');
        newParagraph.innerHTML = '<br>'; // Ensure it has content to place cursor

        // Insert the new paragraph after the <pre> element
        if (preElement.nextSibling) {
          preElement.parentNode.insertBefore(newParagraph, preElement.nextSibling);
        } else {
          preElement.parentNode.appendChild(newParagraph);
        }

        // Move cursor to the new paragraph
        const newRange = document.createRange();
        newRange.setStart(newParagraph, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
        newParagraph.focus(); // Ensure the new paragraph is focused
      }
    }
  }

  const currentIndex = pages.findIndex(p => p.id === pageId);

  if (e.key === 'Backspace') {
    const pageElement = document.getElementById(`page-${pageId}`);
    if (pageElement && currentIndex > 0) {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        const isAtStart = range.startOffset === 0 && range.collapsed;
        let isTrulyAtStart = false;
        if(isAtStart) {
            let node = range.startContainer;
            if (node === pageElement) {
                isTrulyAtStart = true;
            } else {
                let isFirst = true;
                while(node && node !== pageElement) {
                    if(node.previousSibling) {
                        isFirst = false;
                        break;
                    }
                    node = node.parentNode;
                }
                if(isFirst) isTrulyAtStart = true;
            }
        }

        const isEmpty = pageElement.textContent.trim() === '';

        if (isTrulyAtStart && isEmpty) {
          e.preventDefault();
          const prevPageId = pages[currentIndex - 1].id;
          
          setPages(prev => prev.filter(p => p.id !== pageId));
          setCurrentPageId(prevPageId);

          setTimeout(() => {
            const prevPageEl = document.getElementById(`page-${prevPageId}`);
            if (prevPageEl) {
              prevPageEl.focus({ preventScroll: true });
              const selection = window.getSelection();
              const range = document.createRange();
              range.selectNodeContents(prevPageEl);
              range.collapse(false); // To the end
              selection.removeAllRanges();
              selection.addRange(range);

              // Smoothly scroll the new cursor position into view
            }
          }, 0);
          return;
        }
      }
    }
  }

  const navigateAndFocus = (newIndex) => {
    if (newIndex >= 0 && newIndex < pages.length) {
      const newPageId = pages[newIndex].id;
      const newPageElement = document.getElementById(`page-${newPageId}`);
      if (newPageElement) {
        newPageElement.focus();
        setCurrentPageId(newPageId);
        // Set cursor at end on focus
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(newPageElement);
        range.collapse(false);
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Handle font size shortcuts when text is selected
  if (e.ctrlKey && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed && selection.toString().trim().length > 0) {
      e.preventDefault();
      if (e.key === "ArrowUp") {
        execCmd({ command: "increaseFontSizeRem" });
      } else if (e.key === "ArrowDown") {
        execCmd({ command: "decreaseFontSizeRem" });
      }
      return;
    }
  }

  // Handle page navigation (only when no text is selected)
  if (e.key === "ArrowDown" && e.ctrlKey) {
    e.preventDefault();
    navigateAndFocus(currentIndex + 1);
  } else if (e.key === "ArrowUp" && e.ctrlKey) {
    e.preventDefault();
    navigateAndFocus(currentIndex - 1);
  }

  // Handle natural navigation between pages with arrow keys
  if (e.key === "ArrowDown" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pageElement = document.getElementById(`page-${pageId}`);
      
      // Check if cursor is at the end of the current page
      if (pageElement && range.collapsed) {
        const isAtEnd = isAtEndOfElement(pageElement, range);
        if (isAtEnd && currentIndex < pages.length - 1) {
          e.preventDefault();
          const nextPageId = pages[currentIndex + 1].id;
          const nextPageElement = document.getElementById(`page-${nextPageId}`);
          if (nextPageElement) {
            nextPageElement.focus();
            setCurrentPageId(nextPageId);
            // Set cursor at beginning of next page
            const newRange = document.createRange();
            newRange.setStart(nextPageElement, 0);
            newRange.collapse(true);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    }
  }

  if (e.key === "ArrowUp" && !e.ctrlKey && !e.shiftKey && !e.altKey) {
    const selection = window.getSelection();
    if (selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const pageElement = document.getElementById(`page-${pageId}`);
      
      // Check if cursor is at the beginning of the current page
      if (pageElement && range.collapsed) {
        const isAtStart = isAtStartOfElement(pageElement, range);
        if (isAtStart && currentIndex > 0) {
          e.preventDefault();
          const prevPageId = pages[currentIndex - 1].id;
          const prevPageElement = document.getElementById(`page-${prevPageId}`);
          if (prevPageElement) {
            prevPageElement.focus();
            setCurrentPageId(prevPageId);
            // Set cursor at end of previous page
            const newRange = document.createRange();
            newRange.selectNodeContents(prevPageElement);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        }
      }
    }
  }
};

const stripHtmlTags = (html) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const truncateText = (html, wordLimit) => {
    const plainText = stripHtmlTags(html);
    const words = plainText.split(/\s+/);
    if (words.length > wordLimit) {
        return words.slice(0, wordLimit).join(' ') + '...';
    }
    return plainText;
};

const clearCurrentReference = () => {
    setCurrentReferenceText("");
};

// Data for the help modal commands
const specialCommands = [
  // naman changes sidebar
  { title: "Ctrl + L", description: "Opens up the sidebar." },
  // naman changes sidebar
  { title: "Ctrl + Y", description: "Allows you to edit texts without sidebar" },
  { title: "Ctrl + Enter", description: "Accepts AI output." },
  { title: "Ctrl + Shift + Enter", description: "Rejects AI output." },
  { title: "Ctrl + ↑", description: "Increase font size of selected text by 1rem." },
  { title: "Ctrl + ↓", description: "Decrease font size of selected text by 1rem." },
  { title: "/", description: "Opens the slash command menu." },
  { title: "Select Text", description: "Opens the inline formatting bar." },
  { title: "Drag & Drop", description: "Drag images into the editor to upload them." },
  { title: "Paste Images", description: "Copy and paste images from clipboard (Ctrl+V)." },
  //{ title: "Esc", description: "Closes any open menu or modal." },
];

const basicCommands = [
  { title: "Bold", description: "Make text bold.", key: "Ctrl + B" },
  { title: "Italic", description: "Italicize text.", key: "Ctrl + I" },
  { title: "Underline", description: "Underline text.", key: "Ctrl + U" },
  { title: "Undo", description: "Undo the last action.", key: "Ctrl + Z" },
  { title: "Redo", description: "Redo the undone action.", key: "Ctrl + Shift + Z" },
  { title: "Copy", description: "Copy selected content.", key: "Ctrl + C" },
  { title: "Cut", description: "Cut selected content.", key: "Ctrl + X" },
  { title: "Paste", description: "Paste content.", key: "Ctrl + V" },
  { title: "Select All", description: "Select all content on the page.", key: "Ctrl + A" },
  { title: "Save as PDF", description: "Save current document as PDF.", key: "File Menu" },
  { title: "Save as DOC", description: "Save current document as DOC.", key: "File Menu" },
  // TODO: Restore file import functionality - removed temporarily
// { title: "Open File", description: "Open a .txt, .doc, or .docx file.", key: "File Menu" },
  { title: "Heading 1", description: "Apply Heading 1 style.", key: "Slash Menu / Format Menu" },
  { title: "Paragraph", description: "Apply Paragraph style.", key: "Slash Menu / Format Menu" },
  { title: "Bullet List", description: "Create an unordered list.", key: "Slash Menu / Inline Toolbar" },
  { title: "Numbered List", description: "Create an ordered list.", key: "Slash Menu / Inline Toolbar" },
  { title: "Block Quote", description: "Format text as a block quote.", key: "Slash Menu" },
  { title: "Code Block", description: "Format text as a code block.", key: "Slash Menu" },
  { title: "Insert Divider", description: "Insert a horizontal rule.", key: "Slash Menu" },
  { title: "Align Left", description: "Align text to the left.", key: "Inline Toolbar" },
  { title: "Align Center", description: "Center align text.", key: "Inline Toolbar" },
  { title: "Align Right", description: "Align text to the right.", key: "Inline Toolbar" },
  { title: "Justify", description: "Justify align text.", key: "Inline Toolbar" },
  { title: "Increase Font Size", description: "Increase selected text font size.", key: "Inline Toolbar" },
  { title: "Decrease Font Size", description: "Decrease selected text font size.", key: "Inline Toolbar" },
  { title: "Change Font Family", description: "Change font for selected text.", key: "Inline Toolbar" },
];


  return (
    <>
      <Toolbar
        fileName={fileName}
        setFileName={setFileName}
        handleSavePDF={handleSavePDF}
        handleSaveDOC={handleSaveDOC}
        imageInputRef={imageInputRef}
        setShowTimeline={setShowTimeline}
      />

      <Sidebar
        isVisible={isSidebarVisible}
        sidebarWidth={sidebarWidth}
        handleMouseDown={handleMouseDown}
        setIsVisible={setIsSidebarVisible}
        messages={messages}
        sidebarInput={sidebarInput}
        setSidebarInput={setSidebarInput}
        handleSidebarAIQuery={handleSidebarAIQuery}
        aiInputRef={aiInputRef}
      />

     <div
       className="container"
       style={{
         marginRight: isSidebarVisible ? `${sidebarWidth}px` : '0px',
         width: isSidebarVisible ? `calc(100% - ${sidebarWidth}px)` : '100%',
         transition: 'margin-right 0.3s ease, width 0.3s ease'
       }}
     >
 <div
   // naman changes sidebar
   className={`editor-wrapper ${isSidebarVisible ? "shifted" : ""}`}
   id="editorWrapper"
   style={{
     // Removed transform as container now handles spacing
     transition: 'width 0.3s ease', // Keep transition for width if needed
     width: '100%' // Ensure it takes full width of its parent (the adjusted container)
   }}
 >
    <div className="document-container">
      {pages.map((page) => (
        <Page
          key={page.id}
          page={page}
          onInput={handlePageInput}
          onImmediateInput={handleImmediatePageInput}
          onKeyDown={handlePageKeyDown}
          onFocus={setCurrentPageId}
          onTitleClick={positionCursorInTitle}
          skipNextInputHandling={skipNextInputHandling}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onPaste={handlePaste}
          editorRef={page.id === 1 ? editorRef : null}
          diffHighlightsVisible={diffHighlightsVisible}
        />
      ))}
    </div>
  </div>

  {showMenu && (
    <div className="slash-menu" style={{ top: menuPos.top, left: menuPos.left }}>
      {fuzzySearch.searchQuery ? (
        // Show filtered results when searching
        fuzzySearch.hasResults ? (
          <div className="menu-group">
            <div className="menu-title">Search Results ({fuzzySearch.totalResults})</div>
            {fuzzySearch.filteredCommands.map((cmd, i) => {
              const isSelected = i === selectedIndex;
              const isActive = isCommandActive(cmd);
              return (
                <div
                  key={`${cmd.groupIndex}-${cmd.commandIndex}`}
                  className={`menu-item ${isSelected ? "selected" : ""}`}
                  onMouseDown={() => {
                    execCmd(cmd);
                    fuzzySearch.resetSearch();
                  }}
                  ref={isSelected ? selectedRef : null}
                >
                  <span className="icon">{cmd.icon}</span>
                  <span className="label">{cmd.label}</span>
                  {isActive && <span className="check">✔</span>}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="menu-group">
            <div className="menu-title">No results found</div>
            <div className="menu-item-empty">
              No commands match "{fuzzySearch.searchQuery}"
            </div>
          </div>
        )
      ) : (
        // Show all commands grouped when not searching
        fuzzySearch.filteredGroups.map((group, gIndex) => (
          <div key={gIndex} className="menu-group">
            <div className="menu-title">{group.title}</div>
            {group.commands.map((cmd, i) => {
              // Calculate flat index for this command in the full filtered results
              const flatIndex = fuzzySearch.filteredGroups
                .slice(0, gIndex)
                .reduce((acc, g) => acc + g.commands.length, 0) + i;
              const isSelected = flatIndex === selectedIndex;
              const isActive = isCommandActive(cmd);
              return (
                <div
                  key={`${cmd.groupIndex}-${cmd.commandIndex}`}
                  className={`menu-item ${isSelected ? "selected" : ""}`}
                  onMouseDown={() => {
                    execCmd(cmd);
                    fuzzySearch.resetSearch();
                  }}
                  ref={isSelected ? selectedRef : null}
                >
                  <span className="icon">{cmd.icon}</span>
                  <span className="label">{cmd.label}</span>
                  {isActive && <span className="check">✔</span>}
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  )}

  {inlineToolbarPos && !showPopupAI && (
  <div
    className={`inline-toolbar notion-style show`}
    style={{
      top: inlineToolbarPos.top + "px",
      left: inlineToolbarPos.left + "px",
      // Removed transform: "translateX(-50%)" to align to the left
    }}
  >

   {INLINE_COMMANDS.map((cmd, i) => {
    if (cmd.type === "separator") {
      return <div key={`sep-${i}`} className="inline-toolbar-separator"></div>;
    }
    if (cmd.type === "dropdown") {
      let isDropdownOpen;
      let setDropdownOpen;

      if (cmd.label === "Alignment") {
        isDropdownOpen = showAlignDropdown;
        setDropdownOpen = setShowAlignDropdown;
      } else if (cmd.label === "Font Size") {
        isDropdownOpen = showFontSizeDropdown;
        setDropdownOpen = setShowFontSizeDropdown;
      } else if (cmd.label === "Font Family") {
        isDropdownOpen = showFontFamilyDropdown;
        setDropdownOpen = setShowFontFamilyDropdown;
      }
      else if (cmd.label === "List") {
  isDropdownOpen = showListDropdown;
  setDropdownOpen = setShowListDropdown;
}


      return (
        <div key={i} className="dropdown-wrapper">
          <button
  onMouseDown={(e) => {
    e.preventDefault();
    e.stopPropagation();
    skipNextSelectionChange = true;
  }}
  onClick={() => {
    if (setDropdownOpen) setDropdownOpen(prev => !prev);
  }}
  title={cmd.label}
>
  {cmd.icon} ▼
</button>


          {isDropdownOpen && (
            <div className="align-dropdown"> {/* Reusing align-dropdown class for consistent styling */}
              {cmd.options.map((opt, j) => (
                <div
                  key={j}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    execCmd(opt);
                    setDropdownOpen(false); // Close current dropdown after selection
                  }}
                  className="dropdown-option-with-icon" // New class for consistent icon styling
                >
                  {opt.icon && <span className="dropdown-icon">{opt.icon}</span>}
                  {opt.label}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <button
        key={i}
        onMouseDown={(e) => {
          e.preventDefault();
          execCmd(cmd);
        }}
        title={cmd.label}
      >
        {cmd.icon} {["Explain", "Quick Edit", "Bullet List", "Font Family"].includes(cmd.label) ? cmd.label : ""}
      </button>
    );
  })}


  </div>
)}

</div> {/* 👈 END .container */}

{/* Help Button - Commented out */}
{/*
<button className="help-button" onClick={() => setShowHelpModal(true)} title="Help">
  <HelpCircle size={24} />
</button>
*/}

{/* Help Modal */}
{/* ✅ Popup is OUTSIDE of .container now */}
{showPopupAI && (
  <div
    className="popup-input-container" // Apply positioning directly to this container
    style={{
      top: popupPos.top - 40 + "px",
      left: popupPos.left + "px",
      transform: "translate(-50%, -100%)"
    }}
  >
    <div className="popup-input-box"> {/* New wrapper for input and buttons */}
      <textarea
        className="popup-input"
        ref={aiInputRef}
        placeholder="Edit Selected Text"
        value={popupInput}
        onChange={(e) => setPopupInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handlePopupSubmit();
          } else if (e.key === "Escape") {
            setShowPopupAI(false);
          }
        }}
      />
      <button className="popup-send-button circular-icon-button" onClick={handlePopupSubmit} title="Send">
        <ArrowUp size={16} />
      </button>
      <button className="popup-close-btn" onClick={() => setShowPopupAI(false)} title="Close">
        <X size={18} />
      </button>
    </div>
  </div>
)}

{/* Help Button */}
<button 
  className="help-button help-toggle" 
  onClick={() => setShowHelpModal(true)} 
  aria-label="Open Help"
>
  ?
</button>

{/* Sidebar Assistant Hint */}
{!isSidebarVisible && (
  <button 
    className="sidebar-hint-button" 
    onClick={() => setIsSidebarVisible(true)} 
    aria-label="Open Sidebar Assistant"
  >
    Ctrl + L for sidebar assistant
  </button>
)}

{/* Help Modal */}
{showHelpModal && (
  <div className="help-modal-overlay">
    <div className="help-modal">
      <button className="help-modal-close-btn" onClick={() => setShowHelpModal(false)}>
        ×
      </button>
      <h2>Special Commands</h2>
      
      <div className="special-commands-grid" style={{ gridTemplateRows: `repeat(${Math.ceil(specialCommands.length)}, 1fr)` }}>
        {specialCommands.flatMap((cmd, index) => [
          <div key={`${index}-title`} className="special-command-item">
            <span className="command-title">{cmd.title}</span>
          </div>,
          <div key={`${index}-desc`} className="special-command-item">
            <p className="command-description">{cmd.description}</p>
          </div>
        ])}
      </div>
    </div>
  </div>
)}


{/* Timeline Modal */}
{showTimeline && (
  <div className="timeline-modal-overlay">
    <div className="timeline-modal">
      <button className="timeline-modal-close-btn" onClick={() => setShowTimeline(false)}>
        ×
      </button>
      <h2>Document History</h2>
      <div className="timeline-versions">
        {documentVersions.length === 0 ? (
          <p>No previous versions saved yet.</p>
        ) : (
          [...documentVersions].reverse().map((version, index) => (
            <div key={index} className="timeline-version-item">
              <div className="version-info">
                <span className="version-timestamp">{new Date(version.timestamp).toLocaleString()}</span>
                <span className="version-preview">{truncateText(version.pages[0]?.content || '', 10)}</span>
              </div>
              <button onClick={() => restoreDocumentVersion(version.timestamp)}>Restore</button>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
)}

      <input
        type="file"
        ref={imageInputRef}
        onChange={handleImageUpload}
        style={{ display: "none" }}
        accept="image/*"
      />
</>
    
  );
 // End of App component

 // New functions for autosave and timeline
 function saveDocumentVersion() {
   const currentContent = pages.map(page => ({ id: page.id, content: page.content }));
   setDocumentVersions(prev => {
     const newVersion = {
       timestamp: Date.now(),
       pages: currentContent
     };
     // Keep only the last 50 versions to prevent excessive memory usage
     return [...prev, newVersion].slice(-50);
   });
 }

 function restoreDocumentVersion(timestamp) {
   const versionToRestore = documentVersions.find(version => version.timestamp === timestamp);
   if (versionToRestore) {
     setPages(versionToRestore.pages.map(p => ({ ...p }))); // Deep copy to ensure new objects
     setCurrentPageId(versionToRestore.pages[0]?.id || 1);
     setShowTimeline(false); // Close timeline after restoring
   }
 }

 // Autosave effect for subsequent saves (after initial save)
 useEffect(() => {
   if (initialSaveDone) {
     const autosaveInterval = setInterval(() => {
       saveDocumentVersion();
       console.log("Document autosaved!");
     }, 12 * 60 * 1000); // 12 minutes

     return () => clearInterval(autosaveInterval);
   }
 }, [initialSaveDone, saveDocumentVersion]); // Only run this effect once initial save is done

 };

export default App;
