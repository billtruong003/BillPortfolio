import jsonData from './docs.json';

export interface DocPage {
    slug: string;
    title: string;
    description: string;
    section: string;
    order: number;
    difficulty?: string;
    tags: string[];
    image?: string;
    html: string;
    headings: { id: string; text: string }[];
}

// Only import this from server components: the manifest holds every page's HTML.
export const docTracks = (jsonData as unknown as { tracks: Record<string, DocPage[]> }).tracks;

export const getDocPages = (track: string): DocPage[] => docTracks[track] ?? [];
