import React from "react";

interface StackProps {
  children: React.ReactNode;
  direction?: "col" | "row";
  gap?: number | string;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between";
  className?: string;
}

export const Stack = ({
  children,
  direction = "col",
  gap = 4,
  align = "stretch",
  justify = "start",
  className = "",
}: StackProps) => {
  const directions = {
    col: "flex-col",
    row: "flex-row",
  };

  const aligns = {
    start: "items-start",
    center: "items-center",
    end: "items-end",
    stretch: "items-stretch",
  };

  const justifies = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end",
    between: "justify-between",
  };

  // Tailwind doesn't support dynamic gap values well with arbitrary numbers unless using style
  return (
    <div 
      className={`flex ${directions[direction]} ${aligns[align]} ${justifies[justify]} ${className}`}
      style={{ gap: typeof gap === 'number' ? `${gap * 4}px` : gap }}
    >
      {children}
    </div>
  );
};
