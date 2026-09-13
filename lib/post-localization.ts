import { BlogPost } from '@/types';

export function getTranslations(posts: BlogPost[], post: BlogPost): BlogPost[] {
    return post.translationKey
        ? posts.filter(p => p.translationKey === post.translationKey).sort((a, b) => a.lang.localeCompare(b.lang))
        : [post];
}

// Show one edition per translated article; keep untranslated articles discoverable.
export function localizePosts(posts: BlogPost[], lang: string): BlogPost[] {
    return posts.filter(post => !post.translationKey || post.lang === lang ||
        !posts.some(p => p.translationKey === post.translationKey && p.lang === lang));
}

export const languageName = (lang: string) => lang === 'vi' ? 'Tiếng Việt' : 'English';
