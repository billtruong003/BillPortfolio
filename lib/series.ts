import { BlogPost } from '@/types';

export interface Series {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
}

export const SERIES_CONFIG: Series[] = [
    {
        id: 'csharp',
        name: 'C# Cho Game Dev',
        icon: '💻',
        description: 'Từ zero đến OOP — nền tảng C# cho game developer',
        color: '#68217A',
    },
    {
        id: 'unity',
        name: 'Unity Cho Người Mới',
        icon: '🎮',
        description: 'GameObject, Scripting, Physics, UI và Design Patterns',
        color: '#00B894',
    },
    {
        id: 'swift',
        name: 'Swift & SwiftUI',
        icon: '🍎',
        description: 'Lập trình iOS với Swift và SwiftUI framework',
        color: '#F05138',
    },
    {
        id: 'shmup',
        name: 'Làm game bắn máy bay với Unity 6',
        icon: '🚀',
        description: 'Dựng một game shoot \'em up từ scene trống tới build WebGL: Input System, pool, ScriptableObject, HUD, shader',
        color: '#4C6EF5',
    },
    {
        id: 'shader',
        name: 'Shader & Rendering',
        icon: '🎨',
        description: 'HLSL, URP và các kỹ thuật shader dùng trong game thật',
        color: '#FFB84D',
    },
];

export const getSeries = (id: string): Series | undefined =>
    SERIES_CONFIG.find(s => s.id === id);

export const getSeriesForPost = (post: BlogPost): Series | null =>
    post.series ? getSeries(post.series) ?? null : null;

const byOrderThenDate = (a: BlogPost, b: BlogPost) =>
    (a.order ?? Infinity) - (b.order ?? Infinity) ||
    new Date(a.date).getTime() - new Date(b.date).getTime();

export function getSeriesPosts(posts: BlogPost[], seriesId: string): BlogPost[] {
    return posts.filter(p => p.series === seriesId).sort(byOrderThenDate);
}

export function getSeriesNav(posts: BlogPost[], currentSlug: string) {
    const current = posts.find(p => p.slug === currentSlug);
    const series = current ? getSeriesForPost(current) : null;
    if (!series) return null;

    const ordered = getSeriesPosts(posts, series.id);
    const idx = ordered.findIndex(p => p.slug === currentSlug);
    if (idx === -1) return null;

    return {
        series,
        posts: ordered,
        currentIndex: idx,
        prev: idx > 0 ? ordered[idx - 1] : null,
        next: idx < ordered.length - 1 ? ordered[idx + 1] : null,
        total: ordered.length,
        position: idx + 1,
    };
}
