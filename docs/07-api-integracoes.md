# 07 — Contratos de aplicação, API e integrações

Rotas abaixo são planeadas, não estão disponíveis. Prefixo `/api/v1`. Schemas de contrato terão versão e validação runtime antes de handlers. Dinheiro enviado como integer cents, instantes ISO UTC e língua pt-PT/en. Erros localizáveis por código, nunca por comparação de texto traduzido.

## Contratos principais

| Método / rota | Acesso | Comportamento |
|---|---|---|
| GET /public/drivers/:slug | público | Perfil e catálogo publicado, sem dados privados. |
| GET /public/drivers/:id/vehicles | público | Carros associados; disponibilidade revalidada depois. |
| GET /public/tours | público | Pacotes publicados na língua pedida. |
| POST /availability/search | público limitado | Filtros, percurso, data; devolve slots com validade, não bloqueia. |
| POST /quotes | público limitado | Recalcula preço no servidor, devolve linhas, snapshot e expiresAt. |
| POST /bookings | cliente/link validado | quoteId, dados, idempotencyKey; cria pedido e bloqueio transacional. |
| POST /owner/bookings | owner | Reserva manual com mesma validação; source e overrideReason quando necessário. |
| POST /bookings/:id/accept | motorista atribuído/owner | Aceita atribuição, valida recursos, abre prazo de pagamento. |
| POST /bookings/:id/payment-intents | cliente autorizado | Beneficiário vem do snapshot do servidor; nunca do body público. |
| POST /payments/webhooks/:provider | assinatura técnica | Verifica assinatura, evento único, montante, moeda, beneficiário e reserva. |
| GET /booking-access/:token | token | Troca token por sessão restrita, redireciona para URL sem token. |
| GET /bookings/:id | autorizado | Projeção específica de papel; cliente não recebe notas/comissão. |
| POST /bookings/:id/cancellations | cliente/owner | Regista instante, regra, refund devido e libera agenda. |
| POST /bookings/:id/change-requests | cliente/owner | Limite 24h, nova cotação/slot, expectedVersion. |
| POST /change-requests/:id/confirm | autorizado | Confirma revisão atómica ou conflito; não perde original. |
| POST /bookings/:id/status-events | motorista atribuído | Transição válida, expectedVersion, evento auditável. |
| GET /owner/customers | owner | CRM paginado, filtros; proibido a parceiro. |
| GET /owner/finance | owner | Recebimentos dos motoristas, não caixa bancário do dono. |
| GET /driver/settlements | próprio driver | Acertos próprios e serviços de origem. |
| POST /owner/settlements | owner | Liquidação pessoal registada, alocações atómicas. |
| POST /owner/settings/versions | owner | Valida, simula e publica nova versão, sem retroatividade. |

## Exemplo de cotação

Entrada de um tour usa `driverId`, `vehicleId`, `tourId`, `passengers`, `startsAt`, recolha e extras selecionados. Não aceita `totalCents` arbitrário. Resposta contém `quoteId`, `expiresAt`, `currency`, linhas, total/sinal/saldo, `rateVersion`, regras visíveis e prazo de cancelamento.

Exemplo de erro:

```json
{"error":{"code":"SLOT_CONFLICT","messageKey":"booking.slotConflict","retryable":true},"requestId":"opaque-id"}
```

Códigos: VALIDATION_ERROR, FORBIDDEN, NOT_FOUND, SLOT_CONFLICT, CAPACITY_EXCEEDED, OUTSIDE_SERVICE_AREA, LEAD_TIME_REQUIRED, QUOTE_EXPIRED, VERSION_CONFLICT, CHANGE_WINDOW_CLOSED, PAYMENT_NOT_READY, PAYMENT_EXCEPTION, ROUTE_UNAVAILABLE. Não revelar existência de reservas privadas por respostas diferentes a identificadores aleatórios.

## Pagamentos — prova obrigatória antes de escolher prestador

O requisito é todo dinheiro ir diretamente para o executor. Não é cumprido por uma conta única do proprietário com divisão interna fictícia. PAY-01 deve provar em sandbox:

1. Cada motorista pode ser beneficiário habilitado a receber MB WAY.
2. Pedido liga reserva, beneficiário, montante e moeda imutavelmente.
3. Webhook tem autenticação, consulta de confirmação e idempotência.
4. Reembolso total/parcial regressa ao pagador a partir do recebimento correto, com tracking de falhas.
5. Condições de onboarding, custos, limites e tratamento de erros são documentadas a partir de fontes oficiais atuais.

Se não houver integração viável, apresentar o impedimento concreto e opções ao proprietário; não substituir silenciosamente por cobrança central. Esta fundação não escolheu prestador e não moveu dinheiro.

O retorno de sucesso do browser é apenas estado de navegação. Pagamento confirmado pode chegar antes/depois da atualização da UI; reconciliar no servidor. Pagamento duplicado/tardio vira exceção financeira, não segunda reserva. Despesas do prestador não diminuem arbitrariamente o total pago apresentado ao cliente.

## Waze e mapas

Mapa/rota da ficha pode usar RouteProvider; botão Waze abre navegação por coordenadas da próxima etapa. Não assumir que Waze fornece orçamento ou sincroniza automaticamente todas as paragens. Validar formato de ligação e fallback nas fontes oficiais durante NAV-01, testar em Android/iOS. Sem localização ao vivo nesta versão.

Na demonstração 0.2.5, Leaflet 1.9.4 mostra rotas e pontos fictícios com tiles Standard do OpenStreetMap apenas para teste interativo de baixo volume. A geometria não segue necessariamente a estrada e não alimenta o preço. Atribuição permanece visível e existe uma lista textual equivalente. Antes de produção, escolher serviço de tiles/rotas com disponibilidade e condições adequadas ao uso comercial; os servidores comunitários do OSM são best-effort, sem SLA e podem bloquear uso inadequado. Não fazer prefetch nem download offline.

O link de demonstração usa `https://waze.com/ul?ll=LAT,LON&navigate=yes&utm_source=premium_mobility_demo`. HTTPS oferece fallback web quando o app não está disponível. Cada clique abre apenas um destino; uma sequência com paragens precisa avançar para a próxima etapa no estado do serviço.

Rotas têm `distanceMeters`, `durationMinutes`, `provider`, `calculatedAt`, `departureAt`. Chaves privadas de mapas não vão para o browser; credenciais públicas permitidas pelo fornecedor devem ser restringidas por origem e capacidade.

## Notificações e idiomas

Eventos: pedido recebido, aceite, pedido de sinal, confirmação, alteração proposta/confirmada, cancelamento, reembolso pendente/concluído e observação pública relevante. Templates PT/EN e idioma guardado na reserva. Outbox evita perder mensagem após commit. Cada evento/canal/destinatário tem dedupeKey. Erro de envio não desfaz reserva válida; exibir falha ao proprietário e permitir reenvio.

Começar com email e partilha manual de link no WhatsApp; automatização WhatsApp fica fora do escopo selecionado. Mensagens não incluem NIF, segredos ou detalhes privados de acerto.

## Segurança das mutações

Autenticação, autorização por recurso, proteção CSRF quando sessões em cookie, rate limiting, validação runtime e limites de payload. Cancelamento/reagendamento requer ação explícita; abrir um GET nunca altera reserva. Links são capacidades sensíveis: tokens fortes, hash no banco, expiração/revogação, sem analytics de terceiros na página de troca de token, `Referrer-Policy: no-referrer` e sem cache partilhado.
