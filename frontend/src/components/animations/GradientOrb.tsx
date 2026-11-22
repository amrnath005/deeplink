"use client";

import { motion } from "framer-motion";

export function GradientOrb({ className = "", color = "rgba(34, 197, 94, 0.15)", size = 400, duration = 20 }: any) {
  return (
    <motion.div
      className={`pointer-events-none absolute rounded-full blur-3xl ${className}`}
      style={{ width: size, height: size, background: `radial-gradient(circle, ${color}, transparent 70%)` }}
      animate={{ x: [0, 30, -20, 0], y: [0, -30, 20, 0], scale: [1, 1.1, 0.9, 1] }}
      transition={{ duration, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}
