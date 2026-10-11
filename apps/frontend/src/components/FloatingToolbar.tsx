import React, { useMemo } from "react";
import { HiOutlineSparkles } from "react-icons/hi";
import { TbArrowsUpDown } from "react-icons/tb";
import Divider from "./FloatingToolbar/Divider";
import ToolbarButton from "./FloatingToolbar/ToolbarButton";
import Dropdown from "./FloatingToolbar/Dropdown";
import { GiSettingsKnobs } from "react-icons/gi";
import { CiTextAlignLeft } from "react-icons/ci";

export type ToolbarPos = { top: number; left: number } | null;

interface FloatingToolbarProps {
  visible: boolean;
  pos: ToolbarPos;
  readOnly?: boolean;
  onExec: (command: string, value?: string) => void;
  onFormatBlock: (block: "p" | "h1" | "h2" | "h3") => void;
  onExplain?: () => void;
  onQuickEdit?: () => void;
}

const FloatingToolbar = React.forwardRef<HTMLDivElement, FloatingToolbarProps>(
  (
    {
      visible,
      pos,
      readOnly = false,
      onExec,
      onFormatBlock,
      onExplain,
      onQuickEdit,
    },
    ref
  ) => {
    const fontSizes = useMemo(
      () => [
        { label: "12", value: "2" },
        { label: "14", value: "3" },
        { label: "16", value: "4" },
        { label: "18", value: "5" },
        { label: "24", value: "6" },
        { label: "32", value: "7" },
      ],
      []
    );

    const fontFamilies = useMemo(
      () => [
        "Arial",
        "Georgia",
        "Times New Roman",
        "Courier New",
        "Inter",
        "Roboto",
      ],
      []
    );

    if (!visible || !pos || readOnly) return null;

    return (
      <div
        ref={ref}
        id="floating-toolbar"
        className={[
          "absolute z-[1001] flex items-center flex-nowrap",
          "rounded-lg bg-[#333]",
          "px-2 py-1 shadow-[0_2px_5px_rgba(0,0,0,0.3)]",
          "opacity-0 data-[hidden=false]:opacity-100",
          "scale-95 data-[hidden=false]:scale-100",
          "pointer-events-none data-[hidden=false]:pointer-events-auto",
          "transition-all duration-[120ms] ease-out",
          "gap-1.5",
          "min-w-max",
          "max-w-[calc(100vw-24px)]",
          "overflow-x-auto",
        ].join(" ")}
        data-hidden={!visible}
        style={{ top: pos.top, left: pos.left }}
        onMouseDown={(e) => e.preventDefault()}
        role="toolbar"
        aria-label="Inline formatting toolbar"
      >
        <ToolbarButton title="Explain" onClick={onExplain}>
          <HiOutlineSparkles className="text-sm" />
          <span className="text-[0.85rem] leading-none">Explain</span>
        </ToolbarButton>
        <ToolbarButton title="Quick Edit" onClick={onQuickEdit}>
          <span className="text-sm">✦</span>
          <span className="text-[0.85rem] leading-none">Quick Edit</span>
        </ToolbarButton>

        <Divider />

        <ToolbarButton title="Bold" onClick={() => onExec("bold")}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton title="Italic" onClick={() => onExec("italic")}>
          <span className="italic">I</span>
        </ToolbarButton>
        <ToolbarButton title="Underline" onClick={() => onExec("underline")}>
          <span className="underline underline-offset-2">U</span>
        </ToolbarButton>
        <ToolbarButton title="Strikethrough" onClick={() => onExec("strikeThrough")}>
          <span className="line-through">S</span>
        </ToolbarButton>

        <ToolbarButton title="Heading 1" onClick={() => onFormatBlock("h1")}>
          H1
        </ToolbarButton>

        <ToolbarButton title="Paragraph" onClick={() => onFormatBlock("p")}>
          p
        </ToolbarButton>

        <Dropdown
          label="Size"
          items={fontSizes.map((f) => ({
            label: f.label,
            onSelect: () => onExec("fontSize", f.value),
          }))}
        >
          <TbArrowsUpDown className="text-sm" />
        </Dropdown>

        <Dropdown
          label="Font"
          items={fontFamilies.map((ff) => ({
            label: ff,
            onSelect: () => onExec("fontName", ff),
          }))}
        >
          <GiSettingsKnobs className="text-sm rotate-90" strokeWidth={2}/>
        </Dropdown>
        <Dropdown
          label="Lists"
          items={[
            {
              label: "Bulleted",
              onSelect: () => onExec("insertUnorderedList"),
            },
            { label: "Numbered", onSelect: () => onExec("insertOrderedList") },
          ]}
        >
          <span>Lists</span>
        </Dropdown>

        <Dropdown
          label="Align"
          items={[
            { label: "Left", onSelect: () => onExec("justifyLeft") },
            { label: "Center", onSelect: () => onExec("justifyCenter") },
            { label: "Right", onSelect: () => onExec("justifyRight") },
            { label: "Justify", onSelect: () => onExec("justifyFull") },
          ]}
        >
          <CiTextAlignLeft className="text-sm font-bold" strokeWidth={1} />
        </Dropdown>

        <Dropdown
          label="Align"
          items={[
            { label: "Left", onSelect: () => onExec("justifyLeft") },
            { label: "Center", onSelect: () => onExec("justifyCenter") },
            { label: "Right", onSelect: () => onExec("justifyRight") },
            { label: "Justify", onSelect: () => onExec("justifyFull") },
          ]}
        >
          <span>AI</span>
        </Dropdown>
      </div>
    );
  }
);

export default FloatingToolbar;
