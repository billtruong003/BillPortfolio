import type { MetadataRoute } from 'next';
import { postManifest } from '@/data/posts';
import { absoluteUrl } from '@/lib/site';
import { SERIES_CONFIG, getSeriesPosts } from '@/lib/series';
import { getTranslations } from '@/lib/post-localization';
import { DOC_TRACKS } from '@/lib/docs-tracks';
import { getDocPages } from '@/data/docs';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
    const latestPost = postManifest.posts
        .map(p => new Date(p.updated ?? p.date))
        .sort((a, b) => b.getTime() - a.getTime())[0];

    const pages: MetadataRoute.Sitemap = [
        { url: absoluteUrl('/'), changeFrequency: 'monthly', priority: 1 },
        { url: absoluteUrl('/lab/'), lastModified: latestPost, changeFrequency: 'weekly', priority: 0.8 },
        { url: absoluteUrl('/arcade/'), changeFrequency: 'monthly', priority: 0.6 },
    ];

    const series: MetadataRoute.Sitemap = SERIES_CONFIG
        .filter(s => getSeriesPosts(postManifest.posts, s.id).length > 0)
        .flatMap(s => [
            { url: absoluteUrl(`/lab/series/${s.id}/`), changeFrequency: 'monthly' as const, priority: 0.7 },
            ...(s.nameEn && postManifest.posts.some(p => p.series === s.id && p.lang === 'en')
                ? [{ url: absoluteUrl(`/lab/series/${s.id}-en/`), changeFrequency: 'monthly' as const, priority: 0.7 }] : []),
        ]);

    const posts: MetadataRoute.Sitemap = postManifest.posts.map(post => ({
        url: absoluteUrl(`/lab/${post.slug}/`),
        lastModified: new Date(post.updated ?? post.date),
        changeFrequency: 'monthly',
        priority: post.featured ? 0.8 : 0.6,
        ...(post.translationKey ? { alternates: { languages: Object.fromEntries(getTranslations(postManifest.posts, post).map(p => [p.lang, absoluteUrl(`/lab/${p.slug}/`)])) } } : {}),
    }));

    const docs: MetadataRoute.Sitemap = [
        { url: absoluteUrl('/docs/'), changeFrequency: 'weekly', priority: 0.8 },
        ...DOC_TRACKS.filter((t) => getDocPages(t.id).length).flatMap((t) => [
            { url: absoluteUrl(`/docs/${t.id}/`), changeFrequency: 'weekly' as const, priority: 0.7 },
            ...getDocPages(t.id).map((p) => ({ url: absoluteUrl(`/docs/${t.id}/${p.slug}/`), changeFrequency: 'monthly' as const, priority: 0.6 })),
        ]),
    ];

    return [...pages, ...series, ...posts, ...docs];
}
