"use client";

import { useEffect, useRef } from "react";

interface SparkleParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  maxAlpha: number;
  color: string;
}

export function HeavenBeachCanvas() {
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
    let windForceX = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - mouseX;
      windForceX += dx * 0.05;
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

    // Create Tropical Sun Sparkles
    const sparkles: SparkleParticle[] = [];
    const sparkleColors = ["#38bdf8", "#7dd3fc", "#34d399", "#fbbf24", "#ffffff"];

    for (let i = 0; i < 90; i++) {
      sparkles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 500 + 100,
        vx: (Math.random() - 0.5) * 0.5,
        vy: -Math.random() * 0.8 - 0.2,
        size: Math.random() * 3 + 1,
        alpha: Math.random() * 0.6 + 0.2,
        maxAlpha: Math.random() * 0.7 + 0.3,
        color: sparkleColors[Math.floor(Math.random() * sparkleColors.length)],
      });
    }

    let time = 0;

    // Draw Swaying Palm Tree
    const drawPalmTree = (
      ctx: CanvasRenderingContext2D,
      rootX: number,
      rootY: number,
      height: number,
      sway: number,
      scale: number
    ) => {
      ctx.save();
      ctx.translate(rootX, rootY);

      // Curved Trunk
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const controlX = sway * 45;
      const topX = sway * 70;
      const topY = -height;

      ctx.quadraticCurveTo(controlX, -height * 0.5, topX, topY);
      ctx.strokeStyle = "rgba(15, 23, 42, 0.85)";
      ctx.lineWidth = 14 * scale;
      ctx.lineCap = "round";
      ctx.stroke();

      // Inner Trunk Highlight
      ctx.strokeStyle = "rgba(30, 41, 59, 0.9)";
      ctx.lineWidth = 8 * scale;
      ctx.stroke();

      // Palm Fronds (Leaves swaying in wind)
      ctx.translate(topX, topY);
      const frondCount = 7;
      const frondLength = 90 * scale;

      for (let i = 0; i < frondCount; i++) {
        const angle = (i / (frondCount - 1)) * Math.PI * 0.95 - Math.PI * 0.47 + sway * 0.2;
        ctx.save();
        ctx.rotate(angle);

        ctx.beginPath();
        ctx.moveTo(0, 0);
        const leafSway = Math.sin(time * 2 + i) * 8 * scale;
        ctx.quadraticCurveTo(frondLength * 0.5, leafSway - 15, frondLength, leafSway + 25);
        ctx.strokeStyle = i % 2 === 0 ? "rgba(16, 185, 129, 0.45)" : "rgba(14, 165, 233, 0.45)";
        ctx.lineWidth = 4 * scale;
        ctx.stroke();

        ctx.restore();
      }

      ctx.restore();
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.025;
      windForceX *= 0.92;

      const windSway = Math.sin(time * 1.4) * 0.35 + windForceX * 0.02;

      // 1. Draw Undulating Heavenly Ocean Waves at Bottom
      const waveHorizon = height * 0.68;
      const waveLayers = 4;

      for (let l = 0; l < waveLayers; l++) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(0, height);

        const layerY = waveHorizon + l * 45;
        const frequency = 0.008 - l * 0.001;
        const speed = time * (1.5 + l * 0.4);
        const amplitude = 18 + l * 8;

        for (let x = 0; x <= width; x += 12) {
          const y = layerY + Math.sin(x * frequency + speed) * amplitude + Math.cos(x * 0.015 - speed * 0.8) * (amplitude * 0.5);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        // Tropical Lagoon Gradients
        const grad = ctx.createLinearGradient(0, layerY - 30, 0, height);
        if (l === 0) {
          grad.addColorStop(0, "rgba(14, 165, 233, 0.25)"); // Tropical Cyan Wave Crest
          grad.addColorStop(1, "rgba(15, 23, 42, 0.9)");
        } else if (l === 1) {
          grad.addColorStop(0, "rgba(16, 185, 129, 0.2)"); // Emerald Lagoon Wave
          grad.addColorStop(1, "rgba(10, 15, 30, 0.95)");
        } else if (l === 2) {
          grad.addColorStop(0, "rgba(56, 189, 248, 0.15)");
          grad.addColorStop(1, "rgba(5, 10, 20, 0.98)");
        } else {
          grad.addColorStop(0, "rgba(2, 132, 199, 0.1)");
          grad.addColorStop(1, "#05101a");
        }

        ctx.fillStyle = grad;
        ctx.fill();

        // Foam Line on Crest
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.15 - l * 0.03})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.restore();
      }

      // 2. Draw Swaying Tropical Palm Trees (Left & Right Shores)
      drawPalmTree(ctx, width * 0.06, height * 0.85, 240, windSway * 1.2, 1.1);
      drawPalmTree(ctx, width * 0.94, height * 0.88, 220, windSway * 0.9, 1.0);
      drawPalmTree(ctx, width * 0.88, height * 0.92, 170, windSway * 1.1, 0.8);

      // 3. Render Sunlit Glistening Water Sparkles & Breeze Particles
      for (let i = 0; i < sparkles.length; i++) {
        const s = sparkles[i];
        s.x += s.vx + windForceX * 0.1;
        s.y += s.vy;

        if (s.y < 0) s.y = height;
        if (s.x < 0) s.x = width;
        if (s.x > width) s.x = 0;

        ctx.save();
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.shadowBlur = 12;
        ctx.shadowColor = s.color;
        ctx.globalAlpha = Math.sin(time * 2 + i) * 0.3 + s.alpha;
        ctx.fill();
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

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-90" />;
}
