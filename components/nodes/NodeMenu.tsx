"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal } from "lucide-react";

interface NodeMenuProps {
  onDuplicate?: () => void;
  onRename?: () => void;
  onLock?: () => void;
  onDelete?: () => void;
  isLocked?: boolean;
}

export function NodeMenu({
  onDuplicate,
  onRename,
  onLock,
  onDelete,
  isLocked,
}: NodeMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="nodrag p-1 hover:bg-white/10 rounded transition-colors"
      >
        <MoreHorizontal className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-48 bg-[#2a2a2a] rounded-lg shadow-xl border border-gray-700 overflow-hidden z-50">
          {onDuplicate && (
            <button
              onClick={() => {
                onDuplicate();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>Duplicate</span>
              <span className="text-xs text-gray-500">ctrl+d</span>
            </button>
          )}
          {onRename && (
            <button
              onClick={() => {
                onRename();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
            >
              Rename
            </button>
          )}
          {onLock && (
            <button
              onClick={() => {
                onLock();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-gray-200 hover:bg-white/10 transition-colors"
            >
              {isLocked ? "Unlock" : "Lock"}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                onDelete();
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-between border-t border-gray-700"
            >
              <span>Delete</span>
              <span className="text-xs text-gray-500">delete / backspace</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
