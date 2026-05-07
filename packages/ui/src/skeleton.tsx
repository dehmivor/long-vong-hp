import React from "react";

interface SkeletonProps {
  className?: string;
}

export const Skeleton = ({ className = "" }: SkeletonProps) => {
  return (
    <div className={`bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl ${className}`} />
  );
};
