"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function ScrollReveal({ children, className = "", delay = 0, duration = 0.7, direction = "up", distance = 40 }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const directions = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
    none: { x: 0, y: 0 },
  };

  return (
    <motion.div
      ref={ref} className={className}
      initial={{ opacity: 0, ...directions[direction as keyof typeof directions] }}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : { opacity: 0, ...directions[direction as keyof typeof directions] }}
      transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
}
