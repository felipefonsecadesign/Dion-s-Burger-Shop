"use client";
import { useRef } from "react";
import { motion } from "motion/react";
import { benefits } from "@/lib/campaign";
import { BrandIcon, type BrandIconName } from "@/components/brand-icon";
const iconNames: BrandIconName[] = [
  "Fries",
  "CupSoda",
  "IceCreamBowl",
  "Burger",
  "Percent",
];
export default function Wheel({
  rotation,
  reduced,
  onTick,
}: {
  rotation: number;
  reduced: boolean;
  onTick?: () => void;
}) {
  const lastSector = useRef(0);
  return (
    <motion.div
      className="wheel-rotor"
      animate={{ rotate: rotation }}
      transition={{ duration: reduced ? 0 : 6, ease: [0.28, 0.015, 0.1, 1] }}
      onUpdate={(latest) => {
        const sector = Math.floor(Number(latest.rotate ?? 0) / 72);
        if (sector !== lastSector.current) {
          lastSector.current = sector;
          onTick?.();
        }
      }}
    >
      <svg className="wheel-svg" viewBox="0 0 600 600" aria-hidden="true">
        <defs>
          <radialGradient id="wheel-metal">
            <stop offset=".82" stopColor="#121212" />
            <stop offset="1" stopColor="#292929" />
          </radialGradient>
        </defs>
        <circle
          cx="300"
          cy="300"
          r="294"
          fill="url(#wheel-metal)"
          stroke="#f2f2f2"
          strokeWidth="3"
        />
        {benefits.map((b, i) => {
          const a = ((i * 72 - 90) * Math.PI) / 180;
          const z = (((i + 1) * 72 - 90) * Math.PI) / 180;
          const mid = i * 72 + 36;
          return (
            <g key={b.id}>
              <path
                d={`M300 300 L${300 + 260 * Math.cos(a)} ${300 + 260 * Math.sin(a)} A260 260 0 0 1 ${300 + 260 * Math.cos(z)} ${300 + 260 * Math.sin(z)} Z`}
                fill={b.color}
                stroke="#0d0d0d"
                strokeWidth="3"
              />
              <g transform={`rotate(${mid} 300 300)`} color={b.ink}>
                <text
                  x="300"
                  y="107"
                  textAnchor="middle"
                  fill={b.ink}
                  fontSize={b.label.length > 7 ? 28 : 35}
                  fontWeight="900"
                  fontFamily="'Barlow Condensed', Impact, sans-serif"
                >
                  {b.label}
                </text>
                <text
                  x="300"
                  y="134"
                  textAnchor="middle"
                  fill={b.ink}
                  fontSize="10"
                  fontWeight="700"
                  letterSpacing="1.6"
                >
                  {i === 3 ? "NO COMBO" : i === 4 ? "NA PRÓXIMA" : "PRA VOCÊ"}
                </text>
                <svg x="281" y="153" width="38" height="38" viewBox="0 0 24 24">
                  <BrandIcon name={iconNames[i]} />
                </svg>
              </g>
            </g>
          );
        })}
        <circle
          cx="300"
          cy="300"
          r="263"
          fill="none"
          stroke="#f2f2f2"
          strokeWidth="3"
        />
        {Array.from({ length: 40 }, (_, i) => {
          const a = (i * 9 * Math.PI) / 180;
          return (
            <circle
              key={i}
              cx={300 + 278 * Math.cos(a)}
              cy={300 + 278 * Math.sin(a)}
              r="4"
              fill={i % 2 ? "#f1b737" : "#f2f2f2"}
            />
          );
        })}
      </svg>
    </motion.div>
  );
}
