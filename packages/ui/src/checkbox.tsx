import React from "react";

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Checkbox = ({ label, className = "", ...props }: CheckboxProps) => {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer group ${className}`}>
      <div className="relative">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className={`
          w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded-md transition-all
          peer-checked:bg-[#FF6B35] peer-checked:border-[#FF6B35]
          group-hover:border-[#FF6B35]/50
        `} />
        <svg
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white scale-0 peer-checked:scale-100 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth="4"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};
