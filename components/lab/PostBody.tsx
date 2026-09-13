'use client';

export const PostBody = ({ html, lang }: { html: string; lang?: string }) => {
    return (
        <article
            lang={lang}
            className="lab-prose"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
