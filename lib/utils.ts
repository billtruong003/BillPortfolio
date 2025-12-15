import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetPath(path: string) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
  
  if (path.startsWith("http") || path.startsWith("data:") || path.startsWith("blob:")) {
      return path;
  }

  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${basePath}${cleanPath}`;
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