import React from "react";
import { Typography } from "./typography";
import { LayoutDashboard, Store, Trophy, Users, Settings, LogOut } from "lucide-react";

interface SidebarItem {
  icon: React.ElementType;
  label: string;
  href: string;
  active?: boolean;
}

const MENU_ITEMS: SidebarItem[] = [
  { icon: LayoutDashboard, label: "Tổng quan", href: "/admin", active: true },
  { icon: Store, label: "Quản lý quán ăn", href: "/admin/shops" },
  { icon: Trophy, label: "Thử thách & Voucher", href: "/admin/quests" },
  { icon: Users, label: "Người dùng", href: "/admin/users" },
  { icon: Settings, label: "Cài đặt hệ thống", href: "/admin/settings" },
];

export const Sidebar = () => {
  return (
    <aside className="w-72 h-screen sticky top-0 bg-white dark:bg-[#0A0F1E] border-r border-gray-100 dark:border-gray-800 flex flex-direction-column">
      <div className="p-8">
        <Typography type="h2" className="text-[#FF6B35]">Lòng Vòng <span className="text-gray-900 dark:text-white">HP</span></Typography>
        <Typography type="label" className="mt-2">Admin Dashboard</Typography>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {MENU_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className={`
              flex items-center gap-4 px-4 py-3 rounded-xl font-bold transition-all
              ${item.active 
                ? "bg-orange-50 text-[#FF6B35] dark:bg-orange-900/10" 
                : "text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50"}
            `}
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="p-6 border-t border-gray-100 dark:border-gray-800">
        <button className="flex items-center gap-4 px-4 py-3 w-full text-gray-400 hover:text-red-500 transition-colors font-bold">
          <LogOut size={22} />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
};
