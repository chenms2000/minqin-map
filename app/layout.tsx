import type { Metadata } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "民勤中医药生态文化数字地图",
    template: "%s · 绿洲药韵",
  },
  description: "北京中医药大学绿洲药韵·丝路智传实践团2026年民勤生态文化数字成果。",
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
  },
  openGraph: {
    title: "民勤中医药生态文化数字地图",
    description: "在沙与水之间，读懂一座绿洲。",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
