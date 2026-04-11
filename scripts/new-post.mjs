import fs from 'fs';
import path from 'path';

const POSTS_DIR = path.resolve('content/posts');
const CATEGORIES = ['shader-breakdown', 'tech-art', 'unity-dev', 'tools', 'devlog', 'tutorial'];

const title = process.argv[2];
if (!title) {
    console.log('Usage: node scripts/new-post.mjs "Post Title" [--category shader-breakdown] [--tags "HLSL,Unity"]');
    process.exit(1);
}

const categoryFlag = process.argv.indexOf('--category');
const category = categoryFlag !== -1 ? process.argv[categoryFlag + 1] : 'tutorial';
const tagsFlag = process.argv.indexOf('--tags');
const tags = tagsFlag !== -1 ? process.argv[tagsFlag + 1].split(',').map(t => t.trim()) : [];

if (!CATEGORIES.includes(category)) {
    console.error(`Invalid category "${category}". Choose from: ${CATEGORIES.join(', ')}`);
    process.exit(1);
}

const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const filePath = path.join(POSTS_DIR, `${slug}.md`);

if (fs.existsSync(filePath)) {
    console.error(`Post already exists: ${filePath}`);
    process.exit(1);
}

const date = new Date().toISOString().split('T')[0];
const tagYaml = tags.length > 0 ? `[${tags.map(t => `"${t}"`).join(', ')}]` : '[]';

const template = `---
title: "${title}"
date: "${date}"
excerpt: ""
coverImage: ""
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

fs.mkdirSync(POSTS_DIR, { recursive: true });
fs.writeFileSync(filePath, template);
console.log(`✅ Created: ${filePath}`);
console.log(`   Category: ${category}`);
console.log(`   Tags: ${tags.join(', ') || '(none)'}`);
console.log(`\n   Edit the file, then run: node scripts/compile-posts.mjs`);
