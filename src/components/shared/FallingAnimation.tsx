'use client';

import React, { useEffect, useRef } from 'react';

// ============================================================
// CONFIGURATION
// ============================================================
const CONFIG = {
  densityDesktop: 50,   // Max active particles on desktop
  densityTablet: 28,    // Max active particles on tablet (768–1023px)
  spawnRateMs: 180,     // ms between spawns
  ratios: { petals: 0.70, frames: 0.15, boxes: 0.15 },
  physics: {
    // Two overlapping sine waves create organic, non-mechanical gusting
    wind1Base: 0.25, wind1Freq: 0.0008,
    wind2Base: 0.10, wind2Freq: 0.0023,
    gravityMin: 0.9,
    gravityMax: 3.2,
  },
  layers: 3,
  fadeInFrames: 45,   // Frames to ramp opacity from 0 → target on spawn
  fadeOutStart: 0.88, // Start fading at 88% of canvas height
};

// ============================================================
// UTILS
// ============================================================
const rng = {
  range: (min: number, max: number) => Math.random() * (max - min) + min,
  int:   (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  weighted: (w: { [k: string]: number }) => {
    let sum = 0;
    const r = Math.random();
    for (const k in w) { sum += w[k]; if (r <= sum) return k as 'petals' | 'frames' | 'boxes'; }
    return 'petals';
  },
};

// ============================================================
// DRAW — Petals
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
  // Vein detail (no shadow cost)
  ctx.beginPath();
  ctx.moveTo(0, size * 0.4); ctx.lineTo(0, -size * 0.2);
  ctx.strokeStyle = 'rgba(255,255,255,0.12)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

// ============================================================
// DRAW — Frames (no shadow — use stroke for depth instead)
// ============================================================
function drawFrame(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  const w = size, h = size * 1.3;
  if (variant === 0) {
    const g = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
    g.addColorStop(0, '#bf953f'); g.addColorStop(0.5, '#fcf6ba'); g.addColorStop(1, '#b38728');
    ctx.fillStyle = g;
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(-w/2 + w*0.15, -h/2 + w*0.15, w*0.7, h - w*0.3);
  } else if (variant === 1) {
    ctx.fillStyle = '#111'; ctx.fillRect(-w/2, -h/2, w, h);
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-w/2 + w*0.1, -h/2 + w*0.1, w*0.8, h - w*0.2);
  } else if (variant === 2) {
    ctx.fillStyle = '#ffffff'; ctx.fillRect(-w/2, -h/2, w, h);
    ctx.fillStyle = '#222';
    ctx.fillRect(-w/2 + w*0.1, -h/2 + w*0.1, w*0.8, w*0.9);
  } else {
    ctx.fillStyle = '#f8f9fa'; ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = 'rgba(0,0,0,0.12)'; ctx.lineWidth = 1.5;
    ctx.strokeRect(-w/2, -h/2, w, h);
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(-w/2 + w*0.15, -h/2 + w*0.15, w*0.7, h - w*0.3);
  }
  // Subtle right-edge darkening for depth (replaces costly shadow)
  const edgeG = ctx.createLinearGradient(w/2 - w*0.3, 0, w/2, 0);
  edgeG.addColorStop(0, 'rgba(0,0,0,0)'); edgeG.addColorStop(1, 'rgba(0,0,0,0.18)');
  ctx.fillStyle = edgeG;
  ctx.fillRect(-w/2, -h/2, w, h);
}

