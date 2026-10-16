# Dion’s — Roleta premiada / Fase 1

Prévia visual em Next.js App Router, React, TypeScript, Motion e SVG. CSS próprio para o acabamento da campanha.

## Executar

npm install
npm run dev

Abra http://localhost:3000/roleta?origem=mesa-01.

## Escopo demonstrativo

Roleta com cinco segmentos, giro de seis segundos, som opcional, resultado, formulário, orientação Instagram e voucher ilustrativo. Regras e privacidade acessíveis pelo rodapé. Nenhum dado pessoal é enviado ou persistido. Recarregar limpa a participação. O código DEMO não é um voucher válido. Teste com dados fictícios.

`lib/campaign.ts` configura os benefícios e isola o adaptador de simulação. A seleção local é exclusivamente demonstrativa, sem probabilidades comerciais aprovadas. Na Fase 2 será substituída por uma decisão do servidor, vinculada à participação; o cliente apenas animará o resultado retornado.

## Próximas fases (não implementadas)

Supabase/Postgres, sorteio e idempotência no servidor, consentimentos e política definitiva, limites de participação, autenticação por função, vouchers persistentes, transação de resgate, auditoria, painel e gerador de QR Codes. Publicação e ativação dependem das aprovações descritas no briefing.

## Verificação

npm run typecheck
npm run build

Fontes Barlow Condensed e DM Sans via Google Fonts com fallback local. Assets oficiais fornecidos pelo cliente em public/brand.
