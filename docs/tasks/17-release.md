# Estabilização e lançamento

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## REL-01 — Integração completa e piloto de operação

**Estado:** PLANEADA

**Dependências:** PUB-03, DRV-02, NAV-01, NTF-01, PAY-04, SET-02, FIN-02, CFG-03, SEC-03, DASH-01

**Regras:** Todos os gates de 08-entrega

**Implementação:** Executar cenário completo PT/EN com dois parceiros e carro partilhado; teste mobile, acessibilidade, cancelamento, reagendamento, falha de pagamento e liquidação parcial.

**Aceitação:** Evidências E2E, segurança e concorrência anexadas; pendências comerciais resolvidas; nenhum estado fictício ou integração sandbox se apresenta como real.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## REL-02 — Release, hospedagem e plano de atualização

**Estado:** PLANEADA

**Dependências:** REL-01

**Regras:** REG-08; G5

**Implementação:** Preparar migrações, backup/restauração, segredos de produção, monitorização, rollback compatível, changelog e versão; publicar no host/plano confirmado, validando compatibilidade com uso comercial e limites de custo.

**Aceitação:** Build/checks passam, restauração demonstrada, URL e versão verificadas após deploy, piloto aprovado e runbook de incidentes disponível.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
