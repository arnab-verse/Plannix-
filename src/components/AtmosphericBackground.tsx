/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { AppTheme } from '../types';

interface AtmosphericBackgroundProps {
  theme: AppTheme;
}

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  opacitySpeed: number;
  color: string;
  wobble?: number;
  wobbleSpeed?: number;
  rotation?: number;
  rotationSpeed?: number;
  hasFlare?: boolean;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  color: string;
  active: boolean;
}

export const AtmosphericBackground = React.memo<AtmosphericBackgroundProps>(({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    let animationFrameId: number;
    let isRunning = true;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimeout) clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (!canvas) return;
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 200);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        cancelAnimationFrame(animationFrameId);
      } else {
        if (!isRunning) {
          isRunning = true;
          lastFrameTime = performance.now();
          animationFrameId = requestAnimationFrame(render);
        }
      }
    };

    window.addEventListener('resize', handleResize, { passive: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    let particles: Particle[] = [];
    let shootingStars: ShootingStar[] = [];

    const initParticles = () => {
      particles = [];
      shootingStars = [];

      // 1. VOLCANO THEME: Fiery rising embers
      if (theme === 'volcano') {
        const count = 45;
        const colors = [
          'rgba(255, 87, 34, ',
          'rgba(249, 115, 22, ',
          'rgba(251, 146, 60, ',
          'rgba(239, 68, 68, ',
          'rgba(253, 224, 71, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3.5 + 2,
            speedY: -(Math.random() * 1.2 + 0.4),
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.5 + 0.5,
            opacitySpeed: (Math.random() - 0.5) * 0.012,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.01,
          });
        }
      }
      // 2. GALAXY THEME: Silky cosmic starfield & shooting meteors
      else if (theme === 'galaxy') {
        const count = 55;
        const starColors = [
          'rgba(255, 255, 255, ',
          'rgba(192, 132, 252, ',
          'rgba(168, 85, 247, ',
          'rgba(147, 197, 253, ',
          'rgba(244, 114, 182, ',
          'rgba(103, 232, 249, ',
        ];
        for (let i = 0; i < count; i++) {
          const isLarge = Math.random() < 0.2;
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: isLarge ? Math.random() * 2 + 1.8 : Math.random() * 1.4 + 0.8,
            speedX: -(Math.random() * 0.3 + 0.08),
            speedY: Math.random() * 0.2 + 0.05,
            opacity: Math.random() * 0.5 + 0.45,
            opacitySpeed: (Math.random() - 0.5) * 0.015,
            color: starColors[Math.floor(Math.random() * starColors.length)],
            hasFlare: isLarge,
          });
        }
      }
      // 3. CHERRY BLOSSOM THEME: Drifting sakura petals
      else if (theme === 'cherry_blossom') {
        const count = 32;
        const colors = [
          'rgba(251, 113, 133, ',
          'rgba(244, 63, 94, ',
          'rgba(249, 168, 212, ',
          'rgba(253, 164, 175, ',
          'rgba(255, 228, 230, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 5 + 5,
            speedY: Math.random() * 0.8 + 0.4,
            speedX: Math.random() * 0.5 + 0.25,
            opacity: Math.random() * 0.4 + 0.45,
            opacitySpeed: 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.015 + 0.008,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.012,
          });
        }
      }
      // 4. OCEAN THEME: Rising deep abyss bubbles
      else if (theme === 'ocean') {
        const count = 35;
        const colors = [
          'rgba(6, 182, 212, ',
          'rgba(34, 211, 238, ',
          'rgba(14, 165, 233, ',
          'rgba(56, 189, 248, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 5 + 3,
            speedY: -(Math.random() * 1.0 + 0.4),
            speedX: 0,
            opacity: Math.random() * 0.45 + 0.45,
            opacitySpeed: (Math.random() - 0.5) * 0.006,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.018 + 0.008,
          });
        }
      }
    };

    initParticles();

    let lastFrameTime = performance.now();
    let lastMeteorSpawn = performance.now();
    const frameInterval = 1000 / 60; // 60 FPS target cap

    const render = (now: number) => {
      if (!isRunning) return;

      const elapsed = now - lastFrameTime;
      if (elapsed < frameInterval - 1) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }
      lastFrameTime = now - (elapsed % frameInterval);

      ctx.clearRect(0, 0, width, height);

      // 1. VOLCANO THEME
      if (theme === 'volcano') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speedY;
          if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 0.45 + p.speedX;
          } else {
            p.x += p.speedX;
          }

          p.opacity += p.opacitySpeed;
          if (p.opacity > 0.95 || p.opacity < 0.3) {
            p.opacitySpeed = -p.opacitySpeed;
          }

          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }
          if (p.x < -20) p.x = width + 20;
          if (p.x > width + 20) p.x = -20;

          // Glowing ember aura
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 0.35})`;
          ctx.fill();

          // Hot ember body
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.fill();

          // White spark core
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.9})`;
          ctx.fill();
        }
      }

      // 2. GALAXY THEME
      else if (theme === 'galaxy') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.x += p.speedX;
          p.y += p.speedY;

          p.opacity += p.opacitySpeed;
          if (p.opacity > 0.98 || p.opacity < 0.3) {
            p.opacitySpeed = -p.opacitySpeed;
          }

          if (p.x < -20) {
            p.x = width + 20;
            p.y = Math.random() * height;
          }
          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }

          // Star glow aura
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 0.35})`;
          ctx.fill();

          // Star bright center
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.9})`;
          ctx.fill();

          // Subtle twinkle cross on prominent stars
          if (p.hasFlare && p.opacity > 0.6) {
            const flareLen = p.size * 2.2;
            ctx.beginPath();
            ctx.moveTo(p.x - flareLen, p.y);
            ctx.lineTo(p.x + flareLen, p.y);
            ctx.moveTo(p.x, p.y - flareLen);
            ctx.lineTo(p.x, p.y + flareLen);
            ctx.strokeStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }

        // Active meteors / shooting stars
        if (now - lastMeteorSpawn > 1100 && shootingStars.length < 3) {
          lastMeteorSpawn = now;
          shootingStars.push({
            x: Math.random() * (width * 0.8) + width * 0.1,
            y: Math.random() * (height * 0.4),
            length: Math.random() * 80 + 50,
            speed: Math.random() * 7 + 8,
            angle: Math.PI * 0.25 + (Math.random() - 0.5) * 0.2,
            opacity: 1,
            color: 'rgba(216, 180, 254, ',
            active: true,
          });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          if (!s.active) continue;

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.opacity -= 0.02;

          const tailX = s.x - Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${Math.max(0, s.opacity * 0.85)})`;
          ctx.lineWidth = 2;
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(s.x, s.y, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0, s.opacity)})`;
          ctx.fill();

          if (s.opacity <= 0 || s.x > width + 80 || s.y > height + 80) {
            shootingStars.splice(i, 1);
          }
        }
      }

      // 3. CHERRY BLOSSOM THEME
      else if (theme === 'cherry_blossom') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speedY;
          if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 1.1 + p.speedX;
          }
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }

          if (p.y > height + 25) {
            p.y = -25;
            p.x = Math.random() * width;
          }
          if (p.x > width + 25) p.x = -25;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.85, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.fill();
          ctx.restore();
        }
      }

      // 4. OCEAN THEME
      else if (theme === 'ocean') {
        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          p.y += p.speedY;
          if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 0.55;
          }

          if (p.y < -25) {
            p.y = height + 25;
            p.x = Math.random() * width;
          }

          // Bubble glow
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 1.3, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 0.25})`;
          ctx.fill();

          // Bubble rim
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `${p.color}${p.opacity * 0.9})`;
          ctx.lineWidth = 1.4;
          ctx.stroke();

          // Highlight
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.85})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cancelAnimationFrame(animationFrameId);
      if (resizeTimeout) clearTimeout(resizeTimeout);
    };
  }, [theme]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 h-full w-full overflow-hidden">
      {/* CSS-accelerated cosmic nebula glows for Galaxy theme */}
      {theme === 'galaxy' && (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-65">
          <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-purple-600/20 blur-3xl animate-pulse" />
          <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-fuchsia-600/15 blur-3xl" />
          <div className="absolute -bottom-24 left-1/3 h-96 w-96 rounded-full bg-cyan-600/15 blur-3xl" />
        </div>
      )}

      {/* High-performance hardware-accelerated particle canvas */}
      <canvas
        ref={canvasRef}
        id="atmospheric-bg-canvas"
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full will-change-transform"
        style={{ transform: 'translate3d(0, 0, 0)', backfaceVisibility: 'hidden' }}
      />
    </div>
  );
});

AtmosphericBackground.displayName = 'AtmosphericBackground';
