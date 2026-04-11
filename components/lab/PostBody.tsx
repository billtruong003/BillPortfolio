'use client';

export const PostBody = ({ html }: { html: string }) => {
    return (
        <article
            className="lab-prose"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
