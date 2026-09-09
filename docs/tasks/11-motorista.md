# App / vista do motorista

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar.

## DRV-01 — Início, meus serviços e disponibilidade própria

**Estado:** PLANEADA

**Dependências:** BKG-02, CAL-04, SEC-01

**Regras:** DEC-01; DEC-24

**Implementação:** Mostrar oferta com valor X, aceite/recusa, próximos serviços, ficha com passageiros/carros/percurso e bloqueios pessoais de disponibilidade; owner alterna vista.

**Aceitação:** Sem CRM global ou edição de tarifa; parceiro vê apenas atribuições próprias; bloqueio pessoal não cancela reserva existente e conflitos vão ao owner.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## DRV-02 — Execução, espera e registo de recebimentos

**Estado:** PLANEADA

**Dependências:** DRV-01, FIN-01, PRC-02

**Regras:** REG-04; REG-05; REG-09

**Implementação:** Botões a caminho/cheguei/iniciar/concluir, timestamps, espera e ocorrências; saldo devido e recebimento manual identificado; extras separados.

**Aceitação:** Transições fora de ordem/por outro motorista falham no servidor; saldo não vira pago por iniciar viagem; override exige motivo; espera duplicada não cria duas linhas.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.
