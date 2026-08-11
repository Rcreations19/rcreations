'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, ContactShadows, useTexture, Center, MeshReflectorMaterial, Float } from '@react-three/drei';
import * as THREE from 'three';
import type { GlassType } from '@/lib/supabase/types';

// The 10 specific Indian market frame materials
export const FRAME_MATERIALS: Record<string, THREE.MeshPhysicalMaterialParameters> = {
  'f1': { color: '#5C4033', roughness: 0.9, metalness: 0.0 }, // Classic Teak Wood
  'f2': { color: '#D4AF37', roughness: 0.3, metalness: 0.8 }, // Ornate Antique Gold
  'f3': { color: '#1a1a1a', roughness: 0.8, metalness: 0.1 }, // Minimalist Matte Black
  'f4': { color: '#3B1E16', roughness: 0.4, metalness: 0.1 }, // Dark Rosewood / Mahogany
  'f5': { color: '#4a3020', roughness: 0.8, metalness: 0.0 }, // Textured Faux Leather
  'f6': { color: '#E8E5DF', roughness: 0.9, metalness: 0.0 }, // Distressed Vintage White
  'f7': { color: '#C0C0C0', roughness: 0.2, metalness: 0.9 }, // Metallic Ribbed Silver
  'f8': { color: '#CD7F32', roughness: 0.5, metalness: 0.7 }, // Traditional Bronze/Copper
  'f9': { color: '#D2B48C', roughness: 0.7, metalness: 0.0 }, // Natural Pine / Light Wood
  'f10': { color: '#ffffff', roughness: 0.05, metalness: 0.1 }, // Glossy White Acrylic
};

interface FrameGeometryProps {
  widthCm: number;
  heightCm: number;
  thickness: number; // width of the molding
  depth: number; // depth of the molding
  materialParams: THREE.MeshPhysicalMaterialParameters;
}

function FrameMesh({ widthCm, heightCm, thickness, depth, materialParams, materialId }: FrameGeometryProps & { materialId: string }) {
  // Normalize sizes so 1 unit = 10cm for better 3D scaling
  const w = widthCm / 10;
  const h = heightCm / 10;
  const t = thickness / 10;
  const d = depth / 10;

  // We build the frame out of 4 boxes (top, bottom, left, right)
  // Adding key={materialId} forces React to mount a fresh mesh so ThreeJS materials update instantly
  return (
    <group key={materialId}>
      {/* Top */}
      <mesh position={[0, h / 2 + t / 2, d / 2]}>
        <boxGeometry args={[w + t * 2, t, d]} />
        <meshPhysicalMaterial {...materialParams} />
      </mesh>
      {/* Bottom */}
      <mesh position={[0, -(h / 2 + t / 2), d / 2]}>
        <boxGeometry args={[w + t * 2, t, d]} />
        <meshPhysicalMaterial {...materialParams} />
      </mesh>
      {/* Left */}
      <mesh position={[-(w / 2 + t / 2), 0, d / 2]}>
        <boxGeometry args={[t, h, d]} />
        <meshPhysicalMaterial {...materialParams} />
      </mesh>
      {/* Right */}
      <mesh position={[w / 2 + t / 2, 0, d / 2]}>
        <boxGeometry args={[t, h, d]} />
        <meshPhysicalMaterial {...materialParams} />
      </mesh>
      {/* Backing Board */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[w, h, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
    </group>
  );
}

function PhotoCanvas({ photoUrl, widthCm, heightCm }: { photoUrl: string; widthCm: number; heightCm: number }) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  
  // Conditionally load texture. If no URL, use a placeholder color.
  const texture = useMemo(() => {
    if (!photoUrl) return null;
    const loader = new THREE.TextureLoader();
    return loader.load(photoUrl);
  }, [photoUrl]);

  return (
    <mesh position={[0, 0, 0.03]}>
      <planeGeometry args={[w * 0.98, h * 0.98]} />
      {texture ? (
        <meshBasicMaterial map={texture} side={THREE.DoubleSide} />
      ) : (
        <meshStandardMaterial color="#2aabb0" roughness={0.5} />
      )}
    </mesh>
  );
}

function GlassPane({ widthCm, heightCm, glassType }: { widthCm: number; heightCm: number; glassType: GlassType }) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  
  if ((glassType as string) === 'none') return null;

  const roughness = glassType === 'anti-glare-acrylic' ? 0.3 : 0.05;
  const transmission = glassType === 'anti-glare-acrylic' ? 0.8 : 0.95;

  return (
    <mesh position={[0, 0, 0.15]}>
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial 
        transparent 
        opacity={0.3} 
        roughness={roughness} 
        transmission={transmission} 
        thickness={0.1}
        clearcoat={glassType === 'clear-glass' ? 1 : 0}
      />
    </mesh>
  );
}

interface ThreeDFrameViewerProps {
  materialId: string;
  widthCm: number;
  heightCm: number;
  thicknessCm?: number; // Optional to not break other imports if any
  photoUrl: string | null;
  glassType: GlassType;
}

export default function ThreeDFrameViewer({ materialId, widthCm, heightCm, thicknessCm = 3, photoUrl, glassType }: ThreeDFrameViewerProps) {
  const materialParams = FRAME_MATERIALS[materialId] || FRAME_MATERIALS['f1'];

  return (
    <div className="w-full h-full min-h-[500px] bg-transparent rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing">
      <Canvas shadows camera={{ position: [0, 0, Math.max(widthCm, heightCm) / 6.5], fov: 40 }}>
        {/* Lighting */}
        <ambientLight intensity={1.5} />
        <spotLight position={[10, 20, 10]} angle={0.3} penumbra={1} intensity={2.5} castShadow />
        <directionalLight position={[-10, 5, 10]} intensity={1.5} />
        <directionalLight position={[10, -5, -10]} intensity={1.2} />
        
        {/* Environment for reflections (Local Synthetic - No External Fetch) */}
        <Environment resolution={256} background={false}>
          <group rotation={[-Math.PI / 4, -0.3, 0]}>
            <Lightformer intensity={4} rotation-x={Math.PI / 2} position={[0, 5, -9]} scale={[10, 10, 1]} />
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, -1]} scale={[10, 2, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[10, 1, 0]} scale={[20, 2, 1]} />
          </group>
        </Environment>

        {/* The Frame Assembly */}
        <Center>
          <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
            <group rotation={[0, 0, 0]}>
              <FrameMesh 
                materialId={materialId}
                widthCm={widthCm} 
                heightCm={heightCm} 
                thickness={thicknessCm}
                depth={2} // 2cm depth
                materialParams={materialParams} 
              />
              <PhotoCanvas photoUrl={photoUrl || ''} widthCm={widthCm} heightCm={heightCm} />
              <GlassPane widthCm={widthCm} heightCm={heightCm} glassType={glassType} />
            </group>
          </Float>
        </Center>

        {/* Orbit Controls */}
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          minDistance={2}
          maxDistance={30}
          autoRotate={!photoUrl} // Auto rotate if no photo to show off the 3D
          autoRotateSpeed={1}
        />
      </Canvas>
    </div>
  );
}
