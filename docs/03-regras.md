# 03 — Regras e matemática

IDs REG usados nas tarefas e testes. Cálculos são propostas explícitas quando não definidos pelo utilizador; ver DEC/PEN em 01-escopo. Todos os exemplos são fictícios.

## REG-01 — Unidades e arredondamento

Dinheiro EUR em cêntimos inteiros, distâncias em metros inteiros, tempos em minutos inteiros. Percentagens em pontos base: 25%=2500, 10%=1000, 100%=10000. Arredondamento comercial half-up ao cêntimo em cada linha; total é a soma dessas linhas. Intermediários monetários usam BigInt para não perder precisão; o resultado tem de caber num inteiro seguro. Rejeitar negativos, NaN, infinito e valores fracionários onde se exige inteiro.

`roundHalfUp(n/d) = floor((2*n+d)/(2*d))`, para n>=0 e d>0.

Moeda única EUR nesta fase. A localização inglesa não converte moeda. Impostos precisam de integração/decisão fiscal: apresentar preço final ao consumidor; nunca somar uma taxa fiscal inventada. Guardar futuro detalhamento fiscal separadamente.

## REG-02 — Transfer

`distanciaCentimos = roundHalfUp(metrosRodoviarios * tarifaCentimosPorKm / 1000)`

`nucleo = tarifaBase + distanciaCentimos`

`suplementoNoturno = roundHalfUp(nucleo * taxaNoturnaBps / 10000)`

`total = nucleo + suplementoNoturno + soma(extras)`

Extras discriminados: zona/recolha, categoria/veículo quando explicitamente cobrada, paragens, espera, portagens e estacionamento conhecidos. Cada custo entra uma única vez. Os valores do núcleo são resolvidos pelo motor de tarifas, com precedência explícita e snapshot. No core atual recebem-se as tarifas já resolvidas.

Exemplo: base 10 EUR + 12,5 km a 2 EUR/km = 35 EUR; noturno 20%=7 EUR; extra 5 EUR → total 47 EUR; sinal 11,75 EUR; saldo 35,25 EUR. Os 20 EUR/km mencionados na conversa não são default.

Hipótese noturna: usa a hora local de início, sem repartir a viagem em segmentos diurnos/noturnos. Intervalo noturno [início,fim), inclusive início e exclusivo fim; se atravessa meia-noite, pertence à noite se hora>=início OU hora<fim. Exemplo configurável, não publicado: 22:00–06:00. Validação adicional fica em PRC-01.

## REG-03 — Tour

`pessoasAdicionais = max(0, passageiros - 2)`

`nucleoTour = precoBaseAteDuasPessoas + pessoasAdicionais * acrescimoPorPessoa`

Mesmo preço base para 1 ou 2 pessoas. Não acrescentar automaticamente distância ao preço do tour: o roteiro é parte do pacote. Suplementos autorizados no catálogo podem somar ao núcleo, sempre visíveis. Noturno de tours fica desligado por default até configuração explícita.

Exemplo: base 200 EUR e 35 EUR por pessoa adicional: 1/2 pessoas =200; 3=235; 4=270. Sinal para 4 pessoas=67,50; saldo=202,50 EUR.

Limite de passageiros = mínimo entre capacidade de passageiros do carro e limite do pacote. Contar crianças na capacidade; regras de preço diferenciadas para crianças não foram pedidas. Bagagem e cadeiras são validações independentes.

## REG-04 — Espera e paragens

`minutosCobraveis = max(0, esperaReal - esperaIncluida)`

`minutosFaturados = ceil(minutosCobraveis / blocoMinutos) * blocoMinutos`

`esperaCentimos = roundHalfUp(tarifaHoraCentimos * minutosFaturados / 60)`

Bloco deve ser >0. Proposta inicial: blocos de 15 min; preço/hora requer configuração. Exemplo: 10 min incluídos, 26 min reais, bloco 15, 24 EUR/h → 16 min cobraveis, 30 faturados, 12 EUR. Espera incluída já ocupa calendário; não é tempo invisível por ser grátis.

Distância inclui todas as paragens ordenadas. Uma paragem pode ter taxa de serviço própria e duração de espera. Cobrar os dois apenas quando correspondem a serviços distintos e discriminados; não cobrar duas vezes os mesmos minutos. Duração de calendário usa tempo reservado, nunca arredondamento de faturação para encurtar o serviço. Excesso real gera alerta para próximos trabalhos.

## REG-05 — Sinal e saldo

`sinal = roundHalfUp(totalInicial * 2500 / 10000)`

