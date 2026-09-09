# 01 — Escopo e decisões

Versão 0.1.0. Fonte: decisões da conversa até 09/09/2026. C = confirmado; H = hipótese de implementação; P = pendente. Hipóteses permitem preparar código e testes, mas não são regras comerciais aprovadas para lançamento.

## Produto

Uma operação privada, gerida por um proprietário que também pode conduzir. Parceiros convidados recebem serviços; não gerem clientes próprios no sistema. Reservas antecipadas e para o próprio dia, se houver disponibilidade. Experiência semelhante à seleção de profissional num app de barbeiro, com apresentação premium.

## Decisões rastreáveis

| ID | Estado | Regra |
|---|---|---|
| DEC-01 | C | Um proprietário e motoristas parceiros; gestão centralizada. |
| DEC-02 | C | Cliente escolhe motorista e depois um dos carros disponíveis para ele. |
| DEC-03 | C | Instagram leva ao perfil com motorista, veículo e serviços. |
| DEC-04 | C | Recolher nome completo, email, telefone e NIF para faturação. |
| DEC-05 | H | Mostrar orçamento antes de exigir registo; cliente manual pode completar dados por link. |
| DEC-06 | C | Reservas agendadas ou no dia, respeitando disponibilidade. |
| DEC-07 | C | Percurso com recolha, destino, paragens e espera; preços configuráveis. 20 EUR/km foi apenas exemplo, não tarifa real. |
| DEC-08 | C | Sinal de 25%; saldo de 75% no início; extras no final. |
| DEC-09 | C | Tudo é recebido pelo motorista da viagem, inclusive sinal online. |
| DEC-10 | C | Proprietário tem um valor X acordado; acerto pessoal, registado no sistema, sem transferência automática. |
| DEC-11 | C | Cancelamento com >=24h devolve integralmente o sinal; com <24h não devolve o sinal. |
| DEC-12 | C | Pedido de reagendamento no link da reserva com >=24h. |
| DEC-13 | C | Tours: base para até duas pessoas; acréscimo por pessoa adicional. |
| DEC-14 | C | Zonas de recolha/atendimento e taxas de deslocação por motorista. |
| DEC-15 | C | Escolha PT/EN no início e percurso completo traduzido. |
| DEC-16 | C | Extratos de acertos por motorista e período. |
| DEC-17 | C | Proprietário lança reservas recebidas por WhatsApp/telefone. |
| DEC-18 | C | Agenda, CRM, financeiro, ficha de serviço com rota/Waze, observações e estados. |
| DEC-19 | C | Calendário com intervalos de uma hora para deslocação/atrasos e aba de configurações. |
| DEC-20 | H | Interpretar uma hora como margem mínima entre serviços, não como duração de cada serviço nem frequência obrigatória de horários. |
| DEC-21 | H | Margem efetiva = max(60 min, deslocação estimada + 15 min de tolerância); valores configuráveis. |
| DEC-22 | H | Aceitação do motorista antes do pagamento; pedido expira em 30 min e pagamento em 30 min após aceitação. |
| DEC-23 | H | A janela de cancelamento/reagendamento usa a mais cedo entre data original e atual, evitando ampliar a janela artificialmente. |
| DEC-24 | H | Proprietário determina preço e disponibilidade; parceiro só comunica disponibilidade própria e executa serviços. |
| DEC-25 | H | Cancelamento pelo prestador propõe devolução integral do recebido; confirmar política antes de lançar. |

## Pendências que bloqueiam apenas os módulos correspondentes

| ID | Decisão | Impacto / condição de avanço |
|---|---|---|
| PEN-01 | Nome, logótipo e identidade comercial | Usar nome técnico provisório; não inventar marca definitiva. |
| PEN-02 | Aprovação ou confirmação automática; tempos de expiração | Motor de estados segue H; validar antes da reserva pública. |
| PEN-03 | Prestador MB WAY com recebimento por cada motorista | Investigar contas beneficiárias, onboarding, webhooks, reembolsos e custos. Sem cobrança real até demonstrar o fluxo. |
| PEN-04 | Valor X fixo por serviço; regras em cancelamento e extras | Campo explícito acordado; não presumir percentagem nem comissão automática. Bloquear liquidação se valor não definido. |
| PEN-05 | Cancelamento pelo motorista, não comparência e reembolsos de saldo antecipado | Não aplicar retenção do sinal a dinheiro que não é sinal; revisão do proprietário até política definida. |
| PEN-06 | Diferença de preço em reagendamento e troca após pagamento | Proposta: nova cotação, crédito do recebido, cobrança/devolução da diferença; mesma entidade recebedora na primeira versão. |
| PEN-07 | Tarifas reais, horários noturnos, antecedências e margem | Formulário de onboarding exige publicação explícita. Valores de exemplos ficam fora de produção. |
| PEN-08 | Faturação utilizada pelo negócio e regras fiscais aplicáveis | Adaptador separado; extrato ou confirmação não se apresentam como fatura fiscal. |
| PEN-09 | Canal de notificações e política de tratamento de dados | Preparar email e link para partilha manual; WhatsApp automático depende de integração própria. |
| PEN-10 | Lugares comercializados em cada veículo | Guardar capacidade de passageiros, excluindo motorista; não inferir capacidade pelo nome “7 lugares”. |

## Navegação e permissões

| Superfície | Abas/rotas |
|---|---|
| Cliente | Idioma; perfil do motorista; carros; pacotes/tours; personalização/percurso; registo; orçamento/pagamento; consulta da reserva/reagendamento. |
| Proprietário | Início; Agenda; Reservas; Clientes/CRM; Motoristas; Veículos; Pacotes; Financeiro; Acertos; Configurações. |
| Parceiro | Início; Meus serviços; Disponibilidade; Ganhos/acertos; Perfil. |

Um proprietário que conduz usa o mesmo motor de agenda. Viagem executada pelo próprio tem comissão interna zero. Identidades e permissões são verificadas no servidor. Acesso a cliente é contextual ao serviço atribuído, sem pesquisa/exportação do CRM pelo parceiro.

## Não escolhidos para a primeira versão

Lista de espera, sugestão automática de motorista alternativo, programa de indicações, avaliações, portal de hotéis, seguimento de voos, GPS em tempo real, importação automática do WhatsApp, fidelização e app nativo. Não confundir sugestões anteriores com funcionalidades aprovadas. Campos simples como número de voo podem existir sem seguimento automático.

## Fluxo principal alvo

Idioma → perfil → motorista → carro compatível → serviço/tour → data, passageiros e percurso → disponibilidade e orçamento → dados de cliente → pedido → aceitação → sinal → confirmação → execução → saldo/extras → conclusão → acerto com proprietário.

Carros devem ser revalidados após data e passageiros; mostrar um carro no perfil não garante disponibilidade. Reserva manual usa o mesmo motor de regras. Consultar marcação exige link seguro; referência curta isolada não autoriza acesso.
