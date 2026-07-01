import React from "react";
import { Loader2 } from "./icons";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export const Spinner = ({ size = 24, className = "" }: SpinnerProps) => {
  return (
    <div className={`animate-spin text-[#FF6B35] ${className}`}>
      <Loader2 size={size} />
    </div>
  );
};
