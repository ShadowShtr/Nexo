# 19 — Schema operacional e restauração local

Versão 0.2.6, 14/09/2026. Evidência de conclusão de BAS-03 em Supabase exclusivamente local.

## Estrutura implementada

A migração `20260914084608_operational_booking_schema.sql` amplia clientes, perfis e versões de configuração e cria veículos, associações temporais, cotações imutáveis, reservas, alocações, comandos idempotentes e outbox. Todas as relações operacionais incluem `organization_id`; referências compostas impedem cruzamento acidental entre organizações.

Cada reserva aponta para uma cotação com linhas, total, sinal, saldo, validade e versão das regras. Alterar configurações futuras não altera a fotografia anterior. O browser não pode criar ou alterar registos operacionais: mutações ficam reservadas aos futuros casos de uso auditados no servidor.

## Concorrência e rollback

As alocações usam intervalos `[início,fim)` e constraints de exclusão GiST separadas para motorista e veículo. Duas transações reais que tentam alocar o mesmo motorista em horários sobrepostos resultam em uma gravação e uma rejeição PostgreSQL `23P01`.

O teste de rollback cria reserva, alocação, comando idempotente e evento de outbox na mesma transação, desfaz a transação e confirma zero registos em todas as tabelas. Holds expirados continuam a exigir transição explícita para `released`; nenhuma função dependente do relógio foi colocada na constraint.

## Acesso

As 12 tabelas públicas têm RLS. `anon` não possui privilégios. Um motorista autenticado lê apenas o veículo atribuído, as próprias associações, serviços e alocações; não recebe acesso direto a cotações, comandos, outbox ou `internal_note`. O proprietário lê a operação da própria organização. Escritas do browser permanecem revogadas.

## Verificação reproduzível

1. `npm run supabase:start`
2. `npx supabase db reset --local --yes`
3. `npm run test:auth`
4. `npx supabase db lint --local --schema public --level warning --fail-on error`
5. `npx supabase db advisors --local --type security --level warn --fail-on error`
6. Repetir o reset e os testes.

Resultado observado: migrações aplicadas duas vezes; 11/11 testes aprovados; lint sem erros; advisors de segurança e desempenho sem avisos no nível configurado.

## Limites

Não existe ligação a Supabase remoto, API operacional, convite por email ou interface autenticada. A constraint impede sobreposição estrita; margens de deslocação continuam no domínio e devem ser executadas dentro da transação pelo caso de uso. Backup de dados reais ainda não existe porque não há ambiente real.

## Referências

- [Fluxo de desenvolvimento local Supabase](https://supabase.com/docs/guides/local-development/cli-workflows)
- [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)

## Extensão 0.2.23

A migração `20260914111106_scheduling_slots_payments_changes.sql` acrescenta `scheduling_windows`, `scheduling_exceptions`, `payment_events` e `booking_change_proposals`. As quatro tabelas têm `organization_id`, chaves estrangeiras compostas quando aplicável, RLS e leitura autenticada filtrada por proprietário/motorista; escritas continuam exclusivas de `service_role`. O reset local, `db lint`, advisors de segurança/desempenho e 13 testes Auth/PostgREST foram repetidos após a extensão.
