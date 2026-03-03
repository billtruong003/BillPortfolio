import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetPath(src: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

  if (!src) return "";
  if (src.startsWith("http") || src.startsWith("data:") || src.startsWith("blob:")) {
      return src;
  }

  const normalizedSrc = src.startsWith('/') ? src : `/${src}`;
  return `${basePath}${normalizedSrc}`;
}

export const getYoutubeThumbnail = (url: string) => {
  try {
    if (!url) return 'https://placehold.co/1920x1080/1a1a1a/ffae42?text=No+Image';

    if (url.includes('youtube') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('/embed/')) videoId = url.split('/embed/')[1]?.split('?')[0];
        else if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
        else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
        
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }

    if (url.includes('vimeo.com')) return "https://placehold.co/1920x1080/1a1a1a/ffae42?text=Vimeo+Project";
    if (url.includes('dms.licdn.com') || url.endsWith('.mp4')) return "https://placehold.co/1920x1080/1a1a1a/ffae42?text=Video+Preview";

    return url;
  } catch {
    return "https://placehold.co/1920x1080/1a1a1a/ffae42?text=Error";
  }
};

// ===== Optimized Asset Helpers =====

let _supportsWebP: boolean | null = null;
let _supportsWebM: boolean | null = null;

export function supportsWebP(): boolean {
    if (typeof window === 'undefined') return true;
    if (_supportsWebP !== null) return _supportsWebP;
    const canvas = document.createElement('canvas');
    canvas.width = 1; canvas.height = 1;
    _supportsWebP = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return _supportsWebP;
}

export function supportsWebM(): boolean {
    if (typeof window === 'undefined') return true;
    if (_supportsWebM !== null) return _supportsWebM;
    const video = document.createElement('video');
    _supportsWebM = video.canPlayType('video/webm; codecs="vp9"') !== '';
    return _supportsWebM;
}

/** Auto-selects WebP/WebM when optimized variants exist (after `npm run optimize`) */
export function getOptimizedAsset(src: string): string {
    if (!src || src.startsWith('http') || src.startsWith('data:')) return getAssetPath(src);
    if (/\.(png|jpg|jpeg)$/i.test(src) && supportsWebP()) {
        return getAssetPath(src.replace(/\.(png|jpg|jpeg)$/i, '.webp'));
    }
    if (/\.mp4$/i.test(src) && supportsWebM()) {
        return getAssetPath(src.replace(/\.mp4$/i, '.webm'));
    }
    return getAssetPath(src);
}