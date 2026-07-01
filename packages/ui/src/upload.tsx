import React, { useState } from "react";
import { Upload as UploadIcon } from "./icons";
import { Typography } from "./typography";

interface UploadProps {
  label?: string;
  onUpload: (files: File[]) => void;
  multiple?: boolean;
}

export const Upload = ({ label, onUpload, multiple = false }: UploadProps) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onUpload(Array.from(e.dataTransfer.files));
    }
  };

  return (
    <div className="w-full">
      {label && <Typography type="label" className="mb-2">{label}</Typography>}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center transition-all
          ${dragActive ? "border-[#FF6B35] bg-orange-50 dark:bg-orange-900/5" : "border-gray-200 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-700"}
        `}
      >
        <div className="w-12 h-12 bg-gray-50 dark:bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 mb-4">
          <UploadIcon size={24} />
        </div>
        <Typography type="bodySemi" className="mb-1">Click để tải lên hoặc kéo thả</Typography>
        <Typography type="caption">Hỗ trợ JPG, PNG, WEBP (Tối đa 5MB)</Typography>
        <input 
          type="file" 
          multiple={multiple}
          className="absolute inset-0 opacity-0 cursor-pointer" 
          onChange={(e) => e.target.files && onUpload(Array.from(e.target.files))}
        />
      </div>
    </div>
  );
};
