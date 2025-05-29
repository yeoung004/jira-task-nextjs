// 공통 details 섹션 컴포넌트
import * as React from "react";
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
  icon,
  title,
  children,
}: DetailsSectionProps) {
  const [isOpen, setIsOpen] = React.useState(open);
  return (
    <details open={isOpen} className={`rounded-lg border ${borderColorClass} ${bgColorClass} p-4 group`}>
      <summary
        className={`font-semibold cursor-pointer text-lg flex items-center gap-2 select-none ${summaryClass}`}
        onClick={e => {
          e.preventDefault();
          setIsOpen(v => !v);
        }}
      >
        <span className="inline-block w-5 h-5 transition-transform duration-200 group-open:rotate-90">
          {icon ?? <ChevronDownIcon className={iconColorClass + " w-5 h-5"} open={isOpen} />}
        </span>
        {title}
      </summary>
      {isOpen && <div className="mt-2 w-full">{children}</div>}
    </details>
  );
}
