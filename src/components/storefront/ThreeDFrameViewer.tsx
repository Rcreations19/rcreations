'use client';

import React, { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Environment, Lightformer, useTexture, Center } from '@react-three/drei';
import * as THREE from 'three';
import { Maximize, Minimize, Palette } from 'lucide-react';
import type { GlassType } from '@/lib/supabase/types';

class WebGLErrorBoundary extends React.Component<{ fallback: React.ReactNode, children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { fallback: React.ReactNode, children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error | unknown) {
    console.error("WebGL/Canvas rendering error caught by boundary:", error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface FrameMaterialConfig extends THREE.MeshPhysicalMaterialParameters {
  textureUrl?: string;
  innerMaterial?: FrameMaterialConfig;
  innerRatio?: number;
}

// The 10 specific Indian market frame materials plus 10 textured ones
export const FRAME_MATERIALS: Record<string, FrameMaterialConfig & { bumpScale?: number }> = {
  'f1': { color: '#5C4033', roughness: 0.9, metalness: 0.0 }, // Classic Teak Wood
  'f2': { color: '#D4AF37', roughness: 0.3, metalness: 0.8, textureUrl: '/textures/frame_pattern_gold.png', bumpScale: 0.6 }, // Ornate Antique Gold
  'f3': { color: '#1a1a1a', roughness: 0.8, metalness: 0.1 }, // Minimalist Matte Black
  'f4': { color: '#3B1E16', roughness: 0.4, metalness: 0.1 }, // Dark Rosewood / Mahogany
  'f5': { color: '#4a3020', roughness: 0.8, metalness: 0.0 }, // Textured Faux Leather
  'f6': { color: '#E8E5DF', roughness: 0.9, metalness: 0.0 }, // Distressed Vintage White
  'f7': { color: '#C0C0C0', roughness: 0.2, metalness: 0.9 }, // Metallic Ribbed Silver
  'f8': { color: '#CD7F32', roughness: 0.5, metalness: 0.7 }, // Traditional Bronze/Copper
  'f9': { color: '#D2B48C', roughness: 0.7, metalness: 0.0 }, // Natural Pine / Light Wood
  'f10': { color: '#ffffff', roughness: 0.05, metalness: 0.1 }, // Glossy White Acrylic
  'f11': { color: '#D4AF37', roughness: 0.4, metalness: 0.7, textureUrl: '/textures/frame_pattern_gold.png' }, // Royal Gold & Black Velvet
  'f12': { color: '#3E2723', roughness: 0.8, metalness: 0.0, textureUrl: '/textures/frame_pattern_wood.png' }, // Textured Walnut with Gold Rope
  'f13': { color: '#C5B358', roughness: 0.3, metalness: 0.6, textureUrl: '/textures/frame_pattern_gold.png' }, // Baroque Golden Leaf
  'f14': { color: '#4A0E0E', roughness: 0.5, metalness: 0.2, textureUrl: '/textures/frame_pattern_wood.png' }, // Mahogany with Brass Bevel
  'f15': { color: '#DAA520', roughness: 0.4, metalness: 0.7, textureUrl: '/textures/frame_pattern_gold.png' }, // Ornate Florentine Gold
  'f16': { color: '#2E1B15', roughness: 0.9, metalness: 0.1, textureUrl: '/textures/frame_pattern_wood.png' }, // Dark Espresso with Gold Trim
  'f17': { color: '#C0C0C0', roughness: 0.5, metalness: 0.8, textureUrl: '/textures/frame_pattern_beaded.png' }, // Victorian Silver & Black
  'f18': { color: '#654321', roughness: 0.7, metalness: 0.1, textureUrl: '/textures/frame_pattern_wood.png' }, // Classic Rosewood & Inner Gold
  'f19': { color: '#8C7853', roughness: 0.6, metalness: 0.6, textureUrl: '/textures/frame_pattern_beaded.png' }, // Gilded Antique Bronze
  'f20': { color: '#36454F', roughness: 0.8, metalness: 0.3, textureUrl: '/textures/frame_pattern_gold.png' }, // Embossed Charcoal & Gold
  'f21': { 
    color: '#3E2723', // Outer Brown
    roughness: 0.8, 
    metalness: 0.1,
    innerMaterial: {
      color: '#D4AF37', // Inner Gold
      roughness: 0.3,
      metalness: 0.8
    },
    innerRatio: 0.2
  }, // Outer 80% Brown, Inner 20% Gold
};

interface FrameGeometryProps {
  widthCm: number;
  heightCm: number;
  thickness: number; // width of the molding
  depth: number; // depth of the molding
  materialParams: FrameMaterialConfig;
}

interface FramePieceProps {
  position: [number, number, number];
  args: [number, number, number];
  materialParams: FrameMaterialConfig & { bumpScale?: number };
  repeatX: number;
  repeatY: number;
  rotation?: [number, number, number];
}

function TexturedFramePiece({ position, args, materialParams, repeatX, repeatY, rotation = [0, 0, 0] }: FramePieceProps) {
  const { textureUrl = '', bumpScale, ...mParams } = materialParams;
  const texture = useTexture(textureUrl) as THREE.Texture;
  
  const clonedTexture = useMemo(() => {
    const t = texture.clone();
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.repeat.set(repeatX, repeatY);
    t.needsUpdate = true;
    return t;
  }, [texture, repeatX, repeatY]);

  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhysicalMaterial {...mParams} color="#ffffff" map={clonedTexture} bumpMap={clonedTexture} bumpScale={bumpScale !== undefined ? bumpScale : 0.4} />
    </mesh>
  );
}

function FramePiece({ position, args, materialParams, repeatX, repeatY, rotation = [0, 0, 0] }: FramePieceProps) {
  if (materialParams.textureUrl) {
    return (
      <React.Suspense fallback={
        <mesh position={position} rotation={rotation} castShadow receiveShadow>
           <boxGeometry args={args} />
           <meshPhysicalMaterial {...materialParams} />
        </mesh>
      }>
        <TexturedFramePiece position={position} args={args} materialParams={materialParams} repeatX={repeatX} repeatY={repeatY} rotation={rotation} />
      </React.Suspense>
    );
  }
  
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshPhysicalMaterial {...materialParams} />
    </mesh>
  );
}

function FrameLayer({ widthCm, heightCm, thickness, depth, materialParams }: FrameGeometryProps) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  const t = thickness / 10;
  const d = depth / 10;

