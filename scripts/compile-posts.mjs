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
import readingTime from 'reading-time';

const POSTS_DIR = path.resolve('content/posts');
const PUBLIC_DIR = path.resolve('public');
const OUTPUT_FILE = path.resolve('data/posts.json');
const FEED_FILE = path.resolve('public/lab/feed.xml');
const SITE = JSON.parse(fs.readFileSync(path.resolve('data/site.json'), 'utf-8'));

const VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i;

function getMarkdownFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...getMarkdownFiles(fullPath));
        } else if (entry.name.endsWith('.md')) {
            results.push(fullPath);
        }
    }
    return results;
}

function extractHeadings(html) {
    const headings = [];
    const regex = /<h([23])\s+id="([^"]*)"[^>]*>(.*?)<\/h[23]>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
        headings.push({
            level: parseInt(match[1]),
            id: match[2],
            text: match[3].replace(/<[^>]*>/g, '').trim(),
        });
    }
    return headings;
}

function detectLang(frontmatter, content) {
    if (frontmatter.lang) return frontmatter.lang;
    return VI_DIACRITICS.test(content) ? 'vi' : 'en';
}

function checkImages(rel, frontmatter, body) {
    const problems = [];
    const cover = frontmatter.coverImage;
    if (cover && /^https?:\/\//.test(cover)) {
        console.warn(`  ⚠ ${rel}: coverImage is hotlinked (${cover})`);
    } else if (cover && !fs.existsSync(path.join(PUBLIC_DIR, cover))) {
        problems.push(`coverImage not found: public${cover}`);
    }
    for (const m of body.matchAll(/<img[^>]+src="(https?:\/\/[^"]+)"/g)) {
        console.warn(`  ⚠ ${rel}: hotlinked image ${m[1]}`);
    }
    return problems;
}

async function compilePost(filePath) {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data: frontmatter, content } = matter(raw);

    const processor = unified()
        .use(remarkParse)
        .use(remarkGfm)
        .use(remarkRehype, { allowDangerousHtml: true })
        .use(rehypeRaw)
        .use(rehypeSlug)
        .use(rehypePrismPlus, { ignoreMissing: true })
        .use(rehypeStringify);

    const result = await processor.process(content);
    const body = String(result);
    const headings = extractHeadings(body);
    const stats = readingTime(content);
    const slug = path.basename(filePath, '.md');

    return {
        slug,
        title: frontmatter.title || slug,
        date: frontmatter.date || new Date().toISOString().split('T')[0],
        updated: frontmatter.updated || undefined,
        excerpt: frontmatter.excerpt || '',
        coverImage: frontmatter.coverImage || undefined,
        category: frontmatter.category || 'tutorial',
        tags: frontmatter.tags || [],
        lang: detectLang(frontmatter, content),
        translationKey: frontmatter.translationKey || undefined,
        series: frontmatter.series || undefined,
        order: frontmatter.order ?? undefined,
        readingTime: Math.ceil(stats.minutes),
        published: frontmatter.published !== false,
        featured: frontmatter.featured || false,
        body,
        headings,
        problems: checkImages(path.relative(POSTS_DIR, filePath), frontmatter, body),
    };
}

const XML_ESCAPES = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' };
const escapeXml = (s) => String(s).replace(/[<>&"]/g, c => XML_ESCAPES[c]);

function feedItem(p) {
    const url = `${SITE.url}/lab/${p.slug}/`;
    const lines = [
        '    <item>',
        `      <title>${escapeXml(p.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${new Date(p.date).toUTCString()}</pubDate>`,
        `      <description>${escapeXml(p.excerpt)}</description>`,
        ...p.tags.map(t => `      <category>${escapeXml(t)}</category>`),
    ];
    if (p.coverImage) {
        lines.push(`      <enclosure url="${SITE.url}${p.coverImage}" type="image/webp" length="0" />`);
    }
    lines.push('    </item>');
    return lines.join('\n');
}

function writeFeed(posts) {
    const items = posts
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map(feedItem)
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE.name)} — Dev Lab</title>
    <link>${SITE.url}/lab/</link>
    <atom:link href="${SITE.url}/lab/feed.xml" rel="self" type="application/rss+xml" />
    <description>Shader breakdowns, Unity tutorials, and tech art experiments by ${escapeXml(SITE.author)}.</description>
    <language>vi</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>
`;
    fs.mkdirSync(path.dirname(FEED_FILE), { recursive: true });
    fs.writeFileSync(FEED_FILE, xml);
    console.log(`📡 RSS feed → public/lab/feed.xml (${posts.length} items)`);
}

async function main() {
    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    const files = getMarkdownFiles(POSTS_DIR);

    if (files.length === 0) {
        const empty = { posts: [], categories: [], tags: [], lastCompiled: new Date().toISOString() };
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(empty, null, 2));
        writeFeed([]);
        console.log('📝 No posts found. Created empty posts.json');
        return;
    }

    console.log(`📝 Compiling ${files.length} post(s)...`);

    const allPosts = [];
    const errors = [];
    for (const filePath of files) {
        const rel = path.relative(POSTS_DIR, filePath);
        try {
            const { problems, ...post } = await compilePost(filePath);
            if (!post.published) {
                console.log(`  ⊘ ${rel} (draft, skipped)`);
                continue;
            }
            errors.push(...problems.map(p => `${rel}: ${p}`));
            allPosts.push(post);
            console.log(`  ✓ ${rel} → ${post.slug} [${post.lang}] (${post.readingTime} min read)`);
        } catch (err) {
            errors.push(`${rel}: ${err.message}`);
        }
    }

    const slugs = new Set();
    const translations = new Map();
    for (const post of allPosts) {
        if (slugs.has(post.slug)) errors.push(`Duplicate slug: ${post.slug}`);
        slugs.add(post.slug);
        if (!post.translationKey) continue;
        const key = `${post.translationKey}:${post.lang}`;
        if (translations.has(key)) errors.push(`Duplicate translation: ${key}`);
        translations.set(key, post);
        const sibling = allPosts.find(p => p.translationKey === post.translationKey && p.slug !== post.slug);
        if (!sibling) errors.push(`Missing translation partner: ${post.slug}`);
        else if (sibling.series !== post.series || sibling.order !== post.order) errors.push(`Translation lesson mismatch: ${post.translationKey}`);
    }

    if (errors.length > 0) {
        console.error('\n❌ Post compilation failed:');
        for (const e of errors) console.error(`  ✗ ${e}`);
        process.exit(1);
    }

    // Sort: featured first, then by date descending
    allPosts.sort((a, b) => {
        if (a.featured !== b.featured) return b.featured ? 1 : -1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    // Aggregate categories
    const catMap = {};
    for (const p of allPosts) {
        catMap[p.category] = (catMap[p.category] || 0) + 1;
    }
    const categories = Object.entries(catMap).map(([name, count]) => ({ name, count }));

    // Aggregate tags
    const tagMap = {};
    for (const p of allPosts) {
        for (const t of p.tags) {
            tagMap[t] = (tagMap[t] || 0) + 1;
        }
    }
    const tags = Object.entries(tagMap)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

    const manifest = {
        posts: allPosts,
        categories,
        tags,
        lastCompiled: new Date().toISOString(),
    };

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(manifest, null, 2));
    console.log(`\n✅ Compiled ${allPosts.length} post(s) → data/posts.json`);
    writeFeed(allPosts);
}

main().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