`saldoInicial = totalInicial - sinal`

O saldo é subtração, não um segundo arredondamento de 75%. Para 101 cêntimos: sinal 25, saldo 76. Total abaixo dos mínimos do prestador deve ser bloqueado na integração, não ajustado silenciosamente.

Motorista executor é o beneficiário de 100% das cobranças. Proprietário não retém o sinal. Webhook validado confirma pagamento; retorno do browser ou captura de ecrã não confirma automaticamente.

`saldoAtual = totalAprovado - (recebimentosConfirmados - reembolsosConcluidos)`

Resultado positivo = cobrar; negativo = crédito/devolução a tratar. Extras posteriores são novas linhas com autoria e comunicação, sem reescrever o orçamento original nem cobrar automaticamente sem autorização. O módulo 0.1.0 só calcula o split inicial; ledger persistente vem em PAY.

## REG-06 — Cancelamento e reagendamento

`antecedenciaMs = inicioDaViagemUTC - pedidoRecebidoNoServidorUTC`

Elegível se antecedenciaMs >= 86.400.000 (24 horas exatas). 24h exatas: sim; 23h59m59,999s: não. São horas decorridas, não dias de calendário; mudanças de hora não alteram o total de milissegundos.

Cancelamento elegível devolve o sinal efetivamente recebido ainda não devolvido. Não elegível retém o sinal. Não aplicar esta retenção ao saldo pago antecipadamente: PEN-05 exige decisão. Registar cancelamento mesmo se a devolução falhar; devolução fica pendente com alerta e tentativas controladas.

Reagendamento cria uma proposta/revisão; reserva original permanece válida até confirmação atómica da nova alocação. Novo horário deve respeitar capacidade, antecedência, recursos e preço. Em falha/expiração, libertar só a proposta. Hipótese antiabuso: limite calculado pela mais cedo entre data original e atual; não se renova a janela ao adiar. Essa hipótese está isolada no parâmetro originalStart e carece de confirmação comercial.

Troca de motorista após sinal não é uma simples edição de ID: muda beneficiário. Na primeira versão, abrir ocorrência para proprietário e impedir transferência automática. Exigir tratamento do dinheiro já recebido e aceite do cliente antes da substituição.

## REG-07 — Acertos entre parceiros e proprietário

Por serviço: preço do passageiro P, valor fixo acordado com proprietário X, recebido do cliente R, liquidado ao proprietário L. P e X são campos independentes; X não altera o preço nem o sinal do cliente. Não presumir percentagem.

`dividaAoProprietario = soma(X dos serviços elegíveis) - soma(liquidacoesAlocadas)`

Exemplo: viagem 200 EUR, X=20 EUR. Motorista recebe 50 EUR sinal +150 EUR saldo. Deve 20 EUR ao proprietário; após registo do acerto de 20, pendente=0. Isso não é uma transferência executada pelo sistema.

Serviços próprios: X=0. Proposta: dívida nasce na conclusão de serviço de parceiro; X deve estar acordado antes de aceitar. Política de comissão em cancelamento, não comparência e extras é pendente; não gerar automaticamente dívida nesses casos. Liquidação pode cobrir vários serviços, com alocações parciais e sem exceder o devido. Correções geram movimentos inversos auditados.

## REG-08 — Versões e precedência

Alterar tarifa às 15h não muda reserva confirmada às 14h. Orçamento guarda valores por linha, moeda, versão de tarifa, snapshot de cancelamento/margens, motorista recebedor, rota e validade.

Proposta de precedência: tarifa base global → override explícito de motorista/veículo → preço próprio do pacote quando tour. Suplementos são linhas próprias, com regras de aplicação e cumulatividade. Tour substitui base/distância; não acumula ambas por acidente. Override ausente herda; zero é valor explícito, diferente de vazio.

## REG-09 — Estados e dimensões independentes

Reserva: draft → requested → awaiting_payment → confirmed → en_route → arrived → in_progress → completed. Saídas permitidas para declined/expired/cancelled antes da execução, conforme grafo em código.

Pagamento: pending/succeeded/failed/refund_pending/partially_refunded/refunded. Acerto: not_due/pending/partial/settled. Atribuição: offered/accepted/declined/withdrawal_requested. Não usar um único campo para estas quatro dimensões.

`confirmed` exige pagamento ou exceção manual auditada, aceitação válida e alocação garantida. `in_progress` exige registo do saldo ou exceção auditada. `completed` não implica que extras ou acerto estejam liquidados. O grafo atual não implementa estas guardas; são tarefas BKG/PAY.
