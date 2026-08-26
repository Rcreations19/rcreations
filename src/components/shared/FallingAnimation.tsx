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

  return 32.0 * (n0 + n1 + n2 + n3); // Returns value between -1 and 1
}

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  densityDesktop: 60, // Boosted density slightly now that it's highly optimized
  densityTablet: 35,
  spawnRateMs: 140,
  ratios: { petals: 0.70, frames: 0.15, boxes: 0.15 },
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
  weighted: (w: { [k: string]: number }) => {
    let sum = 0;
    const r = Math.random();
    for (const k in w) { sum += w[k]; if (r <= sum) return k as 'petals' | 'frames' | 'boxes'; }
    return 'petals';
  },
};

// ============================================================
// DRAW ROUTINES (Called ONCE per variant during caching)
// ============================================================
function drawPetal(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  ctx.beginPath();
  if (variant === 0) {
    ctx.moveTo(0, size * 0.5);
    ctx.bezierCurveTo(size * 0.5, size * 0.5, size, size * 0.2, size * 0.5, -size * 0.5);
    ctx.bezierCurveTo(0, -size * 0.2, -size * 0.5, size * 0.2, 0, size * 0.5);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    g.addColorStop(0, '#e63946'); g.addColorStop(1, '#9b2226');
    ctx.fillStyle = g;
  } else if (variant === 1) {
    ctx.moveTo(0, size * 0.8);
    ctx.bezierCurveTo(size * 0.3, size * 0.4, size * 0.2, -size * 0.8, 0, -size * 0.9);
    ctx.bezierCurveTo(-size * 0.4, -size * 0.8, -size * 0.6, size * 0.2, 0, size * 0.8);
    ctx.fillStyle = '#c1121f';
  } else if (variant === 2) {
    ctx.moveTo(0, size * 0.6);
    ctx.quadraticCurveTo(size * 0.8, size * 0.2, size * 0.4, -size * 0.6);
    ctx.quadraticCurveTo(0, -size * 0.4, -size * 0.3, -size * 0.6);
    ctx.quadraticCurveTo(-size * 0.8, size * 0.2, 0, size * 0.6);
    const g = ctx.createLinearGradient(-size, -size, size, size);
    g.addColorStop(0, '#ff4d6d'); g.addColorStop(1, '#a81c2b');
    ctx.fillStyle = g;
  } else if (variant === 3) {
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#da1e37';
  } else if (variant === 4) {
    ctx.moveTo(0, size * 0.5);
    ctx.bezierCurveTo(size * 0.6, size * 0.4, size * 0.8, -size * 0.4, 0, -size * 0.6);
    ctx.bezierCurveTo(-size * 0.8, -size * 0.4, -size * 0.6, size * 0.4, 0, size * 0.5);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.8);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#ffccd5'); g.addColorStop(1, '#ff8fa3');
    ctx.fillStyle = g;
  } else {
    ctx.moveTo(0, size);
    ctx.quadraticCurveTo(size * 0.5, 0, 0, -size);
    ctx.quadraticCurveTo(-size * 0.5, 0, 0, size);
    ctx.fillStyle = '#590d22';
  }
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(0, size * 0.4); ctx.lineTo(0, -size * 0.2);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawFrame(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  const w = size * 1.5, h = size * 1.95;
  if (variant === 0) {
    const g = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
    g.addColorStop(0, '#bf953f'); g.addColorStop(0.5, '#fcf6ba'); g.addColorStop(1, '#b38728');
    ctx.fillStyle = g;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(-w / 2 + w * 0.15, -h / 2 + w * 0.15, w * 0.7, h - w * 0.3);
  } else if (variant === 1) {
    ctx.fillStyle = '#111'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-w / 2 + w * 0.1, -h / 2 + w * 0.1, w * 0.8, h - w * 0.2);
  } else if (variant === 2) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#222';
    ctx.fillRect(-w / 2 + w * 0.1, -h / 2 + w * 0.1, w * 0.8, w * 0.9);
  } else {
    ctx.fillStyle = '#f8f9fa'; ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(-w / 2 + w * 0.15, -h / 2 + w * 0.15, w * 0.7, h - w * 0.3);
  }
  const edgeG = ctx.createLinearGradient(w / 2 - w * 0.3, 0, w / 2, 0);
  edgeG.addColorStop(0, 'rgba(0,0,0,0)'); edgeG.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = edgeG;
  ctx.fillRect(-w / 2, -h / 2, w, h);
}

