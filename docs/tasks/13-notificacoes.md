# Mensagens e observações

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## NTF-01 — Templates PT/EN e outbox persistente

**Estado:** PLANEADA

**Dependências:** BKG-02, BAS-03, PUB-01

**Regras:** DEC-15; REG-09

**Implementação:** Implementar email por eventos e links para partilha manual, observações públicas/privadas, dedupe/retry e histórico de entrega; configurar canal real apenas quando validado.

**Aceitação:** Mensagem repetida pelo job não duplica envio lógico; falha não desfaz reserva; cliente recebe idioma guardado; dados de acerto/NIF nunca entram no template.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
