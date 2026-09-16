# Aba Reservas e marcação manual

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## BKG-01 — Criar reserva manual e pedido público pelo mesmo caso de uso

**Estado:** EM CURSO — marcação manual e caixa de entrada do cliente no demo, com validação de capacidade, horário e conflito

**Dependências:** CRM-01, PRC-02, CAL-03

**Regras:** DEC-17; REG-08; REG-09

**Implementação:** Criar draft/request com source WhatsApp/telefone/site/Instagram; busca cliente, percurso, tour, quote, recursos, dados pendentes e motivo de preço acordado; dedupe.

**Aceitação:** Manual não ignora capacidade/conflito/antecedência; repetir comando não cria duas reservas; override owner fica auditado; rascunho não envia confirmação.

**Evidência:** `src/web/pages/BookingSandbox.tsx` permite origem WhatsApp/telefone e mostra pedidos públicos completos recebidos de `src/web/demo-request-store.ts`, enquanto `checkSchedule` bloqueia conflitos. Teste Playwright cobre criação manual e leitura de contacto, NIF, percurso e valores pelo proprietário. Persistência operacional, dedupe, auditoria e integração com o caso de uso do servidor continuam pendentes.

## BKG-02 — Atribuição ao parceiro e estados da reserva

**Estado:** EM CURSO — transições protegidas por ator, pagamento, alocação e versão; persistência do caso de uso pendente

**Dependências:** BKG-01, SEC-01

**Regras:** DEC-01; DEC-22; REG-09

**Implementação:** Oferta de serviço com valor X, aceite/recusa, prazo e alertas; aplicar grafo de estados com guardas de acesso, alocação e pagamento; dono aceita próprios serviços.

**Aceitação:** Parceiro recusa sem cancelar silenciosamente cliente já confirmado; aceite fora de prazo falha; reserva só confirma com prova válida e recurso garantido.

**Evidência:** `src/application/booking-command.ts` e `tests/booking-command.test.ts` exigem motorista atribuído para aceitar/recusar, pagamento sucedido e alocação garantida para confirmar, saldo registado antes de iniciar e `expectedVersion` para evitar escrita obsoleta. Falta ligar o gateway à mutação transacional Supabase e às notificações.

## BKG-03 — Cancelamento e reagendamento versionado

**Estado:** EM CURSO — elegibilidade e reagendamento demonstrados em memória; mutação atómica persistente pendente

**Dependências:** BKG-02, SEC-02

**Regras:** REG-06; CAL-R07; PEN-05; PEN-06

**Implementação:** Registar pedido com hora servidor, calcular fronteira 24h, criar proposta com cotação e novo hold, confirmar atómico, disparar evento de reembolso; revisão de motorista trocado.

**Aceitação:** 24h exatas permitem; menos 1ms bloqueia reagendamento/retém sinal; pedidos repetidos não duplicam; falha preserva original; troca não muda beneficiário de pagamento existente.

**Evidência:** `src/domain/policy.ts` calcula a fronteira de 24h, `CustomerSandbox.tsx` demonstra a proposta e `src/application/booking-change.ts` aplica token do cliente, versão esperada, reembolso de sinal elegível, reembolso integral no cancelamento pelo motorista e proposta com nova cotação sem substituir a original. Falta persistência transacional, hold atómico, webhook de reembolso e auditoria.
