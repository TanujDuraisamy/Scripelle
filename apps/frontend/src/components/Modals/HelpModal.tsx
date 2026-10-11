import { useEffect } from "react";

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal = ({ isOpen, onClose }: HelpModalProps) => {
  const specialCommands = [
    { title: "Ctrl + L", description: "Opens up the sidebar." },
    {
      title: "Ctrl + Y",
      description: "Allows you to edit texts without sidebar",
    },
    { title: "Ctrl + Enter", description: "Accepts AI output." },
    { title: "Ctrl + Shift + Enter", description: "Rejects AI output." },
    {
      title: "Ctrl + ↑",
      description: "Increase font size of selected text by 1rem.",
    },
    {
      title: "Ctrl + ↓",
      description: "Decrease font size of selected text by 1rem.",
    },
    { title: "/", description: "Opens the slash command menu." },
    { title: "Select Text", description: "Opens the inline formatting bar." },
    {
      title: "Drag & Drop",
      description: "Drag images into the editor to upload them.",
    },
    {
      title: "Paste Images",
      description: "Copy and paste images from clipboard (Ctrl+V).",
    },
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 w-full h-full bg-transparent backdrop-blur-md flex justify-center items-center z-[1000]">
      <div className="bg-transparent border-none p-8 relative max-w-[90%] max-h-[90%] overflow-y-auto overflow-x-hidden">
        <button
          className="absolute top-4 right-4 bg-transparent border-none text-white text-[2.5rem] cursor-pointer p-0 w-10 h-10 flex justify-center items-center transition-transform hover:scale-110"
          onClick={onClose}
        >
          ×
        </button>
        <h2 className="text-white text-[1.7rem] text-center mb-2">
          Special Commands
        </h2>

        <div
          className="grid grid-cols-2 relative w-[600px] max-w-full bg-transparent border-none mt-8"
          style={{
            gridTemplateRows: `repeat(${specialCommands.length}, 1fr)`,
          }}
        >
          <div className="absolute left-1/2 top-0 w-px h-full bg-[#555] transform -translate-x-1/2 z-[1]" />

          {specialCommands.flatMap((cmd, index) => [
            <div
              key={`${index}-title`}
              className="flex justify-center items-center text-center border-b border-[#555] font-['Segoe_UI',sans-serif] text-[#f1f1f1] p-4 last:border-b-0"
              style={{
                borderBottom:
                  index === specialCommands.length - 1
                    ? "none"
                    : "1px solid #555",
              }}
            >
              <span className="font-normal text-[#f1f1f1] text-[1.8rem] mb-0">
                {cmd.title}
              </span>
            </div>,
            <div
              key={`${index}-desc`}
              className="flex justify-center items-center text-center border-b border-[#555] font-['Segoe_UI',sans-serif] text-[#f1f1f1] p-4 last:border-b-0"
              style={{
                borderBottom:
                  index === specialCommands.length - 1
                    ? "none"
                    : "1px solid #555",
              }}
            >
              <p className="text-[1.2rem] text-[#ccc] leading-[1.4] mt-0 mb-0 max-w-[80%]">
                {cmd.description}
              </p>
            </div>,
          ])}
        </div>
      </div>
    </div>
  );
};

export default HelpModal;
