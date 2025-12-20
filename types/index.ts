export interface Social {
    platform: string;
    url: string;
    priority: string;
}

export interface Company {
    name: string;
    logo?: string;
    url: string;
    color?: string;
    textColor?: string;
    story?: string;
    role?: string;
    modal_img?: string;
    gallery?: {
        type: 'image' | 'video';
        src: string;
    }[];
}

export interface Production {
    name: string;
    logo?: string;
    url: string;
    desc?: string;
    story?: string;
    at_company?: string;
    role?: string;
    modal_img?: string;
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
    type: 'image' | 'video' | 'web'; 
    src: string;
    url: string;
    tags: string[];
    description: string;
    gallery?: {
        type: 'image' | 'video';
        src: string;
    }[];
}

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
    companies?: Company[];
    productions?: Production[];
    feed: string[];
    experience: {
        dev: ExperienceItem[];
        teaching: ExperienceItem[];
    };
    skills: { name: string; level: string }[];
    portfolio: Project[];
    certifications: { name: string; issuer: string; date: string; url: string }[];
    testimonials: { quote: string; author: string; role: string }[];
    tech_stack: { languages: string[]; frameworks: string[]; others: string[] };
}