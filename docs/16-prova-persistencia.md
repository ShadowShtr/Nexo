# 16 — Prova de persistência e concorrência (BAS-02)

Versão 0.2.1, 11/09/2026. Executada em PostgreSQL 17 local, com conexões independentes e dados fictícios. BAS-02 concluída. Esta prova não instala Supabase, não liga o browser ao banco e não constitui uma API de reservas.

## Execução reproduzível

Requer Node 24, npm e Docker em execução. Na raiz: `npm ci`, `npm run db:test:start`, `npm run test:db`. O script cria/reutiliza exclusivamente o contentor pm-foundation-db, marcado com pm.purpose=foundation-tests, porta 55439 apenas em 127.0.0.1. A palavra-passe pm_local_test_only é fictícia, exclusiva deste contentor local.

Cada execução de testes cria uma base com nome pm_proof seguido de UUID e remove apenas essa base após terminar. Não usa DATABASE_URL nem credenciais remotas. O contentor fica disponível para testes seguintes. Para o suspender: `docker stop pm-foundation-db`. Não necessita de serviço pago.

## Contratos implementados

| Ficheiro | Responsabilidade |
|---|---|
| src/contracts/reservation.ts | Entrada validada, cêntimos inteiros e sinal/saldo consistentes. Actor é contexto de servidor autenticado futuro. |
| src/application/reservation-ports.ts | UnitOfWork e operações de repositório independentes de pg. |
| src/application/request-reservation.ts | Coordenar idempotência, locks, conflito, snapshots e persistência numa transação. |
| src/infrastructure/postgres/proof-unit-of-work.ts | Adaptador pg, conexão única por transação, consultas parametrizadas e limites de espera. |
| db/proofs/scheduling.sql | Schema privado experimental; não é migração de produção. |
| tests/integration/postgres.test.ts | 11 cenários contra PostgreSQL real; sem mock de concorrência. |

## Sequência transacional

1. Validar formato e consistência do pedido preparado pelo servidor.
2. Abrir uma conexão e BEGIN em READ COMMITTED.
3. Confirmar que actor pertence à organização, está ativo e é proprietário. Bloquear leitura da membership contra alterações concorrentes.
4. Inserir/bloquear comando idempotente por organização e chave. Mesmo conteúdo devolve o recibo original; conteúdo diferente é rejeitado. Uma chave de transação falhada é revertida e pode ser tentada novamente.
5. Bloquear as linhas do motorista e veículo, ordenadas por UUID, com FOR UPDATE. Verificar organização, tipo e estado ativo.
6. Ler a configuração protegida e a hora real do banco depois de adquirir os bloqueios.
7. Ler reservas dos recursos; executar checkSchedule existente, com estimativas fornecidas por infraestrutura confiável. Estimativa ausente impede disponibilidade automática. Não fazer chamadas HTTP enquanto segura locks.
8. Gravar pedido, duas alocações, fotografia do orçamento/regras, evento outbox e resultado idempotente.
9. COMMIT; qualquer erro faz ROLLBACK integral e liberta a conexão.

O pedido nasce como requested e bloqueia provisoriamente durante 30 minutos. Não é viagem confirmada nem pagamento recebido. O domínio ignora holds expirados ao verificar disponibilidade, conservando os registos para histórico. O job que persiste a mudança para expired ainda pertence a CAL-03.

O mesmo protocolo de locks deverá ser usado em confirmar, cancelar, reagendar, alterar disponibilidade e desativar recursos. Nesta prova não existe proteção universal contra um administrador que escreva SQL fora do adaptador. Não expor estas tabelas ao browser. A formalização das permissões de escrita e das migrações é BAS-03/SEC-01.

## Mapeamento para o modelo lógico

Organization → organizations; Membership → memberships; Driver/Vehicle → resources tipados apenas nesta prova; SettingsVersion → configuração atual mais fotografia na reserva; Booking/Quote → bookings com fotografia JSON; ResourceAllocation → allocations; Outbox → outbox; deduplicação de comandos → commands.

As relações incluem organization_id nas chaves estrangeiras, impedindo referências a recursos de outra organização. Tipos driver/vehicle têm restrições e referências compostas. Índices por organização/recurso/início sustentam consultas de agenda. A consulta da prova lê todo o histórico dos recursos: BAS-03/CAL-02 devem otimizar vizinhos e bloqueios com planos reais, mantendo a correção do domínio.

O modelo completo em 06-dados.md continua a orientar migrações: clientes, associações temporais de motoristas/carros, jornadas, tarifas imutáveis, contactos, pagamentos e acertos não foram criados nesta prova. O orçamento aqui é preparado internamente e validado na sua matemática; ainda não prova origem, validade da tarifa, capacidade ou disponibilidade comercial. Essas guardas pertencem a PRC/CAT/CAL/BKG antes de qualquer endpoint público.

## Evidência

11 testes aprovados: colisão de motorista; colisão de veículo e sucesso independente; observação explícita de uma sessão bloqueada em pg_stat_activity; deduplicação concorrente e alteração de payload; rollback após falha no outbox; expiração sem apagar histórico; margem/rota ausente; snapshots imutáveis perante alteração de configuração; ator sem acesso e recursos de outra organização; acesso SQL sem privilégios negado/RLS ativo; entradas inválidas sem gravação.

RLS foi ativado em todas as tabelas do schema privado, sem políticas permissivas e sem grants públicos. O adaptador experimental usa o proprietário da base de testes, que pode ultrapassar RLS: a verificação de actor do caso de uso e a prova de negação de privilégios não substituem testes Supabase Auth/JWT. Não há SECURITY DEFINER, views, storage ou service_role no browser.

## Próximo bloco

BAS-03: converter a prova num schema completo versionado, gerar migrações com Supabase CLI e testar repetição/restauro; SEC-01: autenticação e autorização por papel. A geração de migrações e os advisors serão feitos no ambiente Supabase correspondente. O SQL desta pasta não deve ser aplicado num projeto remoto.

## Fontes consultadas

- [Bloqueios PostgreSQL](https://www.postgresql.org/docs/current/explicit-locking.html): locks duram até ao final da transação; ordem consistente reduz deadlocks.
- [Supabase RLS](https://supabase.com/docs/guides/database/postgres/row-level-security): RLS e privilégios são camadas distintas; papéis administrativos podem ultrapassar políticas.
- [Changelog Supabase](https://supabase.com/changelog): consultado em HTML após falha do endpoint Markdown. Alterações de exposição da Data API reforçam o uso de grants explícitos; sem integração com endpoints ou extensões alterados nesta prova.
