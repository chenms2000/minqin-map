import type { NextConfig } from "next";

const [repositoryOwner = ""] = (process.env.GITHUB_REPOSITORY ?? "/").split("/");
const githubPagesBuild = process.env.GITHUB_ACTIONS === "true" && repositoryOwner !== "";
const siteUrl = process.env.SITE_URL ?? (githubPagesBuild ? `https://${repositoryOwner}.github.io/` : "http://localhost:3000/");

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
