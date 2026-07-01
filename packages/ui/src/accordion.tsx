import React, { useState } from "react";
import { ChevronDown } from "./icons";
import { Typography } from "./typography";

interface AccordionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const Accordion = ({ title, children, defaultExpanded = false }: AccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-gray-100 dark:border-gray-800">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between py-6 text-left group"
      >
        <Typography type="bodySemi" className="group-hover:text-[#FF6B35] transition-colors">
          {title}
        </Typography>
        <ChevronDown 
          size={18} 
          className={`text-gray-400 transition-transform duration-300 ${isExpanded ? "rotate-180 text-[#FF6B35]" : ""}`} 
        />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? "max-h-[500px] pb-6" : "max-h-0"}`}>
        <div className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};
