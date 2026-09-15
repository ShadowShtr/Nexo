# 02 — Arquitetura e organização

## Direção

Nota de continuidade (15/09/2026): a árvore abaixo inclui arquitetura alvo. As camadas application, contracts, identity e infrastructure já têm implementação parcial; consultar o [mapa atual](22-estado-atual-e-limites.md). BAS-03 e SEC-01 têm validação local concluída; referências a pendências nas secções históricas abaixo não anulam essa evidência.

Monólito modular: uma aplicação e uma base de dados, com domínios separados. Isto simplifica a primeira operação e preserva pontos de separação para crescimento. Não começar com microserviços. TypeScript no domínio e futura aplicação web; contratos portáveis, independentes do framework.

Na versão 0.2.0 existem src/domain, src/web e src/ui, além de testes e exemplos. src/web contém a pré-visualização React/Vite; a camada de aplicação, infraestrutura e módulos de dados abaixo continua planeada. Ver 15-base-web.md para os limites do scaffold.

```text
app/                         telas, rotas e layouts web PT/EN
components/                  UI partilhada e acessível
src/
  domain/                    matemática e invariantes sem rede
  modules/
    identity/                utilizadores, papéis, sessões
    catalog/                 motoristas, carros, tours, zonas
    scheduling/              disponibilidade, bloqueios e alocações
    bookings/                pedidos, alterações, execução
    customers/               CRM e dados de faturação
    pricing/                 tarifas, orçamentos imutáveis
    payments/                pagamentos e reembolsos
    settlements/             dívida ao proprietário e liquidações
    settings/                configurações e versões
    notifications/           mensagens e preferências de idioma
  application/               casos de uso e transações entre módulos
  contracts/                 schemas de entradas/saídas e erros
  infrastructure/            implementações de banco, pagamentos, mapas, email
  i18n/                      catálogos de textos
db/migrations/               alterações incrementais de schema
tests/{unit,integration,e2e}/ camadas de verificação
docs/{tasks,adr}/             tarefas e decisões de arquitetura
```

## Regras de dependência

UI → casos de uso → domínio + interfaces. Infraestrutura implementa interfaces; domínio não importa framework, banco, SDK ou ficheiros de ambiente. A API valida entradas e autentica; cada caso de uso autoriza a ação e aplica regras. Compartilhar fórmulas com a UI é permitido, mas o servidor recalcula e confirma o valor final.

Módulos não escrevem diretamente nas tabelas financeiras de outros módulos. `ConfirmBooking` coordena prova de pagamento, validade da reserva e alocação numa transação. Notificações são disparadas após commit através de outbox persistente.

## Persistência e crescimento

Banco relacional com transações reais, restrições únicas e controlo de concorrência obrigatório. Supabase/Postgres foi escolhido pelo utilizador. BAS-02 foi validada em PostgreSQL local na versão 0.2.1 (ver 16-prova-persistencia.md); migrações completas e configuração remota continuam pendentes. O utilizador escolheu Vercel para o app, substituindo a preferência inicial de Sites. Vercel Hobby exclui uso comercial: resolver plano pago versus alternativa antes de publicar. A aplicação deve manter regras de negócio portáveis e chamadas sensíveis no servidor.

Todos os dados operacionais levam `organizationId`. Só há uma organização na primeira versão; não existe adesão pública de novas empresas. Esta chave facilita uma evolução sem misturar dados. IDs opacos, createdAt/updatedAt, versão de concorrência e autor de alterações.

O conflito de agenda deve ser verificado dentro de uma transação que serialize as alocações do motorista e veículo. Se o motor não oferecer locks de linha, implementar serialização equivalente por recurso; uma leitura seguida de insert sem proteção não é aceite. Bloquear recursos numa ordem estável para evitar deadlocks.

## Adaptadores

| Interface | Responsabilidade |
|---|---|
| RouteProvider | Distância rodoviária em metros, duração em minutos, estimativa por horário, origem da estimativa e validade. |
| PaymentProvider | Criar cobrança para beneficiário motorista, receber webhook assinado, consultar, reembolsar, reconciliar. |
| NotificationProvider | Enviar template localizado; registar tentativas e resultado. |
| InvoiceProvider | Integração fiscal futura separada dos extratos de gestão. |
| Clock | Hora do servidor injetável nos testes. |
| UnitOfWork | Atomicidade de reserva, alocação, orçamento e eventos. |

Falha do cálculo de rota impede confirmação automática; nunca substituir por distância em linha reta sem sinalização. Operador poderá fornecer estimativa revista com autoria e motivo no futuro, sem ultrapassar conflitos de agenda.

## Acesso

- Owner: CRM completo da organização, preços, atribuições, agenda geral, caixa e acertos.
- Driver: apenas atribuições próprias, contactos necessários, disponibilidade própria e acertos próprios; não altera tarifa, beneficiário nem valor X.
- Customer: apenas reservas autorizadas por conta ou link seguro validado, com ações limitadas.
- Webhook: canal técnico autenticado por assinatura; não partilha autenticação do cliente.

Ocultar um botão não é segurança. Todas as consultas filtram organização e autorização no servidor. Não devolver NIF, notas internas ou valor de comissão na resposta pública de uma reserva.

## Decisões iniciais de arquitetura

- ADR-001 aceito: monólito modular e funções puras.
- ADR-002 aceito: cêntimos, pontos base e arredondamento explícito.
- ADR-003 aceito: UTC persistido e Europe/Lisbon apresentado.
- ADR-004 aceito: preços e regras fotografados por reserva.
- ADR-005 proposto: aplicação web responsiva antes de app nativo.
- ADR-006 atualizado: Supabase/Postgres escolhido; prova de concorrência/persistência pendente. Vercel preferido, custo/alternativa em análise.
- ADR-007 pendente: prestador de pagamentos com beneficiários separados.

Cada alteração significativa cria um ADR com contexto, escolha, alternativas relevantes, consequência, migração e data. Não reescrever ADR antigo para esconder mudança.
