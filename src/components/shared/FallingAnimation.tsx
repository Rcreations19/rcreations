'use client';

import React, { useEffect, useRef } from 'react';

// ============================================================
// MINIMAL SIMPLEX NOISE ENGINE (For Flow Field)
// ============================================================
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;
const p = new Uint8Array(256);
for (let i = 0; i < 256; i++) p[i] = Math.floor(Math.random() * 256);
const perm = new Uint8Array(512);
const permMod12 = new Uint8Array(512);
for (let i = 0; i < 512; i++) {
  perm[i] = p[i & 255];
  permMod12[i] = (perm[i] % 12);
}

function grad3(hash: number, x: number, y: number, z: number) {
  const h = hash & 15;
  const u = h < 8 ? x : y;
  const v = h < 4 ? y : h === 12 || h === 14 ? x : z;
  return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
}

function simplex3(xin: number, yin: number, zin: number) {
  let n0, n1, n2, n3;
  const s = (xin + yin + zin) * F3;
  const i = Math.floor(xin + s), j = Math.floor(yin + s), k = Math.floor(zin + s);
  const t = (i + j + k) * G3;
  const X0 = i - t, Y0 = j - t, Z0 = k - t;
  const x0 = xin - X0, y0 = yin - Y0, z0 = zin - Z0;

  let i1, j1, k1, i2, j2, k2;
  if (x0 >= y0) {
    if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
    else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
  } else {
    if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
    else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
    else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
  }

  const x1 = x0 - i1 + G3, y1 = y0 - j1 + G3, z1 = z0 - k1 + G3;
  const x2 = x0 - i2 + 2.0 * G3, y2 = y0 - j2 + 2.0 * G3, z2 = z0 - k2 + 2.0 * G3;
  const x3 = x0 - 1.0 + 3.0 * G3, y3 = y0 - 1.0 + 3.0 * G3, z3 = z0 - 1.0 + 3.0 * G3;

  const ii = i & 255, jj = j & 255, kk = k & 255;
  let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
  if (t0 < 0) n0 = 0.0;
  else { t0 *= t0; n0 = t0 * t0 * grad3(permMod12[ii + perm[jj + perm[kk]]], x0, y0, z0); }

  let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
  if (t1 < 0) n1 = 0.0;
  else { t1 *= t1; n1 = t1 * t1 * grad3(permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]], x1, y1, z1); }

  let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
  if (t2 < 0) n2 = 0.0;
  else { t2 *= t2; n2 = t2 * t2 * grad3(permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]], x2, y2, z2); }

  let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
  if (t3 < 0) n3 = 0.0;
  else { t3 *= t3; n3 = t3 * t3 * grad3(permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]], x3, y3, z3); }

  return 32.0 * (n0 + n1 + n2 + n3);
}

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  densityDesktop: 54, // Increased by 50%
  densityTablet: 36,
  densityMobile: 22,  // Increased by 50%
  spawnRateMs: 300,   // Slower spawn rate prevents lag
  layers: 3,
  fadeInFrames: 45,
  fadeOutStart: 0.88,
};

// ============================================================
// UTILS
// ============================================================
const rng = {
  range: (min: number, max: number) => Math.random() * (max - min) + min,
  int: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
};

