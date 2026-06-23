import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wazle",
  description: "Wazle is the ultimate lightning-fast infrastructure hosting designed specifically for Discord, Telegram, and WhatsApp bots.",
  keywords: ["Wazle", "Bot Hosting", "Discord Bot", "Telegram Bot", "WhatsApp Bot", "Cloud Hosting", "VPS"],
  openGraph: {
    title: "Wazle - Ultimate Bot Infrastructure",
    description: "Lightning-fast hosting designed for bots. Experience professional-grade reliability and instant deployment.",
    url: "https://wazle.my.id",
    siteName: "Wazle",
    locale: "id_ID",
    type: "website",
  },
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect width='100' height='100' rx='25' fill='%230a0a0f'/><text x='50' y='72' font-size='70' font-family='Arial, sans-serif' font-weight='bold' fill='%233b82f6' text-anchor='middle'>W</text></svg>",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
