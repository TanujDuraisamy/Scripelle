import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface DropdownItem {
  label: string;
  onSelect: () => void;
  icon?: React.ReactNode;
}

interface DropdownProps {
  label: string;
  items: DropdownItem[];
  children?: React.ReactNode;
}

function useClickOutside<T extends HTMLElement>(cb: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) {
        const target = e.target as Element;
        if (target.closest('[role="menu"]')) return;
        cb();
      }
    }
    document.addEventListener("mousedown", onDown, { capture: true });
    return () =>
      document.removeEventListener("mousedown", onDown, { capture: true });
  }, [cb]);
  return ref;
}

const Dropdown: React.FC<DropdownProps> = ({ label, items, children }) => {
  const [open, setOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 2,
        left: rect.left,
      });
    }
  };

  useEffect(() => {
    if (open) {
      const handleResize = () => updateDropdownPosition();
      const handleScroll = () => updateDropdownPosition();

      window.addEventListener("resize", handleResize);
      window.addEventListener("scroll", handleScroll, true);

      return () => {
        window.removeEventListener("resize", handleResize);
        window.removeEventListener("scroll", handleScroll, true);
      };
    }
  }, [open]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!open) {
      updateDropdownPosition();
    }
    setOpen((v) => !v);
  };

  return (
    <>
      <div
        ref={ref}
        className="relative select-none shrink-0"
        onMouseDown={(e) => e.preventDefault()}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={handleToggle}
          className="inline-flex items-center justify-center whitespace-nowrap px-2.5 py-1.5 rounded-md text-[0.85rem] text-white bg-transparent border-none hover:bg-white/10 hover:text-white focus:outline-none transition-all duration-200 ease-out cursor-pointer"
        >
          <span className="leading-none">{children ?? label}</span>
          <span className="text-[14px] leading-none">▼</span>
        </button>
      </div>

      {open && createPortal(
        <div
          role="menu"
          className="fixed min-w-[10rem] max-h-80 overflow-y-auto rounded-lg bg-neutral-800 text-white shadow-2xl ring-1 ring-white/20 z-[10000] py-1"
          style={{
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
          }}
        >
          {items.map((it, idx) => (
            <button
              key={idx}
              role="menuitem"
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                it.onSelect();
                setOpen(false);
              }}
              className="w-full text-left flex items-center gap-2 px-3 py-2 hover:bg-white/10 focus:bg-white/10 focus:outline-none transition-colors"
            >
              {it.icon && (
                <span className="grid place-items-center w-5 h-5 text-white/90">
                  {it.icon}
                </span>
              )}
              <span className="text-sm">{it.label}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </>
  );
};

export default Dropdown;
