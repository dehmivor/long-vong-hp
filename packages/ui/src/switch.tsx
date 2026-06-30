import React from "react";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Switch = ({ label, className = "", ...props }: SwitchProps) => {
  return (
    <label className={`flex items-center space-x-3 cursor-pointer group ${className}`}>
      <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none">
        <input
          type="checkbox"
          className="peer sr-only"
          {...props}
        />
        <div className={`
          absolute inset-0 rounded-full bg-gray-200 dark:bg-gray-700 transition-colors
          peer-checked:bg-[#FF6B35]
        `} />
        <div className={`
          absolute left-1 h-4 w-4 rounded-full bg-white transition-transform
          peer-checked:translate-x-5
        `} />
      </div>
      {label && <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>}
    </label>
  );
};
