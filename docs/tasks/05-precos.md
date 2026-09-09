# Motor de preços

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## PRC-01 — Resolver tarifas e produzir orçamentos persistentes

**Estado:** PLANEADA

**Dependências:** CFG-01, CAT-02, TOUR-01

**Regras:** REG-01..03; REG-05; REG-08

**Implementação:** Estender domínio com resolução de tarifa, faixa noturna local, mínimos se aprovados, capacidades combinadas e schema runtime; persistir cotação com validade e fotografia de regras.

**Aceitação:** Exemplos de 03-regras passam; início/fim da noite e meia-noite testados; servidor ignora total enviado pelo browser; regras novas não alteram quote válido antigo.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## PRC-02 — Paragens, espera e extras discriminados

**Estado:** PLANEADA

**Dependências:** PRC-01

**Regras:** REG-04; REG-05

**Implementação:** Integrar RouteProvider e espera prevista/real, franquia e blocos; linhas com quantidade/unidade; registar extra posterior sem sobrescrever orçamento.

**Aceitação:** Percurso considera paragens ordenadas; mesmos minutos não cobrados duas vezes; não há tarifa fictícia se mapas falharem; extras ficam pendentes de tratamento explícito.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
