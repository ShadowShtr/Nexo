# Aba Financeiro

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## FIN-01 — Ledger de recebimentos, saldos e reembolsos

**Estado:** PLANEADA

**Dependências:** BAS-03, BKG-01

**Regras:** REG-05; REG-07; DEC-09

**Implementação:** Persistir eventos de pagamento e devolução, saldo calculado, método e beneficiário; recibos manuais identificados por autor; imutabilidade e ajustes.

**Aceitação:** Sinal+saldo+extras conciliam com total aprovado; reembolso não apaga recebido histórico; saldo negativo é crédito explícito; proprietário não é apresentado como recebedor bancário.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## FIN-02 — Visões financeiras por período/serviço/motorista

**Estado:** PLANEADA

**Dependências:** FIN-01, PAY-03, SET-01

**Regras:** REG-05; REG-07

**Implementação:** Filtros de recebido, pendente, devolvido e valor do proprietário; drilldown por serviço; exportação de gestão com identificação de período e moeda.

**Aceitação:** Data de serviço e data de recebimento são filtros distintos; não soma valor contratado como dinheiro recebido; parceiro não vê totais globais; extrato não é rotulado fatura fiscal.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
