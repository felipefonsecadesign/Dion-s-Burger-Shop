"use client";
import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { line3, line3Tip, line12 } from "@/lib/brand-lines";
gsap.registerPlugin(useGSAP);
export default function CampaignBackground({
  active = true,
}: {
  active?: boolean;
}) {
  const root = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (!active) return;
      const mm = gsap.matchMedia();
      mm.add(
        "(prefers-reduced-motion: no-preference)",
        () => {
          const path =
            root.current?.querySelector<SVGPathElement>(".living-line");
          if (!path) return;
          const tween = gsap.to(path, {
            attr: { d: line3Tip },
            duration: 3.8,
            ease: "sine.inOut",
            repeat: -1,
            yoyo: true,
          });
          let inView = false;
          const sync = () => {
            if (inView && !document.hidden) tween.resume();
            else tween.pause();
          };
          const observer = new IntersectionObserver(([entry]) => {
            inView = entry.isIntersecting;
            sync();
          });
          observer.observe(path);
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
    <div ref={root} className="campaign-background" aria-hidden="true">
      <div className="brand-line brand-line-left">
        <svg width="1211" height="1372" viewBox="0 0 1211 1372" fill="none">
          <path
            className="living-line"
            d={line3}
            stroke="#F1B737"
            strokeWidth="100"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="brand-line brand-line-right">
        <svg width="1056" height="1033" viewBox="0 0 1056 1033" fill="none">
          <path
            d={line12}
            stroke="#F1B737"
            strokeWidth="100"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}
