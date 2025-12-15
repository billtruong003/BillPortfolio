import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Cần khớp với REPO_NAME trong next.config.mjs
const REPO_NAME = "BillPortfolio";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAssetPath(path: string) {
  const isProd = process.env.NODE_ENV === 'production';
  // Xóa dấu / ở đầu nếu có để tránh double slash khi nối chuỗi
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  if (isProd) {
    return `/${REPO_NAME}/${cleanPath}`;
  }
  return `/${cleanPath}`;
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

    if (url.includes('vimeo.com')) {
        return "https://placehold.co/1920x1080/1a1a1a/ffae42?text=Vimeo+Project";
    }

    if (url.includes('dms.licdn.com') || url.endsWith('.mp4')) {
        return "https://placehold.co/1920x1080/1a1a1a/ffae42?text=Video+Preview";
    }

    return url;
  } catch {
    return "https://placehold.co/1920x1080/1a1a1a/ffae42?text=Error";
  }
};