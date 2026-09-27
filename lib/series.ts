import { BlogPost } from '@/types';
import { localizePosts } from './post-localization';

export interface Series {
    id: string;
    name: string;
    icon: string;
    description: string;
    color: string;
    nameEn?: string;
    descriptionEn?: string;
}

export const SERIES_CONFIG: Series[] = [
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
        nameEn: 'Build a shoot ’em up with Unity 6',
        descriptionEn: 'Twelve complete lessons: from a 2D scene to movement, combat, waves, pickups, feedback, and a playable Web build.',
        name: 'Làm game bắn máy bay với Unity 6',
        icon: '🚀',
        description: 'Dựng một game shoot \'em up từ scene trống tới build WebGL: Input System, pool, ScriptableObject, HUD, shader',
        color: '#4C6EF5',
    },
    {
        id: 'platformer',
        nameEn: 'Build a pixel-art platformer with Unity 6',
        descriptionEn: 'Seventeen lessons from a single sprite to a playable Web build: tilemaps, jump feel measured rather than guessed, ScriptableObject characters, enemies, a boss, juice, and how to find the bugs Unity never reports.',
        name: 'Làm game platformer pixel art với Unity 6',
        icon: '🏃',
        description: 'Mười bảy bài từ một sprite tới build WebGL: tilemap, cú nhảy tính bằng công thức, ScriptableObject, địch, boss, juice, và cách tự tìm lỗi Unity không báo',
        color: '#2FB37A',
    },
    {
        id: 'csharp',
        name: 'C# cho người mới làm game',
        icon: '💻',
        description: 'Nền tảng C# trước khi vào Unity: biến, vòng lặp, collection, hàm, OOP, LINQ và delegate',
        color: '#68217A',
    },
    {
        id: 'shader',
        name: 'Shader & Rendering',
        icon: '🎨',
        description: 'HLSL, URP và các kỹ thuật shader dùng trong game thật',
        color: '#FFB84D',
    },
];

export const getSeries = (id: string, lang = 'vi'): Series | undefined => {
    const series = SERIES_CONFIG.find(s => s.id === id);
    return series && lang === 'en'
        ? { ...series, name: series.nameEn ?? series.name, description: series.descriptionEn ?? series.description }
        : series;
};

export const getSeriesForPost = (post: BlogPost): Series | null =>
    post.series ? getSeries(post.series, post.lang) ?? null : null;

const byOrderThenDate = (a: BlogPost, b: BlogPost) =>
    (a.order ?? Infinity) - (b.order ?? Infinity) ||
    new Date(a.date).getTime() - new Date(b.date).getTime();

export function getSeriesPosts(posts: BlogPost[], seriesId: string, lang = 'vi'): BlogPost[] {
    return localizePosts(posts.filter(p => p.series === seriesId), lang).sort(byOrderThenDate);
}

export function getSeriesNav(posts: BlogPost[], currentSlug: string) {
    const current = posts.find(p => p.slug === currentSlug);
    const series = current ? getSeriesForPost(current) : null;
    if (!series) return null;

    const ordered = getSeriesPosts(posts, series.id, current!.lang);
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
