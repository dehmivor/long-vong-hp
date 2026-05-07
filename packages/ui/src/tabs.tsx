import React from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs = ({ tabs, activeTab, onChange, className = "" }: TabsProps) => {
  return (
    <div className={`flex items-center gap-1 border-b border-gray-100 dark:border-gray-800 ${className}`}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              px-6 py-4 text-sm font-bold transition-all relative
              ${isActive ? "text-[#FF6B35]" : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"}
            `}
          >
            {tab.label}
            {isActive && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6B35] rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
