import React, { useState } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
}

export const Tooltip = ({ content, children, position = "top" }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  const positions = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div className={`
          absolute z-[200] px-3 py-1.5 bg-[#111827] text-white text-[11px] font-bold rounded-lg whitespace-nowrap shadow-xl animate-in fade-in duration-200
          ${positions[position]}
        `}>
          {content}
          {/* Arrow */}
          <div className={`
            absolute border-4 border-transparent
            ${position === "top" ? "top-full left-1/2 -translate-x-1/2 border-t-[#111827]" : ""}
            ${position === "bottom" ? "bottom-full left-1/2 -translate-x-1/2 border-b-[#111827]" : ""}
            ${position === "left" ? "left-full top-1/2 -translate-y-1/2 border-l-[#111827]" : ""}
            ${position === "right" ? "right-full top-1/2 -translate-y-1/2 border-r-[#111827]" : ""}
          `} />
        </div>
      )}
    </div>
  );
};
