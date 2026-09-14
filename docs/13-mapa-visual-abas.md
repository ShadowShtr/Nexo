# 13 — Aplicação do padrão em todas as abas

Esta especificação aplica o [sistema visual](12-design-system.md) às tarefas existentes. Na versão 0.2.0 existe uma pré-visualização das áreas e um calendário visual. As funcionalidades operacionais abaixo continuam por implementar; ver 15-base-web.md. Não adiciona funcionalidades comerciais não escolhidas.

## Proprietário

| Aba / tarefas | Ordem e composição | Detalhes obrigatórios |
|---|---|---|
| Início — DASH-01 | Saudação/data, título, ação nova reserva; destaque escuro do próximo serviço; pendências em grupos brancos; próximos serviços em cartões | Destacar ação que exige atenção; números reais e estados vazios, sem saldo bancário fictício |
| Agenda — CAL-04 | Data + controlos, filtros, calendário branco/lista diária, detalhe em painel | Faixas de deslocação, duração correta, legendas, nome/carro/hora; conflito legível antes de guardar |
| Reservas — BKG-01/02/03 | Título + adicionar; pesquisa; chips estado/data/motorista; grupos por dia como referência de transações | Cartão: hora e percurso à esquerda; total e badge à direita; cliente/carro abaixo. Detalhe completo ao abrir |
| Clientes — CRM-01/02 | Título + novo cliente, pesquisa; lista com avatar e nome; ficha com grupos de contactos e histórico | NIF apenas em faturação; notas privadas assinaladas; não expor CRM ao parceiro |
| Motoristas — CAT-01 | Lista de perfis com foto, nome e estado; ficha com dados, carros, disponibilidade e habilitação de recebimentos | Valores bancários e credenciais não são públicos; desativar em ação separada com consequências |
| Veículos — CAT-02 | Cartões com foto 16:10, nome, passageiros/bagagem, estado; detalhe em grupos | Capacidade exclui motorista; suplemento e antecedência com unidades; associação ao motorista visível |
| Pacotes — TOUR-01/02 | Foto, título e duração, preço base em destaque, adicional por pessoa; editor com grupos PT/EN e roteiro ordenado | Texto explícito “Até 2 pessoas”; “+… por pessoa adicional”; antecedência 48h; sem cobrança de km duplicada |
| Financeiro — FIN-01/02 | Período no cabeçalho; cartão preto de recebido; valores secundários pendente/devolvido; filtros e movimentos por data | Distinguir recebido pelos motoristas de receitas do proprietário; selecionar base de data do relatório |
| Acertos — SET-01/02 | Cartão preto “A receber em acertos”; lista branca por parceiro; detalhe com serviços e liquidações | Ação “Registar acerto”; indicar registo pessoal, não transferência executada; parcial e liquidado legíveis |
| Configurações — CFG-01/02/03 | Exatamente padrão de grupos da referência: legenda externa + linhas brancas; estado da versão no topo | Negócio/idioma, calendário, preços, tours, políticas, notificações; editar abre campo/folha; rascunho/simular/publicar sem confusão |

Menu Mais usa o mesmo padrão de lista agrupada, com ícone, nome e chevron; não é uma segunda dashboard. Configurações é uma aba completa acessível por Mais no mobile e no menu lateral desktop.

## Parceiro

| Aba | Composição |
|---|---|
| Início — DRV-01 | Próxima viagem em cartão preto, novas ofertas em branco com aceitar/recusar; horário e valor X claros |
| Serviços — DRV-01/02 | Pesquisa/filtros simples, grupos por dia; ficha mostra rota, cliente, carro e estado; botão preto para a próxima ação válida |
| Disponibilidade — DRV-01/CAL-04 | Seletor de dia e períodos, grupos de janelas de trabalho e bloqueios próprios; conflitos com reservas confirmadas explicados |
| Ganhos — SET-02 | Valores dos próprios serviços, recebido e devido ao proprietário separados; histórico por período, sem dados dos outros parceiros |
| Perfil | Avatar/nome e grupos com contactos e preferências permitidas; definições comerciais continuam do proprietário |

Ficha de execução: cabeçalho voltar + referência; hora/estado; rota com pontos ordenados; botão Abrir no Waze; dados do passageiro; dinheiro recebido/saldo; observações; ação contextual. Em viagem, evitar controlos pequenos ou grandes formulários como ação principal. Estados atualizados pelo motorista continuam sujeitos às guardas do servidor.

## Cliente

Para transfers, a ordem abaixo é substituída pela [revisão de entrada do cliente](20-entrada-cliente.md): destino/origem → percurso e horário → estimativa → motorista/carro → cadastro e total → pedido. As composições abaixo permanecem referências de componentes.

| Etapa | Composição e aplicação do padrão |
|---|---|
| Idioma — PUB-01 | Duas opções grandes PT/EN, seleção visível; não usar bandeira como único rótulo; preferência acessível depois |
| Perfil — PUB-01 | Foto do motorista, nome/apresentação, cartões brancos dos serviços/carros e botão Reservar; fotografia própria substitui ícones genéricos |
| Carro — PUB-02 | Lista de fotos de carros associados, capacidade, bagagem, adicionais e antecedência; seleção com contorno escuro e texto/ícone |
| Serviço/tour — PUB-02 | Roteiro e inclusões, duração, base para duas pessoas; seletor de passageiros com botões de alvo 44px; total recalcula |
| Data/hora — PUB-02 | Calendário em cartão branco, seleção preta, slots em pílulas; indisponibilidade com texto e alternativa de procurar outra data |
| Percurso e extras — PUB-02 | Moradas em campos agrupados e paragens ordenadas, espera/extras em grupos; mapa opcional como complemento, não substituto dos campos |
| Dados — PUB-02 | Nome/email/telefone/NIF com labels e ajuda; tipo de teclado apropriado, erros perto do campo |
| Orçamento — PRC/PUB-03 | Total em cartão preto, discriminação branca; sinal 25% e saldo destacados; prazo de cancelamento visível antes de pagar |
| Aguarda aceite/pagamento — PUB-03 | Estado em destaque e próximos passos, prazo por hora do servidor; não apresentar pago antes da confirmação |
| Consulta — PUB-03 | Referência, hora, motorista/carro, percurso, pagamento e timeline; reagendar/cancelar com disponibilidade e limite de 24h claros |
| Reagendamento — BKG-03 | Horário atual e proposta separados, novo orçamento e crédito do pago; confirmação explícita; original mantido até sucesso |
| Cancelamento/substituição — BKG-03/PAY-04 | Consequência monetária clara; quando motorista cancela, escolher substituto ou devolução integral; dinheiro pendente não aparece devolvido |

## Estados transversais

- Lista vazia: título curto, explicação e ação possível; sem cartões inventados.
- Sem resultado de pesquisa: manter query/filtros e oferecer limpar.
- Erro de servidor/mapas: mensagem persistente, tentar novamente; valores antigos assinalados quando aplicável.
- Pagamento pendente: estado textual e atualização, sem spinner infinito como única informação.
- Permissão insuficiente: não renderizar dados privados; acesso controlado no servidor.
- Alteração concorrente: explicar atualização necessária e preservar campos possíveis, sem sobrescrever reserva de outro operador.

## Entrega visual por fases

UI-01: guia e tokens. UI-02: componentes reutilizáveis no scaffold e exemplos de todos os estados. UI-03: revisão visual por abas implementadas e tamanhos/idiomas. Tarefas funcionais só ficam concluídas com a aplicação destes critérios. Esta fase não exige decidir hospedagem nem ligar Supabase.
