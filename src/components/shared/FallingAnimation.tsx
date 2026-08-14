'use client';

import React, { useEffect, useRef } from 'react';

// ==========================================
// 1. CONFIGURATION
// ==========================================
export const FALLING_CONFIG = {
  density: 80, // Maximum active particles on screen
  spawnRateMs: 150, // Milliseconds between spawning a new particle
  ratios: {
    petals: 0.70, // 70% petals
    frames: 0.15, // 15% photo frames
    boxes: 0.15,  // 15% gift boxes
  },
  physics: {
    windBase: 0.3,
    windVariance: 1.5,
    windSpeed: 0.001, // How fast the wind sine wave changes
    gravityMin: 1.0,
    gravityMax: 3.5,
  },
  layers: 3, // Depth layers for parallax (1 = closest, 3 = farthest)
};

// ==========================================
// 2. MATH & UTILS
// ==========================================
const MathUtils = {
  randomRange: (min: number, max: number) => Math.random() * (max - min) + min,
  randomInt: (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min,
  chooseWeighted: (weights: { [key: string]: number }) => {
    let sum = 0;
    const r = Math.random();
    for (const key in weights) {
      sum += weights[key];
      if (r <= sum) return key as 'petal' | 'frame' | 'box';
    }
    return 'petal';
  }
};

// ==========================================
// 3. DRAWING FUNCTIONS (CANVAS 2D)
// ==========================================
function drawPetal(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  ctx.beginPath();
  
  // 6 distinct rose petal variants
  if (variant === 0) {
    // Standard Heart-ish Petal
    ctx.moveTo(0, size * 0.5);
    ctx.bezierCurveTo(size * 0.5, size * 0.5, size, size * 0.2, size * 0.5, -size * 0.5);
    ctx.bezierCurveTo(0, -size * 0.2, -size * 0.5, size * 0.2, 0, size * 0.5);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    grad.addColorStop(0, '#e63946');
    grad.addColorStop(1, '#9b2226');
    ctx.fillStyle = grad;
  } else if (variant === 1) {
    // Elongated Curve
    ctx.moveTo(0, size * 0.8);
    ctx.bezierCurveTo(size * 0.3, size * 0.4, size * 0.2, -size * 0.8, 0, -size * 0.9);
    ctx.bezierCurveTo(-size * 0.4, -size * 0.8, -size * 0.6, size * 0.2, 0, size * 0.8);
    ctx.fillStyle = '#c1121f';
  } else if (variant === 2) {
    // Curled Edge Petal
    ctx.moveTo(0, size * 0.6);
    ctx.quadraticCurveTo(size * 0.8, size * 0.2, size * 0.4, -size * 0.6);
    ctx.quadraticCurveTo(0, -size * 0.4, -size * 0.3, -size * 0.6);
    ctx.quadraticCurveTo(-size * 0.8, size * 0.2, 0, size * 0.6);
    const grad = ctx.createLinearGradient(-size, -size, size, size);
    grad.addColorStop(0, '#ff4d6d');
    grad.addColorStop(1, '#a81c2b');
    ctx.fillStyle = grad;
  } else if (variant === 3) {
    // Small Round Petal
    ctx.arc(0, 0, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = '#da1e37';
  } else if (variant === 4) {
    // White with Pink Edge
    ctx.moveTo(0, size * 0.5);
    ctx.bezierCurveTo(size * 0.6, size * 0.4, size * 0.8, -size * 0.4, 0, -size * 0.6);
    ctx.bezierCurveTo(-size * 0.8, -size * 0.4, -size * 0.6, size * 0.4, 0, size * 0.5);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, size * 0.8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.7, '#ffccd5');
    grad.addColorStop(1, '#ff8fa3');
    ctx.fillStyle = grad;
  } else {
    // Dark Burgundy Leaf
    ctx.moveTo(0, size);
    ctx.quadraticCurveTo(size * 0.5, 0, 0, -size);
    ctx.quadraticCurveTo(-size * 0.5, 0, 0, size);
    ctx.fillStyle = '#590d22';
  }

  ctx.fill();
  
  // Subtle vein line for extra detail
  ctx.beginPath();
  ctx.moveTo(0, size * 0.4);
  ctx.lineTo(0, -size * 0.2);
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawFrame(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  const w = size;
  const h = size * 1.3; // Rectangular frames
  
  // Base drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = size * 0.2;
  ctx.shadowOffsetY = size * 0.1;

  if (variant === 0) {
    // Gold Ornate
    const grad = ctx.createLinearGradient(-w/2, -h/2, w/2, h/2);
    grad.addColorStop(0, '#bf953f');
    grad.addColorStop(0.5, '#fcf6ba');
    grad.addColorStop(1, '#b38728');
    ctx.fillStyle = grad;
    ctx.fillRect(-w/2, -h/2, w, h);
    // Inner Photo Placeholder
    ctx.fillStyle = '#e5e5e5';
    ctx.fillRect(-w/2 + w*0.15, -h/2 + w*0.15, w * 0.7, h - w*0.3);
  } else if (variant === 1) {
    // Minimal Black
    ctx.fillStyle = '#111';
    ctx.fillRect(-w/2, -h/2, w, h);
    // Inner Photo Placeholder
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(-w/2 + w*0.1, -h/2 + w*0.1, w * 0.8, h - w*0.2);
  } else if (variant === 2) {
    // Polaroid
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-w/2, -h/2, w, h);
    // Inner Photo Placeholder (top heavy)
    ctx.fillStyle = '#222'; // Dark photo area
    ctx.fillRect(-w/2 + w*0.1, -h/2 + w*0.1, w * 0.8, w * 0.9);
  } else {
    // White Wood
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(-w/2, -h/2, w, h);
    ctx.strokeStyle = '#eaeaea';
    ctx.lineWidth = 2;
    ctx.strokeRect(-w/2, -h/2, w, h);
    // Inner
    ctx.fillStyle = '#e9ecef';
    ctx.fillRect(-w/2 + w*0.15, -h/2 + w*0.15, w * 0.7, h - w*0.3);
  }
  
  // Clear shadow after drawing base
  ctx.shadowColor = 'transparent';
}

function drawBox(ctx: CanvasRenderingContext2D, variant: number, size: number) {
  const w = size;
  const h = size * 0.8;
  
  // Colors based on variant
  const colors = [
    { box: '#38C8CC', ribbon: '#ffffff', lid: '#2eb3b8' },
    { box: '#0a0e27', ribbon: '#bf953f', lid: '#121840' },
    { box: '#ff4d6d', ribbon: '#ffffff', lid: '#e63946' },
    { box: '#f8f9fa', ribbon: '#0a0e27', lid: '#e9ecef' }
  ];
  const c = colors[variant % colors.length];

  // Drop shadow
  ctx.shadowColor = 'rgba(0,0,0,0.2)';
  ctx.shadowBlur = size * 0.2;
  ctx.shadowOffsetY = size * 0.15;

  // Box Main Body (Front face)
  ctx.fillStyle = c.box;
  ctx.fillRect(-w/2, -h/2, w, h);
  
  ctx.shadowColor = 'transparent'; // Turn off shadow for internal details

  // Shading / fake 3D volume (darken right edge)
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(w/2 - w*0.2, -h/2, w*0.2, h);

  // Vertical Ribbon
  ctx.fillStyle = c.ribbon;
  ctx.fillRect(-w*0.1, -h/2, w*0.2, h);

  // Horizontal Ribbon
  if (variant % 2 === 0) { // Some have cross ribbons
    ctx.fillRect(-w/2, -h*0.1, w, h*0.2);
  }

  // Box Lid (Slightly wider)
  ctx.fillStyle = c.lid;
  const lidH = h * 0.3;
  const lidW = w * 1.05;
  
  // Lid shadow onto the box
  ctx.shadowColor = 'rgba(0,0,0,0.3)';
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 4;
  ctx.fillRect(-lidW/2, -h/2 - lidH*0.2, lidW, lidH);
  ctx.shadowColor = 'transparent';

  // Lid ribbon
  ctx.fillStyle = c.ribbon;
  ctx.fillRect(-w*0.1, -h/2 - lidH*0.2, w*0.2, lidH);

  // Simple Bow (two loops)
  if (variant !== 1) {
    ctx.beginPath();
    ctx.ellipse(-w*0.15, -h/2 - lidH*0.2, w*0.15, w*0.1, Math.PI/4, 0, Math.PI*2);
    ctx.ellipse(w*0.15, -h/2 - lidH*0.2, w*0.15, w*0.1, -Math.PI/4, 0, Math.PI*2);
    ctx.fillStyle = c.ribbon;
    ctx.fill();
  }
}

// ==========================================
// 4. PARTICLE CLASS
// ==========================================
class Particle {
  type: 'petal' | 'frame' | 'box';
  variant: number;
  layer: number; // 1 (front) to 3 (back)
  
  x: number = 0;
  y: number = 0;
  
  size: number = 0;
  baseSize: number = 0;
  
  speedY: number = 0;
  speedX: number = 0;
  
  angle: number = 0;
  angularSpeed: number = 0;
  
  driftPhase: number = 0;
  driftSpeed: number = 0;
  driftAmp: number = 0;
  
  opacity: number = 1;
  active: boolean = false;
  
  canvasWidth: number = 1000;
  canvasHeight: number = 1000;

  constructor(cw: number, ch: number) {
    this.type = 'petal';
    this.variant = 0;
    this.layer = 1;
    this.canvasWidth = cw;
    this.canvasHeight = ch;
  }

  spawn() {
    this.active = true;
    this.type = MathUtils.chooseWeighted(FALLING_CONFIG.ratios);
    this.layer = MathUtils.randomInt(1, FALLING_CONFIG.layers); // Parallax depth
    
    // Position
    this.x = MathUtils.randomRange(-50, this.canvasWidth + 50);
    this.y = -MathUtils.randomRange(50, 200); // Spawn above screen
    
    // Depth scaling (Layer 1 = 100%, Layer 2 = 60%, Layer 3 = 35%)
    const depthScale = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    
    // Type specific configs
    if (this.type === 'petal') {
      this.variant = MathUtils.randomInt(0, 5);
      this.baseSize = MathUtils.randomRange(15, 25);
      this.speedY = MathUtils.randomRange(0.5, 1.5) * depthScale;
      this.angularSpeed = MathUtils.randomRange(-0.05, 0.05);
      this.driftAmp = MathUtils.randomRange(10, 30) * depthScale; // High flutter
      this.driftSpeed = MathUtils.randomRange(0.02, 0.05);
    } else if (this.type === 'frame') {
      this.variant = MathUtils.randomInt(0, 3);
      this.baseSize = MathUtils.randomRange(40, 80);
      this.speedY = MathUtils.randomRange(2.0, 4.0) * depthScale; // Heavier
      this.angularSpeed = MathUtils.randomRange(-0.01, 0.01); // Slow tumble
      this.driftAmp = MathUtils.randomRange(2, 5) * depthScale; // Low flutter
      this.driftSpeed = MathUtils.randomRange(0.01, 0.02);
    } else { // box
      this.variant = MathUtils.randomInt(0, 3);
      this.baseSize = MathUtils.randomRange(30, 60);
      this.speedY = MathUtils.randomRange(1.8, 3.5) * depthScale; // Heavier
      this.angularSpeed = MathUtils.randomRange(-0.02, 0.02);
      this.driftAmp = MathUtils.randomRange(3, 8) * depthScale;
      this.driftSpeed = MathUtils.randomRange(0.01, 0.03);
    }
    
    this.size = this.baseSize * depthScale;
    this.angle = MathUtils.randomRange(0, Math.PI * 2);
    this.driftPhase = MathUtils.randomRange(0, Math.PI * 2);
    this.opacity = this.layer === 3 ? 0.5 : this.layer === 2 ? 0.8 : 1; // Fade back layers
  }

  update(globalWind: number, gravityMod: number) {
    if (!this.active) return;
    
    // Physics
    this.y += this.speedY * gravityMod;
    
    // Flutter/Drift combines global wind + local sine wave
    this.driftPhase += this.driftSpeed;
    const localDrift = Math.sin(this.driftPhase) * this.driftAmp;
    
    // Apply depth scaling to wind so front items drift faster
    const depthScale = this.layer === 1 ? 1 : this.layer === 2 ? 0.6 : 0.35;
    this.x += (globalWind * depthScale) + (localDrift * 0.05);
    
    // Rotation
    this.angle += this.angularSpeed;

    // Reset if off screen bottom
    if (this.y > this.canvasHeight + this.size * 2) {
      this.active = false;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (!this.active) return;
    
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.opacity;
    
    // Simple blur for background layer (performance heavy if overused, using globalAlpha mostly)
    // If you want real blur: ctx.filter = this.layer === 3 ? 'blur(3px)' : 'none';
    
    if (this.type === 'petal') {
      drawPetal(ctx, this.variant, this.size);
    } else if (this.type === 'frame') {
      drawFrame(ctx, this.variant, this.size);
    } else {
      drawBox(ctx, this.variant, this.size);
    }
    
    ctx.restore();
  }
}

// ==========================================
// 5. REACT COMPONENT
// ==========================================
export default function FallingAnimation({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poolRef = useRef<Particle[]>([]);
  const animationFrameRef = useRef<number>(0);
  const lastSpawnRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  const [isMobile, setIsMobile] = useState(true);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle Resize
    const handleResize = () => {
      canvas.width = document.documentElement.clientWidth;
      canvas.height = window.innerHeight;
      // Update canvas bounds in existing pool
      poolRef.current.forEach(p => {
        p.canvasWidth = canvas.width;
        p.canvasHeight = canvas.height;
      });
    };
    
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial sizing

    // Initialize Object Pool
    poolRef.current = Array.from({ length: FALLING_CONFIG.density }, () => new Particle(canvas.width, canvas.height));

    // Render Loop
    const render = (timestamp: number) => {
      // Delta time calculation for spawning
      if (!lastSpawnRef.current) lastSpawnRef.current = timestamp;
      const elapsed = timestamp - lastSpawnRef.current;
      
      // Spawn new particles from pool
      if (elapsed > FALLING_CONFIG.spawnRateMs) {
        const deadParticle = poolRef.current.find(p => !p.active);
        if (deadParticle) {
          deadParticle.spawn();
          lastSpawnRef.current = timestamp;
        }
      }

      // Calculate Global Wind (Sine wave slowly shifting over time)
      timeRef.current += FALLING_CONFIG.physics.windSpeed;
      const globalWind = FALLING_CONFIG.physics.windBase + Math.sin(timeRef.current) * FALLING_CONFIG.physics.windVariance;
      
      // Clear Canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Sort pool by layer to draw background items first (painters algorithm)
      // Since it's a fixed pool, we can just filter or sort. Sorting 60 items is fast enough.
      const activeParticles = poolRef.current.filter(p => p.active);
      activeParticles.sort((a, b) => b.layer - a.layer); // layer 3 (back) drawn first

      // Update and Draw
      activeParticles.forEach(p => {
        p.update(globalWind, 1.0); // 1.0 = normal gravity modifier
        p.draw(ctx);
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className={`fixed inset-0 pointer-events-none z-50 ${className}`}
      aria-hidden="true"
    />
  );
}
