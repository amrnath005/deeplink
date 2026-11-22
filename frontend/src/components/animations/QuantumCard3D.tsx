"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface QuantumCard3DProps {
  children: React.ReactNode;
  className?: string;
  depth?: number;
  nodeId?: string;
}

export function QuantumCard3D({ children, className = "", depth = 16, nodeId = "SEC_NODE::0x9F8A" }: QuantumCard3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [scanPosY, setScanPosY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = (mouseX / width - 0.5) * 2;
    const yPct = (mouseY / height - 0.5) * 2;

    setRotateX(-yPct * depth);
    setRotateY(xPct * depth);
    setScanPosY(mouseY);
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      animate={{ rotateX, rotateY }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      style={{ transformStyle: "preserve-3d", perspective: 1000 }}
      className={`relative rounded-3xl transition-all duration-300 ${className}`}
    >
      {/* 1. Interactive 3D Laser Scan Beam Following Mouse Y */}
      {isHovered && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute left-0 right-0 z-30 h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_rgba(34,197,94,0.8)]"
          style={{ top: scanPosY, transform: "translateZ(30px)" }}
        />
      )}

      {/* 2. Quantum Corner Target Brackets (◤ ◥ ◣ ◢) */}
      <div className="pointer-events-none absolute inset-0 rounded-3xl z-30 p-2">
        <span className={`absolute top-3 left-3 w-3 h-3 border-t-2 border-l-2 transition-colors duration-300 ${isHovered ? "border-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "border-white/20"}`} />
        <span className={`absolute top-3 right-3 w-3 h-3 border-t-2 border-r-2 transition-colors duration-300 ${isHovered ? "border-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "border-white/20"}`} />
        <span className={`absolute bottom-3 left-3 w-3 h-3 border-b-2 border-l-2 transition-colors duration-300 ${isHovered ? "border-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "border-white/20"}`} />
        <span className={`absolute bottom-3 right-3 w-3 h-3 border-b-2 border-r-2 transition-colors duration-300 ${isHovered ? "border-emerald-400 shadow-[0_0_10px_rgba(34,197,94,0.6)]" : "border-white/20"}`} />
        
        {/* Node Hex Identification Tag */}
        <span className={`absolute top-3.5 right-8 text-[9px] font-mono transition-colors duration-300 ${isHovered ? "text-emerald-400" : "text-slate-600"}`}>
          {nodeId}
        </span>
      </div>

      {/* 3. Card Inner Children Content */}
      <div style={{ transform: "translateZ(0px)", transformStyle: "preserve-3d" }}>
        {children}
      </div>
    </motion.div>
  );
}
