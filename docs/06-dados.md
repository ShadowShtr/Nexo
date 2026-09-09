# 06 — Modelo lógico de dados

Este é um contrato para as futuras migrações, não um banco já implementado. Todas as entidades operacionais usam ID opaco, organizationId, createdAt, updatedAt e version quando mutáveis. Chaves estrangeiras devem impedir relações entre organizações diferentes. Dinheiro integer cents; instantes UTC; payloads externos sanitizados.

| Entidade | Campos relevantes / relações |
|---|---|
| Organization | nome, timezone, moeda, idiomas, status |
| User / Membership | userId, organizationId, role owner/driver, estado; cliente não ganha membership de operação |
| Driver | membershipId, nome público, bio PT/EN, foto, estado, paymentBeneficiaryId |
| Vehicle | matrícula restrita, nome público, marca, fotos, passengerCapacity, luggageCapacity, status |
| DriverVehicle | driverId, vehicleId, validFrom/Until; associação temporal, muitos-para-muitos |
| ServiceZone | driverId, geometria/identificador, prioridade, pickupFeeCents, version |
| Tour / TourTranslation | título, descrição, inclusões/exclusões e roteiro PT/EN; preço base, adicional, duração, limite, antecedência, status |
| TourDriver / TourVehicle | recursos permitidos por pacote |
| Customer | nome, email, telefone normalizado, NIF opcional enquanto rascunho, language, notas privadas separadas |
| CustomerAddress | customerId, rótulo, endereço, coordenadas |
| CustomerNote | autor, nota privada, createdAt; nunca serializar para cliente |
| SettingsVersion / RateVersion | immutable payload, scope, effectiveAt, authorId |
| WorkWindow / Unavailability | resourceId, timezone, dias/horas locais ou intervalo UTC, motivo privado |
| Booking | referência pública, customerId, driverId, vehicleId, tourId?, status, source, start/end, originalStart, currentQuoteId, policySnapshot, version |
| BookingStop | bookingId, sequence, tipo pickup/stop/dropoff, endereço, coordenadas, waitMinutes |
| Quote / QuoteLine | quoteId, expiresAt, tariffVersion, routeSnapshot, totalCents, depositCents, currency; linhas com código, quantidade/unidade, valor |
| ResourceAllocation | bookingId/proposalId, resourceType driver/vehicle, resourceId, start/end, holdExpiresAt, status, version |
| Assignment | bookingId, offeredToDriverId, offeredAt, expiresAt, accepted/declinedAt, ownerFeeAgreementId |
| ChangeRequest | bookingId, expectedVersion, old/new snapshot, quoteId, holdId, expiresAt, status, acceptedAt |
| BookingEvent | bookingId, type, actorId, timestamp, redacted payload; append-only |
| PaymentBeneficiary | driverId, provider, externalAccountRef, onboardingStatus; nunca dados de cartão/segredos |
| Payment | bookingId, beneficiarySnapshot, kind deposit/balance/extra, amountCents, status, providerRef, idempotencyKey |
| PaymentEvent | providerEventId único, paymentId, signatureValidatedAt, processedAt, payload mínimo |
| Refund | paymentId, amountCents, reason, status, providerRef, idempotencyKey |
| ExtraCharge | bookingId, reason, quantity, cents, reportedBy, approvalStatus, createdAt |
| OwnerFeeAgreement | bookingId, driverId, fixedCents, agreedAt, status; ausente diferente de zero |
| OwnerReceivable | bookingId único por lançamento normal, agreedCents, reversalOf?, postedAt |
| Settlement / SettlementAllocation | driverId, amountCents, paidAt, recordedBy, note; alocações por dívida e valor parcial |
| Outbox / NotificationDelivery | aggregateId, eventType, dedupeKey, status, attempts, nextAttemptAt, locale |
| BookingAccessToken | bookingId, tokenHash, expiresAt, revokedAt; referência curta não é token |
| AuditEvent | actorId, action, entityId, before/after sanitizados, requestId |

## Invariantes de banco e serviço

- Um pagamento externo não pode ser associado a duas reservas: unique(provider, externalRef).
- Um webhook não pode ser processado duas vezes: unique(provider, eventId).
- Dedupe de comandos por (organizationId, operation, idempotencyKey), guardando hash do pedido e resposta. Reutilização com payload diferente é erro.
- Intervalos têm end>start; bloqueios temporários têm expiresAt. Coordenadas, capacidades e unidades são validadas.
- Quote total é igual à soma das linhas; depósito+saldo=total. Reembolsos acumulados não excedem recebido por pagamento.
- SettlementAllocation acumulada não excede dívida nem valor da liquidação. Transação impede duplo acerto concorrente.
- Reference única para suporte; token aleatório separado, com hash, expiração, revogação e limitação de tentativas.
- Eventos financeiros e auditáveis não se apagam para corrigir valor; criar inversão/ajuste.
- Cancelamento liberta alocações mas não apaga pagamentos nem histórico.
- Desativar motorista/carro não apaga reservas anteriores nem permite novas. Serviços futuros exigem resolução explícita.
- Chaves tenant e filtros em todas as relações/consultas; testes de acesso cruzado obrigatórios.

## Índices a definir com as consultas reais

Agenda por organization/resource/start; reservas por customer/start e status/start; pagamentos por booking/status; dívidas por driver/postedAt; outbox por status/nextAttemptAt. A implementação deve avaliar planos de consulta com dados de teste antes de otimizar. Não declarar escalabilidade garantida sem medir.

## Migrações e dados de teste

Migrações numeradas `0001_identity`, `0002_catalog` etc., geradas apenas após BAS-02. Nunca editar migração aplicada. Seed com nomes/contactos fictícios; nenhuma tarifa de exemplo publicada por default. Backups, restauração e rollback com dados de teste antes de produção.

## Dados pessoais

Separar dados públicos de motorista/carros, contactos operacionais do passageiro e dados de faturação. O motorista vê apenas o necessário ao seu serviço. Definir retenção, exportação e eliminação/anonimização com as necessidades reais do negócio em SEC-03; não prometer conformidade legal apenas por existir este documento. Logs não incluem NIF, tokens, mensagens completas ou segredos.
