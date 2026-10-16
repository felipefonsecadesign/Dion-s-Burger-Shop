# Backend Dion’s

Projeto: `zvndirwhvuiyebulmkfi` / `dions-roleta`, região São Paulo.

## Cadastros

`capture-customer` valida nome, WhatsApp brasileiro, e-mail opcional e consentimento. O consentimento de marketing é separado e registrado com versão do aviso e horário. A seleção visual do benefício nunca é aceita como prêmio pelo backend.

O navegador usa apenas a chave pública anon para a verificação JWT da Edge Function. A chave service_role é fornecida pelo ambiente do Supabase e nunca é enviada ao cliente ou ao repositório. As tabelas negam SELECT/INSERT/UPDATE/DELETE a anon e authenticated. Somente a função no servidor grava dados usando a transação `capture_customer`.

Limites: 10 tentativas por cliente de rede a cada 15 minutos e 200 novos contatos por hora no total. O identificador de rede é HMAC; o IP não é persistido. Não há autenticação de identidade do telefone nesta fase; os registros são contatos de interesse, não participantes premiados. Antes da promoção real, adicionar confirmação de telefone e proteção anti-bot, regras aprovadas e política definitiva.

Idempotência por UUID e hash do payload. Uma linha por telefone/campanha; reenvio não altera contatos ou consentimentos anteriores. A resposta não revela se o telefone já existia. A mesma transação grava a fila `sheets_outbox`.

## Planilha

Planilha ROLETA DION’S, ID `1ALBBGDfl23PbnHIGHa9l-BHYYBlsBC7kEibjVM7hyQY`, aba `Página1`. Compartilhamento público removido com aprovação do usuário. Cabeçalhos A1:J1 preparados e verificados.

Script vinculado: https://script.google.com/u/0/home/projects/1WOeJavAJdBW3Mx4voSdPsHkPZOjASo5IuDltffP2qXcjqM9yXz-sjEXv/edit

O código `docs/google-sheets-sync.gs` e o manifesto já foram salvos no editor vinculado. É necessário concluir a autorização Google e executar `ativarSincronizacaoDions` para instalar o acionador a cada 5 minutos. Enquanto não houver execução bem-sucedida, considerar a sincronização PENDENTE; o cadastro no Supabase é independente.

`sheets-sync` mantém a verificação JWT e exige adicionalmente um token Google válido da conta proprietária `felipefonsecadesign@gmail.com`, verificado pelo endpoint userinfo do Google. Não exporta contatos para outras contas. O token é obtido em tempo de execução pelo Apps Script e nunca é salvo no código. Nenhuma senha ou chave privada precisa ser copiada para a planilha.

O script deduplica pelo ID, usa lock, neutraliza células que poderiam ser interpretadas como fórmulas e confirma a fila somente depois da gravação. Falhas deixam os registros pendentes para repetição. A planilha é cópia operacional; o Supabase é a fonte principal. Alterações ou exclusões manuais na planilha não são sincronizadas de volta ao banco.

## Validação realizada

- Compilação Next.js e TypeScript.
- Endpoint real: consentimento obrigatório, telefone inválido, cadastro válido, repetição da mesma requisição, conflito de chave, bloqueio de leitura pública e rejeição sem JWT.
- SQL: limite de tentativas, RLS e ausência de privilégios nas roles públicas. Os dados técnicos dos testes foram excluídos.
- Advisor: apenas INFO `rls_enabled_no_policy` nas quatro tabelas, intencional: nenhuma política permite acesso a clientes comuns. Referência: https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy

## Limites de escopo

Sem sorteio real, vouchers, resgates, painel de funcionários ou integração com caixa. Não se presume aprovação comercial da campanha. Definir o processo de retenção/exclusão e a política definitiva antes de ativar a promoção real.
