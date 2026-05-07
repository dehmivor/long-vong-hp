import React from "react";

interface SliderProps {
  label?: string;
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  className?: string;
}

export const Slider = ({ label, min, max, value, onChange, suffix = "", className = "" }: SliderProps) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-3">
        {label && <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</label>}
        <span className="text-sm font-bold text-[#FF6B35]">{value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-1.5 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer accent-[#FF6B35]"
      />
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-gray-400 font-medium">{min}{suffix}</span>
        <span className="text-[10px] text-gray-400 font-medium">{max}{suffix}</span>
      </div>
    </div>
  );
};
