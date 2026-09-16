# Aba Início do proprietário

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## DASH-01 — Resumo operacional acionável

**Estado:** EM CURSO

**Dependências:** BKG-02, FIN-01, CAL-03

**Regras:** REG-09; DEC-18

**Implementação:** Mostrar próximos serviços, pedidos pendentes, serviços sem aceite, pagamentos/exceções e atalho nova reserva; cada indicador abre filtro correspondente.

**Aceitação:** Totais derivam da mesma consulta operacional, sem dados fixos; situações canceladas/expiradas não contam como confirmadas; período usa Europe/Lisbon.

**Evidência:** Parcial em 0.2.89: `src/web/pages/OwnerHomeSandbox.tsx` apresenta próxima operação, métricas, pedidos que precisam de atenção e atalhos responsivos; pedidos demo do cliente entram no painel via `demo-request-store`. Build e browser da rota `#/owner/home` aprovados. A consulta operacional real e os indicadores derivados do servidor permanecem por concluir.
