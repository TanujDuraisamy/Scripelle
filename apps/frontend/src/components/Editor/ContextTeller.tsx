import React from "react";

interface ContextTellerProps {
  contextText: string;
  onContextChange: (context: string) => void;
  isReadOnly?: boolean;
}

const ContextTeller: React.FC<ContextTellerProps> = ({
  contextText,
  onContextChange,
  isReadOnly = false,
}) => {
  return (
    <div className="bg-[#252526] border-b border-gray-700 px-6 py-4">
      <div className="max-w-[900px] mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <svg
            className="w-5 h-5 text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <label className="text-gray-300 text-sm font-medium">
            Document Context
          </label>
          <span className="text-gray-500 text-xs">
            (Help AI understand what you're writing about)
          </span>
        </div>
        <textarea
          value={contextText}
          onChange={(e) => onContextChange(e.target.value)}
          placeholder="E.g., 'Writing a research paper about climate change' or 'Creating a business proposal for a tech startup'..."
          disabled={isReadOnly}
          className="w-full bg-[#1e1e1e] border border-gray-700 rounded-lg px-4 py-3 text-gray-300 placeholder-gray-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-vertical min-h-[60px] max-h-[120px] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          style={{
            fontFamily: "Arial, sans-serif",
            fontSize: "14px",
            lineHeight: "1.5",
          }}
        />
        {contextText && (
          <div className="mt-2 flex items-center gap-1 text-xs text-gray-500">
            <svg
              className="w-4 h-4 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>AI will use this context to provide better assistance</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextTeller;