// ============================================================
// DRAW ROUTINES (Called ONCE per variant during caching)
// ============================================================
function drawPetal(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  // We use slightly larger raw coordinates scaled by size to create the paths.
  const s = size * 0.85; // Scale factor to fit inside the sprite box nicely
  
  ctx.beginPath();
  
  if (variant === 0) {
    // 1. The Classic Teardrop (Heart dip top, tapered bottom)
    ctx.moveTo(0, s * 0.9); // Base
    ctx.bezierCurveTo(s * 0.5, s * 0.7, s * 0.9, -s * 0.2, s * 0.4, -s * 0.8);
    ctx.bezierCurveTo(s * 0.1, -s * 1.0, -s * 0.1, -s * 1.0, -s * 0.4, -s * 0.8);
    ctx.bezierCurveTo(-s * 0.9, -s * 0.2, -s * 0.5, s * 0.7, 0, s * 0.9);
    const g = ctx.createRadialGradient(0, s * 0.3, 0, 0, 0, s * 1.5);
    g.addColorStop(0, 'rgba(215, 24, 74, 1.0)');  // Deep base
    g.addColorStop(0.6, 'rgba(255, 92, 138, 0.95)'); // Mid pink
    g.addColorStop(1, 'rgba(255, 153, 178, 0.85)'); // Soft translucent edge
    ctx.fillStyle = g;
  } else if (variant === 1) {
    // 2. The Side-Curl (3/4 angle, folded edge)
    ctx.moveTo(0, s * 0.9);
    ctx.bezierCurveTo(s * 0.8, s * 0.4, s * 0.6, -s * 0.7, 0, -s * 0.9);
    ctx.bezierCurveTo(-s * 0.4, -s * 0.9, -s * 0.7, -s * 0.3, -s * 0.3, s * 0.2);
    ctx.bezierCurveTo(-s * 0.1, s * 0.5, -s * 0.1, s * 0.7, 0, s * 0.9);
    const g = ctx.createLinearGradient(-s, -s, s, s);
    g.addColorStop(0, 'rgba(255, 117, 143, 0.9)');
    g.addColorStop(1, 'rgba(201, 24, 74, 1.0)');
    ctx.fillStyle = g;
  } else if (variant === 2) {
    // 3. The Ruffled Bloom (Wide, wavy top)
    ctx.moveTo(0, s * 0.8);
    ctx.bezierCurveTo(s * 0.7, s * 0.6, s * 1.1, -s * 0.2, s * 0.6, -s * 0.7);
    ctx.bezierCurveTo(s * 0.2, -s * 0.6, -s * 0.2, -s * 0.9, -s * 0.6, -s * 0.7);
    ctx.bezierCurveTo(-s * 1.1, -s * 0.2, -s * 0.7, s * 0.6, 0, s * 0.8);
    const g = ctx.createRadialGradient(0, s * 0.5, 0, 0, 0, s * 1.4);
    g.addColorStop(0, 'rgba(164, 19, 60, 1.0)');
    g.addColorStop(1, 'rgba(255, 143, 163, 0.85)');
    ctx.fillStyle = g;
  } else if (variant === 3) {
    // 4. The Asymmetric Flutter (Wind-blown)
    ctx.moveTo(-s * 0.2, s * 0.9);
    ctx.bezierCurveTo(s * 0.6, s * 0.8, s * 0.8, 0, s * 0.3, -s * 0.8);
    ctx.bezierCurveTo(0, -s * 0.9, -s * 0.5, -s * 0.8, -s * 0.8, -s * 0.2);
    ctx.bezierCurveTo(-s * 0.9, s * 0.4, -s * 0.5, s * 0.7, -s * 0.2, s * 0.9);
    const g = ctx.createLinearGradient(0, s, 0, -s);
    g.addColorStop(0, 'rgba(128, 15, 47, 1.0)');
    g.addColorStop(0.5, 'rgba(255, 77, 109, 0.95)');
    g.addColorStop(1, 'rgba(255, 179, 198, 0.8)');
    ctx.fillStyle = g;
  } else if (variant === 4) {
    // 5. The Cupped Base (3D bowl illusion)
    ctx.moveTo(0, s * 0.9);
    ctx.bezierCurveTo(s * 1.0, s * 0.3, s * 0.7, -s * 0.5, s * 0.2, -s * 0.8);
    ctx.bezierCurveTo(0, -s * 0.7, -s * 0.2, -s * 0.7, -s * 0.4, -s * 0.8);
    ctx.bezierCurveTo(-s * 0.8, -s * 0.4, -s * 0.9, s * 0.4, 0, s * 0.9);
    const g = ctx.createRadialGradient(0, -s * 0.2, 0, 0, 0, s * 1.2);
    g.addColorStop(0, 'rgba(255, 143, 163, 0.9)'); // Bright center (cupped light)
    g.addColorStop(0.7, 'rgba(201, 24, 74, 0.95)');
    g.addColorStop(1, 'rgba(128, 15, 47, 1.0)');   // Dark edges
    ctx.fillStyle = g;
  } else {
    // 6. The Narrow Drop (Aerodynamic young petal)
    ctx.moveTo(0, s * 1.0);
    ctx.bezierCurveTo(s * 0.4, s * 0.5, s * 0.5, -s * 0.4, s * 0.2, -s * 0.9);
    ctx.bezierCurveTo(0, -s * 1.0, 0, -s * 1.0, -s * 0.2, -s * 0.9);
    ctx.bezierCurveTo(-s * 0.5, -s * 0.4, -s * 0.4, s * 0.5, 0, s * 1.0);
    const g = ctx.createLinearGradient(0, s, 0, -s);
    g.addColorStop(0, 'rgba(164, 19, 60, 1.0)');
    g.addColorStop(1, 'rgba(255, 117, 143, 0.85)');
    ctx.fillStyle = g;
  }
  
  ctx.fill();
  
  // Organic radiating veins
  ctx.beginPath();
  // Center vein
  ctx.moveTo(0, s * 0.8);
  ctx.quadraticCurveTo(s * 0.05, 0, 0, -s * 0.4);
  // Left vein
  ctx.moveTo(-s * 0.05, s * 0.7);
  ctx.quadraticCurveTo(-s * 0.2, 0, -s * 0.3, -s * 0.2);
  // Right vein
  ctx.moveTo(s * 0.05, s * 0.7);
  ctx.quadraticCurveTo(s * 0.2, 0, s * 0.3, -s * 0.2);
  
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
  ctx.lineWidth = s * 0.05;
  ctx.stroke();
}

