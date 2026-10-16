"use client";
import { useRef, useState, type FormEvent } from "react";
import { ArrowRight } from "@/components/brand-icon";
import { customerEndpoint, customerPublicKey } from "@/lib/customer-api";

export default function CustomerForm({ source }: { source: string }) {
  const id = useRef<string | null>(null);
  const payload = useRef("");
  const busy = useRef(false);
  const [status, setStatus] = useState<"idle" | "sending" | "saved">("idle");
  const [error, setError] = useState("");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const form = new FormData(event.currentTarget);
    const data = {
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      email: String(form.get("email") ?? ""),
      source: source || "site",
      website: String(form.get("website") ?? ""),
      privacyConsent: form.get("privacy") === "on",
      marketingConsent: form.get("marketing") === "on",
    };
    const serialized = JSON.stringify(data);
    if (payload.current !== serialized) {
      id.current = crypto.randomUUID();
      payload.current = serialized;
    }
    busy.current = true;
    setStatus("sending");
    setError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12000);
    try {
      const response = await fetch(customerEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: customerPublicKey,
          Authorization: "Bearer " + customerPublicKey,
        },
        body: JSON.stringify({ ...data, requestId: id.current }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "Não foi possível salvar. Tente novamente.",
        );
      setStatus("saved");
    } catch (e) {
      setStatus("idle");
      setError(
        e instanceof Error && e.name !== "AbortError"
          ? e.message
          : "A conexão demorou. Tente novamente.",
      );
    } finally {
      clearTimeout(timeout);
      busy.current = false;
    }
  }
  if (status === "saved")
    return (
      <div className="notice" role="status">
        <strong>CADASTRO RECEBIDO!</strong>
        <p>Você está na lista de interesse da Dion’s.</p>
        <p>
          Este cadastro não reserva benefícios. O resgate será liberado no
          lançamento.
        </p>
      </div>
    );
  return (
    <form onSubmit={submit} aria-busy={status === "sending"}>
      <fieldset className="customer-fields" disabled={status === "sending"}>
        <legend className="sr-only">Cadastro de interesse</legend>
        <label>
          Nome completo
          <input
            name="fullName"
            required
            autoComplete="name"
            minLength={3}
            maxLength={100}
            placeholder="Seu nome completo"
          />
        </label>
        <label>
          WhatsApp
          <input
            name="phone"
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={20}
            placeholder="(00) 90000-0000"
          />
        </label>
        <label>
          E-mail <small>(opcional)</small>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="voce@exemplo.com"
          />
        </label>
        <div className="honeypot" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <details className="capture-privacy">
          <summary>Como usaremos seus dados</summary>
          <p>
            Nome e WhatsApp serão guardados no Supabase para registrar seu
            interesse e informar sobre o lançamento. O e-mail é opcional. A
            equipe da Dion’s poderá consultar os cadastros em uma planilha de
            acesso restrito. Para corrigir ou excluir seus dados, fale com a
            equipe da Dion’s. Nenhum voucher é emitido nesta etapa.
          </p>
        </details>
        <label className="checkbox">
          <input name="privacy" type="checkbox" required /> Li o aviso e
          autorizo o uso dos dados para meu cadastro de interesse.
        </label>
        <label className="checkbox">
          <input name="marketing" type="checkbox" /> Quero receber também
          ofertas e novidades por WhatsApp ou e-mail (opcional).
        </label>
      </fieldset>
      {error && <p role="alert">{error}</p>}
      <button className="primary" disabled={status === "sending"}>
        {status === "sending" ? "SALVANDO…" : "QUERO SABER DO LANÇAMENTO"}{" "}
        <ArrowRight size={20} />
      </button>
    </form>
  );
}
