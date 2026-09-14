# App / vista do motorista

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## DRV-01 — Início, meus serviços e disponibilidade própria

**Estado:** EM CURSO — serviços demo filtrados por motorista e navegação Waze

**Dependências:** BKG-02, CAL-04, SEC-01

**Regras:** DEC-01; DEC-24

**Implementação:** Mostrar oferta com valor X, aceite/recusa, próximos serviços, ficha com passageiros/carros/percurso e bloqueios pessoais de disponibilidade; owner alterna vista.

**Aceitação:** Sem CRM global ou edição de tarifa; parceiro vê apenas atribuições próprias; bloqueio pessoal não cancela reserva existente e conflitos vão ao owner.

**Evidência:** `src/web/pages/DriverServicesSandbox.tsx` mostra serviços atribuídos, cliente, horário, estado e destino Waze. Teste Playwright confirma o link e a execução local; disponibilidade persistente, notificações e sessão real continuam pendentes.

## DRV-02 — Execução, espera e registo de recebimentos

**Estado:** EM CURSO — transições de execução demonstradas sem recebimentos reais

**Dependências:** DRV-01, FIN-01, PRC-02

**Regras:** REG-04; REG-05; REG-09

**Implementação:** Botões a caminho/cheguei/iniciar/concluir, timestamps, espera e ocorrências; saldo devido e recebimento manual identificado; extras separados.

**Aceitação:** Transições fora de ordem/por outro motorista falham no servidor; saldo não vira pago por iniciar viagem; override exige motivo; espera duplicada não cria duas linhas.

**Evidência:** O sandbox aplica `transition` para confirmado → a caminho → no local → em viagem → concluído. Registo de espera, recebimento por motorista e ledger persistente ainda faltam.
