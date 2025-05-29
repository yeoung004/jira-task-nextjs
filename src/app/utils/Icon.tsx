// 공통 SVG 아이콘 컴포넌트
import React from "react";

export function ChevronDownIcon({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill={color} className={className}>
      <path
        fillRule="evenodd"
        d="M7.293 6.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L9.586 10 7.293 7.707a1 1 0 010-1.414z"
        clipRule="evenodd"
      />
    </svg>
  );
}
