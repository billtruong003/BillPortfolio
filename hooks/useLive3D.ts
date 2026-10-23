'use client';
import { useEffect, useState } from 'react';

/**
 * Live 3D only runs where it is cheap: a desktop-width screen, motion allowed, and hardware WebGL.
 * Phones, reduced motion and software renderers (SwiftShader, llvmpipe — which is also what Lighthouse
 * uses) get no frame loop, and the three.js chunks are never downloaded there.
 */
export const useLive3D = () => {
    const [live, setLive] = useState(false);

    useEffect(() => {
        const wide = window.matchMedia('(min-width: 1024px)').matches;
        const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (!wide || calm) return;

        const gl = document.createElement('canvas').getContext('webgl');
        if (!gl) return;
        const info = gl.getExtension('WEBGL_debug_renderer_info');
        const renderer = info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : '';
        gl.getExtension('WEBGL_lose_context')?.loseContext();
        if (/swiftshader|llvmpipe|software/i.test(renderer)) return;

        setLive(true);
    }, []);

    return live;
};
