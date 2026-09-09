# Aba Agenda e calendário

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## CAL-01 — Horários, timezone, geração de slots e duração

**Estado:** PLANEADA

**Dependências:** CAT-02, CAT-03, CFG-01

**Regras:** CAL-R01; CAL-R02; CAL-R05; CAL-R08

**Implementação:** Implementar janelas semanais/exceções, antecedência, horizonte, duração de transfer/tour e slots locais; converter datas com timezone IANA e tratar hora ambígua/inexistente.

**Aceitação:** Grelha 60 min não encurta serviço de 150 min; slots não ultrapassam jornada; mesma data PT/EN aponta ao mesmo instante; mudanças de hora testadas.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## CAL-02 — Motor de conflitos e margens reais

**Estado:** PLANEADA

**Dependências:** CAL-01, BAS-03

**Regras:** CAL-R03; CAL-R04

**Implementação:** Ligar checkSchedule aos repositórios e ao cálculo rodoviário de deslocação; validar anterior/seguinte por condutor e veículo; bloquear indisponibilidades e margens.

**Aceitação:** Fim 12h + mínimo 60 permite 13h e rejeita 12h59; deslocação 90+tolerância15 só permite 13h45; carro compartilhado conflita; rota ausente não vira OK.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## CAL-03 — Bloqueios temporários, expiração e concorrência

**Estado:** PLANEADA

**Dependências:** CAL-02

**Regras:** CAL-R06; CAL-R07

**Implementação:** Implementar aquisição transacional ordenada dos recursos, holds com prazo, revalidação, jobs idempotentes e expectedVersion; bloquear propostas de alteração sem perder original.

**Aceitação:** Dois pedidos concorrentes só obtêm uma vaga; expiração na igualdade libera slot; reexecução do job não duplica eventos; alteração frustrada preserva reserva original.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## CAL-04 — Interface dia/semana/mês e detalhe de agenda

**Estado:** PLANEADA

**Dependências:** CAL-03, BAS-04

**Regras:** CAL-R01..08

**Implementação:** Criar visão por motorista/carro, filtros, legenda textual, margens visíveis e lista móvel; abertura de ficha e proposta validada ao mover evento.

**Aceitação:** Nenhum arrastar grava sem validar; mobile não corta horários; filtros não mudam alocações; estados vazio/carregando/erro disponíveis; parceiro só vê agenda própria.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
