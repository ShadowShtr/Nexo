# 04 — Calendário e disponibilidade

## CAL-R01 — Três conceitos distintos

1. Grelha visual: proposta de linhas de hora em hora, para leitura.
2. Passo de horários oferecidos: proposta configurável de 30 min; pode ser 60 min sem alterar a duração real.
3. Intervalo entre serviços: mínimo de 60 min, pedido pelo utilizador, com composição proposta abaixo.

Uma viagem de 2h30 ocupa 2h30, mesmo que a grelha seja de uma hora. Não arredondar o fim para baixo. A frequência de slots nunca substitui a margem entre viagens.

## CAL-R02 — Duração do serviço

Transfer: `fim = inicio + duracaoRodoviaria + esperaReservada + permanenciaNasParagens + embarque/desembarque configurados`.

Tour: duração definida no pacote, incluindo paragens/visitas do roteiro; somar apenas extensões extra. Não adicionar novamente a duração das visitas já incluídas.

Pickup/endpoints devem ser coordenadas validadas, com endereço legível. Guardar como a duração foi estimada e quando; mudanças grandes de rota pedem revisão do orçamento/agenda.

## CAL-R03 — Margem entre A e B

Regra aprovada DEC-21:

`margemObrigatoria(A,B) = max(margemMinima, deslocacao(fimA,recolhaB) + toleranciaAtraso)`

Inicialmente margemMinima=60 min; toleranciaAtraso=15 min. Assim a hora funciona como margem mínima total, e deslocações maiores expandem-na. Não soma automaticamente 60 minutos a toda deslocação; se o proprietário preferir esse comportamento, criar nova versão da regra e respetivos testes.

`inicioB >= fimA + margemObrigatoria(A,B)`

Exemplos:

| Fim A | Deslocação | Tolerância | Margem | Primeiro início B |
|---|---|---|---|---|
| 12:00 | 20 min | 15 min | 60 min | 13:00 |
| 12:00 | 50 min | 15 min | 65 min | 13:05; com slots de 30 min, 13:30 |
| 12:00 | 90 min | 15 min | 105 min | 13:45; com slots de 30 min, 14:00 |

Igualdade é permitida. 12:59:59 após fim às 12h com margem 60 é conflito. Verificar serviço anterior E seguinte: encaixar depois do anterior não garante chegar ao próximo.

## CAL-R04 — Recursos simultâneos

Bloquear motorista e veículo, inclusive carros partilhados por motoristas diferentes. Para cada recurso, obter as alocações relevantes e testar conflitos/margens. Relação motorista-carro deve estar ativa naquele período. Capacidade de passageiros exclui motorista.

Horários indisponíveis, manutenção, folgas, compromissos pessoais e serviços manuais usam a mesma fonte de alocação. Primeira/última viagem respeita a janela de trabalho e, quando configurado, deslocação da/para base. Base e ponto inicial da jornada ainda precisam ser recolhidos; sem dados, não declarar chegada garantida para marcações imediatas.

O core atual valida conflitos por motorista/veículo com uma lista de alocações e uma função de deslocação. Não implementa ainda horários de trabalho, dados cartográficos ou locks.

## CAL-R05 — Algoritmo de oferta de horário

1. Resolver timezone e data local; rejeitar hora inexistente e desambiguar hora repetida na mudança de hora.
2. Validar motorista ativo, carro associado, capacidade, pacote e zona de recolha.
3. Resolver antecedência: normal 120 min, tours 2880 min (48h), usando máximo entre global, motorista, veículo e pacote. Para o próprio dia, não ignorar antecedência.
4. Gerar candidatos dentro do horário de trabalho no passo configurado.
5. Obter rota, duração e deslocações relevantes. Sem estimativa suficiente, não vender como disponibilidade confirmada.
6. Calcular fim de serviço e validar indisponibilidades, limites de jornada, conflitos e margens antes/depois.
7. Apresentar slots elegíveis com orçamento e validade; seleção visual não reserva por si só.
8. Ao enviar pedido, revalidar dentro de transação e criar bloqueio temporário para os dois recursos.
9. Aceitação prolonga/substitui o bloqueio dentro do prazo de pagamento; não criar duplicação de recurso.
10. Pagamento confirmado converte bloqueio em reserva definitiva numa transação, ou abre exceção se já expirou.

Alterar passageiros, carro, percurso, data ou extras de duração invalida a disponibilidade anterior. Antecedência mínima é verificada no envio do pedido ou da proposta para o novo slot; não é reiniciada na aceitação e no pagamento de um pedido válido. Caso contrário, um pedido criado exatamente 2h antes ficaria impossível de confirmar. Os prazos 30+30 min não podem ultrapassar o início operacional viável; definir esse limite em CAL-03.

## CAL-R06 — Concorrência e expiração

- Dois clientes tentam mesmo carro/horário: apenas uma transação adquire alocação; a outra recebe conflito e alternativas a recalcular.
- Bloqueios `requested` e `awaiting_payment` têm expiresAt obrigatório na persistência. O núcleo falha conservadoramente se faltar.
- Bloqueio expira quando `expiresAt <= now`, com hora de servidor. Consultas ignoram expirados mesmo antes do job de limpeza.
- Job marca estado expirado, liberta alocação e escreve evento uma única vez. Repetir job não duplica eventos financeiros.
- Pagamento depois de expirar: não ocupar uma vaga já revendida. Abrir `payment_exception`, notificar proprietário e preparar devolução ao pagador; não confirmar silenciosamente.
- Jobs atrasados não alteram a elegibilidade de cancelamento: usar hora de receção do pedido validado pelo servidor.

## CAL-R07 — Reagendamento atómico

Verificar limite de 24h no pedido; criar proposta para o novo slot com validade, mantendo a reserva antiga. No aceite final, revalidar as duas alocações e o preço; mover numa única transação. Pedidos concorrentes usam `expectedVersion`. A proposta não permite trocar beneficiário automaticamente. Se a proposta expirar, a reserva original mantém-se.

## CAL-R08 — Tempo e atraso real

Persistir instantes UTC e timezone IANA Europe/Lisbon; exibir hora local PT e EN com mesma timezone. Nunca aplicar `+1h` fixo. Horas de verão/inverno têm testes de integração próprios. No código 0.1.0, entradas precisam de ISO com Z/offset; a conversão de hora local ainda pertence a CAL-01.

Quando motorista prolonga viagem/espera, recalcular previsão de fim e alertar proprietário sobre conflitos futuros. Não cancelar, deslocar ou cobrar automaticamente outra reserva. Margem de segurança não é garantia contra todos os atrasos.

## Interface da aba Agenda

Desktop: dia/semana/mês, recursos por coluna, filtro de motorista/carro e legenda textual. Telemóvel: lista do dia e navegação de datas. Reserva mostra início/fim, cliente, carro, estado e pendência; detalhes num painel. Margens aparecem como faixas próprias. Arrastar um evento cria proposta validada, não grava diretamente. Erros indicam conflito com serviço/indisponibilidade sem expor dados de outro cliente ao público.
