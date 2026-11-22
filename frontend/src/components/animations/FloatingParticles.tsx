"use client";

import { useEffect, useRef } from "react";

interface AntiGravityOrb {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
}

export function FloatingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = -1000;
    let mouseY = -1000;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseX = -1000;
      mouseY = -1000;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const count = Math.min(Math.floor(width / 14), 110);
    const orbs: AntiGravityOrb[] = [];

    const colors = ["#10b981", "#34d399", "#38bdf8", "#818cf8", "#f43f5e"];

    for (let i = 0; i < count; i++) {
      const bx = Math.random() * width;
      const by = Math.random() * height;
      orbs.push({
        x: bx,
        y: by,
        z: Math.random() * 600 + 100,
        baseX: bx,
        baseY: by,
        vx: 0,
        vy: 0,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 5 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const fov = 400;
    const repelRadius = 220;
    const repelForce = 14;
    const springFactor = 0.04;
    const friction = 0.88;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < orbs.length; i++) {
        const orb = orbs[i];

        // Anti-Gravity Repulsion Physics from Mouse Cursor
        const dx = orb.x - mouseX;
        const dy = orb.y - mouseY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < repelRadius && dist > 0) {
          const force = (1 - dist / repelRadius) * repelForce;
          const angle = Math.atan2(dy, dx);
          orb.vx += Math.cos(angle) * force;
          orb.vy += Math.sin(angle) * force;
        }

        // Spring Force returning to base position
        const springX = (orb.baseX - orb.x) * springFactor;
        const springY = (orb.baseY - orb.y) * springFactor;
        orb.vx += springX;
        orb.vy += springY;

        // Apply friction velocity decay
        orb.vx *= friction;
        orb.vy *= friction;

        orb.x += orb.vx;
        orb.y += orb.vy;

        // Z-axis movement
        orb.z += orb.vz;
        if (orb.z < 50) orb.z = 700;
        if (orb.z > 700) orb.z = 50;

        const scale = fov / (fov + orb.z);
        const radius = orb.radius * scale;

        // Render Anti-Gravity Glowing Sphere
        ctx.save();
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = orb.color;
        ctx.shadowBlur = 20 * scale;
        ctx.shadowColor = orb.color;
        ctx.globalAlpha = Math.min(scale * 0.7, 0.85);
        ctx.fill();
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" />;
}
