# Aba Pacotes e tours

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar.

## TOUR-01 — Editor bilingue de tours

**Estado:** PLANEADA

**Dependências:** SEC-01, CFG-01

**Regras:** DEC-13; DEC-15; REG-03

**Implementação:** Criar pacote com título, fotos, roteiro ordenado, duração, inclusões/exclusões, base até 2, adicional por pessoa, limite e antecedência; estado rascunho/publicado.

**Aceitação:** 1 e 2 pessoas partilham preço base; sem texto inglês ou duração não publica; preço e roteiro antigos permanecem no snapshot da reserva.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## TOUR-02 — Vincular tours a motoristas/carros e disponibilidade

**Estado:** PLANEADA

**Dependências:** TOUR-01, CAT-02, CAL-01

**Regras:** REG-03; CAL-R02

**Implementação:** Selecionar recursos habilitados, locais de recolha, duração incluída e extensões; ligar disponibilidade ao mesmo calendário dos transfers.

**Aceitação:** Tour e transfer não sobrepõem mesmo carro/condutor; visitas incluídas não duplicam duração; capacidade respeita mínimo pacote/carro.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
