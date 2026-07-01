import React from "react";
import { X } from "./icons";
import { Typography } from "./typography";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  position?: "left" | "right";
}

export const Drawer = ({ isOpen, onClose, title, children, position = "right" }: DrawerProps) => {
  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      
      {/* Drawer Content */}
      <div className={`
        fixed top-0 bottom-0 z-[101] w-full max-w-md bg-white dark:bg-[#0A0F1E] shadow-2xl transition-transform duration-300 transform
        ${position === "right" ? "right-0" : "left-0"}
        ${isOpen ? "translate-x-0" : position === "right" ? "translate-x-full" : "-translate-x-full"}
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
            <Typography type="h3">{title}</Typography>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-gray-400 transition-colors">
              <X size={24} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};
