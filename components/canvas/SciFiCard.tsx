'use client';

import { Canvas, useFrame } from '@react-three/fiber';
import { Text, Float, MeshTransmissionMaterial, ContactShadows, Environment, RoundedBox } from '@react-three/drei';
import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { resumeData } from '@/data/resume';

// Cấu hình màu sắc
const THEME = {
    primary: "#FFB84D", // Màu vàng cam chủ đạo
    secondary: "#FFFFFF",
    dark: "#1A1A1A",
    glass: "#202020"
};

const CardLayout = () => {
    // Font online ổn định
    const fontUrl = 'https://fonts.gstatic.com/s/sharetechmono/v15/J7aHnp1uDWRyMbSRsxE3ETNDraO2.ttf';

    // Tạo mảng ngẫu nhiên cho Barcode giả
    const barcodeLines = useMemo(() => Array.from({ length: 12 }, () => Math.random()), []);

    return (
        <group position={[0, 0, 0.06]}>
            {/* --- KHUNG AVATAR (Bên trái) --- */}
            <group position={[-1, 0.2, 0]}>
                {/* Viền ảnh */}
                <mesh position={[0, 0, 0]}>
                    <planeGeometry args={[0.9, 0.9]} />
                    <meshBasicMaterial color={THEME.primary} wireframe />
                </mesh>
                {/* Placeholder Avatar (Giả lập hình ảnh) */}
                <mesh position={[0, 0, -0.01]}>
                    <planeGeometry args={[0.85, 0.85]} />
                    <meshBasicMaterial color={THEME.dark} opacity={0.8} transparent />
                </mesh>
                {/* Icon User đơn giản */}
                <mesh position={[0, -0.1, 0.01]}>
                    <circleGeometry args={[0.2, 32]} />
                    <meshBasicMaterial color={THEME.primary} />
                </mesh>
                <mesh position={[0, 0.15, 0.01]}>
                    <circleGeometry args={[0.1, 32]} />
                    <meshBasicMaterial color={THEME.primary} />
                </mesh>
            </group>

            {/* --- THÔNG TIN CHÍNH (Bên phải) --- */}
            <group position={[0.4, 0.2, 0]}>
                <Text 
                    position={[-0.8, 0.35, 0]} 
                    fontSize={0.18} 
                    color={THEME.primary} 
                    anchorX="left" 
                    font={fontUrl}
                    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ"
                >
                    {resumeData.profile.name.toUpperCase()}
                </Text>
                
                <Text 
                    position={[-0.8, 0.15, 0]} 
                    fontSize={0.09} 
                    color={THEME.secondary} 
                    anchorX="left" 
                    font={fontUrl}
                    maxWidth={2}
                >
                    {resumeData.profile.title}
                </Text>

                {/* Đường kẻ phân cách */}
                <mesh position={[0.1, 0, 0]}>
                    <planeGeometry args={[1.8, 0.01]} />
                    <meshBasicMaterial color={THEME.secondary} opacity={0.3} transparent />
                </mesh>

                {/* Thông tin chi tiết */}
                <group position={[0, -0.2, 0]}>
                    <Text position={[-0.8, 0, 0]} fontSize={0.06} color="#888" anchorX="left" font={fontUrl}>
                        ID REF:
                    </Text>
                    <Text position={[-0.4, 0, 0]} fontSize={0.06} color={THEME.secondary} anchorX="left" font={fontUrl}>
                        84-37-497-6616
                    </Text>

                    <Text position={[-0.8, -0.12, 0]} fontSize={0.06} color="#888" anchorX="left" font={fontUrl}>
                        LOC:
                    </Text>
                    <Text position={[-0.55, -0.12, 0]} fontSize={0.06} color={THEME.secondary} anchorX="left" font={fontUrl}>
                        VN-HCM-REMOTE
                    </Text>
                </group>
            </group>

            {/* --- BOTTOM SECTION (Barcode & Footer) --- */}
            <group position={[0, -0.6, 0]}>
                {/* Dòng chữ trạng thái */}
                <Text position={[-1.4, 0.15, 0]} fontSize={0.05} color={THEME.primary} anchorX="left" font={fontUrl}>
                    /// SYSTEM_ACCESS_GRANTED
                </Text>

                {/* Giả lập Barcode */}
                <group position={[1, 0.15, 0]}>
                    {barcodeLines.map((val, i) => (
                        <mesh key={i} position={[(i * 0.08) - 0.5, 0, 0]}>
                            <planeGeometry args={[0.04 * val + 0.01, 0.15]} />
                            <meshBasicMaterial color={THEME.secondary} opacity={0.7} transparent />
                        </mesh>
                    ))}
                </group>

                {/* Khung viền trang trí dưới đáy */}
                <mesh position={[0, -0.05, 0]}>
                    <planeGeometry args={[3.1, 0.02]} />
                    <meshBasicMaterial color={THEME.primary} opacity={0.5} transparent />
                </mesh>
            </group>

            {/* --- GÓC TRANG TRÍ (Tech Corners) --- */}
            {/* Góc trên trái */}
            <mesh position={[-1.5, 0.8, 0]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color={THEME.primary} />
            </mesh>
            <mesh position={[-1.6, 0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color={THEME.primary} />
            </mesh>

             {/* Góc dưới phải */}
             <mesh position={[1.5, -0.8, 0]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color={THEME.primary} />
            </mesh>
            <mesh position={[1.6, -0.7, 0]} rotation={[0, 0, Math.PI / 2]}>
                <planeGeometry args={[0.2, 0.02]} />
                <meshBasicMaterial color={THEME.primary} />
            </mesh>
        </group>
    );
};

const Card = () => {
    const mesh = useRef<THREE.Mesh>(null);
    
    useFrame((state) => {
        if (!mesh.current) return;
        const t = state.clock.getElapsedTime();
        // Hiệu ứng bay nhẹ nhàng hơn
        mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, Math.cos(t / 2) / 15 + 0.1, 0.1);
        mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, Math.sin(t / 4) / 10 - 0.1, 0.1);
        mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, (-1.5 + Math.sin(t)) / 8, 0.1);
    });

    return (
        <group>
            <Float floatIntensity={1.5} speed={2} rotationIntensity={0.5}>
                <group ref={mesh as any}>
                    {/* KHỐI KÍNH CHÍNH */}
                    {/* Sử dụng RoundedBox để bo tròn góc - nhìn hiện đại hơn */}
                    <RoundedBox args={[3.4, 2.0, 0.1]} radius={0.1} smoothness={4}>
                        <MeshTransmissionMaterial
                            backside
                            backsideThickness={1}
                            thickness={0.5}
                            chromaticAberration={0.06} // Tán sắc ánh sáng
                            anisotropy={0.2}
                            distortion={0.1}
                            distortionScale={0.3}
                            temporalDistortion={0.5}
                            ior={1.3} // Chỉ số khúc xạ
                            color={THEME.glass}
                            background={new THREE.Color("#000000")}
                        />
                    </RoundedBox>
                    
                    {/* LỚP NỘI DUNG */}
                    <CardLayout />
                </group>
            </Float>
            
            {/* Bóng đổ dưới đáy */}
            <ContactShadows position={[0, -2.5, 0]} opacity={0.6} scale={10} blur={3} far={4} color="#FFB84D" />
        </group>
    );
};


export const SciFiCard = () => {
    return (
        <div className="w-full h-full min-h-[500px] cursor-grab active:cursor-grabbing">
            {/* FOV nhỏ lại để giảm méo, position Z gần hơn (3.5) để thẻ to hơn */}
            <Canvas camera={{ position: [0, 0, 3.5], fov: 35 }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                {/* Tăng cường độ đèn Spotlight để thẻ bóng bẩy hơn */}
                <spotLight position={[5, 5, 5]} angle={0.3} penumbra={1} intensity={30} color="#fff" castShadow />
                <spotLight position={[-5, 5, 5]} angle={0.3} penumbra={1} intensity={15} color="#FFB84D" />
                <Environment preset="city" />
                <Card />
            </Canvas>
        </div>
    );
};