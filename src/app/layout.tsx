import type { Metadata } from "next";
import { Geist, Outfit } from "next/font/google";
import Script from "next/script";

import { ThemeProvider } from "@/components/theme-provider";
import { getThemeInlineScriptPayload } from "@/lib/theme";
import { cn } from "@/lib/utils";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-sans" });

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

function buildThemeInitScript(): string {
  const { key, valid } = getThemeInlineScriptPayload();
  return `(function(){
  try {
    var k=${JSON.stringify(key)};
    var valid=${JSON.stringify(valid)};
    var raw=localStorage.getItem(k);
    if(raw==="fallout") raw="dark";
    else if(raw==="mario") raw="light";
    var t=valid.indexOf(raw)>=0?raw:(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light");
    document.documentElement.setAttribute("data-theme",t);
    document.documentElement.classList.toggle("dark",t==="dark");
  } catch(e) {
    document.documentElement.setAttribute("data-theme","light");
    document.documentElement.classList.remove("dark");
  }
})();`;
}

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
    <html
      lang="ru"
      className={cn(geist.variable, outfit.variable, "font-sans")}
      suppressHydrationWarning
    >
      <body className="mesh-bg min-h-screen text-foreground antialiased">
        <Script id="theme-init" strategy="beforeInteractive">
          {buildThemeInitScript()}
        </Script>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
