import React from "react";
import { Typography } from "./typography";
import { Button } from "./button";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  items: NavItem[];
  logo: React.ReactNode;
}

export const Navbar = ({ items, logo }: NavbarProps) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0A0F1E]/80 backdrop-blur-xl border-bottom border-gray-100 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <a href="/" className="hover:opacity-80 transition-opacity">
            {logo}
          </a>
          <div className="hidden md:flex items-center gap-8">
            {items.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                className="text-sm font-semibold text-gray-500 hover:text-[#FF6B35] dark:text-gray-400 dark:hover:text-[#FF6B35] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex">Đăng nhập</Button>
          <Button size="sm">Tải app ngay</Button>
        </div>
      </div>
    </nav>
  );
};
