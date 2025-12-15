/** @type {import('next').NextConfig} */

const REPO_NAME = "BillPortfolio";
const basePath = process.env.NODE_ENV === "production" ? `/${REPO_NAME}` : "";

const nextConfig = {
  output: "export",
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: "https", hostname: "raw.githubusercontent.com" },
      { protocol: "https", hostname: "placehold.co" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "billdevsprint.com" },
      { protocol: "https", hostname: "billthedevlab.store" },
      { protocol: "https", hostname: "api.microlink.io" },
      { protocol: "https", hostname: "github.com" },
      { protocol: "https", hostname: "media.licdn.com" },
      { protocol: "https", hostname: "dms.licdn.com" },
      { protocol: "https", hostname: "player.vimeo.com" },
      { protocol: "https", hostname: "i.vimeocdn.com" },
      { protocol: "https", hostname: "img.itch.zone" },
      { protocol: "https", hostname: "vumbnail.com" },
    ],
    dangerouslyAllowSVG: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  webpack: (config) => {
    config.externals = [...(config.externals || []), { canvas: "canvas" }];
    return config;
  },
};

export default nextConfig;
