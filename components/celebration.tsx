"use client";
import { motion, useReducedMotion } from "motion/react";
export default function Celebration() {
  const reduced = useReducedMotion();
  if (reduced) return null;
  return (
    <div className="confetti" aria-hidden="true">
      {Array.from({ length: 18 }, (_, i) => {
        const angle = (i / 18) * Math.PI * 2;
        const radius = 100 + (i % 3) * 30;
        return (
          <motion.i
            key={i}
            style={{
              background: i % 3 === 0 ? "#f2f2f2" : "#f1b737",
              width: i % 2 ? 5 : 8,
              height: i % 2 ? 13 : 8,
            }}
            initial={{ x: 0, y: 0, rotate: 0, opacity: 0 }}
            animate={{
              x: [
                0,
                Math.cos(angle) * radius * 0.3,
                Math.cos(angle) * radius,
                Math.cos(angle) * radius * 1.15,
              ],
              y: [
                0,
                Math.sin(angle) * radius * 0.3,
                Math.sin(angle) * radius,
                Math.sin(angle) * radius + 70,
              ],
              rotate: i % 2 ? 200 : -160,
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: 1.25,
              delay: (i % 3) * 0.035,
              ease: [0.16, 1, 0.3, 1],
              times: [0, 0.15, 0.65, 1],
            }}
          />
        );
      })}
    </div>
  );
}
