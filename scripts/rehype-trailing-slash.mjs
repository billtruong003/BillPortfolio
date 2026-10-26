// Site links written in Markdown as "/docs/csharp/if-else" get the trailing slash the site uses
// ("/docs/csharp/if-else/"). Without it GitHub Pages answers each one with a 301, and Search Console
// lists every such URL as "Page with redirect". Files ("/Bill_Resume.pdf"), anchors and other sites are left alone.
const FILE = /\.[a-z0-9]{2,5}$/i;

export function withTrailingSlash(href) {
    if (typeof href !== 'string' || !href.startsWith('/') || href.startsWith('//')) return href;
    const cut = href.search(/[?#]/);
    const path = cut === -1 ? href : href.slice(0, cut);
    const rest = cut === -1 ? '' : href.slice(cut);
    if (path.endsWith('/') || FILE.test(path)) return href;
    return `${path}/${rest}`;
}

export default function rehypeTrailingSlash() {
    const walk = (node) => {
        if (node.type === 'element' && node.tagName === 'a' && node.properties?.href) {
            node.properties.href = withTrailingSlash(node.properties.href);
        }
        node.children?.forEach(walk);
    };
    return (tree) => walk(tree);
}
