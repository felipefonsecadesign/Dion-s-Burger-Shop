"use client";
import { useRef, type RefObject } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
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
              scale: reduced ? 1 : 1.035,
              duration: reduced ? 0 : 0.45,
            },
            0,
          )
          .to(
            ".preloader-panel-left",
            { xPercent: reduced ? 0 : -101, duration: reduced ? 0 : 1.05 },
            reduced ? 0 : 0.12,
          )
          .to(
            ".preloader-panel-right",
            { xPercent: reduced ? 0 : 101, duration: reduced ? 0 : 1.05 },
            reduced ? 0 : 0.12,
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
            ".preloader-logo",
            { autoAlpha: 0, scale: 0.9 },
            { autoAlpha: 1, scale: 1, duration: 1.25, ease: "power2.out" },
            0,
          )
          .to(".preloader-logo", {
            scale: 1.025,
            duration: 1,
            ease: "sine.inOut",
          });
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
      const timeout = setTimeout(finish, reduced ? 150 : 3500);
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
        <div
          className="preloader-panel preloader-panel-left"
          aria-hidden="true"
        />
        <div
          className="preloader-panel preloader-panel-right"
          aria-hidden="true"
        />
        <div className="preloader-art">
          <button
            className="preloader-logo-button"
            aria-label="Pular abertura"
            onClick={() => skip.current()}
          >
            <img
              className="preloader-logo"
              src="/brand/logo.svg"
              width="1774"
              height="887"
              alt="Dion’s Burger Shop"
              fetchPriority="high"
            />
          </button>
          <p className="sr-only" role="status">
            Preparando seu giro.
          </p>
        </div>
      </div>
    </>
  );
}
