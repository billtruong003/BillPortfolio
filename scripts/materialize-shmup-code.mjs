// Expand explicit source includes when authoring. Published Markdown stays standalone.
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

for (const name of fs.readdirSync('content/posts/unity-shmup')) {
    if (!name.endsWith('.md')) continue;
    const target = path.join('content/posts/unity-shmup', name);
    let raw = fs.readFileSync(target, 'utf8');
    const { data } = matter(raw);
    raw = raw.replace(/<!-- code:([^\s]+) -->/g, (_, file) => {
        const code = fs.readFileSync(path.join('public/downloads/shmup', `lesson-${String(data.order).padStart(2, '0')}`, file), 'utf8')
            .replace(/^\s*\/\/\/.*\n/gm, '').trim();
        return `**${file}**\n\n\`\`\`${file.endsWith('.shader') ? 'hlsl' : 'csharp'}\n${code}\n\`\`\``;
    });
    fs.writeFileSync(target, raw);
}
