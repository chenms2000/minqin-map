import type { MediaAsset } from "./types";

export const media: MediaAsset[] = [
  { id: "journey-sky", type: "image", src: "/media/2026-08-03/journey-sky.webp", alt: "列车窗外的田野、山地与云层", caption: "向河西走廊行进，地貌从农田渐入旱区。", capturedAt: "2026-08-03 12:52", featured: true },
  { id: "journey-village", type: "image", src: "/media/2026-08-03/journey-village.webp", alt: "列车窗外的河西村落与山地", caption: "窗外的聚落与山地，构成进入河西的第一重空间印象。", capturedAt: "2026-08-03 13:12", featured: false },
  { id: "road-video", type: "video", src: "/media/2026-08-03/road-to-minqin.mp4", poster: "/media/2026-08-03/journey-village.webp", alt: "驶向民勤的公路影像", caption: "从武威方向驶向民勤，绿带、农田与荒漠依次出现。", capturedAt: "2026-08-03 15:02", featured: true },
  { id: "desert-sunset", type: "image", src: "/media/2026-08-03/desert-sunset.webp", alt: "傍晚荒漠地平线上的落日", caption: "落日前的荒漠观察，光线勾勒出植被与沙地的边界。", capturedAt: "2026-08-03 20:00", featured: true },
  { id: "berries-close", type: "image", src: "/media/2026-08-03/berries-close.webp", alt: "沙生植物红色果实的近景", caption: "现场记录的沙生植物。未经过专业鉴定，不标注具体药材名称。", capturedAt: "2026-08-03 20:23", featured: true },
  { id: "observation-video", type: "video", src: "/media/2026-08-03/desert-observation.mp4", poster: "/media/2026-08-03/berries-close.webp", alt: "团队观察沙生植物的短视频", caption: "从形态、果实与生境开始记录，而不是先给出结论。", capturedAt: "2026-08-03 20:05", featured: false },
  { id: "twilight-field", type: "image", src: "/media/2026-08-03/twilight-field.webp", alt: "暮色中的荒漠与团队成员", caption: "一天实践结束前，团队继续采集环境与植物影像。", capturedAt: "2026-08-03 20:04", featured: false },
  { id: "night-flags", type: "image", src: "/media/2026-08-03/night-flags.webp", alt: "夜色中迎风飘扬的公益旗帜", caption: "荒漠基地的夜晚：公益旗帜与志愿者留下的记忆。", capturedAt: "2026-08-03 20:41", featured: false },
  { id: "dawn-desert", type: "image", src: "/media/2026-08-04/dawn-desert.webp", alt: "清晨的沙地与成排梭梭", caption: "清晨进入作业区域，观察苗木密度、风向与沙面状态。", capturedAt: "2026-08-04 07:52", featured: true },
  { id: "seedling", type: "image", src: "/media/2026-08-04/seedling.webp", alt: "沙地中的幼苗近景", caption: "水抵达根部，幼苗才能在高蒸发环境中继续生长。", capturedAt: "2026-08-04 08:11", featured: false },
  { id: "team-walk", type: "image", src: "/media/2026-08-04/team-walk.webp", alt: "团队携带工具走入公益林地", caption: "队员分组携带水管和工具进入林地。", capturedAt: "2026-08-04 08:10", featured: true },
  { id: "irrigation-line", type: "image", src: "/media/2026-08-04/irrigation-line.webp", alt: "团队在沙地上展开浇水管线", caption: "铺设水管、寻找根部、控制水量，是苗木养护的连续动作。", capturedAt: "2026-08-04 09:03", featured: true },
  { id: "irrigation-video", type: "video", src: "/media/2026-08-04/irrigation-arrival.mp4", poster: "/media/2026-08-04/irrigation-line.webp", alt: "水车抵达林地的短视频", caption: "水车抵达后，团队沿管线分工协作。", capturedAt: "2026-08-04 08:37", featured: false },
  { id: "watering-video", type: "video", src: "/media/2026-08-04/watering-together.mp4", poster: "/media/2026-08-04/team-walk.webp", alt: "团队共同浇灌苗木的短视频", caption: "一次浇水看似简单，却是荒漠苗木长期维护中的关键环节。", capturedAt: "2026-08-04 08:37", featured: true },
  { id: "banner-team", type: "image", src: "/media/2026-08-04/banner-team.webp", alt: "队员在荒漠中举起实践团旗帜", caption: "绿洲药韵·丝路智传实践团在作业现场。", capturedAt: "2026-08-04 09:06", featured: true },
  { id: "banner-landscape", type: "image", src: "/media/2026-08-04/banner-landscape.webp", alt: "实践团旗帜与广阔沙地", caption: "旗帜之外，是需要久久为功的荒漠生态治理。", capturedAt: "2026-08-04 09:02", featured: false },
  { id: "sand-traces", type: "image", src: "/media/2026-08-04/sand-traces.webp", alt: "沙面上的动物活动痕迹", caption: "沙面痕迹也是生态观察的一部分，记录环境中细微的生命活动。", capturedAt: "2026-08-04 09:11", featured: false },
  { id: "water-work", type: "image", src: "/media/2026-08-04/water-work.webp", alt: "队员为沙地苗木浇水", caption: "水沿着人工挖出的浅坑汇入根部，减少无效流失。", capturedAt: "2026-08-04 09:12", featured: false },
  { id: "volunteer-base", type: "image", src: "/media/2026-08-04/volunteer-base.webp", alt: "公益林基地里不同高校留下的手绘标牌", caption: "一块块手绘标牌，记录着跨越山海而来的青年志愿者。", capturedAt: "2026-08-04 10:35", featured: true },
  { id: "volunteer-signs", type: "image", src: "/media/2026-08-04/volunteer-signs.webp", alt: "沙地苗木旁的志愿者手绘牌", caption: "社会力量持续参与，是民勤治沙图景中的重要一层。", capturedAt: "2026-08-04 10:35", featured: false },
];
