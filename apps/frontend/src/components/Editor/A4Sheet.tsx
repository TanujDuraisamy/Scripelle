import type { SuggestionsResponse } from "../../types/customTypes";
import React, { useRef, useEffect, useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ToolbarPos } from "../FloatingToolbar";
import FloatingToolbar from "../FloatingToolbar";
import { auth } from "../../utils/handleHttp";

interface A4SheetProps {
  content?: string;
  onContentChange?: (content: string) => void;
  isReadOnly?: boolean;
  onExplainText?: (selectedText: string) => void;
  onQuickEdit?: (selectedText: string) => void;
}

const A4Sheet = React.forwardRef<HTMLDivElement, A4SheetProps>(
  (
    {
      content = "",
      onContentChange,
      isReadOnly = false,
      onExplainText,
      onQuickEdit,
    },
    ref
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);

    const combinedRef = useCallback(
      (node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref]
    );

    const [pageCount, setPageCount] = useState(1);

    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPos, setToolbarPos] = useState<ToolbarPos>(null);
    const [isMarkdownMode, setIsMarkdownMode] = useState(false);
    const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);

    const [predictiveText, setPredictiveText] = useState<string>("");
    const [showPredictive, setShowPredictive] = useState(false);
    const predictiveTimeoutRef = useRef<number | null>(null);

    const A4_HEIGHT_PX = 1123;
    const A4_WIDTH_PX = 794;
    const PADDING_TOP_PX = 94;
    const PADDING_BOTTOM_PX = 94;
    const PADDING_LEFT_PX = 75;
    const PADDING_RIGHT_PX = 75;

    // Function to detect if content contains Markdown syntax
    const isMarkdownContent = useCallback((text: string): boolean => {
      if (!text) return false;

      // Common Markdown patterns
      const markdownPatterns = [
        /^#{1,6}\s+/m, // Headers
        /\*\*.*?\*\*/g, // Bold
        /\*.*?\*/g, // Italic
        /_.*?_/g, // Italic underscore
        /`.*?`/g, // Inline code
        /```[\s\S]*?```/g, // Code blocks
        /^\s*[-*+]\s+/m, // Unordered lists
        /^\s*\d+\.\s+/m, // Ordered lists
        /\[.*?\]\(.*?\)/g, // Links
        /!\[.*?\]\(.*?\)/g, // Images
        /^\s*>\s+/m, // Blockquotes
        /^\s*\|.*\|/m, // Tables
        /^\s*[-=]{3,}/m, // Horizontal rules
      ];

      return markdownPatterns.some(pattern => pattern.test(text));
    }, []);

    // Function to extract plain text from HTML for Markdown detection
    const getPlainTextFromHTML = useCallback((html: string): string => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      return tempDiv.textContent || tempDiv.innerText || '';
    }, []);

    const getPredictiveText = useCallback(async (currentText: string): Promise<string> => {
      try {
        const response = await auth<SuggestionsResponse>({
          method: "POST",
          url: "autocompletion/suggestions",
          data: {
            text: currentText
          }
        });

        if (response.type === "success" && response.data.data?.suggestions) {

          return response.data.data.suggestions[0]?.text || "";
        }


        return "";
      } catch (error) {
        console.error("Error fetching predictive text:", error);
        return "";
      }
    }, []);

    const getCursorContext = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount || !editorRef.current) return null;

      const range = sel.getRangeAt(0);
      if (!range.collapsed) return null;

      const beforeRange = document.createRange();
      beforeRange.setStart(editorRef.current, 0);
      beforeRange.setEnd(range.startContainer, range.startOffset);
      const textBefore = beforeRange.toString();

      return {
        textBefore,
        range: range.cloneRange()
      };
    }, []);

    const updatePredictiveText = useCallback(async () => {
      if (isReadOnly) return;

      const context = getCursorContext();
      if (!context) {
        setShowPredictive(false);
        return;
      }

      const { textBefore } = context;

      if (textBefore.trim().length < 2) {
        setShowPredictive(false);
        return;
      }

      try {
        const prediction = await getPredictiveText(textBefore);
        if (prediction) {
          setPredictiveText(prediction);
          setShowPredictive(true);
        } else {
          setShowPredictive(false);
        }
      } catch (error) {
        console.error("Error getting predictive text:", error);
        setShowPredictive(false);
      }
    }, [isReadOnly, getCursorContext, getPredictiveText]);

    useEffect(() => {
      if (editorRef.current && content !== editorRef.current.innerHTML) {
        editorRef.current.innerHTML = content;

        // Check for Markdown when content is loaded from outside
        const plainText = getPlainTextFromHTML(content);
        const hasMarkdown = isMarkdownContent(plainText);
        setIsMarkdownMode(hasMarkdown);
      } else if (editorRef.current && content === "") {
        editorRef.current.innerHTML = "";
        setIsMarkdownMode(false);
        setShowMarkdownPreview(false);
      }
    }, [content, getPlainTextFromHTML, isMarkdownContent]);

    useEffect(() => {
      return () => {
        if (predictiveTimeoutRef.current) {
          clearTimeout(predictiveTimeoutRef.current);
        }
      };
    }, []);

    const lastRangeRef = useRef<Range | null>(null);

    const nodeInEditor = useCallback((n: Node | null) => {
      const editor = editorRef.current;
      return !!(n && editor && (n === editor || editor.contains(n)));
    }, []);

    const saveSelectionIfInside = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (nodeInEditor(sel.anchorNode) && nodeInEditor(sel.focusNode)) {
        lastRangeRef.current = range.cloneRange();
      }
    }, [nodeInEditor]);

    const restoreSelection = useCallback(() => {
      const r = lastRangeRef.current;
      if (!r) return;
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(r);
    }, []);

    const exec = (command: string, value?: string) => {
      editorRef.current?.focus({ preventScroll: true });
      restoreSelection();

      document.execCommand(command, false, value);

      handleInput();
      saveSelectionIfInside();
      positionToolbar();
    };

    const onFormatBlock = (block: "p" | "h1" | "h2" | "h3") => {
      const tag = block.toUpperCase();
      exec("formatBlock", `<${tag}>`);
    };

    const getSelectedText = (): string => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return "";
      return sel.toString().trim();
    };

    const handleExplain = () => {
      const selectedText = getSelectedText();
      if (selectedText && onExplainText) {
        onExplainText(selectedText);
      }
    };

    const handleQuickEdit = () => {
      const selectedText = getSelectedText();
      if (selectedText && onQuickEdit) {
        onQuickEdit(selectedText);
      }
    };

    const handleInput = () => {
      removeGhostText();

      if (editorRef.current && onContentChange) {
        const htmlContent = editorRef.current.innerHTML;
        const plainText = getPlainTextFromHTML(htmlContent);

        // Check if content looks like Markdown
        const hasMarkdown = isMarkdownContent(plainText);
        setIsMarkdownMode(hasMarkdown);

        onContentChange(htmlContent);
        updatePageCount();
      }

      if (predictiveTimeoutRef.current) {
        clearTimeout(predictiveTimeoutRef.current);
      }

      predictiveTimeoutRef.current = window.setTimeout(() => {
        updatePredictiveText();
      }, 500);
    };

    const acceptPredictiveText = useCallback(() => {
      if (!showPredictive || !predictiveText) return false;

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return false;

      const range = sel.getRangeAt(0);
      if (!range.collapsed) return false;

      const textNode = document.createTextNode(predictiveText);
      range.insertNode(textNode);

      range.setStartAfter(textNode);
      range.setEndAfter(textNode);
      sel.removeAllRanges();
      sel.addRange(range);

      setShowPredictive(false);
      setPredictiveText("");

      setTimeout(() => {
        if (editorRef.current && onContentChange) {
          onContentChange(editorRef.current.innerHTML);
        }
      }, 0);

      return true;
    }, [showPredictive, predictiveText, onContentChange]);

    const insertGhostText = useCallback(() => {
      if (!showPredictive || !predictiveText || !editorRef.current) return;

      const existingGhost = editorRef.current.querySelector('.ghost-text');
      if (existingGhost) {
        existingGhost.remove();
      }

      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;

      const range = sel.getRangeAt(0);
      if (!range.collapsed) return;

      const ghostSpan = document.createElement('span');
      ghostSpan.className = 'ghost-text';
      ghostSpan.style.cssText = `
        color: #6b7280;
        opacity: 0.7;
        pointer-events: none;
        user-select: none;
      `;
      ghostSpan.textContent = predictiveText;

      try {
        const clonedRange = range.cloneRange();
        clonedRange.insertNode(ghostSpan);

        range.setStartBefore(ghostSpan);
        range.setEndBefore(ghostSpan);
        sel.removeAllRanges();
        sel.addRange(range);
      } catch (error) {
        console.error('Error inserting ghost text:', error);
      }
    }, [showPredictive, predictiveText]);

    const removeGhostText = useCallback(() => {
      if (!editorRef.current) return;
      const ghostElements = editorRef.current.querySelectorAll('.ghost-text');
      ghostElements.forEach(el => el.remove());
    }, []);

    useEffect(() => {
      if (showPredictive && predictiveText) {
        insertGhostText();
      } else {
        removeGhostText();
      }

      return () => {
        removeGhostText();
      };
    }, [showPredictive, predictiveText, insertGhostText, removeGhostText]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
      if (isReadOnly) return;

      // Ctrl+M to toggle Markdown preview
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault();
        const plainText = getPlainTextFromHTML(content);
        if (isMarkdownContent(plainText)) {
          setShowMarkdownPreview(prev => !prev);
        }
        return;
      }

      if (e.key === "Tab" && showPredictive) {
        e.preventDefault();
        removeGhostText();
        acceptPredictiveText();
        return;
      }

      if (["Escape", "Enter"].includes(e.key)) {
        setShowPredictive(false);
        setPredictiveText("");
        removeGhostText();
      }
    }, [isReadOnly, showPredictive, acceptPredictiveText, removeGhostText, content, getPlainTextFromHTML, isMarkdownContent]);

    const updatePageCount = () => {
      if (!editorRef.current) return;

      const contentHeight =
        editorRef.current.scrollHeight - PADDING_TOP_PX - PADDING_BOTTOM_PX;
      const pageContentHeight =
        A4_HEIGHT_PX - PADDING_TOP_PX - PADDING_BOTTOM_PX;

      const calculatedPages = Math.min(
        100,
        Math.max(1, Math.ceil(contentHeight / pageContentHeight))
      );

      if (calculatedPages !== pageCount && calculatedPages > 0) {
        setPageCount(calculatedPages);
      }
    };

    useEffect(() => {
      const timer = setTimeout(() => {
        updatePageCount();
      }, 100);
      return () => clearTimeout(timer);
    }, [content]);

    const renderPageBackgrounds = () => {
      const backgrounds = [];
      for (let i = 0; i < pageCount; i++) {
        backgrounds.push(
          <div
            key={i}
            className="absolute bg-[#1e1e1e] border border-[#444444] pointer-events-none rounded-md shadow-lg"
            style={{
              width: `${A4_WIDTH_PX}px`,
              height: `${A4_HEIGHT_PX}px`,
              top: `${i === 0 ? 0 : i * (A4_HEIGHT_PX + 32) + 32}px`,
              left: 0,
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)",
            }}
          />
        );
      }
      return backgrounds;
    };

    const renderPageNumbers = () => {
      const numbers = [];
      for (let i = 0; i < pageCount; i++) {
        numbers.push(
          <div
            key={i}
            className="absolute text-center text-sm text-gray-500 pointer-events-none"
            style={{
              width: `${A4_WIDTH_PX}px`,
              top: `${
                i === 0
                  ? A4_HEIGHT_PX + 16
                  : (i + 1) * A4_HEIGHT_PX + i * 32 + 32 + 16
              }px`,
              left: 0,
            }}
          >
            Page {i + 1}
          </div>
        );
      }
      return numbers;
    };

    const isSelectionInsideEditor = useCallback(() => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return false;
      const anchorNode = sel.anchorNode;
      const focusNode = sel.focusNode;
      const editor = editorRef.current;
      if (!editor) return false;

      const nodeInEditor = (n: Node | null) =>
        !!n && (n === editor || editor.contains(n as Node));

      return nodeInEditor(anchorNode) && nodeInEditor(focusNode);
    }, []);

    const positionToolbar = useCallback(() => {
      const sel = window.getSelection();
      const editor = editorRef.current;
      const container = containerRef.current;
      if (!sel || sel.rangeCount === 0 || !editor || !container) {
        setShowToolbar(false);
        return;
      }
      if (sel.isCollapsed || !isSelectionInsideEditor()) {
        setShowToolbar(false);
        return;
      }

      const range = sel.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      let top = rect.top - containerRect.top - 44;
      let left = rect.left - containerRect.left + rect.width / 2;

      const TOOLBAR_WIDTH = 360;
      left = Math.max(
        8,
        Math.min(left - TOOLBAR_WIDTH / 2, A4_WIDTH_PX - TOOLBAR_WIDTH - 8)
      );

      if (rect.top - 56 < 0) {
        top = rect.bottom - containerRect.top + 8;
      }

      setToolbarPos({ top, left });
      setShowToolbar(true);
    }, [isSelectionInsideEditor]);

    const hideToolbar = useCallback(() => {
      setShowToolbar(false);
      setToolbarPos(null);
    }, []);

    useEffect(() => {
      if (isReadOnly) return;

      const onSelectionChange = () => {
        requestAnimationFrame(() => {
          saveSelectionIfInside();
          positionToolbar();
        });
      };

      document.addEventListener("selectionchange", onSelectionChange);
      document.addEventListener("mouseup", onSelectionChange);
      document.addEventListener("keyup", onSelectionChange, true);

      const onScroll = () => {
        if (showToolbar) positionToolbar();
      };
      window.addEventListener("scroll", onScroll, true);

      return () => {
        document.removeEventListener("selectionchange", onSelectionChange);
        document.removeEventListener("mouseup", onSelectionChange);
        document.removeEventListener("keyup", onSelectionChange, true);
        window.removeEventListener("scroll", onScroll, true);
      };
    }, [positionToolbar, showToolbar, isReadOnly, saveSelectionIfInside]);

    // Hide if you click outside the editor
    useEffect(() => {
      const onDocClick = (e: MouseEvent) => {
        if (!editorRef.current) return;
        if (editorRef.current.contains(e.target as Node)) return;
        if (toolbarRef.current && toolbarRef.current.contains(e.target as Node))
          return;
        hideToolbar();
      };
      document.addEventListener("mousedown", onDocClick);
      return () => document.removeEventListener("mousedown", onDocClick);
    }, [hideToolbar]);

    // Get plain text content for Markdown rendering
    const getContentForMarkdown = useCallback(() => {
      return getPlainTextFromHTML(content);
    }, [content, getPlainTextFromHTML]);

    return (
      <>
        <style>{`
        @media print {
          .page-break {
            page-break-after: always;
            break-after: page;
          }
        }

        #editor-content::before {
          content: attr(data-placeholder);
          color: #6b7280;
          pointer-events: none;
          position: absolute;
        }

        #editor-content:not(:empty)::before {
          display: none;
        }

        .markdown-preview h1,
        .markdown-preview h2,
        .markdown-preview h3,
        .markdown-preview h4,
        .markdown-preview h5,
        .markdown-preview h6 {
          margin-top: 1em;
        }

        .markdown-preview h1:first-child,
        .markdown-preview h2:first-child,
        .markdown-preview h3:first-child,
        .markdown-preview h4:first-child,
        .markdown-preview h5:first-child,
        .markdown-preview h6:first-child {
          margin-top: 0;
        }

        .markdown-preview code {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .markdown-preview pre {
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        }

        .markdown-preview img {
          max-width: 100%;
          height: auto;
        }
      `}</style>
        <div className="flex justify-center px-4 bg-[#202020] min-h-screen">
          <div
            ref={combinedRef}
            className="relative"
            style={{
              width: `${A4_WIDTH_PX}px`,
              minHeight: `${
                pageCount === 1
                  ? A4_HEIGHT_PX + 64
                  : pageCount * (A4_HEIGHT_PX + 32) + 32 + 64
              }px`,
              paddingTop: pageCount > 1 ? "32px" : "0px",
            }}
          >
            {renderPageBackgrounds()}

            {/* Markdown Preview Toggle Button */}
            {isMarkdownMode && !isReadOnly && (
              <div className="absolute top-2 right-2 z-20">
                <button
                  onClick={() => setShowMarkdownPreview(prev => !prev)}
                  className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                  title="Toggle Markdown Preview (Ctrl+M)"
                >
                  {showMarkdownPreview ? "Edit" : "Preview"}
                </button>
              </div>
            )}

            {/* Editor Content */}
            {(!showMarkdownPreview || isReadOnly) && (
              <div
                id="editor-content"
                ref={editorRef}
                contentEditable={!isReadOnly}
                onInput={handleInput}
                onKeyDown={handleKeyDown}
                className="relative outline-none"
                data-placeholder={
                  isReadOnly
                    ? "Sign in to start editing..."
                    : "Start typing your document here..."
                }
                style={{
                  padding: `${PADDING_TOP_PX}px ${PADDING_RIGHT_PX}px ${PADDING_BOTTOM_PX}px ${PADDING_LEFT_PX}px`,
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12pt",
                  lineHeight: "1.6",
                  color: "#d4d4d4",
                  width: `${A4_WIDTH_PX}px`,
                  zIndex: 10,
                  wordWrap: "break-word",
                  overflowWrap: "break-word",
                  minHeight: `${A4_HEIGHT_PX}px`,
                }}
                suppressContentEditableWarning
                onBlur={() => {
                  setTimeout(() => {
                    const active = document.activeElement as HTMLElement | null;
                    if (
                      toolbarRef.current &&
                      active &&
                      toolbarRef.current.contains(active)
                    )
                      return;
                    if (!editorRef.current?.contains(active)) {
                      hideToolbar();
                    }
                  }, 100);
                }}
              />
            )}

            {/* Markdown Preview */}
            {showMarkdownPreview && isMarkdownMode && !isReadOnly && (
              <div
                className="relative markdown-preview"
                style={{
                  padding: `${PADDING_TOP_PX}px ${PADDING_RIGHT_PX}px ${PADDING_BOTTOM_PX}px ${PADDING_LEFT_PX}px`,
                  fontFamily: "Arial, sans-serif",
                  fontSize: "12pt",
                  lineHeight: "1.6",
                  color: "#d4d4d4",
                  width: `${A4_WIDTH_PX}px`,
                  zIndex: 10,
                  minHeight: `${A4_HEIGHT_PX}px`,
                }}
              >
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Custom components for styling
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 text-white">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-bold mb-3 text-white">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-bold mb-2 text-white">{children}</h3>,
                    h4: ({ children }) => <h4 className="text-base font-bold mb-2 text-white">{children}</h4>,
                    h5: ({ children }) => <h5 className="text-sm font-bold mb-1 text-white">{children}</h5>,
                    h6: ({ children }) => <h6 className="text-xs font-bold mb-1 text-white">{children}</h6>,
                    p: ({ children }) => <p className="mb-4 text-gray-200">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc list-inside mb-4 text-gray-200">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-4 text-gray-200">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-500 pl-4 italic text-gray-300 mb-4">{children}</blockquote>,
                    code: ({ children }) => <code className="bg-gray-800 text-green-400 px-1 py-0.5 rounded text-sm">{children}</code>,
                    pre: ({ children }) => <pre className="bg-gray-900 text-green-400 p-4 rounded mb-4 overflow-x-auto text-sm">{children}</pre>,
                    a: ({ href, children }) => <a href={href} className="text-blue-400 hover:text-blue-300 underline">{children}</a>,
                    strong: ({ children }) => <strong className="font-bold text-white">{children}</strong>,
                    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
                    table: ({ children }) => <table className="border-collapse border border-gray-600 mb-4 text-gray-200">{children}</table>,
                    th: ({ children }) => <th className="border border-gray-600 px-3 py-2 bg-gray-800 font-bold">{children}</th>,
                    td: ({ children }) => <td className="border border-gray-600 px-3 py-2">{children}</td>,
                    hr: () => <hr className="border-gray-600 my-6" />,
                  }}
                >
                  {getContentForMarkdown()}
                </ReactMarkdown>
              </div>
            )}

            {/* Tab hint */}
            {showPredictive && predictiveText && (
              <div
                className="absolute pointer-events-none text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded shadow-lg z-30"
                style={{
                  top: `${A4_HEIGHT_PX - 40}px`,
                  left: `${A4_WIDTH_PX - 150}px`,
                }}
              >
                Press Tab to accept
              </div>
            )}

            {/* Markdown hint */}
            {isMarkdownMode && !showMarkdownPreview && !isReadOnly && (
              <div
                className="absolute pointer-events-none text-xs text-blue-400 bg-gray-800 px-2 py-1 rounded shadow-lg z-30"
                style={{
                  top: `${A4_HEIGHT_PX - 60}px`,
                  left: `10px`,
                }}
              >
                Markdown detected - Press Ctrl+M to preview
              </div>
            )}

            {renderPageNumbers()}

            <FloatingToolbar
              ref={toolbarRef}
              visible={showToolbar}
              pos={toolbarPos}
              readOnly={isReadOnly}
              onExec={exec}
              onFormatBlock={onFormatBlock}
              onExplain={handleExplain}
              onQuickEdit={handleQuickEdit}
            />
          </div>
        </div>
      </>
    );
  }
);

A4Sheet.displayName = "A4Sheet";

export default A4Sheet;
