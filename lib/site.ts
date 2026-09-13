import site from '@/data/site.json';

export const SITE = site;

export const absoluteUrl = (path: string) => new URL(path, SITE.url).toString();
