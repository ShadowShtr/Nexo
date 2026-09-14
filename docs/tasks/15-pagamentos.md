# MB WAY e reembolsos

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## PAY-01 — Validar prestador com recebimento por motorista

**Estado:** EM CURSO — contrato de evento verificado, idempotência e beneficiário server-side implementados; prestador MB WAY ainda por selecionar

**Dependências:** BAS-01

**Regras:** DEC-08..10; PEN-03

**Implementação:** Pesquisar documentação oficial atual, comparar onboarding por motorista, MB WAY, webhooks, reembolso e custos; implementar prova sandbox com dois beneficiários distintos.

**Aceitação:** Evidência demonstra dinheiro destinado ao motorista correto; limitações documentadas; sem alternativa silenciosa de cobrar na conta do proprietário.

**Evidência:** `src/application/payment-command.ts` exige webhook já verificado, resolve motorista e montante pelo contexto do servidor e rejeita alterações de organização, moeda ou valor. `tests/payment-command.test.ts` cobre evento, duplicação e falha. Falta comparar prestadores e realizar onboarding sandbox com beneficiários reais.

## PAY-02 — Cobrança de sinal/saldo por beneficiário

**Estado:** PLANEADA

**Dependências:** PAY-01, FIN-01, BKG-02

**Regras:** REG-05; DEC-09

**Implementação:** Onboarding do motorista, snapshot beneficiário, payment intent, idempotency key e UI de pending/error; bloquear cobrança se conta não habilitada.

**Aceitação:** Cliente não escolhe beneficiário no body; duas tentativas idênticas não duplicam cobrança; 25% calculados no servidor; valores/moeda ligados ao quote.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## PAY-03 — Webhook, confirmação e reconciliação

**Estado:** PLANEADA

**Dependências:** PAY-02, CAL-03

**Regras:** CAL-R06; REG-05; REG-09

**Implementação:** Verificar assinatura e payload, evento único, outbox, confirmação transacional; tratar chegada fora de ordem, pagamento tardio e consulta periódica de pendentes.

**Aceitação:** Evento duplicado só lança uma vez; montante/beneficiário errado não confirma; pagamento após expiração não toma vaga revendida; exceção gera alerta e tratamento rastreável.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## PAY-04 — Reembolso por cancelamento e exceções

**Estado:** PLANEADA

**Dependências:** PAY-03, BKG-03

**Regras:** REG-06; PEN-05

**Implementação:** Criar refund idempotente do sinal elegível, limites por pagamento, estados pending/succeeded/failed e retry; política do prestador e troca de motorista documentadas.

**Aceitação:** 24h exatas devolvem sinal pago uma vez; abaixo de 24h não devolve sinal; falha fica visível; soma devolvida não excede recebido; saldo antecipado não é retido por regra inventada.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