  const repeatU_horiz = (w + t * 2) * 2;
  const repeatU_vert = h * 2;
  const repeatV = t * 2;

  return (
    <group>
      <FramePiece position={[0, h / 2 + t / 2, d / 2]} args={[w + t * 2, t, d]} materialParams={materialParams} repeatX={repeatU_horiz} repeatY={repeatV} />
      <FramePiece position={[0, -(h / 2 + t / 2), d / 2]} args={[w + t * 2, t, d]} materialParams={materialParams} repeatX={repeatU_horiz} repeatY={repeatV} />
      <FramePiece position={[-(w / 2 + t / 2), 0, d / 2]} rotation={[0, 0, Math.PI / 2]} args={[h, t, d]} materialParams={materialParams} repeatX={repeatU_vert} repeatY={repeatV} />
      <FramePiece position={[w / 2 + t / 2, 0, d / 2]} rotation={[0, 0, Math.PI / 2]} args={[h, t, d]} materialParams={materialParams} repeatX={repeatU_vert} repeatY={repeatV} />
    </group>
  );
}

function FrameMesh({ widthCm, heightCm, thickness, depth, materialParams, materialId }: FrameGeometryProps & { materialId: string }) {
  if (materialParams.innerRatio && materialParams.innerMaterial) {
    const innerThickness = thickness * materialParams.innerRatio;
    const outerThickness = thickness * (1 - materialParams.innerRatio);
    
    return (
      <group key={materialId}>
        <FrameLayer 
          widthCm={widthCm} 
          heightCm={heightCm} 
          thickness={innerThickness} 
          depth={depth} 
          materialParams={materialParams.innerMaterial} 
        />
        <FrameLayer 
          widthCm={widthCm + (innerThickness * 2)} 
          heightCm={heightCm + (innerThickness * 2)} 
          thickness={outerThickness} 
          depth={depth} 
          materialParams={{...materialParams, innerRatio: undefined, innerMaterial: undefined}} 
        />
        {/* Backing Board */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[widthCm / 10, heightCm / 10, 0.05]} />
          <meshStandardMaterial color="#1a1a1a" roughness={1} />
        </mesh>
      </group>
    );
  }

  return (
    <group key={materialId}>
      <FrameLayer 
          widthCm={widthCm} 
          heightCm={heightCm} 
          thickness={thickness} 
          depth={depth} 
          materialParams={materialParams} 
      />
      {/* Backing Board */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[widthCm / 10, heightCm / 10, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1} />
      </mesh>
    </group>
  );
}

function createGlitterTexture() {
  if (typeof document === 'undefined') return null;
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  // Base normal map color for flat surface: rgb(128, 128, 255)
  ctx.fillStyle = 'rgb(128, 128, 255)';
  ctx.fillRect(0, 0, size, size);
  
  const imgData = ctx.getImageData(0, 0, size, size);
  const data = imgData.data;
  
  // Fine, powdered sparkle micro-facets (40% density of tiny glitter powder granules)
  for (let i = 0; i < data.length; i += 4) {
    const isFlake = Math.random() > 0.60;
    if (isFlake) {
      // Tilt normal vectors randomly in 3D hemisphere to catch sharp specular sparkles
      const angle = Math.random() * Math.PI * 2;
      const tilt = Math.random() * 0.9;
      const nx = Math.cos(angle) * tilt;
      const ny = Math.sin(angle) * tilt;
      const nz = Math.sqrt(Math.max(0, 1 - (nx * nx + ny * ny)));
      
      data[i] = Math.floor(((nx + 1) / 2) * 255);     // Red -> X
      data[i + 1] = Math.floor(((ny + 1) / 2) * 255); // Green -> Y
      data[i + 2] = Math.floor(((nz + 1) / 2) * 255); // Blue -> Z
    }
    data[i + 3] = 255;
  }
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(16, 16);
  return texture;
}

function createLenticularNormalMap() {
  if (typeof document === 'undefined') return null;
  const width = 256;
  const height = 16;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  
  const imgData = ctx.createImageData(width, height);
  const data = imgData.data;
  
  // Create vertical cylindrical lenticular lens ridges
  const period = 8; // width of each lens strip in pixels
  for (let x = 0; x < width; x++) {
    const phase = (x % period) / period; // 0 to 1 across lens
    // Normalized surface tangent: from -1 (left flank) to +1 (right flank)
    const nx = (phase - 0.5) * 1.6;
    const nz = Math.sqrt(Math.max(0.1, 1 - nx * nx));
    const r = Math.floor(((nx + 1) / 2) * 255);
    const g = 128; // flat in Y
    const b = Math.floor(((nz + 1) / 2) * 255);
    
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }
  ctx.putImageData(imgData, 0, 0);
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(30, 1);
  return texture;
}

function PhotoCanvasFallback({ widthCm, heightCm, finish }: { widthCm: number; heightCm: number; finish?: string }) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  const pParams: THREE.MeshPhysicalMaterialParameters = { roughness: 1.0, metalness: 0.0, clearcoat: 0 };
  
  if (finish === 'Matte') {
    pParams.roughness = 1.0;
    pParams.clearcoat = 0.0;
  } else if (finish === 'Glossy') {
    pParams.roughness = 0.05;
    pParams.metalness = 0.05;
    pParams.clearcoat = 1.0;
    pParams.clearcoatRoughness = 0.02;
  } else if (finish === '3D+') {
    pParams.roughness = 0.10;
    pParams.metalness = 0.0;
    pParams.clearcoat = 1.0;
    pParams.clearcoatRoughness = 0.05;
  } else if (finish === 'Glitter') {
    pParams.roughness = 0.45;
    pParams.metalness = 0.2;
    pParams.clearcoat = 1.0;
    pParams.clearcoatRoughness = 0.15;
  } else if (finish === 'Back Light') {
    pParams.roughness = 0.35;
    pParams.emissive = new THREE.Color(0xffffff);
    pParams.emissiveIntensity = 4.8;
  }

  return (
    <group position={[0, 0, 0.03]}>
      <mesh receiveShadow>
        <planeGeometry args={[w * 0.98, h * 0.98]} />
        <meshPhysicalMaterial color="#f0f0f0" {...pParams} />
      </mesh>
    </group>
  );
}

