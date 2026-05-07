import React from "react";

interface AvatarProps {
  src?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar = ({ src, name, size = "md", className = "" }: AvatarProps) => {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-lg",
    xl: "w-24 h-24 text-2xl",
  };

  const initials = name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  return (
    <div className={`
      relative inline-flex items-center justify-center rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800 
      ${sizes[size]} ${className}
    `}>
      {src ? (
        <img src={src} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="font-bold text-[#FF6B35]">{initials}</span>
      )}
    </div>
  );
};
