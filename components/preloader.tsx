"use client";
import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { line12 } from "@/lib/brand-lines";
gsap.registerPlugin(useGSAP);
type Props = {
  onComplete: () => void;
  contentRef: RefObject<HTMLDivElement | null>;
};
export default function Preloader({ onComplete, contentRef }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const skip = useRef<() => void>(() => {});
  useGSAP(
    (context, contextSafe) => {
      if (!contextSafe) return;
      const content = contentRef.current;
      const overlay = root.current;
      if (!overlay) return;
      let disposed = false,
        exiting = false,
        introDone = false,
        assetsDone = false;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const previousInert = content?.inert ?? false;
      if (content) content.inert = true;
      const release = () => {
        if (content) content.inert = previousInert;
      };
      const finish = contextSafe(() => {
        if (disposed || exiting) return;
        exiting = true;
        intro.kill();
        gsap
          .timeline({
            defaults: { ease: "power3.inOut" },
            onComplete: () => {
              release();
              onComplete();
            },
          })
          .to(
            ".preloader-art",
            {
              autoAlpha: 0,
              y: reduced ? 0 : -12,
              duration: reduced ? 0 : 0.18,
            },
            0,
          )
          .to(
            overlay,
            { autoAlpha: 0, duration: reduced ? 0 : 0.5 },
            reduced ? 0 : 0.08,
          );
      });
      skip.current = finish;
      const maybeFinish = contextSafe(() => {
        if (introDone && assetsDone) finish();
      });
      const intro = gsap.timeline({
        defaults: { ease: "power2.out" },
        onComplete: () => {
          introDone = true;
          maybeFinish();
        },
      });
      if (!reduced) {
        intro
          .fromTo(
            ".preloader-line",
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.05, ease: "power2.inOut" },
            0,
          )
          .fromTo(
            ".preloader-logo",
            { autoAlpha: 0, scale: 0.94 },
            { autoAlpha: 1, scale: 1, duration: 0.65 },
            0.22,
          )
          .fromTo(
            ".preloader-caption",
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.3 },
            0.5,
          );
      } else {
        introDone = true;
      }
      // Real readiness, no invented percentage. Slow or failed assets never trap the page.
      const logo = overlay.querySelector("img");
      const imageReady = logo?.decode().catch(() => {}) ?? Promise.resolve();
      Promise.allSettled([imageReady, document.fonts.ready]).then(() => {
        if (!disposed) {
          assetsDone = true;
          maybeFinish();
        }
      });
      const timeout = setTimeout(finish, reduced ? 150 : 2400);
      const onPreference = () => {
        if (matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
      };
      const media = matchMedia("(prefers-reduced-motion: reduce)");
      media.addEventListener("change", onPreference);
      return () => {
        disposed = true;
        clearTimeout(timeout);
        release();
        media.removeEventListener("change", onPreference);
        skip.current = () => {};
      };
    },
    { scope: root },
  );
  return (
    <>
      <noscript>
        <style>{`.preloader{display:none!important}`}</style>
      </noscript>
      <div ref={root} className="preloader">
        <div className="preloader-art">
          <svg
            className="preloader-drawing"
            viewBox="0 0 1056 1033"
            fill="none"
            aria-hidden="true"
          >
            <path
              className="preloader-line"
              d={line12}
              stroke="#F1B737"
              strokeWidth="36"
              strokeLinecap="round"
              pathLength="1"
              strokeDasharray="1"
            />
          </svg>
          <img
            className="preloader-logo"
            src="/brand/logo.svg"
            width="1774"
            height="887"
            alt="Dion’s Burger Shop"
            fetchPriority="high"
          />
          <p className="preloader-caption" role="status">
            Preparando seu giro.
          </p>
        </div>
        <button className="preloader-skip" onClick={() => skip.current()}>
          Pular abertura
        </button>
      </div>
    </>
  );
}