function PhotoCanvasStandard({ photoUrl, widthCm, heightCm, finish }: { photoUrl: string; widthCm: number; heightCm: number; finish?: string }) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  
  const baseTexture = useTexture(photoUrl) as THREE.Texture;
  
  const texture = useMemo(() => {
    if (!baseTexture) return baseTexture;
    const t = baseTexture.clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    t.needsUpdate = true;
    return t;
  }, [baseTexture]);

  const glitterBumpMap = useMemo(() => {
    if (finish === 'Glitter') return createGlitterTexture();
    return null;
  }, [finish]);

  const pParams: THREE.MeshPhysicalMaterialParameters = { roughness: 0.4, metalness: 0.0, clearcoat: 0 };

  if (finish === 'Matte') {
    pParams.roughness = 0.5;
    pParams.metalness = 0.0;
    pParams.clearcoat = 0.0;
  } else if (finish === 'Glossy') {
    pParams.roughness = 0.1;
    pParams.metalness = 0.0;
    pParams.clearcoat = 1.0;
    pParams.clearcoatRoughness = 0.05;
  } else if (finish === 'Glitter') {
    pParams.roughness = 0.45;
    pParams.metalness = 0.25;
    pParams.clearcoat = 1.0;
    pParams.clearcoatRoughness = 0.15;
  } else if (finish === 'Back Light') {
    pParams.roughness = 0.30;
    pParams.emissive = new THREE.Color(0xffffff);
    pParams.emissiveMap = texture;
    pParams.emissiveIntensity = 4.8; // 4X illumination intensity
  }

  return (
    <mesh receiveShadow position={[0, 0, 0.03]}>
      <planeGeometry args={[w * 0.98, h * 0.98]} />
      <meshPhysicalMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        clearcoatNormalMap={glitterBumpMap || null}
        clearcoatNormalScale={glitterBumpMap ? new THREE.Vector2(2.5, 2.5) : new THREE.Vector2(1, 1)}
        {...pParams} 
      />
    </mesh>
  );
}

