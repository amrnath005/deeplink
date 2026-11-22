"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function TextReveal({ children, className = "", delay = 0, duration = 0.8 }: any) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div
        initial={{ y: "100%", opacity: 0 }}
        animate={isInView ? { y: 0, opacity: 1 } : { y: "100%", opacity: 0 }}
        transition={{ duration, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className={className}>{children}</div>
      </motion.div>
    </div>
  );
}
