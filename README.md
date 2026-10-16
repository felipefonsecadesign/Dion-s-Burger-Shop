# Dion’s — Roleta premiada

Aplicação em pré-lançamento com Next.js App Router, React, TypeScript, SVG, Motion e GSAP.

## Executar

```sh
npm install
npm run dev
```

Abra http://localhost:3000/roleta?origem=mesa-01.

## Estado atual

Visual oficial de pré-lançamento. O giro permite conhecer os benefícios, mas não reserva prêmio. Cadastro e resgate estão desativados; não há coleta de dados de participantes nem emissão de voucher. O adaptador `getPreviewResult` em `lib/campaign.ts` faz apenas a seleção visual local, sem probabilidades comerciais aprovadas. O backend decidirá os resultados quando a campanha for implementada e ativada.

## Identidade e movimento

Logo vetorial exportado do Figma oficial, nó 6:44. Assets fornecidos pelo cliente em `public/brand`. Ícones Flaticon Uicons 3.3.1 Bold Rounded; crédito em Privacidade e licença em `public/icons/LICENSE.txt`. O script `scripts/extract-uicons.py` reproduz a extração dos contornos originais (fonttools + brotli e pacote npm oficial como argumento).

Abertura apenas com logo, duração típica de 3,4 s e saída em dois painéis pretos. Tocar no logo pula a abertura. O preloader tem espera limitada e alternativa sem JavaScript. `SnakeBackdrop` faz o traço arredondado percorrer curvas atrás da roleta num ciclo de 24 s. O movimento pausa fora da tela e com a aba oculta. A preferência de movimento reduzido pula a abertura e mantém o fundo estático.

## Próximas fases

Supabase/Postgres, sorteio e idempotência no servidor, consentimentos, regulamento, limites de participação, autenticação por função, vouchers persistentes, transação de resgate, auditoria, painel e gerador de QR Codes. Ativação depende das aprovações comerciais e do regulamento.

## Verificar

```sh
npm run typecheck
npm run build
```