// ============================================================
// SPRITE CACHE ENGINE (Pre-renders all permutations once)
// ============================================================
const SPRITE_SIZE = 120;
let spriteCache: { petals: HTMLCanvasElement[] } | null = null;

function initSpriteCache() {
  if (spriteCache) return;
  spriteCache = { petals: [] };

  const createCacheCanvas = (drawFn: (ctx: CanvasRenderingContext2D, v: number, s: number) => void, variant: number) => {
    const cvs = document.createElement('canvas');
    cvs.width = SPRITE_SIZE;
    cvs.height = SPRITE_SIZE;
    const ctx = cvs.getContext('2d');
    if (ctx) {
      ctx.translate(SPRITE_SIZE / 2, SPRITE_SIZE / 2);
      drawFn(ctx, variant, SPRITE_SIZE / 3);
    }
    return cvs;
  };

  for (let i = 0; i < 6; i++) spriteCache.petals.push(createCacheCanvas(drawPetal, i));
}

// ============================================================
// PARTICLE CLASS
// ============================================================
class Particle {
  variant = 0;
  layer = 1;
  x = 0; y = 0;
  speedX = 0; speedY = 0;
  baseSpeedY = 0;
  size = 0;
  gravityMod = 1;
  angle = 0; angularSpeed = 0;
  flip = 0; flipSpeed = 0;
  baseOpacity = 1; opacity = 0;
  frameAge = 0;
  active = false;
  cw = 1000; ch = 1000;

  constructor(cw: number, ch: number) { this.cw = cw; this.ch = ch; }

  spawn() {
    this.active = true;
    this.frameAge = 0;
    this.opacity = 0;
    this.layer = rng.int(1, CONFIG.layers);
    
    // Spawn across top and left edges to flow into screen
    if (Math.random() > 0.5) {
        this.x = rng.range(-150, this.cw + 150);
        this.y = -rng.range(40, 180);
    } else {
        this.x = -rng.range(50, 200);
        this.y = rng.range(-50, this.ch * 0.3);
    }

    const depth = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    this.baseOpacity = this.layer === 3 ? 0.45 : this.layer === 2 ? 0.75 : 1;
    this.gravityMod = rng.range(0.85, 1.2);
    this.flip = rng.range(0, Math.PI * 2);

    this.variant = rng.int(0, 5);
    // Increased size by another 50% for high impact
    this.size = rng.range(24, 44) * depth;
    // Slower, more fluttery falling speed
    this.baseSpeedY = rng.range(0.8, 1.6) * depth;
    this.angularSpeed = rng.range(-0.06, 0.06);
    this.flipSpeed = rng.range(0.02, 0.1);

    this.angle = rng.range(0, Math.PI * 2);
    this.speedX = 0;
    this.speedY = this.baseSpeedY;
  }

