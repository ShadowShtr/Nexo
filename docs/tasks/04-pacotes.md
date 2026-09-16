# Aba Pacotes e tours

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## TOUR-01 — Editor bilingue de tours

**Estado:** EM CURSO — editor demo bilingue com duração de dois dias, área/local e foto

**Dependências:** SEC-01, CFG-01

**Regras:** DEC-13; DEC-15; REG-03

**Implementação:** Criar pacote com título, fotos, roteiro ordenado, duração, inclusões/exclusões, base até 2, adicional por pessoa, limite e antecedência; estado rascunho/publicado.

**Aceitação:** 1 e 2 pessoas partilham preço base; sem texto inglês ou duração não publica; preço e roteiro antigos permanecem no snapshot da reserva.

**Evidência:** `src/contracts/tour.ts` exige nomes/descritivos PT/EN, duração de 2 dias, base e adicional; `TourSandbox.tsx` permite inserir pacotes com área/local e foto principal, guardando a configuração demo no navegador. Teste Node e Playwright cobrem a regra de dois dias e os novos campos. Persistência e publicação autenticada continuam pendentes.

## TOUR-02 — Vincular tours a motoristas/carros e disponibilidade

**Estado:** EM CURSO — antecedência e simulador demo; vínculos persistentes pendentes

**Dependências:** TOUR-01, CAT-02, CAL-01

**Regras:** REG-03; CAL-R02

**Implementação:** Selecionar recursos habilitados, locais de recolha, duração incluída e extensões; ligar disponibilidade ao mesmo calendário dos transfers.

**Aceitação:** Tour e transfer não sobrepõem mesmo carro/condutor; visitas incluídas não duplicam duração; capacidade respeita mínimo pacote/carro.

**Evidência:** O editor demonstra antecedência mínima configurável a partir de 48h e mantém o simulador de preço para até duas pessoas. Associação a motoristas/carros, calendário e disponibilidade persistentes ainda faltam.
