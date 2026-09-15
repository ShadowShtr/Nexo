# 01 — Escopo e decisões

Versão 0.1.2. Fonte: decisões da conversa até 09/09/2026. C = confirmado; H = hipótese de implementação; P = pendente. Hipóteses permitem preparar código e testes, mas não são regras comerciais aprovadas para lançamento.

## Produto

Uma operação privada, gerida por um proprietário que também pode conduzir. Parceiros convidados recebem serviços; não gerem clientes próprios no sistema. Reservas antecipadas e para o próprio dia, se houver disponibilidade. Experiência semelhante à seleção de profissional num app de barbeiro, com apresentação premium.

## Decisões rastreáveis

| ID | Estado | Regra |
|---|---|---|
| DEC-01 | C | Um proprietário e motoristas parceiros; gestão centralizada. |
| DEC-02 | C | No transfer, cliente define primeiro percurso, recebe estimativa por km e depois escolhe motorista e carro disponível; cadastro apresenta o total. Revisão em [entrada do cliente](20-entrada-cliente.md). |
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
| DEC-20 | C | Interpretar uma hora como margem mínima entre serviços, não como duração de cada serviço nem frequência obrigatória de horários. |
| DEC-21 | C | Margem efetiva = max(60 min, deslocação estimada + 15 min de tolerância); valores configuráveis. |
| DEC-22 | C | Aceitação do motorista antes do pagamento; pedido expira em 30 min e pagamento em 30 min após aceitação. |
| DEC-23 | H | A janela de cancelamento/reagendamento usa a mais cedo entre data original e atual, evitando ampliar a janela artificialmente. |
| DEC-24 | H | Proprietário determina preço e disponibilidade; parceiro só comunica disponibilidade própria e executa serviços. |
| DEC-25 | C | Se motorista cancelar, cliente escolhe aceitar substituto ou receber devolução integral do recebido. |
| DEC-26 | C | Antecedência normal 2h; tours 2 dias, interpretados operacionalmente como 48h decorridas; recursos podem exigir mais. |
| DEC-27 | C | Reagendamento gera nova cotação, credita recebido e cobra/devolve diferença. |
| DEC-28 | C | X fixo por serviço, definido pelo proprietário e aceite pelo parceiro antes da viagem. |
| DEC-29 | C | Supabase para banco/autenticação; Vercel como preferência para app. Objetivo de custo base zero; conflito do Vercel Hobby comercial documentado. |
| DEC-30 | C | Todas as abas seguem as cinco referências visuais do utilizador: guia em 12-design-system e 13-mapa-visual-abas; fonte/medidas são aproximações especificadas. |

## Pendências que bloqueiam apenas os módulos correspondentes

| ID | Decisão | Impacto / condição de avanço |
|---|---|---|
| PEN-01 | Nome, logótipo e identidade comercial | Usar nome técnico provisório; não inventar marca definitiva. |
| PEN-02 | RESOLVIDA | Aceitação do motorista; 30 min para aceitar e 30 min para pagar. |
| PEN-03 | Prestador MB WAY com recebimento por cada motorista | Investigar contas beneficiárias, onboarding, webhooks, reembolsos e custos. Sem cobrança real até demonstrar o fluxo. |
| PEN-04 | X fixo resolvido; faltam regras em cancelamento e extras | Não gerar comissão em casos não definidos. Bloquear liquidação se valor não acordado. |
| PEN-05 | Não comparência e saldo antecipado em cancelamento do cliente | Cancelamento pelo motorista resolvido em DEC-25; não aplicar retenção do sinal a dinheiro que não é sinal. |
| PEN-06 | Reprecificação resolvida; operacionalização da troca após pagamento pendente | DEC-27 aprovada; mudança de beneficiário precisa de acerto/reembolso explícito, sem mover dinheiro automaticamente entre parceiros. |
| PEN-07 | Tarifas reais, horários noturnos e regras de carros especiais | Margem/antecedências padrão aprovadas; tarifas de exemplos ficam fora de produção. |
| PEN-08 | Faturação utilizada pelo negócio e regras fiscais aplicáveis | Adaptador separado; extrato ou confirmação não se apresentam como fatura fiscal. |
| PEN-09 | Canal de notificações e política de tratamento de dados | Preparar email e link para partilha manual; WhatsApp automático depende de integração própria. |
| PEN-10 | Lugares comercializados em cada veículo | Guardar capacidade de passageiros, excluindo motorista; não inferir capacidade pelo nome “7 lugares”. |

## Navegação e permissões

| Superfície | Abas/rotas |
|---|---|
| Cliente | Idioma; destino/origem; percurso e horário; estimativa; motorista/carro; cadastro e total; pedido/pagamento; consulta/reagendamento. Perfil e pacotes acessíveis separadamente. |
| Proprietário | Início; Agenda; Reservas; Clientes/CRM; Motoristas; Veículos; Pacotes; Financeiro; Acertos; Configurações. |
| Parceiro | Início; Meus serviços; Disponibilidade; Ganhos/acertos; Perfil. |

Um proprietário que conduz usa o mesmo motor de agenda. Viagem executada pelo próprio tem comissão interna zero. Identidades e permissões são verificadas no servidor. Acesso a cliente é contextual ao serviço atribuído, sem pesquisa/exportação do CRM pelo parceiro.

## Não escolhidos para a primeira versão

Lista de espera, sugestão automática de motorista alternativo, programa de indicações, avaliações, portal de hotéis, seguimento de voos, GPS em tempo real, importação automática do WhatsApp, fidelização e app nativo. Não confundir sugestões anteriores com funcionalidades aprovadas. Campos simples como número de voo podem existir sem seguimento automático.

## Fluxo principal alvo

Idioma → Descobrir/perfil → percurso e serviço → estimativa e data/hora → motorista e carro compatíveis → dados e revisão → pedido → aceitação → sinal → confirmação → execução → saldo/extras → conclusão → acerto com proprietário. Sequência revista em [entrada do cliente](20-entrada-cliente.md).

Carros devem ser revalidados após data e passageiros; mostrar um carro no perfil não garante disponibilidade. Reserva manual usa o mesmo motor de regras. Consultar marcação exige link seguro; referência curta isolada não autoriza acesso.
