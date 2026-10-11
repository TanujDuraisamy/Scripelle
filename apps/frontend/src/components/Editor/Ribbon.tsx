import { useState, useRef, useEffect } from "react";

interface RibbonProps {
  onMenuClick: (menu: string, action: string) => void;
  isVisible?: boolean;
}

const Ribbon = ({ onMenuClick, isVisible = true }: RibbonProps) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isVisible) {
      setActiveMenu(null);
    }
  }, [isVisible]);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  const menus = {
    file: ["New", "Open", "Save", "Save As", "Print", "Export"],
    edit: ["Undo", "Redo", "Cut", "Copy", "Paste", "Find", "Replace"],
    format: [
      "Bold",
      "Italic",
      "Underline",
      "Font Size",
      "Text Color",
      "Highlight",
      "Align Left",
      "Align Center",
      "Align Right",
    ],
    tools: ["Word Count", "Spelling", "Grammar", "Translate", "Settings"],
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  const handleMenuHover = (menu: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setActiveMenu(menu);
  };

  const handleMenuLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setActiveMenu(null);
    }, 150); // Small delay to allow moving to submenu
  };

  const handleSubmenuEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleSubmenuLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = window.setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const handleActionClick = (menu: string, action: string) => {
    onMenuClick(menu, action);
    setActiveMenu(null);
  };

  // const executeCommand = (command: string, value?: string) => {
  //   document.execCommand(command, false, value);
  // };

  // const handleFontChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   executeCommand("fontName", e.target.value);
  // };

  // const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   executeCommand("fontSize", e.target.value);
  // };

  // const handleTextColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   executeCommand("foreColor", e.target.value);
  // };

  // const handleHighlightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   executeCommand("hiliteColor", e.target.value);
  // };

  return (
    <div className="bg-[#202020] text-white shadow-lg" ref={menuRef}>
      {/* Menu Bar */}
      <div className="flex items-center px-4">
        {Object.keys(menus).map((menu) => (
          <div key={menu} className="relative">
            <button
              onClick={() => handleMenuClick(menu)}
              onMouseEnter={() => handleMenuHover(menu)}
              onMouseLeave={handleMenuLeave}
              className={`px-3 py-1.5 capitalize hover:bg-[#3c3c3c] rounded transition-colors text-sm ${
                activeMenu === menu ? "bg-[#3c3c3c]" : ""
              }`}
            >
              {menu}
            </button>

            {activeMenu === menu && (
              <div
                className="absolute top-full left-0 mt-1 bg-[#333333] text-gray-800 shadow-xl rounded-lg overflow-hidden z-50 min-w-[180px]"
                onMouseEnter={handleSubmenuEnter}
                onMouseLeave={handleSubmenuLeave}
              >
                {menus[menu as keyof typeof menus].map((action) => (
                  <button
                    key={action}
                    onClick={() => handleActionClick(menu, action)}
                    className="w-full text-left px-4 py-2 text-white hover:bg-[#444444] transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Toolbar */}
      {/* <div className="flex items-center gap-2 px-4 py-2 overflow-x-auto">
        <select
          onChange={handleFontChange}
          className="bg-[#3c3c3c] text-white px-3 py-1 rounded border border-gray-600 text-sm"
        >
          <option value="Arial">Arial</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Georgia">Georgia</option>
          <option value="Verdana">Verdana</option>
        </select>

        <select
          onChange={handleFontSizeChange}
          defaultValue="3"
          className="bg-[#3c3c3c] text-white px-3 py-1 rounded border border-gray-600 text-sm"
        >
          <option value="1">8</option>
          <option value="2">10</option>
          <option value="3">12</option>
          <option value="4">14</option>
          <option value="5">18</option>
          <option value="6">24</option>
          <option value="7">36</option>
        </select>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button
          onClick={() => executeCommand("bold")}
          className="px-3 py-1 hover:bg-[#3c3c3c] rounded transition-colors font-bold"
          title="Bold"
        >
          B
        </button>
        <button
          onClick={() => executeCommand("italic")}
          className="px-3 py-1 hover:bg-[#3c3c3c] rounded transition-colors italic"
          title="Italic"
        >
          I
        </button>
        <button
          onClick={() => executeCommand("underline")}
          className="px-3 py-1 hover:bg-[#3c3c3c] rounded transition-colors underline"
          title="Underline"
        >
          U
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <button
          onClick={() => executeCommand("justifyLeft")}
          className="px-3 py-1 hover:bg-[#3c3c3c] rounded transition-colors"
          title="Align Left"
        >
          ≡
        </button>
        <button
          onClick={() => executeCommand("justifyCenter")}
          className="px-3 py-1 hover:bg-[#3c3c3c] rounded transition-colors"
          title="Align Center"
        >
          ≣
        </button>
        <button
          onClick={() => executeCommand("justifyRight")}
          className="px-3 py-1 hover:bg-[#3c3c3c] rounded transition-colors"
          title="Align Right"
        >
          ≢
        </button>

        <div className="h-6 w-px bg-gray-600 mx-1"></div>

        <input
          type="color"
          onChange={handleTextColorChange}
          className="w-8 h-8 rounded cursor-pointer"
          title="Text Color"
          defaultValue="#ffffff"
        />
        <input
          type="color"
          onChange={handleHighlightChange}
          className="w-8 h-8 rounded cursor-pointer"
          title="Highlight Color"
          defaultValue="#ffff00"
        />
      </div> */}
    </div>
  );
};

export default Ribbon;
