export interface Service {
    id: string;
    title: string;
    pitch: string;
    includes: string[];
    proof: { label: string; href: string }[];
}

export const SERVICES: Service[] = [
    {
        id: 'unity-xr',
        title: 'Unity games & XR',
        pitch: 'Gameplay systems, multiplayer and VR for Meta Quest, from first prototype to a build you can ship.',
        includes: ['Gameplay and systems in C#', 'Multiplayer with Photon Fusion', 'Meta Quest and VR interaction', 'WebGL builds for the browser'],
        proof: [
            { label: 'Shmackle VR', href: 'https://www.meta.com/experiences/shmackle-new-year/8557045787751880/' },
            { label: 'Game Lab', href: '/arcade' },
        ],
    },
    {
        id: 'performance',
        title: 'Performance & rendering',
        pitch: 'Your game drops frames on Quest or low-end phones. I profile it, find what is eating the frame, and fix it.',
        includes: ['Profiling CPU, GPU and memory', 'Draw calls, batching and instancing', 'URP shaders: toon, outline, dissolve', 'Holding a target FPS on standalone VR'],
        proof: [
            { label: 'Bill SSOutline', href: 'https://github.com/billtruong003/Bill-SSOutline' },
            { label: 'Bill Biome Shader', href: 'https://github.com/billtruong003/Bill-Biome-Shader' },
        ],
    },
    {
        id: 'tools',
        title: 'Tools & automation',
        pitch: 'Editor tools, Blender add-ons and Python pipelines that take repetitive work off your team, including tooling for YouTube channels.',
        includes: ['Unity editor tools', 'Blender add-ons (Python API)', 'Batch pipelines for 3D assets', 'Video and channel automation'],
        proof: [
            { label: 'Pro Origin Tools', href: 'https://superhivemarket.com/products/pro-origin-tools' },
            { label: 'Scene Switcher', href: 'https://github.com/billtruong003/SceneSwitcherToolUnity' },
        ],
    },
    {
        id: 'web-ai',
        title: 'Web apps & AI agents',
        pitch: 'Web apps, landing pages and AI agents set up around how you work, from a product site to a personal agent that runs 24/7.',
        includes: ['Next.js and React apps', 'Unity WebGL on your site', 'AI agents with memory and tools', 'Integrations and automations'],
        proof: [
            { label: 'Lucy AI agent', href: 'https://billtruong003.github.io/lucy-showcase/' },
            { label: 'This website', href: 'https://github.com/billtruong003/BillPortfolio' },
        ],
    },
];

export const CONTACT_TOPICS = [
    ...SERVICES.map(({ id, title }) => ({ id, title })),
    { id: 'full-time', title: 'Full-time or contract role' },
    { id: 'other', title: 'Something else' },
];
