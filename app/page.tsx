import type { Metadata } from "next";
import { Experience } from "./components/experience/experience";

export const metadata: Metadata = {
  title: "民勤中医药生态文化数字地图",
  description: "沿着实践足迹、绿洲水脉、药材产业与人物故事，读懂民勤在沙与水之间守护绿洲的长期行动。",
};

export default function Home() {
  return <Experience />;
}
