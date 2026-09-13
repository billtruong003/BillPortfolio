import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import ts from 'typescript';
import matter from 'gray-matter';

// Execute the real TypeScript selectors, not a copy of their implementation.
const modules = new Map();
function loadModule(file) {
    file = path.resolve(file);
    if (modules.has(file)) return modules.get(file);
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
    const module = { exports: {} };
    vm.runInNewContext(`(function(require, module, exports) { ${output}\n})`)(name => loadModule(path.join(path.dirname(file), name + '.ts')), module, module.exports);
    modules.set(file, module.exports);
    return module.exports;
}
const { getSeriesPosts, getSeriesNav } = loadModule('lib/series.ts');
const { getTranslations, localizePosts } = loadModule('lib/post-localization.ts');
const { posts } = JSON.parse(fs.readFileSync('data/posts.json', 'utf8'));
const lessons = posts.filter(p => p.series === 'shmup');
assert.equal(lessons.length, 24);
assert.equal(new Set(posts.map(p => p.slug)).size, posts.length, 'Duplicate slug');
for (const lang of ['vi', 'en']) {
    const edition = getSeriesPosts(posts, 'shmup', lang);
    assert.equal(edition.length, 12, `${lang} lesson count`);
    assert.equal(localizePosts(posts, lang).filter(p => p.series === 'shmup').length, 12);
    edition.forEach((p, index) => {
        assert.equal(p.lang, lang);
        assert.equal(p.order, index);
        const nav = getSeriesNav(posts, p.slug);
        assert.equal(nav.total, 12);
        assert.equal(nav.prev?.slug ?? null, edition[index - 1]?.slug ?? null);
        assert.equal(nav.next?.slug ?? null, edition[index + 1]?.slug ?? null);
        assert.equal(getTranslations(posts, p).length, 2);
        const ids = p.headings.map(h => h.id);
        assert.equal(new Set(ids).size, ids.length, `${p.slug}: duplicate heading IDs`);
        assert.ok(ids.length >= 5, `${p.slug}: missing lesson structure`);
        assert.ok(!p.body.includes('<!-- code:'), `${p.slug}: unexpanded source`);
        for (const match of p.body.matchAll(/(?:href|src)="(\/[^"#?]+)(?:[?#][^"]*)?"/g)) {
            const href = match[1];
            if (href.startsWith('/lab/series/')) continue;
            if (href.startsWith('/lab/')) {
                const target = posts.find(other => other.slug === href.slice(5).replace(/\/$/, ''));
                assert.ok(target, `${p.slug}: broken article ${href}`);
                if (target.series === 'shmup') assert.equal(target.lang, lang, `${p.slug}: wrong-language next link`);
            } else assert.ok(fs.existsSync(path.join('public', href)), `${p.slug}: missing local asset ${href}`);
        }
        const raw = fs.readFileSync(`content/posts/unity-shmup/${p.slug}.md`, 'utf8');
        const partner = lessons.find(other => other.translationKey === p.translationKey && other.lang !== lang);
        const other = fs.readFileSync(`content/posts/unity-shmup/${partner.slug}.md`, 'utf8');
        const code = value => [...value.matchAll(/```(?:csharp|hlsl)\n([\s\S]*?)```/g)].map(m => m[1]);
        assert.deepEqual(code(raw), code(other), `${p.slug}: translations have diverging code`);
        for (const match of raw.matchAll(/\*\*(Assets\/[^*]+)\*\*\n\n```(?:csharp|hlsl)\n([\s\S]*?)```/g)) {
            const source = fs.readFileSync(path.join('public/downloads/shmup', `lesson-${String(p.order).padStart(2, '0')}`, match[1]), 'utf8').replace(/^\s*\/\/\/.*\n/gm, '').trim();
            assert.equal(match[2].trim(), source, `${p.slug}: inline code differs from download`);
        }
        const metadata = matter(raw).data;
        assert.equal(metadata.translationKey, p.translationKey);
    });
}
console.log('PASS: 24 articles, 12 paired lessons, same-language boundaries, local links/assets, unique headings, and identical source in both translations.');
