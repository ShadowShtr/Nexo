# 09 — Roadmap por etapas

Não são tarefas novas da barra lateral do Codex; são tarefas versionadas no próprio projeto para serem implementadas por ordem. Não abrir tarefas independentes sem necessidade ou pedido do utilizador.

| Etapa | Objetivo | Tarefas / dependências | Saída verificável |
|---|---|---|---|
| 0 — 0.1.0 | Regras e alicerce | BAS-01 | Esta documentação, domínio e testes. |
| 1 — 0.2.x | Persistência, acesso e configurações | BAS-02..04, SEC-01..02, CFG-01..03 | Banco transacional, papéis e simulador de regras; catálogos ainda podem estar vazios. |
| 2 — 0.3.x | Catálogo e calendário | CAT, TOUR, PRC, CAL | Motoristas/carros/tours, preço e disponibilidade consistentes. |
| 3 — 0.4.x | Operação do proprietário | CRM, BKG, DASH | Criar cliente/reserva manual, atribuir e acompanhar sem cobrança real. |
| 4 — 0.5.x | Cliente e execução | PUB, DRV, NAV, NTF | Percurso PT/EN, consulta, reagendamento e serviço do parceiro em ambiente de teste. |
| 5 — 0.6.x | Financeiro real | PAY, FIN, SET | Recebimento por motorista, devolução e acerto pessoal registado. |
| 6 — 0.7.x/1.0 | Piloto e lançamento | SEC-03, REL | Integração completa, operação piloto e release. |

PAY-01 (viabilidade do prestador) pode começar cedo para evitar descobrir uma limitação tarde. Não exige interromper catálogo, agenda ou CRM. Na etapa 3, registos de pagamentos manuais são claramente identificados e não substituem a implementação de cobrança online.

## Caminho crítico

BAS-02 → BAS-03 → SEC-01 → CAT-01/02 → CFG-01 → PRC-01 → CAL-01/02/03 → BKG-01/02 → PUB-03 → PAY-02/03 → REL-01.

CRM e traduções podem avançar quando contratos/acesso estiverem prontos. Acertos dependem de eventos de conclusão e acordo X; não precisam de transferências automáticas.

## Rastreabilidade por necessidade

| Pedido | Implementação planeada |
|---|---|
| Instagram e perfil premium | PUB-01 |
| Nome, email, telefone, NIF | CRM-01, PUB-02 |
| Escolher motorista e carros dele | CAT-01/02, PUB-02 |
| 7 lugares, antecedência e suplementos | CAT-02, CFG-02, CAL-01, PRC-01 |
| Percurso, paragens e espera | PRC-02, BKG-01, NAV-01 |
| Calendário com uma hora de intervalo | CAL-01/02, CFG-01 |
| Tours para duas pessoas + adicionais | TOUR-01/02, PRC-01 |
| Área de atendimento | CAT-03, CAL-01 |
| PT/EN desde entrada | PUB-01, BAS-04, NTF-01 |
| Sinal 25%, saldo no início | PAY-02, FIN-01, DRV-02 |
| Tudo recebido pelo executor | PAY-01/02, FIN-01 |
| Link e código de consulta | PUB-03, SEC-02 |
| Cancelamento/reagendamento 24h | BKG-03, PUB-03, PAY-04 |
| WhatsApp manual e CRM | BKG-01, CRM-01/02 |
| Waze na ficha de serviço | NAV-01, DRV-01 |
| Parceiros recebem serviços | BKG-02, DRV-01, SEC-01 |
| Financeiro e acertos pessoais | FIN-01/02, SET-01/02 |
| Configurações de valores | CFG-01/02/03 |

## Reutilização aprovada como direção de implementação

BAS-05 documenta a pesquisa concluída em [bibliotecas GitHub](14-reutilizacao-github.md). BAS-04 valida o conjunto escolhido; UI-02 e CAL-04 reutilizam componentes. Isto não conclui as tarefas de funcionamento nem altera a ordem de persistência, concorrência e interface.

## Primeiro ciclo depois desta entrega

1. BAS-02: selecionar persistência adequada e definir transação por motorista/veículo.
2. BAS-03: implementar primeiro o teste “dois pedidos, uma vaga”.
3. BAS-04 + SEC-01: scaffold web PT/EN e login/permissões.
4. CFG-01: primeira aba com versão e validação das regras.
5. CAT-01/02 + CAL-01/02: recursos e calendário; só depois abrir o fluxo público.

Não começar por todas as telas ao mesmo tempo. Cada incremento deve atravessar contrato, regra, persistência, UI e teste da funcionalidade correspondente.
