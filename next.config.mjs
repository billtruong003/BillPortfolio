// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'raw.githubusercontent.com' },
            { protocol: 'https', hostname: 'placehold.co' },
            { protocol: 'https', hostname: 'img.youtube.com' },
            { protocol: 'https', hostname: 'billdevsprint.com' },
        ],
        dangerouslyAllowSVG: true,
    },
    webpack: (config) => {
        config.externals = [...(config.externals || []), { canvas: "canvas" }];
        return config;
    },
};

export default nextConfig;