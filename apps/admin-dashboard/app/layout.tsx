import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Long Vong HP Admin",
  description: "Operations dashboard for Long Vong HP shops, quests and content.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
