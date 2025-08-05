import React, { useRef, useEffect } from "react";

/**
 * Single document page. Extracted from the former inline component inside app.jsx.
 */
const Page = React.memo(
  ({
    page,
    onInput,
    onKeyDown,
    onFocus,
    editorRef,
    onImmediateInput,
    onKeyUp,
    onTitleClick,
    skipNextInputHandling,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onPaste,
    diffHighlightsVisible,
  }) => {
    const contentRef = useRef(null);
    const debounceTimeout = useRef(null);

    useEffect(() => {
      if (contentRef.current && contentRef.current.innerHTML !== page.content) {
        // Save current selection
        const selection = window.getSelection();
        const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
        const currentOffset = range ? range.startOffset : 0;
        const currentContainer = range ? range.startContainer : null;

        contentRef.current.innerHTML = page.content;

        // Restore selection if possible
        if (currentContainer && contentRef.current.contains(currentContainer)) {
          let newRange = document.createRange();
          newRange.setStart(
            currentContainer,
            Math.min(currentOffset, currentContainer.length)
          );
          newRange.collapse(true);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } else {
          // If original container is no longer valid, set cursor.
          let newRange = document.createRange();
          const firstElement = contentRef.current.firstElementChild;

          if (firstElement) {
            // On initial load, this places the cursor inside the starting H1.
            newRange.setStart(firstElement, 0);
            newRange.collapse(true);
          } else {
            // Fallback for other cases where selection is lost.
            newRange.selectNodeContents(contentRef.current);
            newRange.collapse(false);
          }

          selection.removeAllRanges();
          selection.addRange(newRange);
        }
      }
    }, [page.id, page.content]); // Re-render when page ID or content changes

    const handleInput = (e) => {
      // Skip input handling if flag is set (during Enter key operations)
      if (skipNextInputHandling && skipNextInputHandling.current) {
        return;
      }

      const newContent = e.target.innerHTML;

      // Immediate actions
      onImmediateInput(page.id);

      // Debounced actions
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        onInput(page.id, newContent);
      }, 300); // 300ms debounce delay
    };

    const handleClick = (e) => {
      // Check if click was on or inside an H1 (title) element
      let clickedElement = e.target;
      let titleElement = null;

      // Traverse up to find if we clicked on an H1
      while (clickedElement && clickedElement !== contentRef.current) {
        if (clickedElement.nodeName === "H1") {
          titleElement = clickedElement;
          break;
        }
        clickedElement = clickedElement.parentNode;
      }

      // If we clicked on a title, use the custom positioning
      if (titleElement && onTitleClick) {
        e.preventDefault(); // Prevent default cursor positioning
        onTitleClick(titleElement);
      }
    };

    return (
      <div className="document-page">
        <div
          id={`page-${page.id}`}
          ref={(el) => {
            contentRef.current = el;
            if (editorRef) {
              editorRef.current = el;
            }
          }}
          className={`page-content ${!diffHighlightsVisible ? "highlights-hidden" : ""}`}
          contentEditable
          onKeyDown={(e) => onKeyDown(e, page.id)}
          onInput={handleInput}
          onKeyUp={onKeyUp}
          onClick={handleClick}
          onDragOver={onDragOver}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onPaste={onPaste}
          suppressContentEditableWarning={true}
          onFocus={() => onFocus(page.id)}
        />
      </div>
    );
  }
);

export default Page;
