import { useState } from "react";
import ReactMarkdown from "react-markdown";
import useEditorStore from "../../store/editorStore";

interface AIAssistantProps {
  documentContent: string;
  onAiRequest: (
    prompt: string,
    context: string,
    chatHistory: string[]
  ) => Promise<unknown>;
  isAuthenticated: boolean;
}

const AIAssistant = ({
  documentContent,
  onAiRequest,
  isAuthenticated,
}: AIAssistantProps) => {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { chatHistory } = useEditorStore();

  // Convert store chat history to display format
  const chatMessages = [
    {
      id: 0,
      type: "ai" as const,
      content: "How can I help you with your document today?",
      timestamp: new Date(),
    },
    ...chatHistory.map((msg, index) => ({
      id: index + 1,
      type: msg.role === "user" ? ("user" as const) : ("ai" as const),
      content: msg.content,
      timestamp: msg.timestamp,
    })),
  ];

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading || !isAuthenticated) return;

    const currentMessage = message;
    setMessage("");
    setIsLoading(true);

    try {
      // Build chat history from store messages for API call
      const chatHistoryForApi = chatHistory.map(
        (msg) => `${msg.role === "user" ? "User" : "AI"}: ${msg.content}`
      );

      // Call the AI API - this will automatically add messages to store
      await onAiRequest(currentMessage, documentContent, chatHistoryForApi);
    } catch (error) {
      console.error("Error calling AI API:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-semibold text-white">AI Assistant</h3>
        <p className="text-sm text-gray-400 mt-1">
          Ask me anything about your document or get help with writing.
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`${msg.type === "user" ? "flex justify-end" : ""}`}
          >
            <div
              className={`p-3 rounded-lg max-w-[85%] ${
                msg.type === "user"
                  ? "bg-gray-600 text-white"
                  : "bg-[#2b2b2b] text-gray-300 border border-gray-700"
              }`}
            >
              {msg.type === "user" ? (
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
              ) : (
                <div className="text-sm prose prose-invert prose-sm max-w-none">
                  <ReactMarkdown
                    components={{
                      // Customize markdown elements to match dark theme
                      p: ({ children }) => (
                        <p className="text-gray-300 mb-2 last:mb-0">
                          {children}
                        </p>
                      ),
                      h1: ({ children }) => (
                        <h1 className="text-xl font-bold text-white mb-2">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="text-lg font-bold text-white mb-2">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="text-base font-bold text-white mb-2">
                          {children}
                        </h3>
                      ),
                      ul: ({ children }) => (
                        <ul className="list-disc list-inside text-gray-300 mb-2 space-y-1">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="list-decimal list-inside text-gray-300 mb-2 space-y-1">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="text-gray-300">{children}</li>
                      ),
                      code: ({ className, children }) => {
                        const isInline = !className;
                        return isInline ? (
                          <code className="bg-gray-700 text-blue-300 px-1.5 py-0.5 rounded text-xs font-mono">
                            {children}
                          </code>
                        ) : (
                          <code className="block bg-gray-800 text-blue-300 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                            {children}
                          </code>
                        );
                      },
                      pre: ({ children }) => (
                        <pre className="bg-gray-800 p-2 rounded overflow-x-auto mb-2">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-gray-600 pl-3 italic text-gray-400 mb-2">
                          {children}
                        </blockquote>
                      ),
                      a: ({ href, children }) => (
                        <a
                          href={href}
                          className="text-blue-400 hover:text-blue-300 underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {children}
                        </a>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-bold text-white">
                          {children}
                        </strong>
                      ),
                      em: ({ children }) => (
                        <em className="italic text-gray-300">{children}</em>
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-end">
            <div className="p-3 rounded-lg max-w-[85%] bg-gray-600 text-white">
              <p className="text-sm">Thinking...</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-[#252526] border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAuthenticated
                ? "Ask AI assistant..."
                : "Please sign in to use AI assistant"
            }
            disabled={!isAuthenticated}
            className="flex-1 bg-[#3c3c3c] text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:border-gray-500 text-sm placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            onClick={handleSendMessage}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!message.trim() || isLoading || !isAuthenticated}
          >
            <svg
              className="w-5 h-5 transform rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
