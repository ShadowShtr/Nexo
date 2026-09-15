# Entrada do cliente — revisão do planeamento

Pedido de 14/09/2026. Estado: direção aplicada no fluxo demo, incluindo planeador inline na descoberta e autocomplete com fornecedores substituíveis; localização, rota rodoviária, persistência e pagamento reais continuam pendentes. Esta sequência substitui a seleção inicial de motorista no transfer. Não altera as políticas de pagamentos, cancelamentos ou tours.

## Sequência

Antes do formulário, a tela **Descobrir** funciona como catálogo visual: pesquisa “Para onde?”, opção de horário, categorias de tours e um destaque Lisboa–Sintra com imagem. O destaque e cada categoria conduzem ao fluxo abaixo, já com o serviço tour selecionado.

1. **Para onde vai?** A descoberta abre os campos e o mapa na mesma tela, sem trocar de aba. O mapa começa centrado na origem sugerida; após escolher o destino, mostra a rota e aguarda “Ver rota e preço” para confirmar a cotação. Entrada com PT/EN acessível, destino como ação principal, locais recentes e mapa após o cálculo. Origem sugerida pela localização atual após autorização; confirmar endereço/pino, permitindo editar sempre. Lote e número de porta são preservados como conceitos diferentes. Se a fonte só reconhecer o arruamento, o resultado continua selecionável, mas o ponto fica explicitamente marcado como aproximado até confirmação do pino. Sem autorização, precisão suficiente ou localização disponível, preencher a origem manualmente. Não pedir localização repetidamente nem tratar a posição aproximada como recolha confirmada.
2. **Percurso e horário.** Confirmar origem/destino, data/hora e passageiros; permitir paragens e espera. Estes dados são necessários antes de filtrar motoristas/carros por disponibilidade, capacidade e antecedência. Viagem no próprio dia continua dependente dessas regras.
3. **Distância e estimativa.** Consultar distância e duração rodoviárias reais entre os pontos ordenados. Mostrar km e estimativa calculada com a tarifa publicada pelo proprietário. Enquanto não houver rota válida, mostrar erro/repetição, nunca zero euros ou distância em linha reta como cotação rodoviária.
4. **Motorista e carro.** Escolher motorista e um dos carros associados disponíveis para o percurso e horário. Mostrar foto, nome, lugares de passageiros, bagagem, suplementos e total de cada opção. Recalcular quando a seleção alterar a tarifa; manter os dados do percurso ao voltar.
5. **Cadastro e revisão.** Nome completo, email, telefone e NIF, com resumo visível do percurso, horário, recursos, preço total, adicionais, sinal de 25% e saldo. Antes de recursos/extras estarem definidos, usar a palavra estimativa; o total final é validado no servidor.
6. **Pedido e pagamento.** Enviar pedido; manter a aceitação do motorista antes do pagamento já acordada. Depois do aceite, pedir o sinal e disponibilizar consulta segura e estado da reserva.

O link do Instagram mantém a referência do motorista e permite consultar o perfil, mas o transfer inicia pelo percurso. Um motorista indicado pelo link é uma preferência, nunca garantia de disponibilidade. Tours continuam num fluxo próprio com preço de pacote, evitando cobrar km novamente.

## Matemática

- Distância cobrável em km = metros da rota / 1000; não arredondar km para inteiros antes da multiplicação.
- Parcela de distância em cêntimos = arredondamento half-up(metros × tarifa em cêntimos por km / 1000).
- Exemplo ilustrativo: 12,5 km × 20 €/km = 250 €. O valor de 20 € não passa a tarifa real nem padrão de produção.
- Total = base aplicável + distância + adicionais aplicáveis discriminados. Espera, paragens, suplemento de carro e noite seguem as regras existentes; apresentar cada parcela sem duplicação.
- Sinal = arredondamento half-up(total em cêntimos × 25 / 100); saldo = total − sinal. No exemplo sem outros custos: 62,50 € de sinal e 187,50 € de saldo.
- Alterar origem, destino, paragens, horário, passageiros, espera, motorista ou carro invalida a cotação anterior quando afetar preço/disponibilidade. Guardar tarifa e regras em snapshot na cotação, com validade; mudanças posteriores de configuração não reescrevem históricos.

## Direção visual para implementar

Priorizar a referência Uber indicada pelo utilizador na entrada do cliente: tipografia sans-serif legível, títulos fortes, hierarquia simples, preto/branco/cinzas, separadores discretos e poucos cartões sobrepostos. Fonte exata e medidas oficiais ainda não verificadas; não apresentar a fonte de sistema atual como idêntica à Uber.

Proposta inicial de tokens para revisão: texto/campos 16 px, títulos 28–32 px, pesos 400/500/700, grelha de 8 px, campos/botões com 48–56 px de altura e raio 8–12 px, separadores de 1 px, sombras mínimas. São valores propostos, não extraídos da Uber. Validar uma fonte licenciada consistente entre PC e telemóvel antes de substituir a família atual.

Desktop: painel de percurso e mapa lado a lado. Telemóvel: mapa e painel de campos adaptado à altura disponível; teclado não tapa a ação principal. Confirmar no dispositivo real posteriormente. As referências anteriores permanecem como base das áreas internas até revisão específica.

## Implementação nas tarefas existentes

- PUB-01 / UI-02: entrada “Para onde vai?”, idioma, contexto Instagram e composição responsiva.
- NAV-01: localização autorizada, pesquisa de moradas, confirmação do pino, rota real e falhas do fornecedor.
- CFG-01/02 / PRC-01/02: tarifa por km publicada, suplementos, estimativa e cotação final no servidor.
- PUB-02 / CAL-01..03: percurso e horário antes dos recursos; seleção filtrada; cadastro com resumo do total.
- PUB-03: pedido, aceite, sinal e consulta; preservar as políticas existentes.
- UI-03: verificar PC e telemóvel, PT/EN, teclado, localização recusada e textos longos.

Critérios de revisão: percurso preservado ao voltar; nenhum recurso indisponível selecionável; preço atualizado sem cotação antiga parecer válida; GPS recusado não impede marcação; distância real e extras discriminados; total sempre acessível no cadastro. A demonstração cobre a sequência e as guardas principais em memória; a integração de produção continua nas tarefas PUB, NAV, PRC e CAL.
