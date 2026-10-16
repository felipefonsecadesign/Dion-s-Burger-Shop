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

## Refinamento de identidade

Logo vetorial exportado do Figma oficial (nó 6:44). As linhas anexadas são preservadas em `public/brand/line-3.svg` e `line-12.svg` e compõem as bordas do fundo, com alternativa sem movimento.

Ícones: Flaticon Uicons 3.3.1, família Bold Rounded; Instagram usa o símbolo oficial da família Brands. Os contornos originais foram extraídos do pacote oficial para SVGs individuais e `lib/icon-paths.ts`; nenhuma fonte inteira ou requisição ao Flaticon é necessária no navegador. Crédito em Privacidade e licença em `public/icons/LICENSE.txt`. O script `scripts/extract-uicons.py` documenta a reprodução (fonttools + brotli; pacote npm original como argumento).

O giro anima um contêiner HTML e aciona a lingueta a cada divisão ultrapassada. Confetes são disparados uma vez ao revelar o resultado. Todos os efeitos respeitam movimento reduzido. Motion mantém o giro e as transições do formulário. GSAP e @gsap/react coordenam a abertura e o movimento da linha.


## Abertura e fundo com GSAP

Preloader com traçado da linha original e entrada do logo, duração típica de 1,6 s, opção Pular abertura e limite de espera de 2,4 s antes da saída. Aguarda o logo e as fontes, sem exibir porcentagens fictícias. Há fallback CSS e alternativa sem JavaScript. A preferência de movimento reduzido pula a abertura e mantém o fundo estático.

`lib/brand-lines.ts` preserva os caminhos vetoriais originais. Apenas o último trecho Bézier de line-3 é deformado, em um ciclo suave de 7,6 s. O loop pausa fora da tela e com a aba oculta; ao abrir um modal, o fundo volta ao estado estático. `useGSAP` e `gsap.matchMedia` limpam as animações e os listeners.
