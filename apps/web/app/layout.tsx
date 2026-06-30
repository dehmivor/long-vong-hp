import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Long Vong HP - Kham pha Hai Phong nhu nguoi ban dia",
  description:
    "Ung dung du lich va am thuc Hai Phong voi ban do quan ngon, food reels, check-in quest va voucher doi tac dia phuong.",
  keywords: ["Hai Phong", "am thuc", "du lich", "food tour", "quan an ngon HP"],
  openGraph: {
    title: "Long Vong HP",
    description: "Kham pha am thuc Hai Phong nhu nguoi ban dia",
    type: "website",
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
