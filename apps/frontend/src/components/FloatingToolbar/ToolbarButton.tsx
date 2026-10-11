import React from "react";

interface ToolbarButtonProps {
  title?: string;
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
}

const ToolbarButton: React.FC<ToolbarButtonProps> = ({
  children,
  title,
  onClick,
  className
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={[
      "inline-flex items-center justify-center whitespace-nowrap gap-1.5",
      "px-2.5 py-1.5 rounded-md text-[0.85rem] text-white",
      "bg-transparent border-none",
      "hover:bg-white/10 hover:text-white",
      "focus:outline-none",
      "transition-all duration-200 ease-out",
      "cursor-pointer",
      "shrink-0",
      className ?? "",
    ].join(" ")}
  >
    {children}
  </button>
);

export default ToolbarButton;
