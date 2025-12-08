// types/index.ts

// 1. Khai báo các Interface con trước
export interface Social {
    platform: string;
    url: string;
    priority: string;
}

export interface ExperienceItem {
    role: string;
    company: string;
    period: string;
    desc?: string;
    achievements?: string[];
    skills?: string[];
}

export interface Project {
    id: number;
    title: string;
    category: string;
    type: 'image' | 'video';
    src: string;
    url: string;
    tags: string[];
    description: string;
    gallery?: {
        type: 'image' | 'video';
        src: string;
    }[];
}

// 2. Interface cha dùng các interface con
export interface ResumeData {
    profile: {
        name: string;
        title: string;
        quote: string;
        quoteAuthor: string;
        about: string;
        location: string;
        contact: { email: string };
    };
    socials: Social[];
    feed: string[];
    experience: {
        dev: ExperienceItem[];      // Đã có ExperienceItem ở trên
        teaching: ExperienceItem[]; // Đã có ExperienceItem ở trên
    };
    skills: { name: string; level: string }[];
    portfolio: Project[];
    certifications: { name: string; issuer: string; date: string; url: string }[];
    testimonials: { quote: string; author: string; role: string }[];
    tech_stack: { languages: string[]; frameworks: string[]; others: string[] };
}