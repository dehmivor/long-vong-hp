import React from "react";

interface ProgressProps {
  value: number; // 0 to 100
  label?: string;
  className?: string;
}

export const Progress = ({ value, label, className = "" }: ProgressProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {label && <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{label}</span>}
        <span className="text-xs font-black text-[#FF6B35]">{value}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-[#FF6B35] transition-all duration-500 ease-out rounded-full shadow-[0_0_10px_rgba(255,107,53,0.3)]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};
