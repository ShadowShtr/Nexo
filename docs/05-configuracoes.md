# 05 — Aba Configurações do proprietário

CFG-R01: só owner edita; backend verifica papel/organização. Mostrar valor atual, unidade, âmbito, herança, data de vigência e quem alterou. Formulário guarda rascunho, valida e mostra simulação antes de publicar uma nova versão. Reservas existentes mantêm o snapshot.

## Catálogo de campos

“Proposta” significa default para testar, não valor comercial publicado. “Obrigatório” precisa de preenchimento antes de oferecer esse serviço. Campos fixos representam decisões aprovadas; mudança requer revisão de política, não toggle silencioso.

| Chave | Unidade / valor inicial | Validação e efeito |
|---|---|---|
| business.timezone | Europe/Lisbon | IANA válido; alteração exige revisão dos horários futuros. |
| business.currency | EUR fixo | Não conversível pelo seletor de idioma. |
| business.languages | pt-PT, en fixos | Textos e tours completos nos dois idiomas. |
| business.name/contact | obrigatório para lançamento | Nome público, email e telefone; nunca inventar. |
| calendar.minimumGapMinutes | 60 min | Inteiro >=0; mostrar aviso e impacto ao reduzir a margem aprovada de uma hora. |
| calendar.delayAllowanceMinutes | aprovado 15 min | Inteiro >=0; composição max(mínimo, deslocação+tolerância). |
| calendar.slotStepMinutes | proposta 30 min | Opções 15/30/60; independente da grelha visual e da margem. |
| calendar.gridStepMinutes | 60 min visual | Não afeta cálculos. |
| calendar.globalLeadMinutes | aprovado 120 min | Inteiro >=0; antecipação mínima global. |
| calendar.bookingHorizonDays | proposta 180 dias | Inteiro 1–730; gerar slots apenas nesse horizonte. |
| calendar.workWindows | obrigatório por motorista | Dias/intervalos locais; sem janelas sobrepostas; permite folgas e exceções por data. |
| calendar.boardingMinutes | proposta 10 min | Inteiro >=0; soma à duração do transfer. |
| calendar.alightingMinutes | proposta 5 min | Inteiro >=0; não duplicar se tour já inclui. |
| calendar.originBase | por motorista, pendente | Coordenadas e regra de deslocação na primeira/última viagem. |
| booking.acceptanceTtlMinutes | aprovado 30 min | Inteiro >0; não ultrapassar início viável do serviço. |
| booking.paymentTtlMinutes | aprovado 30 min | Inteiro >0; limitar ao início operacional viável e validade do orçamento, sem reaplicar a antecedência mínima ao pagamento. |
| booking.confirmationMode | aprovado driver_acceptance | Alternativa automática só após validar operação e regras. |
| pricing.centsPerKm | obrigatório para transfer | Inteiro >=0; distância em metros, nunca linha reta. |
| pricing.nightEnabled | proposta false | Exige faixa e taxa quando ativo. |
| pricing.nightStart/End | obrigatório quando ativo | HH:mm local, diferentes; suporta meia-noite. |
| pricing.nightSurchargeBps | proposta 0 | Inteiro >=0; limite comercial de publicação a definir, preview obrigatório. |
| pricing.stopFeeCents | proposta 0 | Inteiro >=0; preço por paragem elegível, mostrado por linha. |
| pricing.waitHourlyCents | obrigatório se vender espera | Inteiro >=0. |
| pricing.waitIncludedMinutes | proposta 0 | Inteiro >=0. |
| pricing.waitBlockMinutes | proposta 15 | Inteiro >0, opção comercial explícita. |
| driver.serviceZones | obrigatório | Polígono ou área administrativa definida; fronteiras pertencem à zona. |
| zone.pickupFeeCents | proposta 0 | Não duplicar quando zonas se sobrepõem; prioridade mais específica explícita. |
| vehicle.passengerCapacity | obrigatório | Inteiro >0, exclui motorista; bagagem em campos próprios. |
| vehicle.minimumLeadMinutes | obrigatório | Ex.: maior antecedência para veículo de 7 lugares; não presumir 24h. |
| vehicle.surchargeCents | proposta 0 | Suplemento explicitamente visível; não duplicar override de tarifa. |
| tour.baseCents | obrigatório por pacote | Preço do pacote inclui até duas pessoas; não é usado em transferes. |
| tour.extraPassengerCents | obrigatório por pacote | Inteiro >=0 por pessoa acima de duas. |
| tour.durationMinutes | obrigatório | Inteiro >0; inclui roteiro e visitas. |
| tour.maxPassengers | obrigatório | Não exceder capacidade do carro selecionado. |
| tour.minimumLeadMinutes | aprovado 2880 min (48h) | Combina com outras antecedências pelo máximo. |
| payments.depositBps | 2500 fixo | Decisão aprovada; não editável como tarifa comum. |
| policy.cancelCutoffHours | 24 fixo | Comparação exata >=24h; regra publicada ao cliente. |
| policy.rescheduleCutoffHours | 24 fixo | Mesma fronteira; validade do pedido baseada na hora do servidor. |
| partner.ownerFeeCents | X fixo por serviço, aceite pelo parceiro | Não inferir percentagem; campo ausente não significa zero. |
| notifications.reminders | proposta futuro | Horários/canais só ativados após integração; não exibir sucesso fictício. |

## CFG-R02 — Herança

Global → motorista → veículo/pacote apenas nos campos permitidos. O editor mostra “herdado de…” e permite remover override. Para antecedência, usar o maior mínimo aplicável. Para capacidade, usar o menor limite. Margens por recurso usam o maior valor necessário. Não permitir que override genérico reduza uma restrição de segurança operacional sem intenção explícita.

## CFG-R03 — Publicação

Validar o conjunto, não só cada input. Ex.: tour sem tradução não publica; serviço com espera vendida sem preço não publica; pagamento online sem beneficiário apto não habilita cobrança. Guardar `settingsVersion`, `effectiveAt`, diff e actorId. Publicação não aplica retroativamente. Exportar/restaurar configurações futuras deve omitir credenciais.

Simulador de configurações usa o mesmo domínio da API e mostra pelo menos: transfer diurno/noturno, tour 2/4 pessoas, espera, sinal e dois serviços consecutivos com margem. Mostrar diferença entre versão atual e rascunho antes de guardar.
