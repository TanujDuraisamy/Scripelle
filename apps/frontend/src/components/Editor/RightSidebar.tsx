import type { AIResponse } from "../../types/customTypes";
import { useState, useRef, useEffect } from "react";
import { X, ArrowUp, Check, X as XIcon } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { IoChevronDownOutline } from "react-icons/io5";
import useEditorStore from "../../store/editorStore";

interface RightSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  documentContent: string;
  context: string;
  onAiRequest: (
    prompt: string,
    context: string,
    chatHistory: Array<{ role: string; content: string }>,
    mode: "agent" | "auto" | "ask",
    documentId: string
  ) => Promise<AIResponse>;
  onInsertTextAtCursor: (text: string) => void;
}

const RightSidebar = ({
  isOpen,
  onToggle,
  onAiRequest,
  onInsertTextAtCursor,
}: RightSidebarProps) => {
  const [messages, setMessages] = useState<
    Array<{
      role: string;
      content: string;
      shouldInsert: boolean;
      isPending?: boolean;
      messageId?: string;
    }>
  >([]);
  const [sidebarInput, setSidebarInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const aiInputRef = useRef<HTMLTextAreaElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const [mode, setMode] = useState<"agent" | "auto" | "ask">("auto");
  const [isModeOpen, setIsModeOpen] = useState(false);
  const modeRef = useRef<HTMLDivElement>(null);
  const { contextText, chatHistory, clearChatHistory, document, addChatMessage, removeLastAssistantMessage } = useEditorStore();

  const adjustTextareaHeight = () => {
    if (aiInputRef.current) {
      aiInputRef.current.style.height = "auto";
      const scrollHeight = aiInputRef.current.scrollHeight;
      const minHeight = 50;
      const maxHeight = 180;
      const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
      aiInputRef.current.style.height = `${newHeight}px`;

      if (scrollHeight > maxHeight) {
        aiInputRef.current.scrollTop = 0;
      }
    }
  };

  const updateSidebarWidth = () => {
    const width = window.innerWidth;
    if (width >= 1920) {
      setSidebarWidth(400);
    } else if (width >= 1440) {
      setSidebarWidth(350);
    } else if (width >= 1024) {
      setSidebarWidth(340);
    } else {
      setSidebarWidth(360);
    }
  };

  useEffect(() => {
    updateSidebarWidth();
    window.addEventListener("resize", updateSidebarWidth);
    return () => window.removeEventListener("resize", updateSidebarWidth);
  }, []);

  useEffect(() => {
    // Map chat history from store to local messages format
    const mappedMessages = chatHistory.map((h) => {
      return {
        role: h.role,
        content: h.content,
        shouldInsert: false,
        isPending: false,
        messageId: h.id || Date.now().toString() + Math.random(),
      };
    });

    // Find any pending insert messages to preserve them
    const pendingInsertMessages = messages.filter(
      (m) => m.role === "assistant" && m.shouldInsert && m.isPending
    );

    // Only update if the chat history length changed or there are no pending messages
    const shouldUpdate = mappedMessages.length !== messages.filter(m => !m.shouldInsert || !m.isPending).length;

    if (shouldUpdate || pendingInsertMessages.length === 0) {
      setMessages([...mappedMessages, ...pendingInsertMessages]);
    }
  }, [chatHistory]);

  useEffect(() => {
    adjustTextareaHeight();
  }, [sidebarInput]);

  useEffect(() => {
    if (isOpen && aiInputRef.current) {
      const timeoutId = setTimeout(() => {
        aiInputRef.current?.focus();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [isOpen]);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!modeRef.current) return;
      if (!modeRef.current.contains(e.target as Node)) {
        setIsModeOpen(false);
      }
    };
    window.addEventListener("mousedown", onDocClick);
    return () => window.removeEventListener("mousedown", onDocClick);
  }, []);

  useEffect(() => {
    if (!scrollContainerRef.current) return;
    const el = scrollContainerRef.current;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    const shouldSmooth = distanceFromBottom < 200;
    if (shouldSmooth) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    } else {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, isThinking, isOpen]);

  const handleSidebarAIQuery = async (prompt: string) => {
    // Add user message to chat history store first
    addChatMessage({ role: "user", content: prompt });

    // Add user message to local state temporarily
    const newUserMessage = { role: "user", content: prompt, shouldInsert: false };
    setMessages(prev => [...prev, newUserMessage]);

    setSidebarInput("");
    setIsThinking(true);

    try {
      const response = await onAiRequest(
        prompt,
        contextText || "",
        chatHistory.map((msg) => ({ role: msg.role, content: msg.content })),
        mode,
        document.id || ""
      );

      const responseText = response?.response || response?.text || "No response";
      const cleanedResponseText = responseText.replace(/^(AI|Assistant):\s*/i, '').trim();
      const responseShouldInsert: boolean = !!response?.shouldInsert;
      const localMessageId = Date.now().toString();



      // Add assistant message to chat history store
      addChatMessage({ role: "assistant", content: cleanedResponseText });

      // If the response should be inserted, add it as a pending message locally
      if (responseShouldInsert) {
        setMessages(prev => [
          ...prev.filter(m => !(m.role === "user" && m.content === prompt)), // Remove temp user message
          {
            role: "assistant",
            content: cleanedResponseText,
            shouldInsert: true,
            isPending: true,
            messageId: localMessageId,
          },
        ]);
      }
    } catch (error) {
      console.error("AI request failed:", error);
      const errorMessage = "Sorry, I couldn't process that request.";

      // Add error message to chat history store
      addChatMessage({ role: "assistant", content: errorMessage });
    } finally {
      setIsThinking(false);
    }
  };

  const handleAcceptResponse = (messageId: string, content: string) => {
    onInsertTextAtCursor(content);

    // Remove the pending insert message from local state
    setMessages(prev => prev.filter(msg => msg.messageId !== messageId));
  };

  const handleRejectResponse = (messageId: string) => {
    // Remove the pending insert message from local state
    setMessages(prev => prev.filter(msg => msg.messageId !== messageId));

    // Remove the last assistant message from store
    removeLastAssistantMessage();
  };

  const handleSidebarKeyDown = async (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const userPrompt = sidebarInput.trim();
      if (userPrompt) await handleSidebarAIQuery(userPrompt);
    }
  };

  const handleNewChat = async () => {
    clearChatHistory();
    setMessages([]);
  }

  return (
    <>
      {!isOpen && (
        <div
          onClick={onToggle}
          className="fixed bottom-4 right-10 text-gray-300 text-sm cursor-pointer hover:text-gray-100 transition-colors z-40 px-3 py-2 rounded-lg"
        >
          Ctrl + L for sidebar assistant
        </div>
      )}

      <div
        className="absolute bottom-2 flex flex-col bg-[#202020] shadow-[-4px_0_12px_rgba(0,0,0,0.2)] rounded-l-[30px] overflow-hidden"
        style={{
          top: "60px",
          right: 0,
          width: `${sidebarWidth}px`,
          transform: isOpen ? "translateX(0)" : `translateX(${sidebarWidth}px)`,
          transition:
            "transform 0.3s ease-in-out, width 0.3s ease-in-out",
          zIndex: 999,
        }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize bg-transparent hover:bg-[#444] z-10" />
        <div className="flex justify-between items-center px-4 pt-4 pb-3 bg-[#202020] sticky top-0 z-10">
          <button onClick={handleNewChat} className="text-white bg-[#2c2c2c] text-sm font-semibold px-3 py-2 rounded-md hover:bg-[#3a3a3a] transition">
            New Chat
          </button>

          <button
            onClick={onToggle}
            aria-label="Close sidebar"
            className="flex items-center justify-center w-8 h-8 text-[#8e8ea0] hover:text-white hover:bg-[#555] rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

  <div ref={scrollContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden text-[#ddd] text-[0.95rem] whitespace-pre-wrap flex flex-col gap-3 px-4 py-4 scroll-smooth">
          {messages.length === 0 ? (
            <div className="flex flex-col items-start justify-start h-full">
              <div className="text-[#a9a9a9] text-lg mt-4">
                Ask something...
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-3 rounded-xl max-w-[85%] break-words ${
                    msg.role === "user"
                      ? "bg-[#3a3a3a] self-end rounded-br-sm"
                      : "bg-[#2a2a2a] self-start rounded-bl-sm"
                  }`}
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                  >
                    {msg.content}
                  </ReactMarkdown>

                  {msg.role === "assistant" && msg.shouldInsert && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-[#444]">
                      <button
                        onClick={() => handleAcceptResponse(msg.messageId!, msg.content)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#3c3c3c] hover:bg-[#4a4a4a] text-white rounded-md text-sm transition-colors"
                      >
                        <Check size={16} />
                        Accept
                      </button>
                      <button
                        onClick={() => handleRejectResponse(msg.messageId!)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-[#1e1e1e] hover:bg-[#2a2a2a] text-white rounded-md text-sm transition-colors"
                      >
                        <XIcon size={16} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {isThinking && (
                <div className="bg-[#2a2a2a] px-4 py-3 rounded-xl max-w-[85%] self-start rounded-bl-sm flex items-center gap-2">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-[#a9a9a9] rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-[#a9a9a9] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-[#a9a9a9] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span className="text-[#a9a9a9] text-sm">Thinking...</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 flex flex-col p-4 bg-[#202020]">
          <div className="w-full bg-[#2c2c2c] rounded-xl pt-6 border border-[#444444]">
            <textarea
              ref={aiInputRef}
              placeholder="Plan, search, or ask..."
              value={sidebarInput}
              onChange={(e) => {
                setSidebarInput(e.target.value);
                adjustTextareaHeight();
              }}
              onKeyDown={handleSidebarKeyDown}
              className="w-full px-4 pb-4 rounded-xl text-white resize-none outline-none text-base box-border min-h-[50px] max-h-[180px] font-[Inter] placeholder:text-[#a3a3a3] placeholder:text-[0.95rem] placeholder:font-normal transition-all duration-200 ease-in-out custom-textarea"
              rows={1}
              style={{
                height: "50px",
                boxSizing: "border-box",
              }}
            />

            <div className="flex items-center justify-between px-2 pb-2">
              <div ref={modeRef} className="relative">
                <button
                  onClick={() => setIsModeOpen((v) => !v)}
                  className="bg-[#3a3a3a] hover:bg-[#4a4a4a] text-[#e6e6e6] px-2 py-1 rounded-full transition-colors flex items-center gap-2"
                  title="Mode"
                >
                  <span className="text-xs font-semibold">
                    {mode === "agent"
                      ? "Agent"
                      : mode === "auto"
                      ? "Auto"
                      : "Ask"}
                  </span>

                  <span>
                    <IoChevronDownOutline size={12} />
                  </span>
                </button>

                {isModeOpen && (
                  <div className="absolute left-0 bottom-[28px] mb-2 w-36 rounded-md bg-[#2a2a2a] border border-[#444] shadow-lg z-[1100]">
                    <button
                      onClick={() => {
                        setMode("agent");
                        setIsModeOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#3a3a3a] text-white"
                    >
                      Agent
                    </button>
                    <button
                      onClick={() => {
                        setMode("auto");
                        setIsModeOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#3a3a3a] text-white"
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => {
                        setMode("ask");
                        setIsModeOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-[#3a3a3a] text-white"
                    >
                      Ask
                    </button>
                  </div>
                )}
              </div>

              <button
                onClick={async () => {
                  const userPrompt = sidebarInput.trim();
                  if (userPrompt) await handleSidebarAIQuery(userPrompt);
                }}
                title="Send"
                className="bg-[#464646] hover:bg-[#555555] text-[#b6b6b6] rounded-full cursor-pointer transition-colors duration-200 ease-in-out h-9 w-9 flex items-center justify-center flex-shrink-0 shadow-none active:scale-95"
              >
                <ArrowUp size={16} color="#b6b6b6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .scroll-smooth::-webkit-scrollbar {
          width: 8px;
        }
        .scroll-smooth::-webkit-scrollbar-track {
          background: #202020;
        }
        .scroll-smooth::-webkit-scrollbar-thumb {
          background-color: #3a3a3a;
          border-radius: 4px;
        }
        .scroll-smooth::-webkit-scrollbar-thumb:hover {
          background-color: #4a4a4a;
        }

        .custom-textarea {
          line-height: 1.5;
          padding-top: 0 !important;
        }

        .custom-textarea::-webkit-scrollbar {
          width: 6px;
        }

        .custom-textarea::-webkit-scrollbar-track {
          background: transparent;
        }

        .custom-textarea::-webkit-scrollbar-thumb {
          background-color: #4a4a4a;
          border-radius: 3px;
        }

        .custom-textarea::-webkit-scrollbar-thumb:hover {
          background-color: #5a5a5a;
        }

        @media (min-width: 1920px) {
          .scroll-smooth {
            font-size: 1rem;
          }
        }

        @media (max-width: 1024px) {
          .scroll-smooth {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
};

export default RightSidebar;
