import React from "react";
import { Badge } from "./badge";
import { Card } from "./card";

interface ShopCardProps {
  name: string;
  address: string;
  rating: number;
  image?: string;
  status: "open" | "closed" | "sold_out";
  isLocalPick?: boolean;
  category: string;
  onClick?: () => void;
}

export const ShopCard = ({
  name,
  address,
  rating,
  image,
  status,
  isLocalPick,
  category,
  onClick,
}: ShopCardProps) => {
  return (
    <Card
      className="group cursor-pointer hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
      onClick={onClick}
    >
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
        {image ? (
          <img src={image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <span className="text-4xl">🍜</span>
        )}
        {isLocalPick && (
          <div className="absolute top-4 left-4 bg-[#FF6B35] text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-tight">
            Local Pick ⭐
          </div>
        )}
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#FF6B35] transition-colors">
            {name}
          </h3>
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            ⭐ {rating}
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-1">
          📍 {address}
        </p>
        <div className="flex items-center gap-3">
          <Badge
            label={status === "open" ? "Đang mở" : status === "sold_out" ? "Hết món" : "Đã đóng"}
            type={status === "open" ? "success" : "default"}
          />
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">• {category}</span>
        </div>
      </div>
    </Card>
  );
};
