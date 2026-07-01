import React, { useEffect } from "react";
import { CheckCircle, AlertCircle, Info, X } from "./icons";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast = ({ message, type = "info", onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const variants = {
    success: { 
      bg: "bg-emerald-500", 
      icon: <CheckCircle size={20} className="text-white" /> 
    },
    error: { 
      bg: "bg-red-500", 
      icon: <AlertCircle size={20} className="text-white" /> 
    },
    info: { 
      bg: "bg-[#111827]", 
      icon: <Info size={20} className="text-white" /> 
    },
  };

  return (
    <div className={`
      fixed top-6 right-6 z-[1000] flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl animate-in slide-in-from-right duration-300
      ${variants[type].bg} text-white
    `}>
      {variants[type].icon}
      <span className="font-bold text-sm">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70 transition-opacity">
        <X size={18} />
      </button>
    </div>
  );
};
