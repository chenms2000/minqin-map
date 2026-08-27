import type { Metadata } from "next";
import { publicAsset } from "@/content/public-assets";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles/base.css";
import "./styles/page.css";
import "./styles/map.css";
import "./styles/exhibit.css";
import "./styles/responsive.css";

const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000/");
const socialImage = new URL(publicAsset("/og.png"), siteUrl.origin).href;

export const metadata: Metadata = {
  title: { default: "民勤中医药生态文化数字地图", template: "%s · 绿洲药韵" },
  description: "北京中医药大学绿洲药韵·丝路智传实践团2026年民勤生态文化数字成果。",
  metadataBase: siteUrl,
  icons: { icon: publicAsset("/favicon.png"), shortcut: publicAsset("/favicon.png") },
  openGraph: {
    title: "民勤中医药生态文化数字地图｜2026暑期实践数字成果",
    description: "在沙与水之间，读懂一座绿洲。自动导览、证据索引、实践影像与本地离线地图。",
    type: "website",
    locale: "zh_CN",
    images: [{ url: socialImage, width: 1200, height: 630, alt: "民勤中医药生态文化数字地图分享封面" }],
  },
  twitter: { card: "summary_large_image", title: "民勤中医药生态文化数字地图", description: "在沙与水之间，读懂一座绿洲。", images: [socialImage] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
