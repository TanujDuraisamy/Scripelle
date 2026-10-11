import { useState, useRef, useEffect } from "react";
import useUserStore from "../../store/userStore";
import useEditorStore from "../../store/editorStore";
import { MdOutlineHistory } from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";

interface DocumentHeaderProps {
  initialName?: string;
  onNameChange?: (name: string) => void;
  inSignInPrompt?: () => void;
}

const DocumentHeader = ({
  initialName = "Untitled",
  onNameChange,
  inSignInPrompt,
}: DocumentHeaderProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localTitle, setLocalTitle] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useUserStore();
  const { document, setTitle } = useEditorStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const docName = document?.title || initialName;

  const handleNameClick = () => {
    setLocalTitle(document?.title || initialName);
    setIsEditing(true);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (localTitle !== (document?.title || initialName)) {
      setTitle(localTitle);
    }
    if (onNameChange) {
      onNameChange(localTitle);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    if (onNameChange) {
      onNameChange(newTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleNameBlur();
    }
  };

  const handleSignIn = () => {
    inSignInPrompt?.();
  };

  return (
    <div className="bg-[#202020] border-b border-[#333333] px-6 py-1 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        {isEditing ? (
          <input
            type="text"
            value={localTitle}
            onChange={handleNameChange}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            className="bg-transparent text-white opacity-50 border-none font-[Yachting] text-[1.25rem] font-medium outline-none w-[250px]"
            autoFocus
          />
        ) : (
          <h1
            onClick={handleNameClick}
            className="text-lg font-semibold text-[#909090] cursor-pointer hover:bg-[#3c3c3c] px-2 py-1 rounded transition-colors font-[Yachting]"
            title="Click to edit document name"
          >
            {docName}
          </h1>
        )}
      </div>

      <div className="absolute left-[50.5%] -translate-x-1/2 pointer-events-none">
        <h2 className="text-[1.25rem] font-semibold font-[Yachting] italic text-white select-none">
          Scripelle
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {user ? (
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              title="History"
            >
              <MdOutlineHistory size={24} />
            </button>
            <div className="relative">
              <div
                className="ml-2 w-7 h-7 rounded-full bg-gray-600 flex items-center justify-center text-white font-semibold text-xs cursor-pointer hover:bg-gray-700 transition-colors"
                title={`${user.firstName} ${user.lastName}`}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {user.firstName?.charAt(0)?.toUpperCase()}
              </div>

              {isMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-48 bg-[#2a2a2a] border border-[#333] rounded-md shadow-lg z-10111"
                  ref={menuRef}
                >
                  <button
                    onClick={async () => {
                      await logout();
                      setIsMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#3c3c3c] transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
              title="History"
            >
              <MdOutlineHistory size={24} />
            </button>
            <div
              className="ml-2 w-7 h-7 rounded-full flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-gray-700 transition-colors"
              title="Guest User"
              onClick={handleSignIn}
            >
              <FaRegUserCircle size={20} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentHeader;
