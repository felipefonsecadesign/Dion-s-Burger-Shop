"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
gsap.registerPlugin(useGSAP);
// Closed route: the rounded stroke travels around the curves, like a moving ribbon.
const route =
  "M-180 330C20 20 210 90 410 290C590 490 700 510 900 310C1110 100 1260 80 1460 280C1650 470 1830 510 1810 290C1790 50 1570-70 1350 70C1140 210 990 390 770 230C550 70 440 20 240 210C40 400-380 620-180 330Z";
export default function SnakeBackdrop({ active }: { active: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!active) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const path = root.current?.querySelector<SVGPathElement>("path");
          if (!path) return;
          const length = path.getTotalLength();
          const body = length * 0.27;
          gsap.set(path, {
            strokeDasharray: `${body} ${length - body}`,
            strokeDashoffset: -length * 0.12,
          });
          const movement = gsap.to(path, {
            strokeDashoffset: -length * 1.12,
            duration: 24,
            repeat: -1,
            ease: "none",
            paused: true,
          });
          let visible = false;
          const sync = () => {
            if (visible && !document.hidden) movement.resume();
            else movement.pause();
          };
          const observer = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            sync();
          });
          observer.observe(root.current!);
          document.addEventListener("visibilitychange", sync);
          return () => {
            observer.disconnect();
            document.removeEventListener("visibilitychange", sync);
          };
        },
        root,
      );
      return () => mm.revert();
    },
    { scope: root, dependencies: [active], revertOnUpdate: true },
  );
  return (
    <div ref={root} className="snake-backdrop" aria-hidden="true">
      <svg
        viewBox="0 0 1600 640"
        width="1600"
        height="640"
        fill="none"
        preserveAspectRatio="none"
      >
        <path
          d={route}
          stroke="#F1B737"
          strokeWidth="68"
          strokeLinecap="round"
          strokeDasharray="1300 4000"
        />
      </svg>
    </div>
  );
}
