import type { NextConfig } from "next";

const [repositoryOwner = "", repositoryName = ""] = (process.env.GITHUB_REPOSITORY ?? "/").split("/");
const githubPagesBuild = process.env.GITHUB_PAGES_BUILD === "true" && repositoryOwner !== "" && repositoryName !== "";
const rawBasePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (githubPagesBuild ? `/${repositoryName}` : "");
const basePath = rawBasePath === "" || rawBasePath === "/" ? "" : `/${rawBasePath.replace(/^\/+|\/+$/g, "")}`;
const siteUrl = process.env.SITE_URL ?? (githubPagesBuild ? `https://${repositoryOwner}.github.io${basePath}/` : "http://localhost:3000/");

const nextConfig: NextConfig = {
  output: "export",
  assetPrefix: githubPagesBuild ? siteUrl.replace(/\/$/, "") : undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
};

export default nextConfig;