function drawBox(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  const w = size * 1.5, h = size * 1.2;
  const colors = [
    { box: '#38C8CC', ribbon: '#ffffff', lid: '#2eb3b8' },
    { box: '#01063B', ribbon: '#bf953f', lid: '#0a1050' },
    { box: '#ff4d6d', ribbon: '#ffffff', lid: '#e63946' },
    { box: '#f8f9fa', ribbon: '#01063B', lid: '#e9ecef' },
  ];
  const c = colors[variant % colors.length];
  ctx.fillStyle = c.box; ctx.fillRect(-w / 2, -h / 2, w, h);
  const shade = ctx.createLinearGradient(w / 2 - w * 0.25, 0, w / 2, 0);
  shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = shade; ctx.fillRect(-w / 2, -h / 2, w, h);
  ctx.fillStyle = c.ribbon;
  ctx.fillRect(-w * 0.1, -h / 2, w * 0.2, h);
  if (variant % 2 === 0) ctx.fillRect(-w / 2, -h * 0.1, w, h * 0.2);
  const lidH = h * 0.3, lidW = w * 1.05;
  ctx.fillStyle = c.lid; ctx.fillRect(-lidW / 2, -h / 2 - lidH * 0.2, lidW, lidH);
  ctx.fillStyle = c.ribbon; ctx.fillRect(-w * 0.1, -h / 2 - lidH * 0.2, w * 0.2, lidH);
  if (variant !== 1) {
    ctx.beginPath();
    ctx.ellipse(-w * 0.15, -h / 2 - lidH * 0.2, w * 0.15, w * 0.09, Math.PI / 4, 0, Math.PI * 2);
    ctx.ellipse(w * 0.15, -h / 2 - lidH * 0.2, w * 0.15, w * 0.09, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fillStyle = c.ribbon; ctx.fill();
  }
}

// ============================================================
// SPRITE CACHE ENGINE (Pre-renders all permutations once)
// ============================================================
const SPRITE_SIZE = 160;
let spriteCache: { petals: HTMLCanvasElement[], frames: HTMLCanvasElement[], boxes: HTMLCanvasElement[] } | null = null;

function initSpriteCache() {
  if (spriteCache) return;
  spriteCache = { petals: [], frames: [], boxes: [] };

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
  for (let i = 0; i < 4; i++) spriteCache.frames.push(createCacheCanvas(drawFrame, i));
  for (let i = 0; i < 4; i++) spriteCache.boxes.push(createCacheCanvas(drawBox, i));
}

// ============================================================
// PARTICLE CLASS
// ============================================================
class Particle {
  type: 'petals' | 'frames' | 'boxes' = 'petals';
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
    this.type = rng.weighted(CONFIG.ratios) as 'petals' | 'frames' | 'boxes';
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

    if (this.type === 'petals') {
      this.variant = rng.int(0, 5);
      this.size = rng.range(24, 38) * depth;
      this.baseSpeedY = rng.range(1.2, 2.2) * depth;
      this.angularSpeed = rng.range(-0.04, 0.04);
      this.flipSpeed = rng.range(0.02, 0.08); // Fast flutter
    } else if (this.type === 'frames') {
      this.variant = rng.int(0, 3);
      this.size = rng.range(40, 75) * depth;
      this.baseSpeedY = rng.range(3.5, 6.0) * depth; // Heavy
      this.angularSpeed = rng.range(-0.015, 0.015);
      this.flipSpeed = rng.range(0.005, 0.02); // Slow tumble
    } else {
      this.variant = rng.int(0, 3);
      this.size = rng.range(35, 60) * depth;
      this.baseSpeedY = rng.range(2.8, 4.8) * depth; // Medium
      this.angularSpeed = rng.range(-0.02, 0.02);
      this.flipSpeed = rng.range(0.008, 0.025);
    }

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

    // ----------------------------------------------------
    // SIMPLEX NOISE FLOW FIELD PHYSICS
    // ----------------------------------------------------
    const depth = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    
    // Scale dictates how "zoomed in" the noise map is.
    // Lower = sweeping, gentle curves. Higher = twitchy, tight swirls.
    const noiseScale = 0.002; 
    
    // Sample 3D noise (x, y, time) to get a value between -1 and 1
    // We multiply by Math.PI to convert it into a rotational offset (-180deg to +180deg)
    const noiseValue = simplex3(this.x * noiseScale, this.y * noiseScale, timeRef);
    const angleOffset = noiseValue * Math.PI;
    
    // Base wind blows gently to the bottom right
    const baseWindAngle = Math.PI * 0.25; 
    const flowAngle = baseWindAngle + angleOffset;
    
    // Aerodynamics (how much the object is caught in the wind)
    // Petals catch a lot of wind, frames cut straight through
    const windMultiplier = this.type === 'petals' ? 3.0 : 0.5;
    
    // Calculate the force vector applied by the flow field
    const windForceX = Math.cos(flowAngle) * windMultiplier * depth;
    const windForceY = Math.sin(flowAngle) * windMultiplier * depth;
    
    // Apply soft drag to velocity (inertia)
    this.speedX = this.speedX * 0.96 + windForceX * 0.04;
    // Y speed is a mix of gravity and downward wind pressure
    const targetSpeedY = this.baseSpeedY * this.gravityMod + Math.max(0, windForceY);
    this.speedY = this.speedY * 0.96 + targetSpeedY * 0.04;

    this.x += this.speedX;
    this.y += this.speedY;
    
    // 3D Tumbling
    this.flip += this.flipSpeed;
    this.angle += this.angularSpeed;

    // Boundary wrapping and cleanup
    if (this.y > this.ch + this.size * 2) this.active = false;
    if (this.x < -this.size * 3) this.active = false; // let it die if it blows too far left
    if (this.x > this.cw + this.size * 3) this.x = -this.size; // wrap around right side
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active || this.opacity <= 0 || !spriteCache) return;

    const sprite = spriteCache[this.type][this.variant];
    if (!sprite) return;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    const cosFlip = Math.cos(this.flip);
    ctx.scale(cosFlip, 1);

    ctx.globalAlpha = this.opacity;
    if (cosFlip < 0 && this.type !== 'petals') {
      ctx.filter = 'brightness(0.75)';
    }

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
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    initSpriteCache();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const density = window.innerWidth >= 1024 ? CONFIG.densityDesktop : CONFIG.densityTablet;

    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth < 768) {
          canvas.style.display = 'none';
          return;
        }
        canvas.style.display = '';
        canvas.width = document.documentElement.clientWidth;
        canvas.height = window.innerHeight;
        pool.forEach(p => { p.cw = canvas.width; p.ch = canvas.height; });
      }, 120);
    };

    window.addEventListener('resize', handleResize);
    canvas.width = document.documentElement.clientWidth;
    canvas.height = window.innerHeight;

    const pool: Particle[] = Array.from({ length: density }, () => new Particle(canvas.width, canvas.height));
    const buckets: Particle[][] = [[], [], [], []];
    const rebucket = (p: Particle) => { buckets[p.layer]?.push(p); };
    pool.forEach(rebucket);

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

      timeRef += 0.003; // Slow time progression for the Simplex Flow Field

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
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      aria-hidden="true"
    />
  );
}
