import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Money Tracker",
  description: "Учёт доходов и расходов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        {children}
      </body>
    </html>
  );
}
