import type { SuggestionsResponse } from "../../types/customTypes";
import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import Typography from "@tiptap/extension-typography";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { useEffect, useState, useRef, useCallback } from "react";
import { auth } from "../../utils/handleHttp";
import "./tiptap-styles.css";

interface TipTapEditorProps {
  content: string;
  onContentChange?: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
  onEditorReady?: (editor: Editor) => void;
}

const TipTapEditor = ({
  content,
  onContentChange,
  placeholder = "Start writing...",
  editable = true,
  onEditorReady,
}: TipTapEditorProps) => {
  const [suggestion, setSuggestion] = useState<string>("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const suggestionTimeoutRef = useRef<number | null>(null);
  const lastTextRef = useRef<string>("");

  const getSuggestion = useCallback(
    async (currentText: string): Promise<string> => {
      try {
        const response = await auth<SuggestionsResponse>({
          method: "POST",
          url: "autocompletion/suggestions",
          data: {
            text: currentText,
          },
        });

        if (response.type === "success" && response.data.data?.suggestions) {
          return response.data.data.suggestions[0]?.text || "";
        }
        return "";
      } catch (error) {
        console.error("Error fetching suggestion:", error);
        return "";
      }
    },
    []
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        underline: false,
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Typography,
      Placeholder.configure({
        placeholder,
      }),
      TextStyle,
      Color,
    ],
    content:
      content && content.trim() !== "" && content !== "<p></p>"
        ? content
        : '<h3 style="text-align: center; margin-bottom: 17px;">Untitled Document</h3><p></p>',
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onContentChange?.(html);

      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }

      suggestionTimeoutRef.current = window.setTimeout(async () => {
        const text = editor.getText();

        if (text.trim().length < 10 || text === lastTextRef.current) {
          setShowSuggestion(false);
          return;
        }

        lastTextRef.current = text;
        const newSuggestion = await getSuggestion(text);

        if (newSuggestion && newSuggestion.trim().length > 0) {
          setSuggestion(newSuggestion);
          setShowSuggestion(true);
        } else {
          setShowSuggestion(false);
        }
      }, 1000);
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-invert max-w-none focus:outline-none min-h-[297mm] p-8",
      },
      handleKeyDown: (view, event) => {
        if (event.key === "Tab" && showSuggestion && suggestion) {
          event.preventDefault();
          const { state, dispatch } = view;
          const { tr } = state;
          tr.insertText(suggestion);
          dispatch(tr);
          setShowSuggestion(false);
          setSuggestion("");
          return true;
        }
        if (event.key === "Escape" && showSuggestion) {
          event.preventDefault();
          setShowSuggestion(false);
          setSuggestion("");
          return true;
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor && onEditorReady) {
      onEditorReady(editor);
    }
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (content && content.trim() !== "" && content !== "<p></p>") {
        editor.commands.setContent(content);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(editable);
    }
  }, [editable, editor]);

  useEffect(() => {
    return () => {
      if (suggestionTimeoutRef.current) {
        clearTimeout(suggestionTimeoutRef.current);
      }
    };
  }, []);

  if (!editor) {
    return null;
  }

  return (
    <div
      className="tiptap-editor-wrapper mx-auto my-8 overflow-hidden relative"
      style={{
        width: "210mm",
        minHeight: "297mm",
        backgroundColor: "#1e1e1e",
        color: "#ffffff",
        border: "1px solid #444444",
        borderRadius: "12px",
      }}
    >
      <EditorContent editor={editor} />

      {/* Text Suggestion Overlay */}
      {showSuggestion && suggestion && editable && (
        <div className="fixed bottom-20 right-8 max-w-md bg-[#2a2a2a] border border-[#444444] rounded-lg p-4 shadow-lg z-50 animate-fade-in">
          <div className="flex items-start justify-between mb-2">
            <span className="text-xs text-gray-400 font-medium">
              AI Suggestion
            </span>
            <button
              onClick={() => {
                setShowSuggestion(false);
                setSuggestion("");
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Dismiss (Esc)"
            >
              ×
            </button>
          </div>
          <p className="text-white text-sm mb-3 leading-relaxed">
            {suggestion}
          </p>
          <div className="flex gap-2 text-xs">
            <button
              onClick={() => {
                if (editor) {
                  editor.commands.insertContent(suggestion);
                  setShowSuggestion(false);
                  setSuggestion("");
                }
              }}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Accept (Tab)
            </button>
            <button
              onClick={() => {
                setShowSuggestion(false);
                setSuggestion("");
              }}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TipTapEditor;
