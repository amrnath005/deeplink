"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ClickPulse {
  id: number;
  x: number;
  y: number;
}

export function CustomCursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  const [pulses, setPulses] = useState<ClickPulse[]>([]);
  const [isPointerFine, setIsPointerFine] = useState(false);

  useEffect(() => {
    // Check if device supports fine hover pointer (Desktop / Laptop with Mouse)
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    setIsPointerFine(mediaQuery.matches);

    const handleMediaChange = (e: MediaQueryListEvent) => setIsPointerFine(e.matches);
    mediaQuery.addEventListener("change", handleMediaChange);

    if (!mediaQuery.matches) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });

      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "BUTTON" ||
          target.tagName === "A" ||
          target.tagName === "INPUT" ||
          target.tagName === "SELECT" ||
          target.closest("button") ||
          target.closest("a") ||
          target.classList.contains("cursor-pointer"))
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      setIsClicked(true);
      const newPulse = { id: Date.now(), x: e.clientX, y: e.clientY };
      setPulses((prev) => [...prev.slice(-4), newPulse]);
    };

    const handleMouseUp = () => setIsClicked(false);

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      mediaQuery.removeEventListener("change", handleMediaChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  if (!isPointerFine) return null;

  return (
    <>
      {/* 1. Subtle Laser Reticle Lines (Horizontal & Vertical Crosshairs) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent"
        animate={{ y: pos.y }}
        transition={{ type: "spring", stiffness: 1000, damping: 60 }}
      />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 h-full w-px bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent"
        animate={{ x: pos.x }}
        transition={{ type: "spring", stiffness: 1000, damping: 60 }}
      />

      {/* 2. Quantum Holographic Framing Reticle Box ([ ]) */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 z-50 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        animate={{
          x: pos.x,
          y: pos.y,
          scale: isClicked ? 0.75 : isHovered ? 1.4 : 1,
        }}
        transition={{ type: "spring", stiffness: 500, damping: 28 }}
      >
        <div className={`relative transition-all duration-300 ${isHovered ? "w-10 h-10 border border-emerald-400 bg-emerald-500/10 shadow-[0_0_20px_rgba(34,197,94,0.4)]" : "w-6 h-6 border border-emerald-500/30"}`}>
          {/* Corner Ticks */}
          <span className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-emerald-400" />
          <span className="absolute -top-1 -right-1 w-2 h-2 border-t-2 border-r-2 border-emerald-400" />
          <span className="absolute -bottom-1 -left-1 w-2 h-2 border-b-2 border-l-2 border-emerald-400" />
          <span className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-emerald-400" />
          
          {/* Center Target Dot */}
          <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-1 rounded-full bg-emerald-400" />
        </div>

        {/* Live Coordinate Micro-HUD */}
        <div className="absolute top-7 left-7 text-[9px] font-mono text-emerald-400/80 backdrop-blur-md px-1.5 py-0.5 rounded border border-emerald-500/20 whitespace-nowrap shadow">
          {pos.x} : {pos.y}
        </div>
      </motion.div>

      {/* 3. Click Shockwave Pulses */}
      <AnimatePresence>
        {pulses.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 0.2 }}
            animate={{ opacity: 0, scale: 2.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            aria-hidden="true"
            className="pointer-events-none fixed top-0 left-0 z-50 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400 shadow-[0_0_30px_rgba(34,197,94,0.6)]"
            style={{ left: p.x, top: p.y }}
          />
        ))}
      </AnimatePresence>
    </>
  );
}
