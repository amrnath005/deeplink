"use client";

import { useEffect, useRef } from "react";

interface BlackholeParticle {
  x: number;
  y: number;
  radius: number;
  angle: number;
  dist: number;
  speed: number;
  color: string;
  size: number;
  text?: string;
}

export function CyberMatrixCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const particles: BlackholeParticle[] = [];
    const colors = ["#22c55e", "#10b981", "#ef4444", "#f43f5e", "#06b6d4", "#a855f7"];
    const telemetryCodes = ["0x9F8A", "SIG_52", "20MS", "PROXY_0", "UDP_IN", "TCP_OK", "CANVAS_FP", "BOT_0.0", "GEO_IN", "IP_WAN"];

    const count = 120;
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 300 + 80,
        angle: Math.random() * Math.PI * 2,
        dist: Math.random() * 320 + 50,
        speed: (Math.random() * 0.015 + 0.005) * (Math.random() > 0.5 ? 1 : -1),
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 3.5 + 1.5,
        text: Math.random() > 0.7 ? telemetryCodes[Math.floor(Math.random() * telemetryCodes.length)] : undefined,
      });
    }

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.02;

      const centerX = width / 2;
      const centerY = height * 0.45;

      // 1. Draw Central Blackhole Event Horizon Singularity Glow
      ctx.save();
      const bhGrad = ctx.createRadialGradient(centerX, centerY, 10, centerX, centerY, 240);
      bhGrad.addColorStop(0, "rgba(3, 3, 5, 1)");
      bhGrad.addColorStop(0.2, "rgba(34, 197, 94, 0.15)"); // Matrix Green Core Ring
      bhGrad.addColorStop(0.5, "rgba(239, 68, 68, 0.12)"); // Cyber Red Horizon Ring
      bhGrad.addColorStop(0.8, "rgba(6, 182, 212, 0.05)");
      bhGrad.addColorStop(1, "transparent");

      ctx.fillStyle = bhGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 240, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Inner Blackhole Void Core
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 42, 0, Math.PI * 2);
      ctx.fillStyle = "#030305";
      ctx.shadowBlur = 30;
      ctx.shadowColor = "#ef4444";
      ctx.fill();
      ctx.strokeStyle = "rgba(34, 197, 94, 0.4)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();

      // 2. Draw Orbiting Accretion Disk Particles & Telemetry Hashes
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.angle += p.speed;

        // Gravitational Mouse Wobble
        const targetX = centerX + Math.cos(p.angle) * p.dist + (mouseX - centerX) * 0.05;
        const targetY = centerY + Math.sin(p.angle) * (p.dist * 0.45) + (mouseY - centerY) * 0.05;

        p.x += (targetX - p.x) * 0.08;
        p.y += (targetY - p.y) * 0.08;

        ctx.save();
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = p.color;

        if (p.text) {
          ctx.font = "10px monospace";
          ctx.globalAlpha = Math.sin(time * 3 + i) * 0.35 + 0.45;
          ctx.fillText(p.text, p.x, p.y);
        } else {
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.globalAlpha = Math.sin(time * 2 + i) * 0.4 + 0.4;
          ctx.fill();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-85" />;
}
