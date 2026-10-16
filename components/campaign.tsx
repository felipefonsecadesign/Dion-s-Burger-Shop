"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  Volume2,
  VolumeX,
  X,
  Ticket,
  Fries,
  IceCreamBowl,
  CupSoda,
  Percent,
  Burger,
} from "@/components/brand-icon";
import { benefits, getPreviewResult, type Benefit } from "@/lib/campaign";
import Wheel from "@/components/wheel";
const icons = [Fries, CupSoda, IceCreamBowl, Burger, Percent];
import CampaignBackground from "@/components/campaign-background";
import Celebration from "@/components/celebration";
import Preloader from "@/components/preloader";
import SnakeBackdrop from "@/components/snake-backdrop";
import CustomerForm from "@/components/customer-form";
export default function Campaign() {
  const contentRef = useRef<HTMLDivElement>(null);
  const [introReady, setIntroReady] = useState(false);
  const finishIntro = useCallback(() => setIntroReady(true), []);
  const pointerRef = useRef<HTMLDivElement>(null);
  function tick() {
    if (!reduced)
      pointerRef.current?.animate(
        [
          { transform: "translateX(-50%) rotate(-14deg)" },
          { transform: "translateX(-50%) rotate(0deg)" },
        ],
        { duration: 130, easing: "ease-out" },
      );
  }
  const reduced = useReducedMotion();
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<Benefit | null>(null);
  const [step, setStep] = useState<"result" | "rules" | "privacy" | null>(null);
  const [sound, setSound] = useState(false);
  const [error, setError] = useState("");
  const [origin, setOrigin] = useState("");
  const busy = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const spinRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setOrigin(
      new URLSearchParams(location.search).get("origem")?.slice(0, 80) || "",
    );
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  useEffect(() => {
    if (!step) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setStep(null);
      if (e.key === "Tab") {
        const items = dialogRef.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),a[href],input:not(:disabled)",
        );
        if (!items?.length) return;
        const first = items[0],
          last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = old;
      document.removeEventListener("keydown", handler);
      spinRef.current?.focus();
    };
  }, [step]);
  async function spin() {
    if (busy.current) return;
    busy.current = true;
    setSpinning(true);
    setError("");
    try {
      const picked = await getPreviewResult();
      const index = benefits.findIndex((b) => b.id === picked.benefit.id);
      const target = 360 - (index * 72 + 36);
      setRotation((r) => r + (360 - (r % 360)) + 360 * 6 + target);
      if (sound) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.frequency.value = 420;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        osc.onended = () => void ctx.close();
      }
      timer.current = setTimeout(
        () => {
          setResult(picked.benefit);
          setStep("result");
          setSpinning(false);
          busy.current = false;
        },
        reduced ? 100 : 6100,
      );
    } catch {
      setError("Não foi possível iniciar. Tente novamente.");
      setSpinning(false);
      busy.current = false;
    }
  }
  return (
    <main>
      <div className="campaign-content" ref={contentRef}>
        <CampaignBackground />
        <div className="ambient" aria-hidden="true" />
        <header className="header">
          <a href="/roleta" aria-label="Dion’s Burger Shop">
            <img src="/brand/logo.svg" alt="Dion’s Burger Shop" />
          </a>
          <button
            className="sound"
            aria-label={sound ? "Desativar som" : "Ativar som"}
            aria-pressed={sound}
            onClick={() => setSound(!sound)}
          >
            {sound ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </header>
        <section className="hero">
          <h1>
            SUA <span>SORTE</span>
            <br />
            TÁ NA MESA!
          </h1>
          <p className="intro">
            Um giro pode deixar seu pedido ainda melhor.
            <br className="desktop" /> Toque na roleta e descubra seu benefício!
          </p>
          <div className={`wheel-stage ${spinning ? "is-spinning" : ""}`}>
            <SnakeBackdrop active={introReady && !step} />
            <div className="wheel-wrap">
              <div className="pointer" ref={pointerRef}>
                <span />
              </div>
              <div
                style={reduced ? { transition: "none" } : undefined}
                className={reduced ? "reduced-wheel" : ""}
              >
                <Wheel rotation={rotation} reduced={!!reduced} onTick={tick} />
              </div>
              <button
                ref={spinRef}
                className="spin-button"
                onClick={spin}
                disabled={spinning}
                aria-label={spinning ? "Roleta girando" : "Girar roleta"}
              >
                <span>{spinning ? "GIRANDO" : "GIRAR"}</span>
                <small>{spinning ? "SEGURA A EMOÇÃO" : "TOCA AQUI"}</small>
              </button>
            </div>
          </div>
          <p className="spin-caption" role="status">
            {spinning
              ? "A sorte tá dando uma voltinha…"
              : result
                ? "Curtiu? Você pode testar de novo."
                : "Seu próximo favorito pode estar a um giro."}
          </p>
          {error && <p role="alert">{error}</p>}
          <div className="how">
            <div>
              <b>01</b>
              <span>
                Dê um giro
                <br />
                <strong>na sua sorte.</strong>
              </span>
            </div>
            <i />
            <div>
              <b>02</b>
              <span>
                Poste um Story
                <br />
                <strong>marcando a Dion’s.</strong>
              </span>
            </div>
            <i />
            <div>
              <b>03</b>
              <span>
                Mostre à equipe
                <br />
                <strong>e aproveite!</strong>
              </span>
            </div>
          </div>
        </section>
        <section className="benefits-section">
          <div className="benefits-heading">
            <p>SEU PEDIDO + UM AGRADO</p>
            <h2>Olha o que pode sair.</h2>
            <span>Um giro. Um agrado para o seu pedido.</span>
          </div>
          <div className="benefits">
            {benefits.map((b, i) => {
              const Icon = icons[i];
              return (
                <div key={b.id}>
                  <Icon size={30} />
                  <span>{b.name}</span>
                </div>
              );
            })}
          </div>
        </section>
        <section className="brand-strip">
          <img src="/brand/burger.webp" alt="Hambúrguer artesanal da Dion’s" />
          <div>
            <span>O GIRO É SÓ O COMEÇO.</span>
            <h2>
              A fome a gente
              <br />
              resolve por aqui.
            </h2>
            <p>Feito no capricho. Do primeiro ao último pedaço.</p>
          </div>
          <img
            className="strip-line"
            src="/brand/line-12.svg"
            width="1056"
            height="1033"
            alt=""
            aria-hidden="true"
          />
        </section>
        <footer>
          <img src="/brand/logo.svg" alt="Dion’s" />
          <p>Experiência exclusiva Dion’s Burger Shop.</p>
          <nav>
            <button onClick={() => setStep("rules")}>Regras da campanha</button>
            <button onClick={() => setStep("privacy")}>Privacidade</button>
          </nav>
          <small>
            Campanha em pré-lançamento. Cadastre-se para acompanhar. Resgates em
            breve.
            {origin && ` Origem: ${origin}`}
          </small>
        </footer>
        {step && (
          <div className="overlay" onClick={() => setStep(null)}>
            <motion.div
              ref={dialogRef}
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="dialog-title"
              initial={{
                opacity: 0,
                y: reduced ? 0 : 24,
                scale: reduced ? 1 : 0.96,
              }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                ref={closeRef}
                className="close"
                aria-label="Fechar"
                onClick={() => setStep(null)}
              >
                <X />
              </button>
              <span className="modal-kicker">PRÉ-LANÇAMENTO</span>
              {step === "result" && result && (
                <>
                  <Celebration />
                  <div className="celebrate" aria-hidden="true">
                    <Ticket className="ticket-horizontal" size={52} />
                  </div>
                  <h2 id="dialog-title">
                    SUA SORTE
                    <br />
                    VEM AÍ!
                  </h2>
                  <div className="prize">
                    <strong>{result.name}</strong>
                    <p>{result.caption}</p>
                  </div>
                  <p>
                    Entre na lista para acompanhar o lançamento. O giro não
                    reserva benefícios.
                  </p>
                  <CustomerForm source={origin} />
                </>
              )}
              {step === "rules" && (
                <>
                  <h2 id="dialog-title">Sobre a campanha</h2>
                  <p>
                    A roleta Dion’s está em pré-lançamento. Explore os
                    benefícios enquanto preparamos a experiência completa.
                  </p>
                  <p>
                    O cadastro registra seu interesse no lançamento. Os giros
                    desta etapa não reservam benefícios nem emitem vouchers.
                  </p>
                  <p>
                    Benefícios, disponibilidade, limites e condições serão
                    informados no regulamento antes da abertura das
                    participações.
                  </p>
                </>
              )}
              {step === "privacy" && (
                <>
                  <h2 id="dialog-title">Sua privacidade</h2>
                  <p>
                    Ícones por{" "}
                    <a
                      href="https://www.flaticon.com/uicons"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        textDecoration: "underline",
                        textUnderlineOffset: "3px",
                      }}
                    >
                      Flaticon Uicons
                    </a>
                    .
                  </p>
                  <p>
                    Os dados do cadastro de interesse são guardados no Supabase,
                    com acesso restrito à equipe. Nenhum voucher é emitido nesta
                    etapa.
                  </p>
                  <p>
                    O parâmetro de origem identifica o acesso apenas nesta
                    página e não comprova presença física.
                  </p>
                  <p>
                    A política completa e os canais de atendimento serão
                    disponibilizados antes da abertura das participações. O
                    consentimento de marketing será separado da participação.
                  </p>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
      {!introReady && (
        <Preloader contentRef={contentRef} onComplete={finishIntro} />
      )}
    </main>
  );
}