// ============================================================
// DRAW — Gift Boxes (no shadow)
// ============================================================
function drawBox(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  const w = size, h = size * 0.8;
  const colors = [
    { box: '#38C8CC', ribbon: '#ffffff', lid: '#2eb3b8' },
    { box: '#0a0e27', ribbon: '#bf953f', lid: '#121840' },
    { box: '#ff4d6d', ribbon: '#ffffff', lid: '#e63946' },
    { box: '#f8f9fa', ribbon: '#0a0e27', lid: '#e9ecef' },
  ];
  const c = colors[variant % colors.length];
  ctx.fillStyle = c.box; ctx.fillRect(-w/2, -h/2, w, h);
  // Depth shade (replaces shadow)
  const shade = ctx.createLinearGradient(w/2 - w*0.25, 0, w/2, 0);
  shade.addColorStop(0, 'rgba(0,0,0,0)'); shade.addColorStop(1, 'rgba(0,0,0,0.15)');
  ctx.fillStyle = shade; ctx.fillRect(-w/2, -h/2, w, h);
  // Ribbons
  ctx.fillStyle = c.ribbon;
  ctx.fillRect(-w*0.1, -h/2, w*0.2, h);
  if (variant % 2 === 0) ctx.fillRect(-w/2, -h*0.1, w, h*0.2);
  // Lid
  const lidH = h * 0.3, lidW = w * 1.05;
  ctx.fillStyle = c.lid; ctx.fillRect(-lidW/2, -h/2 - lidH*0.2, lidW, lidH);
  ctx.fillStyle = c.ribbon; ctx.fillRect(-w*0.1, -h/2 - lidH*0.2, w*0.2, lidH);
  // Bow
  if (variant !== 1) {
    ctx.beginPath();
    ctx.ellipse(-w*0.15, -h/2 - lidH*0.2, w*0.15, w*0.09, Math.PI/4, 0, Math.PI*2);
    ctx.ellipse( w*0.15, -h/2 - lidH*0.2, w*0.15, w*0.09, -Math.PI/4, 0, Math.PI*2);
    ctx.fillStyle = c.ribbon; ctx.fill();
  }
}

// ============================================================
// PARTICLE CLASS
// ============================================================
class Particle {
  type: 'petals' | 'frames' | 'boxes' = 'petals';
  variant = 0;
  layer = 1;
  x = 0; y = 0;
  size = 0;
  speedY = 0;
  gravityMod = 1; // per-particle gravity variance
  angle = 0;
  angularSpeed = 0;
  driftPhase = 0; driftSpeed = 0; driftAmp = 0;
  baseOpacity = 1;
  opacity = 0; // starts at 0 for fade-in
  frameAge = 0; // counts up for fade-in
  active = false;
  cw = 1000; ch = 1000;

  constructor(cw: number, ch: number) { this.cw = cw; this.ch = ch; }

  spawn() {
    this.active = true;
    this.frameAge = 0;
    this.opacity = 0;
    this.type = rng.weighted(CONFIG.ratios) as 'petals' | 'frames' | 'boxes';
    this.layer = rng.int(1, CONFIG.layers);
    this.x = rng.range(-50, this.cw + 50);
    this.y = -rng.range(40, 180);

    const depth = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    this.baseOpacity = this.layer === 3 ? 0.45 : this.layer === 2 ? 0.75 : 1;
    this.gravityMod = rng.range(0.85, 1.2);

    if (this.type === 'petals') {
      this.variant = rng.int(0, 5);
      this.size = rng.range(14, 24) * depth;
      this.speedY = rng.range(0.4, 1.4) * depth;
      // Wider angular speed variance — most slow, occasional fast spin
      this.angularSpeed = (Math.random() < 0.15 ? rng.range(0.05, 0.09) : rng.range(0.008, 0.04))
        * (Math.random() < 0.5 ? 1 : -1);
      this.driftAmp = rng.range(8, 28) * depth;
      this.driftSpeed = rng.range(0.018, 0.048);
    } else if (this.type === 'frames') {
      this.variant = rng.int(0, 3);
      this.size = rng.range(35, 70) * depth;
      this.speedY = rng.range(1.4, 3.0) * depth; // Slowed down vs original
      this.angularSpeed = rng.range(0.003, 0.012) * (Math.random() < 0.5 ? 1 : -1);
      this.driftAmp = rng.range(2, 6) * depth;
      this.driftSpeed = rng.range(0.008, 0.018);
    } else {
      this.variant = rng.int(0, 3);
      this.size = rng.range(28, 55) * depth;
      this.speedY = rng.range(1.5, 3.0) * depth;
      this.angularSpeed = rng.range(0.005, 0.022) * (Math.random() < 0.5 ? 1 : -1);
      this.driftAmp = rng.range(3, 9) * depth;
      this.driftSpeed = rng.range(0.01, 0.028);
    }

    this.angle = rng.range(0, Math.PI * 2);
    this.driftPhase = rng.range(0, Math.PI * 2);
  }

