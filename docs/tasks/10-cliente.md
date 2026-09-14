# Percurso do cliente

Ler [escopo](../01-escopo.md), [regras](../03-regras.md) e [definição de pronto](../08-entrega.md) antes de implementar. Para trabalho de interface, aplicar o [sistema visual](../12-design-system.md) e o [mapa de abas](../13-mapa-visual-abas.md); os critérios UI-02/UI-03 complementam os critérios funcionais.

## PUB-01 — Idioma inicial e perfil vindo do Instagram

**Estado:** EM CURSO — entrada PT/EN e percurso demo implementados; deep links e publicação persistente pendentes

**Dependências:** BAS-04, CAT-01, TOUR-01

**Regras:** DEC-03; DEC-15

**Implementação:** Criar entrada PT/EN “Para onde vai?” e links específicos de motorista que preservam o perfil como contexto; a descoberta abre um planeador inline com origem, destino, locais recentes e localização atual antes de seguir para o percurso, conforme a [revisão de entrada](../20-entrada-cliente.md). Perfil e tours continuam acessíveis.

**Aceitação:** Escolha de inglês traduz navegação e conteúdo publicado; deep link Instagram mantém motorista; nenhuma etapa regressa silenciosamente a português.

**Evidência:** `src/web/pages/CustomerDiscoverSandbox.tsx`, `src/web/pages/CustomerSandbox.tsx` e `tests/browser/customer.spec.ts` cobrem entrada bilingue e sequência de teste. Perfil vindo de Instagram e publicação persistente continuam pendentes.

## PUB-02 — Seleção e formulário de reserva

**Estado:** EM CURSO — fluxo route-first demo implementado; cotação server-side, persistência e pagamento pendentes

**Dependências:** PUB-01, TOUR-02, PRC-02, CAL-03, CRM-01

**Regras:** DEC-02; DEC-04; REG-02..05

**Implementação:** Destino e origem confirmada → percurso/data/pessoas/extras → km e estimativa → motorista e carro disponíveis → cadastro com total → pedido. Aplicar a [revisão de entrada](../20-entrada-cliente.md); apresentar inclusões, extras, sinal/saldo e recalcular ao mudar dados relevantes.

**Aceitação:** Carro indisponível/capacidade insuficiente não continua; totais discriminados; voltar não perde campos nem mantém orçamento inválido; registo completo antes de confirmação.

**Evidência:** `src/web/pages/CustomerSandbox.tsx` mostra rota/mapa, preço, capacidade, motorista/carro, registo, revisão e pedido; `tests/browser/customer.spec.ts` valida conflitos, tour, total e sinal. Endpoints persistentes continuam pendentes.

## PUB-03 — Pagamento, consulta e reagendamento por link

**Estado:** EM CURSO — consulta e reagendamento demo; segurança e pagamento persistentes pendentes

**Dependências:** PUB-02, BKG-03, SEC-02

**Regras:** DEC-08; DEC-11; DEC-12; REG-06

**Implementação:** Implementar estados de pedido/aceitação/pagamento, consulta segura com timeline, observações públicas, cancelamento e proposta de reagendamento; ligar PaymentProvider quando pronto.

**Aceitação:** Tela distingue recebido/aguarda/confirmado; sem integração real não mostra pago; regra de 24h visível antes de pagar; histórico de alteração e erro de notificação acessíveis.

**Evidência:** `src/contracts/lookup.ts` normaliza o código, `CustomerSandbox.tsx` mostra consulta, cancelamento e pedido de reagendamento, e o teste Playwright cobre o percurso. O resultado é fictício, sem pagamento nem endpoint autenticado de produção.

Evidência parcial 0.2.4: [percurso de teste do cliente](../18-teste-calendario.md). Protótipo em memória; não conclui PUB nem pagamento.

