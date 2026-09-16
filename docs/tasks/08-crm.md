# Aba Clientes / CRM

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## CRM-01 — Cadastro e pesquisa de clientes

**Estado:** EM CURSO — CRM demo com cadastro, validação de NIF, pesquisa e importação do pedido público

**Dependências:** SEC-01, BAS-03

**Regras:** DEC-04; DEC-17

**Implementação:** Criar ficha com nome, email, telefone normalizado, NIF de faturação e idioma; rascunho manual pode completar por link; pesquisar telefone/email e sinalizar possíveis duplicados.

**Aceitação:** Partner não lista CRM; não fundir pessoas só por telefone automaticamente; NIF de turista não recebe validação portuguesa arbitrária; entrada inválida mostra erro localizado.

**Evidência:** `src/contracts/customer.ts` valida nome, email, telefone e NIF de 9 dígitos; `CustomerCrmSandbox.tsx` permite cadastrar, pesquisar e receber clientes de `demo-request-store.ts`. Testes Node e Playwright cobrem os limites. Persistência operacional, deduplicação e ligação ao pedido do servidor continuam pendentes.

## CRM-02 — Histórico, moradas e notas internas

**Estado:** EM CURSO — notas internas demonstradas em memória

**Dependências:** CRM-01, BKG-01

**Regras:** DEC-18; REG-08

**Implementação:** Mostrar reservas, pagamentos, endereço frequente e notas privadas; ação nova reserva com dados reutilizados e orçamento recalculado.

**Aceitação:** Repetir viagem não reutiliza preço/slot antigo sem cotação; nota interna nunca vai para cliente; ações de edição ficam auditadas.

**Evidência:** O CRM demo mostra notas internas por cliente e deixa o modelo pronto para histórico/moradas. Falta persistência, histórico de reservas, preferências e controlo de acesso detalhado.