  update(wind: number) {
    if (!this.active) return;

    // Fade-in
    if (this.frameAge < CONFIG.fadeInFrames) {
      this.frameAge++;
      this.opacity = this.baseOpacity * (this.frameAge / CONFIG.fadeInFrames);
    } else {
      // Fade-out near bottom
      const fadeOutY = this.ch * CONFIG.fadeOutStart;
      if (this.y > fadeOutY) {
        const ratio = 1 - (this.y - fadeOutY) / (this.ch * (1 - CONFIG.fadeOutStart));
        this.opacity = this.baseOpacity * Math.max(0, ratio);
      } else {
        this.opacity = this.baseOpacity;
      }
    }

    const depth = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    this.y += this.speedY * this.gravityMod;
    this.driftPhase += this.driftSpeed;
    const localDrift = Math.sin(this.driftPhase) * this.driftAmp;
    this.x += (wind * depth) + (localDrift * 0.05);
    this.angle += this.angularSpeed;

    if (this.y > this.ch + this.size * 2) this.active = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active || this.opacity <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    if (this.type === 'petals') drawPetal(ctx, this.variant, this.size);
    else if (this.type === 'frames') drawFrame(ctx, this.variant, this.size);
    else drawBox(ctx, this.variant, this.size);
    ctx.restore();
  }
}

// ============================================================
// REACT COMPONENT
// ============================================================
export default function FallingAnimation({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // Respect prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Skip on mobile (< 768px)
    if (window.innerWidth < 768) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Density based on viewport
    const density = window.innerWidth >= 1024 ? CONFIG.densityDesktop : CONFIG.densityTablet;

    // Resize handler (single, throttled)
    let resizeTimer: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (window.innerWidth < 768) {
          // Hide if resized to mobile
          canvas.style.display = 'none';
          return;
        }
        canvas.style.display = '';
        canvas.width  = document.documentElement.clientWidth;
        canvas.height = window.innerHeight;
        pool.forEach(p => { p.cw = canvas.width; p.ch = canvas.height; });
      }, 120);
    };
    window.addEventListener('resize', handleResize);
    // Initial size
    canvas.width  = document.documentElement.clientWidth;
    canvas.height = window.innerHeight;

    // Pre-bucketed layers (avoids Array.sort() every frame)
    const pool: Particle[] = Array.from({ length: density }, () => new Particle(canvas.width, canvas.height));
    // Layer buckets: index 0 = unused, 1 = front, 2 = mid, 3 = back
    const buckets: Particle[][] = [[], [], [], []];
    const rebucket = (p: Particle) => { buckets[p.layer]?.push(p); };
    pool.forEach(rebucket);

    let lastSpawn = 0;
    let timeRef = 0;
    let rafId = 0;

    const render = (ts: number) => {
      // Spawn
      if (ts - lastSpawn > CONFIG.spawnRateMs) {
        const dead = pool.find(p => !p.active);
        if (dead) {
          dead.spawn();
          rebucket(dead);
          lastSpawn = ts;
        }
      }

      // Organic wind: two overlapping sines
      timeRef += 0.016; // ~60fps tick
      const wind =
        CONFIG.physics.wind1Base * Math.sin(timeRef * CONFIG.physics.wind1Freq * 1000) +
        CONFIG.physics.wind2Base * Math.sin(timeRef * CONFIG.physics.wind2Freq * 1000);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw back → front (painters algorithm, no sort needed)
      for (let layer = 3; layer >= 1; layer--) {
        const bucket = buckets[layer];
        for (let i = bucket.length - 1; i >= 0; i--) {
          const p = bucket[i];
          if (!p.active) { bucket.splice(i, 1); continue; }
          p.update(wind);
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
