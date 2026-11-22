"use client";

import { useEffect, useRef } from "react";

export function ThreeDSeaMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = 360);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = 360;
    };

    window.addEventListener("resize", handleResize);

    const rows = 28;
    const cols = 45;
    const gridSpacing = 40;
    const fov = 300;
    const cameraY = 160;
    const cameraZ = -100;

    let time = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.03;

      const grid: { x: number; y: number; z: number; projX: number; projY: number }[][] = [];

      // Compute 3D Grid Wave Vertices
      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          const worldX = (c - cols / 2) * gridSpacing;
          const worldZ = r * gridSpacing + 60;
          
          // 3D Sea Wave Motion Equation
          const wave1 = Math.sin(worldX * 0.015 + time) * 18;
          const wave2 = Math.cos(worldZ * 0.02 + time * 1.2) * 14;
          const worldY = wave1 + wave2;

          // 3D Perspective Projection
          const scale = fov / (worldZ - cameraZ);
          const projX = worldX * scale + width / 2;
          const projY = (worldY + cameraY) * scale + height / 2 - 40;

          grid[r][c] = { x: worldX, y: worldY, z: worldZ, projX, projY };
        }
      }

      // Draw 3D Retro Wave Grid Lines (Horizontal & Vertical)
      ctx.lineWidth = 0.9;

      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const p1 = grid[r][c];
          const p2 = grid[r][c + 1];
          const p3 = grid[r + 1][c];

          // Alpha fade out into horizon
          const alpha = Math.max(0, 1 - r / rows);

          // Horizontal Line
          ctx.beginPath();
          ctx.moveTo(p1.projX, p1.projY);
          ctx.lineTo(p2.projX, p2.projY);
          ctx.strokeStyle = `rgba(16, 185, 129, ${alpha * 0.4})`;
          ctx.stroke();

          // Vertical Line
          ctx.beginPath();
          ctx.moveTo(p1.projX, p1.projY);
          ctx.lineTo(p3.projX, p3.projY);
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.35})`;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[360px] overflow-hidden flex items-center justify-center my-12 pointer-events-none">
      <canvas ref={canvasRef} className="w-full h-full opacity-70" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#07080a] via-transparent to-[#07080a] pointer-events-none" />
    </div>
  );
}