  update(timeRef: number) {
    if (!this.active) return;

    if (this.frameAge < CONFIG.fadeInFrames) {
      this.frameAge++;
      this.opacity = this.baseOpacity * (this.frameAge / CONFIG.fadeInFrames);
    } else {
      const fadeOutY = this.ch * CONFIG.fadeOutStart;
      if (this.y > fadeOutY) {
        const ratio = 1 - (this.y - fadeOutY) / (this.ch * (1 - CONFIG.fadeOutStart));
        this.opacity = this.baseOpacity * Math.max(0, ratio);
      } else {
        this.opacity = this.baseOpacity;
      }
    }

    const depth = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    const noiseScale = 0.002; 
    const noiseValue = simplex3(this.x * noiseScale, this.y * noiseScale, timeRef);
    const angleOffset = noiseValue * Math.PI;
    const baseWindAngle = Math.PI * 0.25; 
    const flowAngle = baseWindAngle + angleOffset;
    
    // Wind force
    const windMultiplier = 1.8;
    const windForceX = Math.cos(flowAngle) * windMultiplier * depth;
    const windForceY = Math.sin(flowAngle) * windMultiplier * depth;
    
    // Drag and inertia
    this.speedX = this.speedX * 0.96 + windForceX * 0.04;
    const targetSpeedY = this.baseSpeedY * this.gravityMod + Math.max(0, windForceY);
    this.speedY = this.speedY * 0.96 + targetSpeedY * 0.04;

    this.x += this.speedX;
    this.y += this.speedY;
    
    // Fluttering
    this.flip += this.flipSpeed;
    this.angle += this.angularSpeed;

    if (this.y > this.ch + this.size * 2) this.active = false;
    if (this.x < -this.size * 3) this.active = false;
    if (this.x > this.cw + this.size * 3) this.x = -this.size;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active || this.opacity <= 0 || !spriteCache) return;

    const sprite = spriteCache.petals[this.variant];
    if (!sprite) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    // Subtle 3D wobble instead of full barrel rolls so they mostly face the screen
    const cosFlip = Math.cos(this.flip) * 0.35 + 0.65; // Ranges from 0.3 to 1.0
    ctx.scale(cosFlip, 1);

    ctx.globalAlpha = this.opacity;

    const drawW = this.size * 1.5;
    const drawH = this.size * 1.5;
    ctx.drawImage(sprite, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
}

// ============================================================
// REACT COMPONENT
// ============================================================
export default function FallingAnimation({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect user's motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    initSpriteCache();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const density = window.innerWidth >= 1024 ? CONFIG.densityDesktop : window.innerWidth >= 768 ? CONFIG.densityTablet : CONFIG.densityMobile;

    // Use viewport dimensions only — canvas is position:fixed so it always
    // covers exactly what the user sees. No page-height density scaling needed.
    let resizeTimer: ReturnType<typeof setTimeout>;
    const currentDensity = density;
    let pool: Particle[] = [];
    const buckets: Particle[][] = [[], [], [], []];
    const rebucket = (p: Particle) => { buckets[p.layer]?.push(p); };

    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        pool.forEach(p => { p.cw = canvas.width; p.ch = canvas.height; });
      }, 120);
    };

    window.addEventListener('resize', handleResize);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    pool = Array.from({ length: currentDensity }, () => new Particle(canvas.width, canvas.height));
    
    // Pre-warm the animation: spawn all particles immediately, spread across the screen
    pool.forEach(p => {
      p.spawn();
      // Randomize initial positions so they are already falling across the screen
      p.y = Math.random() * canvas.height;
      p.x = Math.random() * canvas.width;
      // Randomize age so they don't all fade out/die at the same time
      p.frameAge = Math.floor(Math.random() * CONFIG.fadeInFrames);
      rebucket(p);
    });

    let lastSpawn = 0;
    let timeRef = 0;
    let rafId = 0;

    const render = (ts: number) => {
      if (ts - lastSpawn > CONFIG.spawnRateMs) {
        const dead = pool.find(p => !p.active);
        if (dead) {
          dead.spawn();
          rebucket(dead);
          lastSpawn = ts;
        }
      }

      timeRef += 0.003;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let layer = 3; layer >= 1; layer--) {
        const bucket = buckets[layer];
        for (let i = bucket.length - 1; i >= 0; i--) {
          const p = bucket[i];
          if (!p.active) { bucket.splice(i, 1); continue; }
          p.update(timeRef);
          p.draw(ctx);
        }
      }

      rafId = requestAnimationFrame(render);
    };

    rafId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
