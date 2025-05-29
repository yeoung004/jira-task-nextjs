// 공통 details 섹션 컴포넌트
import React from "react";
import { ChevronDownIcon } from "./Icon";

interface DetailsSectionProps {
  open?: boolean;
  borderColorClass?: string;
  bgColorClass?: string;
  iconColorClass?: string;
  summaryClass?: string;
  icon?: React.ReactNode;
  title: React.ReactNode;
  children: React.ReactNode;
}

export function DetailsSection({
  open = true,
  borderColorClass = "border-indigo-200",
  bgColorClass = "bg-indigo-50/60",
  iconColorClass = "text-indigo-500",
  summaryClass = "text-indigo-700",
  icon = <ChevronDownIcon className="w-5 h-5" color="currentColor" />,
  title,
  children,
}: DetailsSectionProps) {
  return (
    <details open={open} className={`rounded-lg border ${borderColorClass} ${bgColorClass} p-4 group`}>
      <summary className={`font-semibold cursor-pointer text-lg flex items-center gap-2 select-none ${summaryClass}`}>
        <span className="inline-block w-5 h-5 transition-transform duration-200 group-open:rotate-180">
          {icon}
        </span>
        {title}
      </summary>
      <div className="mt-2 w-full">{children}</div>
    </details>
  );
}
