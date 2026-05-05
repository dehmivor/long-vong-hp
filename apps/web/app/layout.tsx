import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Lòng Vòng HP — Khám phá Hải Phòng như người bản địa",
  description:
    "Ứng dụng du lịch & ẩm thực Hải Phòng. Tìm kiếm quán ngon được người bản địa tuyển chọn, check-in thực tế, nhận voucher hấp dẫn. Hỗ trợ Việt - Anh - Hàn.",
  keywords: ["Hải Phòng", "ẩm thực", "du lịch", "food tour", "quán ăn ngon HP"],
  openGraph: {
    title: "Lòng Vòng HP",
    description: "Khám phá ẩm thực Hải Phòng như người bản địa",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
