import type { AIResponse } from "../types/customTypes";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import Ribbon from "../components/Editor/Ribbon";
import DocumentHeader from "../components/Editor/DocumentHeader";
import RightSidebar from "../components/Editor/RightSidebar";
import SignInPromptModal from "../components/Modals/SignInPromptModal";
import HelpModal from "../components/Modals/HelpModal";
import TipTapEditor from "../components/Editor/TipTapEditor";
import useUserStore from "../store/userStore";
import useEditorStore from "../store/editorStore";
import { auth } from "../utils/handleHttp";
import { MdOutlineQuestionMark } from "react-icons/md";
import { Editor } from "@tiptap/react";

const EditorPage = () => {
  const [searchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showRibbon, setShowRibbon] = useState(false);
  const ribbonTimeout = useRef<number | null>(null);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(400);
  const documentId = searchParams.get("id");
  const { user } = useUserStore();
  const isAuthenticated = user !== null;
  const ribbonRef = useRef<HTMLDivElement>(null);
  const editorInstanceRef = useRef<Editor | null>(null);

  const {
    document,
    contextText,
    setTitle,
    setContent,
    loadDocument,
    saveDocument,
  } = useEditorStore();

  useEffect(() => {
    if (documentId && isAuthenticated) {
      loadDocument(documentId);
    }
  }, [documentId, isAuthenticated]);

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
    const handleResize = () => updateSidebarWidth();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const isMouseOverRibbonOrDropdown = useCallback(
    (event: MouseEvent): boolean => {
      if (ribbonRef.current) {
        const rect = ribbonRef.current.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          return true;
        }
      }

      const dropdowns = window.document.querySelectorAll(
        ".absolute.top-full.left-0"
      );
      for (let i = 0; i < dropdowns.length; i++) {
        const dropdown = dropdowns[i] as HTMLElement;
        const rect = dropdown.getBoundingClientRect();
        if (
          event.clientX >= rect.left &&
          event.clientX <= rect.right &&
          event.clientY >= rect.top &&
          event.clientY <= rect.bottom
        ) {
          return true;
        }
      }

      return false;
    },
    []
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      const isOverRibbon = isMouseOverRibbonOrDropdown(event);

      if (event.clientY <= 60 || isOverRibbon) {
        setShowRibbon(true);
        if (ribbonTimeout.current) clearTimeout(ribbonTimeout.current);
      } else {
        if (ribbonTimeout.current) clearTimeout(ribbonTimeout.current);
        ribbonTimeout.current = setTimeout(() => setShowRibbon(false), 150);
      }
    },
    [isMouseOverRibbonOrDropdown]
  );

  const handlePageKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.ctrlKey && event.key === "l") {
        event.preventDefault();
        toggleSidebar();
      }
      if (event.ctrlKey && event.key === "s") {
        event.preventDefault();
        if (isAuthenticated) {
          saveDocument();
        }
      }
      if (event.ctrlKey && event.key === "h") {
        event.preventDefault();
        setShowHelpModal((prev) => !prev);
      }
    },
    [isAuthenticated]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (ribbonTimeout.current) clearTimeout(ribbonTimeout.current);
    };
  }, [handleMouseMove]);

  const handleMenuClick = (_menu: string, action: string) => {

    if (!isAuthenticated && action.toLowerCase() !== "print") {
      setShowSignInModal(true);
      return;
    }

    const editor = editorInstanceRef.current;
    if (!editor) return;

    switch (action.toLowerCase()) {
      case "save":
        saveDocument();
        break;
      case "print":
        window.print();
        break;
      case "bold":
        editor.chain().focus().toggleBold().run();
        break;
      case "italic":
        editor.chain().focus().toggleItalic().run();
        break;
      case "underline":
        editor.chain().focus().toggleUnderline().run();
        break;
      case "undo":
        editor.chain().focus().undo().run();
        break;
      case "redo":
        editor.chain().focus().redo().run();
        break;
      case "align left":
        editor.chain().focus().setTextAlign("left").run();
        break;
      case "align center":
        editor.chain().focus().setTextAlign("center").run();
        break;
      case "align right":
        editor.chain().focus().setTextAlign("right").run();
        break;
      default:

    }
  };

  const handleNameChange = (name: string) => {
    setTitle(name);

  };


  const showSignInPrompt = () => {
    setShowSignInModal(true);
  };

  const postAiRequest = async (
    prompt: string,
    context: string,
    currentChatHistory: Array<{ role: string; content: string }>,
    mode: "agent" | "auto" | "ask" = "agent",
    documentId: string = ""
  ) => {
    const url = `ai/generate-text`;
    const res = await auth<AIResponse>({
      method: "POST",
      url,
      data: {
        prompt,
        context,
        chatHistory: currentChatHistory,
        mode,
        documentId,
      },
    });

    if (res.type === "error") throw new Error(res.data);

    return res.data;
  };

  return (
    <div
      className="h-screen flex flex-col overflow-hidden bg-[#202020]"
      onKeyDown={handlePageKeyDown}
      tabIndex={0}
    >
      <DocumentHeader
        initialName={document.title}
        onNameChange={handleNameChange}
        inSignInPrompt={showSignInPrompt}
      />
      <div style={{ position: "relative", zIndex: 50 }}>
        <div
          ref={ribbonRef}
          id="editor-ribbon-bar"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            transition: "opacity 0.3s ease-in-out, transform 0.3s ease-in-out",
            opacity: showRibbon ? 1 : 0,
            transform: showRibbon ? "translateY(0)" : "translateY(-32px)",
            pointerEvents: showRibbon ? "auto" : "none",
          }}
        >
          <Ribbon onMenuClick={handleMenuClick} isVisible={showRibbon} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative bg-[#202020]">
        <div
          className="flex-1 overflow-y-auto transition-all duration-700 ease-in-out"
          style={{
            marginLeft: isSidebarOpen ? `-${sidebarWidth / 2}px` : "0px",
            paddingTop: showRibbon ? "50px" : "40px",
            paddingRight: "0px",
          }}
        >
          <TipTapEditor
            content={document.content}
            onContentChange={setContent}
            placeholder="Start writing your document..."
            editable={isAuthenticated}
            onEditorReady={(editor) => {
              editorInstanceRef.current = editor;
            }}
          />
        </div>

        <RightSidebar
          isOpen={isSidebarOpen}
          onToggle={toggleSidebar}
          documentContent={document.content}
          onAiRequest={postAiRequest}
          context={contextText}
          onInsertTextAtCursor={(text) => {
            const editor = editorInstanceRef.current;
            if (!editor) return;
            editor.chain().focus().insertContent({ type: "text", text }).run();
          }}
        />
      </div>

      <button
        className="fixed bottom-4 left-4 w-12 h-12 bg-[#444444] text-white rounded-full shadow-lg hover:bg-[#3c3c3c] transition-colors z-40 border border-gray-700 flex items-center justify-center"
        title="Help (Ctrl+H)"
        onClick={() => setShowHelpModal(true)}
      >
        <MdOutlineQuestionMark size={22} color="white" />
      </button>

      <SignInPromptModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />

      <HelpModal
        isOpen={showHelpModal}
        onClose={() => setShowHelpModal(false)}
      />
    </div>
  );
};

export default EditorPage;
