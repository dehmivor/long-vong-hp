import React from "react";
import { Inbox } from "lucide-react";
import { Typography } from "./typography";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
}

export const EmptyState = ({ title, description, icon }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-16 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-6">
        {icon || <Inbox size={40} />}
      </div>
      <Typography type="h3" className="mb-2">{title}</Typography>
      {description && (
        <Typography type="caption" className="max-w-xs">{description}</Typography>
      )}
    </div>
  );
};
