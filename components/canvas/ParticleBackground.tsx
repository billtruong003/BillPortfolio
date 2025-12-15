'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import { useRef, useMemo, Suspense, useState, useEffect } from 'react';
import * as THREE from 'three';

const generateSpherePositions = (count: number, radius: number) => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
        const r = radius * Math.cbrt(Math.random());
        const theta = Math.random() * 2 * Math.PI;
        const phi = Math.acos(2 * Math.random() - 1);
        
        const x = r * Math.sin(phi) * Math.cos(theta);
        const y = r * Math.sin(phi) * Math.sin(theta);
        const z = r * Math.cos(phi);

        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
    }
    return positions;
};

const Particles = () => {
    const ref = useRef<THREE.Points>(null);
    
    // Mặc định render ít hạt để tránh crash memory ban đầu
    const [count, setCount] = useState(1500); 

    useEffect(() => {
        // Chỉ tăng số lượng hạt sau khi component đã mount và check được màn hình to
        if (typeof window !== 'undefined' && window.innerWidth > 768) {
            setCount(4000);
        }
    }, []);

    const sphere = useMemo(() => generateSpherePositions(count, 1.8), [count]);

    useFrame((state, delta) => {
        if (ref.current) {
            const safeDelta = Math.min(delta, 0.1); 
            ref.current.rotation.x -= safeDelta / 15;
            ref.current.rotation.y -= safeDelta / 20;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            {/* QUAN TRỌNG: Thêm key={count} để buộc R3F tạo lại Geometry mới khi số lượng hạt thay đổi, tránh lỗi WebGL resize buffer */}
            <Points key={count} ref={ref} positions={sphere} stride={3} frustumCulled={false}>
                <PointMaterial
                    transparent
                    color="#FFB84D"
                    size={0.003}
                    sizeAttenuation={true}
                    depthWrite={false}
                    opacity={0.6}
                />
            </Points>
        </group>
    );
};

export const ParticleBackground = () => {
    return (
        <div className="fixed inset-0 z-[-1] pointer-events-none opacity-60">
            <Canvas 
                camera={{ position: [0, 0, 1] }} 
                dpr={[1, 2]} 
                gl={{ 
                    antialias: false,
                    alpha: true,
                    powerPreference: "high-performance"
                }}
            >
                <Suspense fallback={null}>
                    <Particles />
                </Suspense>
            </Canvas>
        </div>
    );
};