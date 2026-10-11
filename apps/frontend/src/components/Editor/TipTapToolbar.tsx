import { Editor } from "@tiptap/react";
import {
  FaBold,
  FaItalic,
  FaUnderline,
  FaListUl,
  FaListOl,
  FaQuoteLeft,
  FaCode,
  FaAlignLeft,
  FaAlignCenter,
  FaAlignRight,
  FaAlignJustify,
  FaUndo,
  FaRedo,
} from "react-icons/fa";
import { MdFormatClear } from "react-icons/md";

interface TipTapToolbarProps {
  editor: Editor;
}

const TipTapToolbar = ({ editor }: TipTapToolbarProps) => {
  if (!editor) {
    return null;
  }

  const buttonClass = (isActive: boolean) =>
    `p-2 rounded hover:bg-gray-700 transition-colors ${
      isActive ? "bg-gray-600 text-white" : "text-gray-300"
    }`;

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[#2a2a2a] border-b border-gray-700 sticky top-0 z-10">
      {/* Undo/Redo */}
      <div className="flex gap-1 border-r border-gray-600 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className={buttonClass(false)}
          title="Undo (Ctrl+Z)"
        >
          <FaUndo size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className={buttonClass(false)}
          title="Redo (Ctrl+Y)"
        >
          <FaRedo size={16} />
        </button>
      </div>

      {/* Headings */}
      <div className="flex gap-1 border-r border-gray-600 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setParagraph().run()}
          className={buttonClass(editor.isActive("paragraph"))}
          title="Paragraph"
        >
          <span className="text-sm font-medium">P</span>
        </button>
        {[1, 2, 3, 4, 5, 6].map((level) => (
          <button
            key={level}
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 })
                .run()
            }
            className={buttonClass(editor.isActive("heading", { level }))}
            title={`Heading ${level}`}
          >
            <span className="text-sm font-bold">H{level}</span>
          </button>
        ))}
      </div>

      {/* Text formatting */}
      <div className="flex gap-1 border-r border-gray-600 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={buttonClass(editor.isActive("bold"))}
          title="Bold (Ctrl+B)"
        >
          <FaBold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={buttonClass(editor.isActive("italic"))}
          title="Italic (Ctrl+I)"
        >
          <FaItalic size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          className={buttonClass(editor.isActive("underline"))}
          title="Underline (Ctrl+U)"
        >
          <FaUnderline size={16} />
        </button>
      </div>

      {/* Lists */}
      <div className="flex gap-1 border-r border-gray-600 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={buttonClass(editor.isActive("bulletList"))}
          title="Bullet List"
        >
          <FaListUl size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={buttonClass(editor.isActive("orderedList"))}
          title="Numbered List"
        >
          <FaListOl size={16} />
        </button>
      </div>

      {/* Alignment */}
      <div className="flex gap-1 border-r border-gray-600 pr-2 mr-2">
        <button
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={buttonClass(editor.isActive({ textAlign: "left" }))}
          title="Align Left"
        >
          <FaAlignLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={buttonClass(editor.isActive({ textAlign: "center" }))}
          title="Align Center"
        >
          <FaAlignCenter size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={buttonClass(editor.isActive({ textAlign: "right" }))}
          title="Align Right"
        >
          <FaAlignRight size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
          className={buttonClass(editor.isActive({ textAlign: "justify" }))}
          title="Justify"
        >
          <FaAlignJustify size={16} />
        </button>
      </div>

      {/* Other formatting */}
      <div className="flex gap-1">
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={buttonClass(editor.isActive("blockquote"))}
          title="Quote"
        >
          <FaQuoteLeft size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={buttonClass(editor.isActive("codeBlock"))}
          title="Code Block"
        >
          <FaCode size={16} />
        </button>
        <button
          onClick={() =>
            editor.chain().focus().clearNodes().unsetAllMarks().run()
          }
          className={buttonClass(false)}
          title="Clear Formatting"
        >
          <MdFormatClear size={18} />
        </button>
      </div>
    </div>
  );
};

export default TipTapToolbar;
