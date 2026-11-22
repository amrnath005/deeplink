"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export function MagneticButton({ children, className = "", strength = 0.3, onClick, disabled = false, type = "button" }: any) {
  const ref = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;
    const rect = ref.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - rect.width / 2) * strength;
    const y = (e.clientY - rect.top - rect.height / 2) * strength;
    setPosition({ x, y });
  };

  return (
    <motion.button
      ref={ref} type={type} className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setPosition({ x: 0, y: 0 })}
      onClick={onClick} disabled={disabled}
      animate={{ x: position.x, y: position.y }}
      transition={{ type: "spring", stiffness: 350, damping: 15, mass: 0.5 }}
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.button>
  );
}
