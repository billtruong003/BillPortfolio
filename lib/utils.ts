// lib/utils.ts
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getYoutubeThumbnail = (url: string) => {
  try {
    if (!url) return '';
    if (url.includes('youtube') || url.includes('youtu.be')) {
        let videoId = '';
        if (url.includes('/embed/')) videoId = url.split('/embed/')[1]?.split('?')[0];
        else if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
        
        if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    }
    return url;
  } catch {
    return url;
  }
};