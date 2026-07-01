import React from "react";
import { Star } from "./icons";

interface RatingProps {
  rating: number;
  max?: number;
  onChange?: (rating: number) => void;
  size?: number;
  className?: string;
}

export const Rating = ({ rating, max = 5, onChange, size = 20, className = "" }: RatingProps) => {
  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: max }).map((_, i) => {
        const index = i + 1;
        const isFilled = index <= rating;
        
        return (
          <button
            key={i}
            onClick={() => onChange?.(index)}
            disabled={!onChange}
            className={`transition-all ${onChange ? "hover:scale-110 active:scale-95" : "cursor-default"}`}
          >
            <Star 
              size={size} 
              className={isFilled ? "fill-amber-400 text-amber-400" : "text-gray-300 dark:text-gray-700"} 
            />
          </button>
        );
      })}
    </div>
  );
};
