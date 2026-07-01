import React from "react";
import { ChevronRight, Home } from "./icons";

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export const Breadcrumbs = ({ items }: BreadcrumbsProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm font-medium text-gray-400 mb-6">
      <a href="/" className="hover:text-[#FF6B35] transition-colors flex items-center">
        <Home size={16} />
      </a>
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight size={14} className="text-gray-300 dark:text-gray-700" />
          <a 
            href={item.href} 
            className={`hover:text-[#FF6B35] transition-colors ${index === items.length - 1 ? "text-gray-900 dark:text-white font-bold" : ""}`}
          >
            {item.label}
          </a>
        </React.Fragment>
      ))}
    </nav>
  );
};
