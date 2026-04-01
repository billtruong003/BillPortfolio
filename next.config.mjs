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
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
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
  async headers() {
    return [
      // ===== SECURITY HEADERS (prevents "suspicious site" warnings) =====
      {
        source: '/(.*)',
        headers: [
          // Prevents MIME-type sniffing attacks
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          // Controls iframe embedding
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          // Strict referrer policy
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          // Permissions policy — declare we don't use suspicious APIs
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=()'
          },
          // Content Security Policy — whitelist trusted sources only
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com https://www.facebook.com https://platform.linkedin.com https://www.googleapis.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https: http:",
              "media-src 'self' blob: https:",
              "frame-src https://www.youtube.com https://www.facebook.com https://www.linkedin.com https://player.vimeo.com",
              "connect-src 'self' https://www.googleapis.com https://ipwho.is https://*.google.com",
              "worker-src 'self' blob:",
            ].join('; ')
          },
        ],
      },
      // Unity WebGL build headers
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
