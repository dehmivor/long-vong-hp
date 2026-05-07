import React from "react";

interface TypographyProps {
  children: React.ReactNode;
  type?: "h1" | "h2" | "h3" | "body" | "bodySemi" | "caption" | "label";
  className?: string;
  component?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "label";
}

export const Typography = ({
  children,
  type = "body",
  className = "",
  component,
}: TypographyProps) => {
  const styles = {
    h1: "text-4xl md:text-5xl font-black tracking-tight leading-tight",
    h2: "text-2xl md:text-3xl font-extrabold tracking-tight leading-snug",
    h3: "text-lg md:text-xl font-bold leading-normal",
    body: "text-base font-normal leading-relaxed",
    bodySemi: "text-base font-semibold leading-relaxed",
    caption: "text-sm text-gray-500 dark:text-gray-400",
    label: "text-xs font-bold uppercase tracking-widest text-gray-400",
  };

  const Component = component || (type.startsWith("h") ? (type as any) : "p");

  return (
    <Component className={`${styles[type]} ${className}`}>
      {children}
    </Component>
  );
};
