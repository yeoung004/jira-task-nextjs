// 공통 SVG 아이콘 컴포넌트
import React from "react";

export function ChevronDownIcon({ className = "", color = "currentColor", open = false }: { className?: string; color?: string; open?: boolean }) {
  // open: true면 아래, false면 오른쪽
  return (
    <svg
      viewBox="0 0 20 20"
      fill={color}
      className={className + " transition-transform duration-200"}
      style={{ transform: open ? "rotate(90deg)" : "rotate(0deg)" }}
    >
      <path
        fillRule="evenodd"
        d="M7.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 10 7.293 7.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}
