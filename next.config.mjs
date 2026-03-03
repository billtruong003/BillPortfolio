/** @type {import('next').NextConfig} */

const basePath = "";

const nextConfig = {
  output: "export",
  basePath: basePath,
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
    config.resolve.fallback = { ...config.resolve.fallback, fs: false, path: false };
    config.module.rules.push({ test: /\.(glb|gltf)$/, type: 'asset/resource' });
    return config;
  },
  // Headers for Unity WebGL builds (used when deploying to Vercel/similar)
  // For static export (GitHub Pages), configure via _headers file or server config
  async headers() {
    return [
      {
        source: '/webgl-games/:path*.gz',
        headers: [
          { key: 'Content-Encoding', value: 'gzip' },
          { key: 'Content-Type', value: 'application/octet-stream' },
        ],
      },
      {
        source: '/webgl-games/:path*.br',
        headers: [
          { key: 'Content-Encoding', value: 'br' },
          { key: 'Content-Type', value: 'application/octet-stream' },
        ],
      },
      {
        source: '/webgl-games/:path*.wasm',
        headers: [
          { key: 'Content-Type', value: 'application/wasm' },
        ],
      },
      {
        source: '/webgl-games/:path*.js',
        headers: [
          { key: 'Content-Type', value: 'application/javascript' },
        ],
      },
    ];
  },
};

export default nextConfig;
