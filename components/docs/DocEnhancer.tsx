'use client';
import { useEffect } from 'react';

const LABELS: Record<string, string> = {
    csharp: 'C#',
    cs: 'C#',
    python: 'Python',
    py: 'Python',
    javascript: 'JavaScript',
    js: 'JavaScript',
    typescript: 'TypeScript',
    ts: 'TypeScript',
    hlsl: 'HLSL',
    html: 'HTML',
    text: 'Text',
};
const STORAGE_KEY = 'docs-code-lang';

const langOf = (pre: Element) => pre.className.match(/language-(\w+)/)?.[1] ?? 'text';

const readPreferred = () => {
    try { return localStorage.getItem(STORAGE_KEY); } catch { return null; }
};

// Server-rendered doc HTML is plain markup; this adds code tabs and copy buttons after hydration.
export const DocEnhancer = ({ rootId }: { rootId: string }) => {
    useEffect(() => {
        const root = document.getElementById(rootId);
        if (!root) return;
        const groups: { langs: string[]; select: (lang: string) => void }[] = [];

        root.querySelectorAll<HTMLElement>('.code-tabs').forEach((group) => {
            if (group.dataset.ready) return;
            group.dataset.ready = '1';
            const pres = Array.from(group.querySelectorAll(':scope > pre'));
            const langs = pres.map(langOf);
            const bar = document.createElement('div');
            bar.className = 'code-tabs-bar';
            bar.setAttribute('role', 'tablist');
            const buttons = langs.map((lang) => {
                const b = document.createElement('button');
                b.type = 'button';
                b.setAttribute('role', 'tab');
                b.textContent = LABELS[lang] ?? lang;
                bar.appendChild(b);
                return b;
            });
            const select = (lang: string) => {
                const index = Math.max(0, langs.indexOf(lang));
                pres.forEach((p, i) => ((p as HTMLElement).hidden = i !== index));
                buttons.forEach((b, i) => b.setAttribute('aria-selected', String(i === index)));
            };
            buttons.forEach((b, i) =>
                b.addEventListener('click', () => {
                    try { localStorage.setItem(STORAGE_KEY, langs[i]); } catch { /* private mode */ }
                    groups.forEach((g) => g.langs.includes(langs[i]) && g.select(langs[i]));
                }),
            );
            group.prepend(bar);
            groups.push({ langs, select });
            select(readPreferred() ?? langs[0]);
        });

        root.querySelectorAll<HTMLElement>('pre').forEach((pre) => {
            if (pre.dataset.copy) return;
            pre.dataset.copy = '1';
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'code-copy';
            button.textContent = 'Copy';
            button.addEventListener('click', async () => {
                try {
                    await navigator.clipboard.writeText(pre.querySelector('code')?.innerText ?? pre.innerText);
                    button.textContent = 'Đã copy';
                } catch {
                    button.textContent = 'Không copy được';
                }
                setTimeout(() => (button.textContent = 'Copy'), 1500);
            });
            pre.appendChild(button);
        });
    }, [rootId]);

    return null;
};
