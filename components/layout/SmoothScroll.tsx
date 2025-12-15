'use client';
import { ReactNode, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useStore } from '@/hooks/useStore';

export const SmoothScroll = ({ children }: { children: ReactNode }) => {
    // Lấy trạng thái modal từ store
    const isModalOpen = useStore((state) => state.isModalOpen);
    const lenisRef = useRef<Lenis | null>(null);

    useEffect(() => {
        const lenis = new Lenis({
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            touchMultiplier: 2,
        });
        
        lenisRef.current = lenis;

        function raf(time: number) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }

        requestAnimationFrame(raf);
        return () => lenis.destroy();
    }, []);

    // Effect để dừng/chạy lại scroll dựa trên modal
    useEffect(() => {
        if (lenisRef.current) {
            if (isModalOpen) {
                lenisRef.current.stop(); // Dừng scroll
                document.body.style.overflow = 'hidden'; // Khóa thanh cuộn trình duyệt
            } else {
                lenisRef.current.start(); // Chạy lại
                document.body.style.overflow = ''; // Mở lại thanh cuộn
            }
        }
    }, [isModalOpen]);

    return <>{children}</>;
};