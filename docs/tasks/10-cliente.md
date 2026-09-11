# Percurso do cliente

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## PUB-01 — Idioma inicial e perfil vindo do Instagram

**Estado:** PLANEADA

**Dependências:** BAS-04, CAT-01, TOUR-01

**Regras:** DEC-03; DEC-15

**Implementação:** Criar rotas PT/EN e links específicos de motorista; mostrar perfil, carros, tours e CTA reservar; persistir só preferência de idioma no dispositivo.

**Aceitação:** Escolha de inglês traduz navegação e conteúdo publicado; deep link Instagram mantém motorista; nenhuma etapa regressa silenciosamente a português.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## PUB-02 — Seleção e formulário de reserva

**Estado:** PLANEADA

**Dependências:** PUB-01, TOUR-02, PRC-02, CAL-03, CRM-01

**Regras:** DEC-02; DEC-04; REG-02..05

**Implementação:** Motorista → carros dele → serviço/data/pessoas/percurso → orçamento → dados; apresentar inclusões, extras, sinal/saldo e condições; recalcular ao mudar dados relevantes.

**Aceitação:** Carro indisponível/capacidade insuficiente não continua; totais discriminados; voltar não perde campos nem mantém orçamento inválido; registo completo antes de confirmação.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

## PUB-03 — Pagamento, consulta e reagendamento por link

**Estado:** PLANEADA

**Dependências:** PUB-02, BKG-03, SEC-02

**Regras:** DEC-08; DEC-11; DEC-12; REG-06

**Implementação:** Implementar estados de pedido/aceitação/pagamento, consulta segura com timeline, observações públicas, cancelamento e proposta de reagendamento; ligar PaymentProvider quando pronto.

**Aceitação:** Tela distingue recebido/aguarda/confirmado; sem integração real não mostra pago; regra de 24h visível antes de pagar; histórico de alteração e erro de notificação acessíveis.

**Evidência:** Por preencher: ficheiros/commit, testes executados e resultado. Não marcar concluída sem demonstração do critério acima.

Evidência parcial 0.2.4: [percurso de teste do cliente](../18-teste-calendario.md). Protótipo em memória; não conclui PUB nem pagamento.

