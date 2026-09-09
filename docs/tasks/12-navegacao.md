# Rota e Waze

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## NAV-01 — Percurso e navegação por etapa

**Estado:** PLANEADA

**Dependências:** DRV-01, PRC-02

**Regras:** DEC-18; CAL-R02

**Implementação:** Validar integração oficial de link Waze por coordenadas; abrir recolha antes do início e próxima etapa depois; fallback endereço copiável; manter roteiro ordenado.

**Aceitação:** Testes em Android/iOS com app presente/ausente; paragem certa em cada etapa; Waze não é apresentado como fornecedor do preço ou tracking automático.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
