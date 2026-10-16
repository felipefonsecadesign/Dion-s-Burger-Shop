"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  ArrowUpRight,
  Volume2,
  VolumeX,
  X,
  Ticket,
  Instagram,
  RotateCcw,
  Fries,
  IceCreamBowl,
  CupSoda,
  Percent,
  Burger,
  Sparkles,
} from "@/components/brand-icon";
import { benefits, getDemoResult, type Benefit } from "@/lib/campaign";
import Wheel from "@/components/wheel";
const icons = [Fries, CupSoda, IceCreamBowl, Burger, Percent];
import CampaignBackground from "@/components/campaign-background";
import Celebration from "@/components/celebration";
import Preloader from "@/components/preloader";
import SnakeBackdrop from "@/components/snake-backdrop";
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
  const [step, setStep] = useState<
    "result" | "instagram" | "voucher" | "rules" | "privacy" | null
  >(null);
  const [sound, setSound] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
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
        const items =
          dialogRef.current?.querySelectorAll<HTMLElement>("button,a,input");
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
      const picked = await getDemoResult();
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
          setCode(`DEMO-${picked.participationId.slice(0, 8).toUpperCase()}`);
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
          <span className="edition">UM GIRO. UM MOTIVO A MAIS.</span>
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
          <div className="demo-tag">
            <span /> MODO DEMONSTRAÇÃO
          </div>
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
                aria-label={
                  spinning ? "Roleta girando" : "Girar roleta de demonstração"
                }
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
            <span>Benefícios ilustrativos. Aqui, a diversão é de verdade.</span>
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
            Demonstração visual. Nenhum benefício real será emitido.
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
              <span className="modal-demo">
                DEMONSTRAÇÃO · SEM VALOR DE RESGATE
              </span>
              {step === "result" && result && (
                <>
                  <Celebration />
                  <div className="celebrate" aria-hidden="true">
                    <Sparkles size={22} /> <Ticket size={42} />{" "}
                    <Sparkles size={22} />
                  </div>
                  <h2 id="dialog-title">
                    BOA!
                    <br />
                    VOCÊ GANHOU!
                  </h2>
                  <div className="prize">
                    <strong>{result.name}</strong>
                    <p>{result.caption}</p>
                  </div>
                  <p>
                    Teste o próximo passo com dados fictícios.
                    <br />
                    Nada será enviado ou salvo.
                  </p>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (name.trim().split(/\s+/).length < 2) {
                        setError("Informe nome e sobrenome fictícios.");
                        return;
                      }
                      setError("");
                      setStep("instagram");
                    }}
                  >
                    <label>
                      Nome completo
                      <input
                        required
                        autoComplete="off"
                        placeholder="Ex.: Alex da Silva"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        maxLength={90}
                      />
                    </label>
                    <label>
                      WhatsApp
                      <input
                        required
                        type="tel"
                        inputMode="tel"
                        autoComplete="off"
                        placeholder="(00) 90000-0000"
                        pattern={String.raw`[0-9 \(\)\+\-]{10,20}`}
                        title="Use um número fictício de 10 a 20 caracteres"
                      />
                    </label>
                    <label>
                      E-mail <small>(opcional)</small>
                      <input
                        type="email"
                        autoComplete="off"
                        placeholder="voce@exemplo.com"
                        maxLength={120}
                      />
                    </label>
                    <label className="checkbox">
                      <input type="checkbox" required /> Entendi que esta é uma
                      simulação, sem prêmio real.
                    </label>
                    <label className="checkbox">
                      <input type="checkbox" /> Quero receber novidades da
                      Dion’s (opcional e simulado).
                    </label>
                    {error && <p role="alert">{error}</p>}
                    <button className="primary">
                      RESGATAR MEU BENEFÍCIO <ArrowUpRight size={19} />
                    </button>
                  </form>
                </>
              )}
              {step === "instagram" && (
                <>
                  <Instagram className="modal-icon" size={44} />
                  <h2 id="dialog-title">
                    SEU BENEFÍCIO ESTÁ
                    <br />
                    <em>QUASE LIBERADO!</em>
                  </h2>
                  <p>
                    Para resgatar, publique um Story no Instagram marcando{" "}
                    <strong>@dionsburgershop</strong> e mostre a publicação
                    junto com seu voucher ao nosso atendente.
                  </p>
                  <div className="notice">
                    Na campanha real, a equipe confere o Story presencialmente.
                    Abrir o Instagram não comprova a publicação.
                  </div>
                  <a
                    className="primary"
                    href="https://www.instagram.com/dionsburgershop/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    ABRIR INSTAGRAM <ArrowUpRight size={19} />
                  </a>
                  <button
                    className="secondary"
                    onClick={() => setStep("voucher")}
                  >
                    VER MEU VOUCHER <Ticket size={19} />
                  </button>
                </>
              )}
              {step === "voucher" && result && (
                <>
                  <h2 id="dialog-title" className="sr-only">
                    Seu voucher demonstrativo
                  </h2>
                  <div className="voucher">
                    <img src="/brand/logo.svg" alt="Dion’s Burger Shop" />
                    <span className="status">PENDENTE · DEMONSTRAÇÃO</span>
                    <p>Esse agrado seria seu,</p>
                    <h3>{name.trim()}</h3>
                    <div className="voucher-prize">{result.name}</div>
                    <div className="perforation" />
                    <small>CÓDIGO ILUSTRATIVO</small>
                    <strong className="code">{code}</strong>
                    <p>Validade: não aplicável na demonstração.</p>
                    <div className="notice">
                      SEM VALOR DE RESGATE
                      <br />
                      Na campanha real, apresente o voucher e o Story à equipe.
                      Sujeito à validade e às regras aprovadas.
                    </div>
                  </div>
                  <button
                    className="secondary"
                    onClick={() => setStep("instagram")}
                  >
                    VER INSTRUÇÕES
                  </button>
                  <button className="text-button" onClick={() => setStep(null)}>
                    <RotateCcw size={15} /> Voltar à roleta
                  </button>
                </>
              )}
              {step === "rules" && (
                <>
                  <h2 id="dialog-title">Regras da demonstração</h2>
                  <p>
                    Esta é uma prévia da experiência da Dion’s. Os cinco
                    benefícios são fictícios e provisórios. Os giros podem ser
                    repetidos para avaliação visual e não geram direito a
                    prêmios.
                  </p>
                  <p>
                    As chances desta simulação não representam probabilidades
                    comerciais. Cadastro, publicação de Story, validade e
                    resgate são apenas ilustrativos.
                  </p>
                  <p>
                    A campanha real depende de aprovação comercial, regulamento
                    e verificação das exigências legais. A operação e o painel
                    serão desenvolvidos em fases posteriores.
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
                    Nesta demonstração, os campos são usados somente na memória
                    desta página para montar a prévia do voucher. Use dados
                    fictícios. Nenhum cadastro é enviado a um servidor ou
                    armazenado no navegador.
                  </p>
                  <p>
                    Ao recarregar a página, os dados desaparecem. O parâmetro de
                    origem aparece apenas nesta sessão e não comprova presença
                    física.
                  </p>
                  <p>
                    A política definitiva, os prazos de retenção e os canais
                    para exercer seus direitos serão definidos antes da campanha
                    real. O consentimento de marketing será separado da
                    participação.
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
