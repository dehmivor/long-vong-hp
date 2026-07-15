import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://longvong.hp"),
  title: "Long Vong HP - Khám phá Hải Phòng như người bản địa",
  description:
    "Ứng dụng du lịch và ẩm thực Hải Phòng với bản đồ quán ngon, food reels, check-in quest và voucher đối tác địa phương.",
  keywords: ["Hải Phòng", "ẩm thực", "du lịch", "food tour", "quán ăn ngon HP"],
  openGraph: {
    title: "Long Vong HP - Khám phá Hải Phòng như người bản địa",
    description: "Khám phá ẩm thực Hải Phòng như người bản địa",
    type: "website",
    locale: "vi_VN",
    siteName: "Long Vong HP",
  },
  twitter: {
    card: "summary_large_image",
    title: "Long Vong HP",
    description: "Khám phá ẩm thực Hải Phòng như người bản địa",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
