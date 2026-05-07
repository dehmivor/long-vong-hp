import React from "react";
import { AlertCircle, CheckCircle, Info, XCircle, X } from "lucide-react";

interface AlertProps {
  type?: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  onClose?: () => void;
}

export const Alert = ({ type = "info", title, description, onClose }: AlertProps) => {
  const styles = {
    success: "bg-emerald-50 border-emerald-100 text-emerald-800 dark:bg-emerald-900/10 dark:border-emerald-900/20",
    error: "bg-red-50 border-red-100 text-red-800 dark:bg-red-900/10 dark:border-red-900/20",
    warning: "bg-amber-50 border-amber-100 text-amber-800 dark:bg-amber-900/10 dark:border-amber-900/20",
    info: "bg-blue-50 border-blue-100 text-blue-800 dark:bg-blue-900/10 dark:border-blue-900/20",
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className={`flex gap-4 p-4 rounded-xl border ${styles[type]}`}>
      <div className="shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <h5 className="font-bold text-sm leading-tight">{title}</h5>
        {description && <p className="mt-1 text-xs opacity-90 leading-relaxed">{description}</p>}
      </div>
      {onClose && (
        <button onClick={onClose} className="shrink-0 hover:opacity-60 transition-opacity">
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};
