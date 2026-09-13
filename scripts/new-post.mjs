import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('content/posts');
const CATEGORIES = ['shader-breakdown', 'tech-art', 'unity-dev', 'tools', 'devlog', 'tutorial'];
const SERIES = ['csharp', 'unity', 'swift', 'shader'];
const LANGS = ['vi', 'en'];

const title = process.argv[2];
if (!title) {
    console.log('Usage: node scripts/new-post.mjs "Post Title" [--category shader-breakdown] [--tags "HLSL,Unity"] [--lang vi|en] [--series shader] [--order 4] [--dir shader]');
    process.exit(1);
}

const flag = (name, fallback) => {
    const i = process.argv.indexOf(name);
    return i !== -1 ? process.argv[i + 1] : fallback;
};

const category = flag('--category', 'tutorial');
const tags = flag('--tags', '').split(',').map(t => t.trim()).filter(Boolean);
const lang = flag('--lang', 'vi');
const series = flag('--series', '');
const order = Number(flag('--order', '1'));
const dir = flag('--dir', series);

const fail = (msg) => { console.error(msg); process.exit(1); };
if (!CATEGORIES.includes(category)) fail(`Invalid category "${category}". Choose from: ${CATEGORIES.join(', ')}`);
if (!LANGS.includes(lang)) fail(`Invalid lang "${lang}". Choose from: ${LANGS.join(', ')}`);
if (series && !SERIES.includes(series)) fail(`Invalid series "${series}". Choose from: ${SERIES.join(', ')}`);

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const postDir = path.join(POSTS_DIR, dir);
const filePath = path.join(postDir, `${slug}.md`);

if (fs.existsSync(filePath)) fail(`Post already exists: ${filePath}`);

const date = new Date().toISOString().split('T')[0];
const tagYaml = `[${tags.map(t => `"${t}"`).join(', ')}]`;
const seriesYaml = series ? `series: "${series}"\norder: ${order}\n` : '';

const template = `---
title: "${title}"
date: "${date}"
lang: "${lang}"
${seriesYaml}excerpt: ""
coverImage: "/images/posts/${slug}/cover.webp"
category: "${category}"
tags: ${tagYaml}
published: false
featured: false
---

## Introduction

Write your post content here...

## Code Example

\`\`\`hlsl
// Your shader code here
float4 frag(v2f i) : SV_Target {
    return float4(1, 0, 0, 1);
}
\`\`\`

## Conclusion

Wrap up your post here.
`;

fs.mkdirSync(postDir, { recursive: true });
fs.writeFileSync(filePath, template);
console.log(`✅ Created: ${filePath}`);
console.log(`   Category: ${category}`);
console.log(`   Tags: ${tags.join(', ') || '(none)'}`);
console.log(`   Lang: ${lang}${series ? `, series: ${series} #${order}` : ''}`);
console.log(`   Cover: add public/images/posts/${slug}/cover.webp — the build fails while it is missing`);
console.log(`\n   Edit the file, then run: npm run compile-posts`);