function PhotoCanvasLenticular({ photoUrl, photoUrl2, widthCm, heightCm }: { photoUrl: string; photoUrl2: string; widthCm: number; heightCm: number }) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  
  const textures = useTexture([photoUrl, photoUrl2]) as THREE.Texture[];
  
  const texture = useMemo(() => {
    if (!textures[0]) return textures[0];
    const t = textures[0].clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    t.needsUpdate = true;
    return t;
  }, [textures[0]]);

  const texture2 = useMemo(() => {
    if (!textures[1]) return textures[1];
    const t = textures[1].clone();
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 16;
    t.needsUpdate = true;
    return t;
  }, [textures[1]]);

  const lenticularNormalMap = useMemo(() => createLenticularNormalMap(), []);

  const pParams: THREE.MeshPhysicalMaterialParameters = {
    roughness: 0.10,
    metalness: 0.0,
    clearcoat: 1.0,
    clearcoatRoughness: 0.04,
  };

  return (
    <mesh receiveShadow position={[0, 0, 0.03]}>
      <planeGeometry args={[w * 0.98, h * 0.98]} />
      <meshPhysicalMaterial 
        map={texture} 
        side={THREE.DoubleSide} 
        clearcoatNormalMap={lenticularNormalMap || null}
        clearcoatNormalScale={new THREE.Vector2(0.8, 0.8)}
        {...pParams} 
        onBeforeCompile={(shader) => {
          shader.uniforms.tex2 = { value: texture2 };
          shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `#include <common>\n varying vec3 vWorldPositionForFlip;`
          );
          shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>\n vWorldPositionForFlip = (modelMatrix * vec4(transformed, 1.0)).xyz;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `#include <common>\n uniform sampler2D tex2;\n varying vec3 vWorldPositionForFlip;`
          );
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            #ifdef USE_MAP
              vec4 texelColor1 = texture2D( map, vMapUv );
              vec4 texelColor2 = texture2D( tex2, vMapUv );
              
              vec3 viewDir = normalize(cameraPosition - vWorldPositionForFlip);
              // Optical lenticular switching: viewing left shows photo 1, viewing right shows photo 2
              float factor = smoothstep(-0.15, 0.15, viewDir.x);
              
              vec4 texelColor = mix(texelColor1, texelColor2, factor);
              diffuseColor *= texelColor;
            #endif
            `
          );
        }}
      />
    </mesh>
  );
}

function PhotoCanvas({ photoUrl, photoUrl2, widthCm, heightCm, finish }: { photoUrl: string; photoUrl2?: string | null; widthCm: number; heightCm: number; finish?: string }) {
  if (!photoUrl) {
    return <PhotoCanvasFallback widthCm={widthCm} heightCm={heightCm} finish={finish} />;
  }

  return (
    <React.Suspense fallback={<PhotoCanvasFallback widthCm={widthCm} heightCm={heightCm} finish={finish} />}>
      {finish === '3D+' && photoUrl2 ? (
        <PhotoCanvasLenticular photoUrl={photoUrl} photoUrl2={photoUrl2} widthCm={widthCm} heightCm={heightCm} />
      ) : (
        <PhotoCanvasStandard photoUrl={photoUrl} widthCm={widthCm} heightCm={heightCm} finish={finish} />
      )}
    </React.Suspense>
  );
}

function GlassPane({ widthCm, heightCm, glassType }: { widthCm: number; heightCm: number; glassType: GlassType }) {
  const w = widthCm / 10;
  const h = heightCm / 10;
  
  if ((glassType as string) === 'none') return null;

  return (
    <mesh position={[0, 0, 0.15]}>
      <planeGeometry args={[w, h]} />
      <meshPhysicalMaterial 
        transparent={true} 
        opacity={glassType === 'anti-glare-acrylic' ? 0.1 : 0.05} 
        roughness={glassType === 'anti-glare-acrylic' ? 0.4 : 0.0} 
        metalness={0.1}
        clearcoat={glassType === 'clear-glass' ? 1.0 : 0.0}
        clearcoatRoughness={0.0}
      />
    </mesh>
  );
}

function CameraAdjuster({ widthCm, heightCm, thicknessCm }: { widthCm: number; heightCm: number; thicknessCm: number }) {
  const { camera, size } = useThree();
  
  useEffect(() => {
    if (camera.type === 'PerspectiveCamera') {
      const pCam = camera as THREE.PerspectiveCamera;
      const aspect = size.width / size.height;
      const totalW = (widthCm + thicknessCm * 2) / 10;
      const totalH = (heightCm + thicknessCm * 2) / 10;
      const margin = 1.1; // 10% margin
      const fov = pCam.fov * (Math.PI / 180);
      const distH = (totalH / 2 * margin) / Math.tan(fov / 2);
      const distW = (totalW / 2 * margin) / (aspect * Math.tan(fov / 2));
      pCam.position.set(0, 0, Math.max(distH, distW, 3)); // Ensure min distance
      pCam.updateProjectionMatrix();
    }
  }, [widthCm, heightCm, thicknessCm, size, camera]);

  return null;
}

interface ThreeDFrameViewerProps {
  materialId: string;
  widthCm: number;
  heightCm: number;
  thicknessCm?: number; // Optional to not break other imports if any
  photoUrl: string | null;
  photoUrl2?: string | null;
  glassType?: GlassType | 'none';
  finish?: string;
  productType?: 'frames' | 'backlit';
  isThumbnail?: boolean;
}

export default function ThreeDFrameViewer({ materialId, widthCm, heightCm, thicknessCm = 3, photoUrl, photoUrl2, glassType, finish, productType = 'frames', isThumbnail = false }: ThreeDFrameViewerProps) {
  const materialParams = FRAME_MATERIALS[materialId] || FRAME_MATERIALS['f1'];


  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div ref={containerRef} className={`w-full h-full ${isFullscreen ? 'bg-surface-muted min-h-[500px]' : 'bg-transparent'} rounded-3xl overflow-hidden relative cursor-grab active:cursor-grabbing group`}>
      
      {/* Fullscreen Toggle */}
      {!isThumbnail && (
        <button 
          onClick={toggleFullscreen}
          className="absolute top-4 right-4 z-10 bg-white/80 p-2 rounded-full shadow-sm hover:bg-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize className="w-5 h-5 text-gray-700" /> : <Maximize className="w-5 h-5 text-gray-700" />}
        </button>
      )}

      {/* Canvas wrapped in ErrorBoundary to prevent WebGL crashes on low-end devices from taking down the app */}
      <WebGLErrorBoundary 
        fallback={
          isThumbnail ? (
            <div className="w-full h-full rounded-xl flex items-center justify-center border-4 border-white shadow-lg" style={{ backgroundColor: (typeof materialParams.color === 'number' ? '#' + materialParams.color.toString(16).padStart(6, '0') : (materialParams.color as string)) || '#e5e5e5' }}>
              <Palette className="w-12 h-12 text-white/50 mix-blend-overlay" />
            </div>
          ) : (
            <PhotoCanvasFallback widthCm={widthCm} heightCm={heightCm} finish={finish} />
          )
        }
      >
        <Canvas 
          frameloop={isThumbnail ? "always" : (!photoUrl ? "always" : "demand")} 
          shadows={!isThumbnail} 
          camera={{ position: photoUrl ? [0, 0, 10] : [-5, 2, 10], fov: 40 }}
          gl={isThumbnail ? { antialias: false, powerPreference: "low-power" } : undefined}
        >
        <color attach="background" args={['#f5f5f5']} />
        
        <ambientLight intensity={isThumbnail ? 2.5 : 1.5} />
        <directionalLight 
          position={[5, 5, 5]} 
          intensity={isThumbnail ? 3.0 : 2} 
          castShadow={!isThumbnail} 
          shadow-mapSize={[1024, 1024]} 
          shadow-bias={-0.001} 
        />
        {!isThumbnail && (
          <directionalLight position={[-5, 5, -5]} intensity={1} />
        )}
        
        {!isThumbnail && (
          <Environment resolution={256} preset="apartment">
            <Lightformer intensity={2} rotation-y={Math.PI / 2} position={[-5, 1, 5]} scale={[10, 5, 1]} />
            <Lightformer intensity={2} rotation-y={-Math.PI / 2} position={[5, 1, 5]} scale={[10, 5, 1]} />
            <Lightformer intensity={2} rotation-x={Math.PI / 2} position={[0, 5, 5]} scale={[10, 10, 1]} />
            <Lightformer form="ring" intensity={3} rotation-x={Math.PI / 2} position={[0, 5, -5]} scale={[10, 10, 1]} />
          </Environment>
        )}

        <Center>
          <group>
            {productType === 'backlit' && (
              <mesh position={[0, 0, -0.1]}>
                <planeGeometry args={[widthCm / 10 + 0.5, heightCm / 10 + 0.5]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={0.3} />
                <pointLight position={[0, 0, -0.5]} intensity={5.0} distance={10} color="#ffffff" />
              </mesh>
            )}
            <FrameMesh 
              materialId={materialId}
              widthCm={widthCm} 
              heightCm={heightCm} 
              thickness={thicknessCm} 
              depth={productType === 'backlit' ? 4 : 2.5} 
              materialParams={materialParams} 
            />

            {!isThumbnail && photoUrl && (
              <PhotoCanvas photoUrl={photoUrl} photoUrl2={photoUrl2} widthCm={widthCm} heightCm={heightCm} finish={finish} />
            )}
            
            {!isThumbnail && glassType && glassType !== 'none' && (
              <GlassPane widthCm={widthCm} heightCm={heightCm} glassType={glassType as GlassType} />
            )}
          </group>
        </Center>

        <OrbitControls 
          makeDefault
          enablePan={!isThumbnail} 
          enableZoom={!isThumbnail} 
          enableRotate={!isThumbnail}
          autoRotate={isThumbnail || !photoUrl}
          autoRotateSpeed={isThumbnail ? 2.0 : 1.5}
          minDistance={isThumbnail ? 3 : 5}
          maxDistance={isThumbnail ? 3 : 30}
        />
        {!isThumbnail && (
          <CameraAdjuster widthCm={widthCm} heightCm={heightCm} thicknessCm={thicknessCm} />
        )}
        </Canvas>
      </WebGLErrorBoundary>
    </div>
  );
}
