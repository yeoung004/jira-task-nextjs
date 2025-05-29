import React from "react";

interface SidebarProps {
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export function Sidebar({ open, onToggle, children }: SidebarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full z-30 bg-white/95 shadow-xl border-r border-indigo-100 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} w-80 flex flex-col`}
    >
      <button
        className="absolute top-4 right-[-40px] bg-indigo-500 text-white rounded-r-lg px-3 py-2 shadow-md focus:outline-none"
        onClick={onToggle}
        aria-label={open ? "사이드바 닫기" : "사이드바 열기"}
        type="button"
      >
        {open ? "←" : "→"}
      </button>
      <div className="p-6 flex-1 overflow-y-auto">{children}</div>
    </aside>
  );
}
