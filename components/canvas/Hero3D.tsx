'use client';

import { Canvas, useFrame, extend, ReactThreeFiber } from '@react-three/fiber';
import { 
    OrbitControls, 
    Center,
    shaderMaterial,
    useGLTF,
    ContactShadows,
    Environment,
    Float
} from '@react-three/drei';
import { Suspense, useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { getAssetPath } from '@/lib/utils';

const HologramShaderMaterial = shaderMaterial(
    {
        uTime: 0,
        uColor: new THREE.Color('#332008'),
        uRimColor: new THREE.Color('#FFB84D'),
    },
    `
    varying vec2 vUv;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
        vUv = uv;
        vNormal = normalize(normalMatrix * normal);
        vec4 modelPosition = modelMatrix * vec4(position, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vViewPosition = -viewPosition.xyz;
        gl_Position = projectionMatrix * viewPosition;
    }
    `,
    `
    uniform float uTime;
    uniform vec3 uColor;
    uniform vec3 uRimColor;
    varying vec3 vNormal;
    varying vec3 vViewPosition;
    void main() {
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        float scanline = sin(gl_FragCoord.y * 0.1 - uTime * 2.0);
        scanline = smoothstep(0.4, 0.6, scanline);
        float fresnel = dot(viewDir, normal);
        fresnel = clamp(1.0 - fresnel, 0.0, 1.0);
        fresnel = pow(fresnel, 2.5);
        vec3 finalColor = mix(uColor, uRimColor, fresnel);
        finalColor += uRimColor * scanline * 0.05;
        float alpha = 0.85 + (fresnel * 0.15);
        gl_FragColor = vec4(finalColor, alpha);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
    }
    `
);

extend({ HologramShaderMaterial });

declare global {
    namespace JSX {
        interface IntrinsicElements {
            hologramShaderMaterial: ReactThreeFiber.Object3DNode<THREE.ShaderMaterial, typeof HologramShaderMaterial> & {
                uColor?: THREE.Color;
                uRimColor?: THREE.Color;
                uTime?: number;
                transparent?: boolean;
                side?: THREE.Side;
                blending?: THREE.Blending;
                depthWrite?: boolean;
            };
        }
    }
}

// FIX: Sử dụng hàm getAssetPath để lấy đúng đường dẫn trên Github Pages
const MODEL_PATH = 'models/hero-model.glb';

const HologramModel = () => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
    const [useFallback, setUseFallback] = useState(false);
    
    // FIX: Prepend basePath
    const gltf = useGLTF(getAssetPath(MODEL_PATH), true) as any;

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    if (!gltf.scene || useFallback) {
        return <FallbackShape materialRef={materialRef} />;
    }

    const scene = useMemo(() => gltf.scene.clone(), [gltf.scene]);

    useEffect(() => {
        scene.traverse((child: any) => {
            if (child.isMesh) {
                child.material = new THREE.MeshBasicMaterial({ visible: false });
            }
        });
        return () => {
             scene.traverse((child: any) => {
                if (child.isMesh) {
                    child.geometry.dispose();
                }
            });
        }
    }, [scene]);

    const meshes = useMemo(() => {
        const m: THREE.Mesh[] = [];
        scene.traverse((child: any) => {
            if (child.isMesh) m.push(child);
        });
        return m;
    }, [scene]);

    return (
        <Center>
            <Float 
                speed={2} 
                rotationIntensity={0.2} 
                floatIntensity={0.5} 
                floatingRange={[-0.1, 0.1]}
            >
                <group dispose={null}>
                    {meshes.map((mesh, i) => (
                        <mesh 
                            key={i}
                            geometry={mesh.geometry}
                            position={mesh.position}
                            rotation={mesh.rotation}
                            scale={mesh.scale}
                        >
                            <hologramShaderMaterial
                                ref={i === 0 ? materialRef : undefined}
                                transparent={true}
                                side={THREE.FrontSide}
                                depthWrite={true}
                                blending={THREE.NormalBlending}
                                uColor={new THREE.Color('#2A1805')} 
                                uRimColor={new THREE.Color('#FFB84D')}
                            />
                        </mesh>
                    ))}
                </group>
            </Float>
        </Center>
    );
};

const FallbackShape = ({ materialRef }: { materialRef: any }) => (
    <Center>
        <Float speed={3} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh scale={1.8}>
                <torusKnotGeometry args={[0.5, 0.2, 128, 64]} />
                <hologramShaderMaterial
                    ref={materialRef}
                    transparent={true}
                    side={THREE.FrontSide}
                    depthWrite={true}
                    blending={THREE.NormalBlending}
                    uColor={new THREE.Color('#2A1805')}
                    uRimColor={new THREE.Color('#FFB84D')}
                />
            </mesh>
        </Float>
    </Center>
);

export const Hero3D = () => {
    return (
        <div className="w-full h-full min-h-[500px] lg:min-h-[600px] cursor-grab active:cursor-grabbing relative z-10">
            <Canvas 
                camera={{ position: [0, 0, 5], fov: 30 }} 
                dpr={[1, 2]} 
                gl={{ 
                    alpha: true, 
                    antialias: true, 
                    powerPreference: "high-performance",
                    stencil: false,
                    depth: true
                }}
            >
                <Environment preset="studio" />
                
                <Suspense fallback={null}>
                    <HologramModel />
                </Suspense>

                <ContactShadows 
                    position={[0, -1.6, 0]} 
                    opacity={0.4} 
                    scale={12} 
                    blur={2.5} 
                    far={2}
                    color="#1a1005"
                    frames={1} 
                />

                <OrbitControls 
                    enableZoom={false} 
                    autoRotate 
                    autoRotateSpeed={0.8}
                    enablePan={false}
                    minPolarAngle={Math.PI / 3}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
};