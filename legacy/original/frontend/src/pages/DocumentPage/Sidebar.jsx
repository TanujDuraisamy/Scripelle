import React from "react";
import { X, ArrowUp } from "lucide-react";

export default function Sidebar({
  isVisible,
  sidebarWidth,
  handleMouseDown,
  setIsVisible,
  messages,
  sidebarInput,
  setSidebarInput,
  handleSidebarAIQuery,
  aiInputRef,
}) {
  return (
    <div
      className={`ai-sidebar ${isVisible ? "visible" : ""}`}
      id="aiSidebar"
      style={{
        width: `${sidebarWidth}px`,
        right: isVisible ? "0px" : `-${sidebarWidth + 100}px`,
      }}
    >
      {/* Resize handle */}
      <div
        className="resize-handle"
        onMouseDown={handleMouseDown}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: "4px",
          cursor: "ew-resize",
          backgroundColor: "transparent",
          zIndex: 10,
        }}
      />

      {/* Header */}
      <div className="ai-chat-header">
        <button className="new-chat-btn">New Chat</button>
        <button
          className="sidebar-close-btn"
          aria-label="Close sidebar"
          onClick={() => setIsVisible(false)}
        >
          <X size={20} />
        </button>
      </div>

      {/* Output */}
      <div className="ai-chat-output">
        {messages.length === 0 ? (
          <div className="chat-placeholder-container">
            <div className="ask-something-placeholder">Ask something...</div>
          </div>
        ) : (
          <div className="chat-log">
            {messages.map((msg, idx) => (
              <div key={idx} className={`chat-bubble ${msg.role}`}>
                <div className="chat-content">{msg.content}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="ai-chat-input-wrapper">
        <textarea
          ref={aiInputRef}
          className="ai-chat-input"
          placeholder="Plan, search, or ask..."
          value={sidebarInput}
          onChange={(e) => setSidebarInput(e.target.value)}
          onKeyDown={async (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              const userPrompt = sidebarInput.trim();
              if (userPrompt) await handleSidebarAIQuery(userPrompt);
            }
          }}
        />
        <button
          className="ai-send-button circular-icon-button"
          onClick={async () => {
            const userPrompt = sidebarInput.trim();
            if (userPrompt) await handleSidebarAIQuery(userPrompt);
          }}
          title="Send"
        >
          <ArrowUp size={16} />
        </button>
      </div>
    </div>
  );
}
