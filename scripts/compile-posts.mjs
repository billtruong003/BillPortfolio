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
const OUTPUT_FILE = path.resolve('data/posts.json');

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
        readingTime: Math.ceil(stats.minutes),
        published: frontmatter.published !== false,
        featured: frontmatter.featured || false,
        body,
        headings,
    };
}

async function main() {
    if (!fs.existsSync(POSTS_DIR)) {
        fs.mkdirSync(POSTS_DIR, { recursive: true });
    }

    const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

    if (files.length === 0) {
        const empty = { posts: [], categories: [], tags: [], lastCompiled: new Date().toISOString() };
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(empty, null, 2));
        console.log('📝 No posts found. Created empty posts.json');
        return;
    }

    console.log(`📝 Compiling ${files.length} post(s)...`);

    const allPosts = [];
    for (const file of files) {
        try {
            const post = await compilePost(path.join(POSTS_DIR, file));
            if (post.published) {
                allPosts.push(post);
                console.log(`  ✓ ${post.slug} (${post.readingTime} min read)`);
            } else {
                console.log(`  ⊘ ${post.slug} (draft, skipped)`);
            }
        } catch (err) {
            console.error(`  ✗ ${file}: ${err.message}`);
        }
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
}

main().catch(err => {
    console.error('❌ Build failed:', err);
    process.exit(1);
});
