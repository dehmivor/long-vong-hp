import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, error, icon, className = "", ...props }: InputProps) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 
            rounded-xl py-3 px-4 outline-none transition-all focus:border-[#FF6B35] focus:ring-2 focus:ring-orange-500/20
            ${icon ? "pl-11" : ""}
            ${error ? "border-red-500 focus:border-red-500 focus:ring-red-500/20" : ""}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500 font-medium">{error}</p>}
    </div>
  );
};
