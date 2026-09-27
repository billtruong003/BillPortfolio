import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeRaw from 'rehype-raw';
import rehypeSlug from 'rehype-slug';
import rehypePrismPlus from 'rehype-prism-plus';
import rehypeStringify from 'rehype-stringify';

// Compiles content/docs/<track>/*.md into data/docs.json and writes
// docs/image-concepts.md, the list of illustration slots still waiting for an image.

const DOCS_DIR = path.resolve('content/docs');
const PUBLIC_DIR = path.resolve('public');
const OUTPUT_FILE = path.resolve('data/docs.json');
const CONCEPTS_FILE = path.resolve('docs/image-concepts.md');

// Consecutive code blocks marked with `tab` in their info string (```csharp tab)
// are wrapped in one .code-tabs container; DocEnhancer turns it into tabs.
function remarkCodeTabs() {
    const isTab = (node) => node.type === 'code' && /\btab\b/.test(node.meta ?? '');
    const walk = (node) => {
        if (!node.children) return;
        const out = [];
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (isTab(child)) {
                const group = [];
                while (i < node.children.length && isTab(node.children[i])) group.push(node.children[i++]);
                i--;
                out.push({ type: 'html', value: '<div class="code-tabs">' }, ...group, { type: 'html', value: '</div>' });
            } else {
                walk(child);
                out.push(child);
            }
        }
        node.children = out;
    };
    return walk;
}

const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkCodeTabs)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeRaw)
    .use(rehypeSlug)
    .use(rehypePrismPlus, { ignoreMissing: true })
    .use(rehypeStringify);

function extractHeadings(html) {
    return [...html.matchAll(/<h2\s+id="([^"]*)"[^>]*>(.*?)<\/h2>/gi)].map((m) => ({
        id: m[1],
        text: m[2].replace(/<[^>]*>/g, '').trim(),
    }));
}

async function compileTrack(track) {
    const dir = path.join(DOCS_DIR, track);
    const pages = [];
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md')).sort()) {
        const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf-8'));
        if (data.published === false) continue;
        if (content.includes('—') || String(data.title).includes('—')) {
            throw new Error(`${track}/${file}: em dash found; rewrite the sentence.`);
        }
        const html = String(await processor.process(content));
        const slug = file.replace(/^\d+-/, '').replace(/\.md$/, '');
        const image = data.image && fs.existsSync(path.join(PUBLIC_DIR, data.image)) ? data.image : undefined;
        pages.push({
            slug,
            title: data.title ?? slug,
            description: data.description ?? '',
            section: data.section ?? 'Cơ bản',
            order: data.order ?? pages.length,
            difficulty: data.difficulty,
            tags: data.tags ?? [],
            image,
            imageSlot: data.image,
            imageIdea: data.imageIdea,
            imagePrompt: data.imagePrompt,
            html,
            headings: extractHeadings(html),
        });
    }
    return pages.sort((a, b) => a.order - b.order);
}

function writeConcepts(tracks) {
    const lines = [
        '# Ảnh minh họa cho Docs',
        '',
        'File này sinh tự động từ `npm run compile-posts`. Mỗi dòng là một chỗ trống đang chờ ảnh.',
        'Tìm ảnh gốc, sửa bằng ChatGPT theo prompt, xuất `.webp` (khoảng 1200x675) rồi đặt đúng đường dẫn. Build lại là ảnh tự hiện.',
        '',
    ];
    for (const [track, pages] of Object.entries(tracks)) {
        const missing = pages.filter((p) => p.imageSlot && !p.image);
        if (!missing.length) continue;
        lines.push(`## ${track}`, '');
        for (const p of missing) {
            lines.push(`- **${p.title}**: \`public${p.imageSlot}\``);
            if (p.imageIdea) lines.push(`  - Ý tưởng: ${p.imageIdea}`);
            if (p.imagePrompt) lines.push(`  - Prompt: ${p.imagePrompt}`);
        }
        lines.push('');
    }
    fs.mkdirSync(path.dirname(CONCEPTS_FILE), { recursive: true });
    fs.writeFileSync(CONCEPTS_FILE, lines.join('\n'));
}

const tracks = {};
for (const entry of fs.readdirSync(DOCS_DIR, { withFileTypes: true })) {
    if (entry.isDirectory()) tracks[entry.name] = await compileTrack(entry.name);
}
fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ tracks }));
writeConcepts(tracks);

const total = Object.values(tracks).reduce((n, p) => n + p.length, 0);
console.log(`📚 Compiled ${total} doc page(s) in ${Object.keys(tracks).length} track(s) → data/docs.json`);
