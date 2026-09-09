# Aba Configurações

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar.

## CFG-01 — Persistência e edição versionada de configurações

**Estado:** PLANEADA

**Dependências:** SEC-01, BAS-03

**Regras:** CFG-R01..03; REG-08

**Implementação:** Implementar tabela de versões, rascunho, publicação, diff e effectiveAt; formulário organizado por negócio, calendário, preços, políticas e notificações; validar unidades.

**Aceitação:** Apenas owner publica; publicar nova tarifa não altera quote/reserva anterior; rascunho incompleto não fica público; PT/EN e histórico de autor disponíveis.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## CFG-02 — Herança e configurações por motorista/carro/pacote

**Estado:** PLANEADA

**Dependências:** CFG-01, CAT-01, CAT-02, TOUR-01

**Regras:** CFG-R02; REG-08; CAL-R05

**Implementação:** Resolver overrides, zero vs vazio, maior antecedência e menor capacidade; mostrar origem herdada; exigir valores antes de habilitar serviço.

**Aceitação:** Carro especial impõe antecedência maior; tour substitui base/distância; override zero funciona; valores de demonstração não entram em publicação automática.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## CFG-03 — Simulador de preço e calendário antes de publicar

**Estado:** PLANEADA

**Dependências:** CFG-02, PRC-01, CAL-02

**Regras:** REG-02..05; CAL-R03

**Implementação:** Construir comparação entre configuração atual e rascunho com transfer, noite, tour e espera; simular duas viagens com deslocação e margem.

**Aceitação:** O mesmo input produz preço idêntico na API e simulação; apresenta origem das linhas, depósito/saldo e motivo de conflito; não grava reserva.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
