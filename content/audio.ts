import { publicAsset } from "./public-assets";

export const backgroundTracks = [
  {
    id: "forest-mist-whispers",
    title: "Forest Mist Whispers",
    artist: "Alejandro Magaña (A. M.)",
    src: publicAsset("/audio/forest-mist-whispers.mp3"),
    sourceUrl: "https://mixkit.co/free-stock-music/mood/reflective/",
  },
  {
    id: "valley-sunset",
    title: "Valley Sunset",
    artist: "Alejandro Magaña (A. M.)",
    src: publicAsset("/audio/valley-sunset.mp3"),
    sourceUrl: "https://mixkit.co/free-stock-music/ambient/",
  },
  {
    id: "rest-now",
    title: "Rest Now",
    artist: "Eugenio Mininni",
    src: publicAsset("/audio/rest-now.mp3"),
    sourceUrl: "https://mixkit.co/free-stock-music/instrument/synth/?page=2",
  },
] as const;

export const backgroundMusicLicense = {
  label: "Mixkit Stock Music Free License",
  url: "https://mixkit.co/license/#musicFree",
} as const;
