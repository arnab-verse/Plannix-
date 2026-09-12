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
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

export const AtmosphericBackground = React.memo<AtmosphericBackgroundProps>(({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particles system initialization
    let particles: Particle[] = [];
    let shootingStars: ShootingStar[] = [];

    const initParticles = () => {
      particles = [];
      shootingStars = [];

      if (theme === 'volcano') {
        const count = 45;
        const colors = [
          'rgba(239, 68, 68, ',
          'rgba(249, 115, 22, ',
          'rgba(245, 158, 11, ',
          'rgba(251, 191, 36, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 3 + 1.2,
            speedY: -(Math.random() * 1.2 + 0.4),
            speedX: (Math.random() - 0.5) * 0.5,
            opacity: Math.random() * 0.7 + 0.2,
            opacitySpeed: (Math.random() - 0.5) * 0.02,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.03 + 0.01,
          });
        }
      } else if (theme === 'galaxy') {
        const count = 90;
        const colors = [
          'rgba(255, 255, 255, ',
          'rgba(192, 132, 252, ',
          'rgba(147, 197, 253, ',
          'rgba(232, 121, 249, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 2 + 0.8,
            speedY: 0,
            speedX: 0,
            opacity: Math.random() * 0.8 + 0.1,
            opacitySpeed: (Math.random() - 0.5) * 0.015,
            color: colors[Math.floor(Math.random() * colors.length)],
          });
        }
        shootingStars = [
          {
            x: Math.random() * width,
            y: Math.random() * (height * 0.4),
            length: Math.random() * 80 + 50,
            speed: Math.random() * 10 + 12,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            opacity: 0,
            active: false,
          },
        ];
      } else if (theme === 'cherry_blossom') {
        const count = 35;
        const colors = [
          'rgba(251, 113, 133, ',
          'rgba(244, 63, 94, ',
          'rgba(249, 168, 212, ',
          'rgba(253, 164, 175, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 7 + 8,
            speedY: Math.random() * 0.8 + 0.5,
            speedX: Math.random() * 0.8 + 0.2,
            opacity: Math.random() * 0.5 + 0.3,
            opacitySpeed: 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.02 + 0.01,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
          });
        }
      } else if (theme === 'ocean') {
        const count = 35;
        const colors = [
          'rgba(6, 182, 212, ',
          'rgba(14, 165, 233, ',
          'rgba(45, 212, 191, ',
        ];
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            size: Math.random() * 5 + 2.5,
            speedY: -(Math.random() * 0.9 + 0.3),
            speedX: 0,
            opacity: Math.random() * 0.5 + 0.2,
            opacitySpeed: (Math.random() - 0.5) * 0.01,
            color: colors[Math.floor(Math.random() * colors.length)],
            wobble: Math.random() * Math.PI * 2,
            wobbleSpeed: Math.random() * 0.025 + 0.01,
          });
        }
      }
    };

    initParticles();

    let lastMeteorSpawn = performance.now();

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // =========================================================================
      // 1. VOLCANO THEME
      // Rising embers + faint bottom magma fissure glow
      // =========================================================================
      if (theme === 'volcano') {
        // Bottom magma glow gradient
        const grad = ctx.createLinearGradient(0, height - 120, 0, height);
        grad.addColorStop(0, 'rgba(234, 88, 12, 0)');
        grad.addColorStop(1, 'rgba(220, 38, 38, 0.08)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, height - 120, width, 120);

        for (const p of particles) {
          p.y += p.speedY;
          if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 0.5 + p.speedX;
          } else {
            p.x += p.speedX;
          }

          p.opacity += p.opacitySpeed;
          if (p.opacity > 0.85 || p.opacity < 0.2) {
            p.opacitySpeed = -p.opacitySpeed;
          }

          if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
          }
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.max(0.1, Math.min(1, p.opacity))})`;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#f97316';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // =========================================================================
      // 2. GALAXY THEME
      // Twinkling stars + shooting meteors
      // =========================================================================
      else if (theme === 'galaxy') {
        for (const p of particles) {
          p.opacity += p.opacitySpeed;
          if (p.opacity > 0.95 || p.opacity < 0.1) {
            p.opacitySpeed = -p.opacitySpeed;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${Math.max(0.05, Math.min(1, p.opacity))})`;
          ctx.shadowBlur = p.size > 1.8 ? 6 : 2;
          ctx.shadowColor = '#c084fc';
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Shooting stars / meteors
        const now = performance.now();
        if (now - lastMeteorSpawn > 4500 && Math.random() < 0.02) {
          lastMeteorSpawn = now;
          shootingStars.push({
            x: Math.random() * (width * 0.7),
            y: Math.random() * (height * 0.3),
            length: Math.random() * 90 + 60,
            speed: Math.random() * 12 + 14,
            angle: Math.PI / 4 + (Math.random() - 0.5) * 0.2,
            opacity: 1,
            active: true,
          });
        }

        for (let i = shootingStars.length - 1; i >= 0; i--) {
          const s = shootingStars[i];
          if (!s.active) continue;

          s.x += Math.cos(s.angle) * s.speed;
          s.y += Math.sin(s.angle) * s.speed;
          s.opacity -= 0.015;

          const tailX = s.x - Math.cos(s.angle) * s.length;
          const tailY = s.y - Math.sin(s.angle) * s.length;

          const meteorGrad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
          meteorGrad.addColorStop(0, 'rgba(192, 132, 252, 0)');
          meteorGrad.addColorStop(1, `rgba(255, 255, 255, ${Math.max(0, s.opacity)})`);

          ctx.beginPath();
          ctx.moveTo(tailX, tailY);
          ctx.lineTo(s.x, s.y);
          ctx.strokeStyle = meteorGrad;
          ctx.lineWidth = 2;
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#e879f9';
          ctx.stroke();
          ctx.shadowBlur = 0;

          if (s.opacity <= 0 || s.x > width + 100 || s.y > height + 100) {
            shootingStars.splice(i, 1);
          }
        }
      }

      // =========================================================================
      // 3. CHERRY BLOSSOM THEME
      // Falling fluttering sakura petals
      // =========================================================================
      else if (theme === 'cherry_blossom') {
        for (const p of particles) {
          p.y += p.speedY;
          if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 1.2 + p.speedX;
          }
          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }

          if (p.y > height + 20) {
            p.y = -20;
            p.x = Math.random() * width;
          }
          if (p.x > width + 20) p.x = -20;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.rotation || 0);

          ctx.beginPath();
          // Sakura petal ellipse shape
          ctx.ellipse(0, 0, p.size * 0.45, p.size * 0.85, 0, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity})`;
          ctx.fill();

          ctx.restore();
        }
      }

      // =========================================================================
      // 4. OCEAN THEME
      // Rising translucent cyan bubbles
      // =========================================================================
      else if (theme === 'ocean') {
        for (const p of particles) {
          p.y += p.speedY;
          if (p.wobble !== undefined && p.wobbleSpeed !== undefined) {
            p.wobble += p.wobbleSpeed;
            p.x += Math.sin(p.wobble) * 0.7;
          }

          if (p.y < -20) {
            p.y = height + 20;
            p.x = Math.random() * width;
          }

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = `${p.color}${p.opacity * 0.3})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.strokeStyle = `${p.color}${p.opacity})`;
          ctx.lineWidth = 1;
          ctx.stroke();

          // Highlight dot on bubble
          ctx.beginPath();
          ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.25, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${p.opacity * 0.7})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      id="atmospheric-ambient-canvas"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-90 transition-opacity duration-700"
    />
  );
});

AtmosphericBackground.displayName = 'AtmosphericBackground';
