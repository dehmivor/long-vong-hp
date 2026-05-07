import React from "react";

interface BadgeProps {
  label: string;
  type?: "primary" | "success" | "warning" | "default";
  className?: string;
}

export const Badge = ({ label, type = "default", className = "" }: BadgeProps) => {
  const baseStyles = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider";
  
  const types = {
    primary: "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400",
    success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400",
    default: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };

  return (
    <span className={`${baseStyles} ${types[type]} ${className}`}>
      {label}
    </span>
  );
};
