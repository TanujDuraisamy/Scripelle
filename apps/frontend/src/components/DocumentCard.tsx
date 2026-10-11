import React, { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

interface DocumentCardProps {
  doc: {
    id: string;
    title: string;
    content: string;
    updatedAt: string;
    owner?: {
      firstName: string;
      lastName: string;
    };
  };
  openDocument: (docId: string) => void;
  handleDeleteClick: (docId: string) => void;
  getPreviewText: (content: string) => string;
  getFormattedDate: (dateString: string) => string;
}

const DocumentCard: React.FC<DocumentCardProps> = ({
  doc,
  openDocument,
  handleDeleteClick: onDeleteClick,
  getPreviewText,
  getFormattedDate,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setMenuOpen(!menuOpen);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteClick(doc.id);
    setMenuOpen(false);
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openDocument(doc.id)}
      onKeyDown={(e) => e.key === "Enter" && openDocument(doc.id)}
      className="relative cursor-pointer outline-none group focus:outline-none"
    >
      <div className="h-[393px] bg-[#1e1e1e] rounded-sm shadow-[0_1px_0_rgba(255,255,255,0.03)_inset,0_8px_24px_rgba(0,0,0,0.35)] overflow-hidden relative">
        <div className="p-5 text-[#cccccc] text-sm leading-relaxed overflow-hidden h-full bg-gradient-to-b from-transparent via-transparent to-[#1e1e1e] [mask-image:linear-gradient(to_bottom,black_0%,black_75%,transparent_100%)]">
          {getPreviewText(doc.content) || "No content available"}
        </div>
      </div>

      <div className="mt-4">
        <div className="text-white text-lg mb-2">{doc.title || "Untitled"}</div>
        <div className="text-white text-base opacity-95 drop-shadow-[0_4px_0_rgba(0,0,0,0.25)]">
          {getFormattedDate(doc.updatedAt)}
        </div>
      </div>

      <div
        onClick={handleMenuClick}
        className="absolute top-3 right-3 bg-black/80 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 hover:bg-black/90"
      >
        <BsThreeDotsVertical className="text-white text-sm" />

        <div
          className={`absolute top-full right-0 bg-[#2a2a2a] border border-[#444] rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.3)] min-w-[120px] mt-1 transition-all duration-200 z-20 ${
            menuOpen
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible -translate-y-2"
          }`}
        >
          <div
            onClick={handleDeleteClick}
            className="px-4 py-3 text-[#ff6b6b] text-sm cursor-pointer rounded-md m-1 hover:bg-[rgba(255,107,107,0.1)] transition-colors duration-200"
          >
            Delete
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentCard;
