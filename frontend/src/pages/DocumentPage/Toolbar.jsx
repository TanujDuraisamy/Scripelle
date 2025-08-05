import React from "react";
import LoginButton from "../../LoginButton.jsx";
import { History } from "lucide-react";

export default function Toolbar({ fileName, setFileName, handleSavePDF, handleSaveDOC, imageInputRef, setShowTimeline }) {
  const menus = ["File", "Edit", "Format", "Tools"];

  return (
    <>
      <div className="file-name-bar" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <div className="app-title" align="centre">Scripelle</div>
        <input
          type="text"
          className="file-name-input"
          value={fileName}
          onChange={(e) => setFileName(e.target.value)}
        />
        <div style={{ flex: 1 }} />
        <LoginButton />
        <button className="timeline-button" onClick={() => setShowTimeline(true)} title="Document History">
          <History size={20} />
        </button>
      </div>

      <div className="menubar-container">
        <div className="menubar">
          {menus.map((menu, i) => (
            <div className="menu-item" key={i}>
              {menu}
              <div className="dropdown">
                {menu === "File" && (
                  <>
                    <div onMouseDown={() => document.execCommand("selectAll")}>Select All</div>
                    <div onMouseDown={() => document.execCommand("copy")}>Copy</div>
                    <div onMouseDown={() => document.execCommand("cut")}>Cut</div>
                    <div onMouseDown={handleSavePDF}>Save as PDF</div>
                    <div onMouseDown={handleSaveDOC}>Save as DOC</div>
                  </>
                )}
                {menu === "Edit" && (
                  <>
                    <div onMouseDown={() => document.execCommand("undo")}>Undo</div>
                    <div onMouseDown={() => document.execCommand("redo")}>Redo</div>
                    <div onMouseDown={() => document.execCommand("delete")}>Delete</div>
                    <div onMouseDown={(e) => { e.preventDefault(); imageInputRef.current && imageInputRef.current.click(); }}>Insert Image</div>
                    <div className="dropdown-separator"></div>
                    <div onMouseDown={() => {
                      const selectedImages = document.querySelectorAll('.resizable-image-wrapper.selected');
                      selectedImages.forEach(img => img.remove());
                    }}>Remove Selected Images</div>
                  </>
                )}
                {menu === "Format" && (
                  <>
                    <div onMouseDown={() => document.execCommand("bold")}>Bold</div>
                    <div onMouseDown={() => document.execCommand("italic")}>Italic</div>
                    <div onMouseDown={() => document.execCommand("underline")}>Underline</div>
                    <div onMouseDown={() => document.execCommand("formatBlock", false, "h1")}>Heading</div>
                    <div onMouseDown={() => document.execCommand("formatBlock", false, "p")}>Paragraph</div>
                  </>
                )}
                {menu === "Tools" && (
                  <>
                    <div onMouseDown={() => alert("Spell Check Coming Soon")}>Spelling & Grammar</div>
                    <div onMouseDown={() => alert("Word Count Coming Soon")}>Word Count</div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
