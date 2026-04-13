import { BlogPost } from '@/types';

export interface Series {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    pattern: RegExp;
}

export const SERIES_CONFIG: Series[] = [
    {
        id: 'csharp',
        name: 'C# Cho Game Dev',
        icon: '💻',
        description: 'Từ zero đến OOP — nền tảng C# cho game developer',
        color: '#68217A',
        pattern: /^csharp-\d/,
    },
    {
        id: 'unity',
        name: 'Unity Cho Người Mới',
        icon: '🎮',
        description: 'GameObject, Scripting, Physics, UI và Design Patterns',
        color: '#00B894',
        pattern: /^unity-\d/,
    },
    {
        id: 'swift',
        name: 'Swift & SwiftUI',
        icon: '🍎',
        description: 'Lập trình iOS với Swift và SwiftUI framework',
        color: '#F05138',
        pattern: /^(swiftui-|introduction-to-swiftui|pet-project-tictactoe)/,
    },
];

export function getSeriesForPost(post: BlogPost): Series | null {
    return SERIES_CONFIG.find(s => s.pattern.test(post.slug)) ?? null;
}

export function getSeriesPosts(posts: BlogPost[], seriesId: string): BlogPost[] {
    const series = SERIES_CONFIG.find(s => s.id === seriesId);
    if (!series) return [];
    return posts
        .filter(p => series.pattern.test(p.slug))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getSeriesNav(posts: BlogPost[], currentSlug: string) {
    const series = SERIES_CONFIG.find(s => s.pattern.test(currentSlug));
    if (!series) return null;

    const ordered = posts
        .filter(p => series.pattern.test(p.slug))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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
