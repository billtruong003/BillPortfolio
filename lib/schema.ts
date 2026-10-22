// Structured data shared with the studio site (billthedevstudio.com/lib/schema.ts): the same @ids,
// so search engines see one person who founded one studio, not two unrelated "Bill The Dev"s.
import { SITE } from './site';
import resume from '@/data/resume.json';

export const PERSON_ID = 'https://www.billthedev.com/#person';
export const PORTFOLIO_SITE_ID = 'https://www.billthedev.com/#website';
export const STUDIO_ID = 'https://billthedevstudio.com/#organization';
export const STUDIO_URL = 'https://billthedevstudio.com/';

export const person = {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: resume.profile.name,
    alternateName: 'Trương Ngọc Châu',
    jobTitle: resume.profile.title,
    description: resume.profile.about,
    url: `${SITE.url}/`,
    email: resume.profile.contact.email,
    address: { '@type': 'PostalAddress', addressLocality: 'Ho Chi Minh City', addressCountry: 'VN' },
    worksFor: { '@type': 'Organization', '@id': STUDIO_ID, name: 'Bill The Dev', url: STUDIO_URL },
    sameAs: resume.socials.map((s) => s.url),
};

export const website = {
    '@type': 'WebSite',
    '@id': PORTFOLIO_SITE_ID,
    name: SITE.siteName,
    url: `${SITE.url}/`,
    inLanguage: ['en', 'vi'],
    about: { '@id': PERSON_ID },
};

export const graph = (...nodes: object[]) => ({ '@context': 'https://schema.org', '@graph': nodes });
