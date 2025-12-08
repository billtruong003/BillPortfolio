// components/canvas/ParticleBackground.tsx
'use client';
import { Canvas, useFrame } from '@react-three/fiber';
import { PointMaterial, Points } from '@react-three/drei';
import { useState, useRef, Suspense } from 'react';
import * as random from 'maath/random/dist/maath-random.cjs';
import * as THREE from 'three';

const Particles = () => {
    const ref = useRef<THREE.Points>(null);
    const [sphere] = useState(() => random.inSphere(new Float32Array(4000), { radius: 1.8 }) as Float32Array);

    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 15;
            ref.current.rotation.y -= delta / 20;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <Points ref={ref} positions={sphere} stride={3} frustumCulled={false}>
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
            <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]} gl={{ antialias: false }}>
                <Suspense fallback={null}>
                    <Particles />
                </Suspense>
            </Canvas>
        </div>
    );
};