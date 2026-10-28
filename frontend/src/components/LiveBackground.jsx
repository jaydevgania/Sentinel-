import React, { useEffect, useRef, useState } from 'react';

/**
 * LiveBackground
 * High-performance, GPU-accelerated living background for Sentinel.
 * Features:
 * - Fluid atmospheric gradient mesh orbs (Amber Gold, Cyber Cyan, Cosmic Indigo)
 * - Interactive cursor follower glow for dynamic glass specularity
 * - Canvas-based brand compliance constellation particles
 * - Subtle geometric compliance grid overlay
 */
export default function LiveBackground() {
  const canvasRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: -500, y: -500 });
  const [smoothMouse, setSmoothMouse] = useState({ x: -500, y: -500 });
  const mouseTargetRef = useRef({ x: -500, y: -500 });
  const smoothMouseRef = useRef({ x: -500, y: -500 });

  // Mouse tracking with smooth lerp
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseTargetRef.current = { x: e.clientX, y: e.clientY };
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });

    let animId;
    const updateSmoothMouse = () => {
      const target = mouseTargetRef.current;
      const current = smoothMouseRef.current;
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      setSmoothMouse({ x: current.x, y: current.y });
      animId = requestAnimationFrame(updateSmoothMouse);
    };
    animId = requestAnimationFrame(updateSmoothMouse);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Canvas constellation particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Particle nodes definition
    const particleCount = Math.min(35, Math.floor(width / 45));
    const particles = [];
    const colors = [
      'rgba(245, 158, 11, ', // Amber
      'rgba(251, 191, 36, ', // Sun Gold
      'rgba(6, 182, 212, ',  // Cyan
      'rgba(99, 102, 241, '  // Indigo
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
        baseAlpha: Math.random() * 0.4 + 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseAngle: Math.random() * Math.PI * 2
      });
    }

    let isVisible = true;
    const handleVisibility = () => {
      isVisible = !document.hidden;
    };
    document.addEventListener('visibilitychange', handleVisibility);

    let animationFrameId;

    const render = () => {
      if (!isVisible) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      // Draw constellation connections
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.12;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.lineWidth = 0.75;
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      // Draw particle nodes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        // Wrap around bounds
        if (p.x < 0) p.x = width;
        else if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        else if (p.y > height) p.y = 0;

        p.pulseAngle += p.pulseSpeed;
        const currentAlpha = p.baseAlpha + Math.sin(p.pulseAngle) * 0.15;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `${p.color}${Math.max(0.1, currentAlpha)})`;
        ctx.shadowColor = p.color === colors[0] || p.color === colors[1] ? 'rgba(245, 158, 11, 0.4)' : 'rgba(6, 182, 212, 0.4)';
        ctx.shadowBlur = 6;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      aria-hidden="true"
    >
      {/* 1. Deep Obsidian Base Gradient */}
      <div className="absolute inset-0 bg-[#07090e]" />

      {/* 2. Interactive Cursor Follower Spotlight */}
      <div
        className="absolute w-[600px] h-[600px] rounded-full blur-[100px] opacity-60 transition-opacity duration-700 pointer-events-none"
        style={{
          left: `${smoothMouse.x - 300}px`,
          top: `${smoothMouse.y - 300}px`,
          background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, rgba(6, 182, 212, 0.04) 40%, transparent 70%)',
          willChange: 'left, top'
        }}
      />

      {/* 3. Fluid Living Atmospheric Mesh Orbs */}
      {/* Orb 1: Primary Radiant Amber (Upper Center / Left) */}
      <div className="absolute -top-32 left-1/4 w-[650px] h-[550px] rounded-full bg-gradient-to-br from-amber-500/18 via-orange-500/10 to-transparent blur-[120px] animate-orb-1 opacity-80" />

      {/* Orb 2: Cyber Cyan / Compliance Teal (Top Right) */}
      <div className="absolute -top-20 right-10 w-[550px] h-[480px] rounded-full bg-gradient-to-bl from-cyan-500/14 via-teal-500/08 to-transparent blur-[110px] animate-orb-2 opacity-75" />

      {/* Orb 3: Cosmic Indigo / Deep Violet (Bottom Left) */}
      <div className="absolute bottom-10 left-10 w-[600px] h-[500px] rounded-full bg-gradient-to-tr from-indigo-600/12 via-purple-600/08 to-transparent blur-[130px] animate-orb-3 opacity-70" />

      {/* Orb 4: Golden Glow Horizon (Center / Bottom Right) */}
      <div className="absolute top-1/2 -right-24 -translate-y-1/2 w-[500px] h-[600px] rounded-full bg-gradient-to-l from-amber-500/10 via-yellow-500/05 to-transparent blur-[120px] animate-orb-1 opacity-65" />

      {/* 4. Geometric Compliance Grid Matrix */}
      <div
        className="absolute inset-0 bg-grid-pattern opacity-60"
        style={{
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 30%, transparent 90%)',
          WebkitMaskImage: 'radial-gradient(ellipse 90% 80% at 50% 30%, black 30%, transparent 90%)'
        }}
      />

      {/* 5. Micro-Dot Accents */}
      <div
        className="absolute inset-0 bg-dot-pattern opacity-40"
        style={{
          maskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black 20%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 20%, black 20%, transparent 80%)'
        }}
      />

      {/* 6. Canvas Constellation Nodes & Connecting Rays */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full opacity-70"
      />

      {/* 7. Subtle Vignette Depth Frame */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#07090e]/80" />
    </div>
  );
}
