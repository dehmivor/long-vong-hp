import React from "react";
import { Card } from "./card";

interface QuestCardProps {
  title: string;
  description: string;
  icon: string;
  onClick?: () => void;
}

export const QuestCard = ({ title, description, icon, onClick }: QuestCardProps) => {
  return (
    <Card 
      className="flex items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
      onClick={onClick}
    >
      <div className="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/10 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div className="ml-4 flex-1">
        <h4 className="font-bold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="text-gray-300 dark:text-gray-700 group-hover:text-[#FF6B35] transition-colors">
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Card>
  );
};
