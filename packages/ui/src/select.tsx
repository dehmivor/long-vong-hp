import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const Select = ({ label, options, value, onChange, placeholder, className = "" }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`w-full relative ${className}`} ref={containerRef}>
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 
          rounded-xl py-3 px-4 flex items-center justify-between outline-none transition-all
          focus:border-[#FF6B35] ${isOpen ? "ring-2 ring-orange-500/20 border-[#FF6B35]" : ""}
        `}
      >
        <span className={selectedOption ? "text-gray-900 dark:text-white font-medium" : "text-gray-400"}>
          {selectedOption ? selectedOption.label : placeholder || "Chọn một mục..."}
        </span>
        <ChevronDown size={18} className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-[100] mt-2 w-full bg-white dark:bg-[#111827] border border-gray-100 dark:border-gray-800 rounded-xl shadow-xl py-2 max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2.5 text-left text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center justify-between group"
            >
              <span className={option.value === value ? "text-[#FF6B35]" : "text-gray-700 dark:text-gray-300"}>
                {option.label}
              </span>
              {option.value === value && <Check size={16} className="text-[#FF6B35]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
