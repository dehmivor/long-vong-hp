import React from "react";

interface DividerProps {
  className?: string;
}

export const Divider = ({ className = "" }: DividerProps) => {
  return (
    <hr className={`border-t border-gray-100 dark:border-gray-800 w-full ${className}`} />
  );
};
