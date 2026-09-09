import test from 'node:test';
import assert from 'node:assert/strict';
import { quote, paymentSplit, waitingCents } from '../src/domain/pricing.ts';
import { checkSchedule, requiredGapMinutes, type Allocation } from '../src/domain/calendar.ts';
import { changeEligibility, customerCancellationRefund } from '../src/domain/policy.ts';
import { settlementSummary } from '../src/domain/settlement.ts';
import { transition } from '../src/domain/booking.ts';
import { instant, ratio } from '../src/domain/validation.ts';

const tour = (passengers: number) => quote({ passengers, passengerCapacity: 6,
  service: { kind: 'tour', baseCents: 20000, extraPassengerCents: 3500 } });

test('REG-03: 1 e 2 passageiros têm a mesma base; 3/4 pagam adicionais', () => {
  assert.equal(tour(1).totalCents, 20000); assert.equal(tour(2).totalCents, 20000);
  assert.equal(tour(3).totalCents, 23500); assert.equal(tour(4).totalCents, 27000);
  assert.equal(tour(4).depositCents, 6750); assert.equal(tour(4).balanceCents, 20250);
});
test('REG-03: capacidade exata aceite, excedida e zero rejeitados', () => {
  assert.equal(tour(6).totalCents, 34000);
  assert.throws(() => tour(7)); assert.throws(() => tour(0)); assert.throws(() => tour(2.5));
});
test('REG-02: transfer discrimina distância, noite e extra', () => {
  const result = quote({ passengers: 2, passengerCapacity: 4,
    service: { kind: 'transfer', baseCents: 1000, distanceMeters: 12500, centsPerKm: 200 },
    nightSurchargeBps: 2000, extras: [{ code: 'pickup_zone', cents: 500 }] });
  assert.equal(result.totalCents, 4700); assert.equal(result.depositCents, 1175);
  assert.equal(result.balanceCents, 3525);
  assert.equal(result.lines.reduce((n, line) => n + line.cents, 0), result.totalCents);
});
test('REG-01: arredondamento half-up de meia unidade e metros não inteiros em km', () => {
  assert.equal(ratio(1, 1, 2), 1); assert.equal(ratio(1, 1, 3), 0);
  assert.equal(ratio(101, 500, 1000), 51);
});
test('REG-05: sinal e saldo preservam todos os cêntimos em 10 mil valores', () => {
  for (let total = 0; total < 10000; total++) {
    const split = paymentSplit(total);
    assert.equal(split.depositCents + split.balanceCents, total);
    assert.ok(split.depositCents >= 0 && split.balanceCents >= 0);
  }
  assert.deepEqual(paymentSplit(101), { depositCents: 25, balanceCents: 76 });
});
test('REG-01: rejeita dinheiro negativo, fracionário, infinito e overflow', () => {
  for (const bad of [-1, 1.1, NaN, Infinity]) assert.throws(() => paymentSplit(bad));
  assert.throws(() => ratio(Number.MAX_SAFE_INTEGER, 2, 1));
  assert.throws(() => paymentSplit(100, 10001));
});
test('REG-04: espera dentro da franquia, bloco exato e bloco ultrapassado', () => {
  assert.equal(waitingCents(0, 10, 15, 2400), 0);
  assert.equal(waitingCents(10, 10, 15, 2400), 0);
  assert.equal(waitingCents(25, 10, 15, 2400), 600);
  assert.equal(waitingCents(26, 10, 15, 2400), 1200);
  assert.throws(() => waitingCents(10, 0, 0, 2400));
});
const start = '2026-09-12T10:00:00Z';
test('REG-06: exatamente 24h permite cancelamento e reagendamento', () => {
  assert.deepEqual(changeEligibility('2026-09-11T10:00:00Z', start, start), {
    refundEligible: true, rescheduleEligible: true, cutoffAt: '2026-09-11T10:00:00.000Z',
  });
});
test('REG-06: menos 1ms recusa devolução e reagendamento', () => {
  const result = changeEligibility('2026-09-11T10:00:00.001Z', start, start);
  assert.equal(result.refundEligible, false); assert.equal(result.rescheduleEligible, false);
});
test('REG-06: após início não é elegível', () => {
  assert.equal(changeEligibility('2026-09-12T12:00:00Z', start, start).refundEligible, false);
});
test('DEC-23 hipótese: adiar não renova janela original', () => {
  assert.equal(changeEligibility('2026-09-11T11:00:00Z', '2026-09-15T10:00:00Z', start).refundEligible, false);
});
test('REG-06: devolução calcula só sinal efetivamente pago', () => {
  assert.equal(customerCancellationRefund(6750, true), 6750);
  assert.equal(customerCancellationRefund(6750, false), 0);
  assert.equal(customerCancellationRefund(0, true), 0);
});
test('CAL-R08: offsets distintos representam o mesmo instante', () => {
  assert.equal(instant('2026-09-12T11:00:00+01:00'), instant(start));
  assert.throws(() => instant('2026-09-12T10:00:00'));
  assert.throws(() => instant('2026-02-30T10:00:00Z'));
  assert.throws(() => instant('2026-09-12T24:00:00Z'));
});
test('CAL-R08: 24 horas decorridas na mudança de hora de março', () => {
  const result = changeEligibility('2026-03-28T11:00:00Z', '2026-03-29T12:00:00+01:00', '2026-03-29T12:00:00+01:00');
  assert.equal(result.refundEligible, true);
  assert.equal(changeEligibility('2026-03-28T11:00:00.001Z', '2026-03-29T12:00:00+01:00', '2026-03-29T12:00:00+01:00').refundEligible, false);
});

const now = '2026-09-10T00:00:00Z';
const rules = { minimumGapMinutes: 60, delayAllowanceMinutes: 15 };
const item = (id: string, startsAt: string, endsAt: string, overrides: Partial<Allocation> = {}): Allocation => ({
  id, startsAt: `2026-09-12T${startsAt}:00Z`, endsAt: `2026-09-12T${endsAt}:00Z`, driverId: 'driver-a', vehicleId: 'car-a', status: 'confirmed', ...overrides,
});
const prior = item('prior', '10:00', '12:00');
test('CAL-R03: uma hora é margem mínima; deslocação longa aumenta', () => {
  assert.equal(requiredGapMinutes(20, rules), 60);
  assert.equal(requiredGapMinutes(50, rules), 65);
  assert.equal(requiredGapMinutes(90, rules), 105);
});
test('CAL-R03: margem exata de 60 minutos aceite', () => {
  assert.equal(checkSchedule(item('new', '13:00', '14:00'), [prior], now, rules, () => 20).available, true);
});
test('CAL-R03: margem de 59 minutos rejeitada', () => {
  const result = checkSchedule(item('new', '12:59', '14:00'), [prior], now, rules, () => 20);
  assert.equal(result.available, false); assert.equal(result.conflicts[0].reason, 'gap');
});
test('CAL-R03: uma hora não basta para deslocação de 90 minutos', () => {
  assert.equal(checkSchedule(item('new', '13:00', '14:00'), [prior], now, rules, () => 90).available, false);
  assert.equal(checkSchedule(item('new', '13:45', '14:45'), [prior], now, rules, () => 90).available, true);
});
test('CAL-R04: carro partilhado bloqueia mesmo com outro motorista', () => {
  const other = item('other', '10:30', '11:30', { driverId: 'driver-b' });
  assert.equal(checkSchedule(other, [prior], now, rules, () => 0).conflicts[0].reason, 'overlap');
});
test('CAL-R04: mesmo motorista bloqueia mesmo com outro carro', () => {
  assert.equal(checkSchedule(item('new', '11:00', '13:00', { vehicleId: 'car-b' }), [prior], now, rules, () => 0).available, false);
});
test('CAL-R04: recursos independentes não conflitam', () => {
  assert.equal(checkSchedule(item('new', '11:00', '13:00', { vehicleId: 'car-b', driverId: 'driver-b' }), [prior], now, rules, () => undefined).available, true);
});
test('CAL-R03: verifica também o serviço seguinte', () => {
  const later = item('later', '14:30', '16:00');
  const result = checkSchedule(item('new', '13:00', '14:00'), [prior, later], now, rules, () => 20);
  assert.equal(result.available, false); assert.equal(result.conflicts[0].bookingId, 'later');
});
test('CAL-R06: bloqueio expira na igualdade e deixa de bloquear', () => {
  const hold = { ...prior, status: 'requested' as const, holdExpiresAt: now };
  assert.equal(checkSchedule(item('new', '10:00', '12:00'), [hold], now, rules, () => 0).available, true);
  assert.equal(checkSchedule(item('new', '10:00', '12:00'), [{ ...hold, holdExpiresAt: '2026-09-10T00:00:01Z' }], now, rules, () => 0).available, false);
});
test('CAL-R06: cancelada não bloqueia; hold sem expiração bloqueia conservadoramente', () => {
  assert.equal(checkSchedule(item('new', '10:00', '12:00'), [{ ...prior, status: 'cancelled' }], now, rules, () => 0).available, true);
  assert.equal(checkSchedule(item('new', '10:00', '12:00'), [{ ...prior, status: 'requested' }], now, rules, () => 0).available, false);
});
test('CAL-R05: rota desconhecida não gera disponibilidade garantida', () => {
  assert.equal(checkSchedule(item('new', '13:00', '14:00'), [prior], now, rules, () => undefined).conflicts[0].reason, 'route_unknown');
});
test('CAL-R03: usa vizinho imediato, sem consultar rota de serviço remoto irrelevante', () => {
  const remote = item('remote', '06:00', '07:00');
  const seen: string[] = [];
  const result = checkSchedule(item('new', '13:00', '14:00'), [remote, prior], now, rules, (from) => {
    seen.push(from.id); return from.id === 'prior' ? 20 : undefined;
  });
  assert.equal(result.available, true); assert.deepEqual(seen, ['prior']);
});
test('CAL-R03: recurso diferente pode ter outro vizinho imediato relevante', () => {
  const driverPrevious = item('driverPrevious', '10:30', '12:00', { vehicleId: 'car-b' });
  const carPrevious = item('carPrevious', '11:00', '12:30', { driverId: 'driver-b' });
  const result = checkSchedule(item('new', '13:00', '14:00'), [driverPrevious, carPrevious], now, rules, () => 20);
  assert.deepEqual(result.conflicts.map(c => c.bookingId), ['carPrevious']);
});
test('CAL-R02: rejeita intervalo invertido e início no passado', () => {
  assert.throws(() => checkSchedule(item('new', '14:00', '13:00'), [], now, rules, () => 0));
  assert.throws(() => checkSchedule(prior, [], '2026-09-13T00:00:00Z', rules, () => 0));
});
test('REG-07: extrato suporta liquidação parcial e serviços próprios zero', () => {
  assert.deepEqual(settlementSummary([
    { bookingId: 'a', ownerFeeCents: 2000, settledCents: 2000 },
    { bookingId: 'b', ownerFeeCents: 1500, settledCents: 500 },
    { bookingId: 'own', ownerFeeCents: 0, settledCents: 0 },
  ]), { owedCents: 3500, settledCents: 2500, outstandingCents: 1000 });
});
test('REG-07: rejeita dívida duplicada e liquidação acima do devido', () => {
  assert.throws(() => settlementSummary([{ bookingId: 'a', ownerFeeCents: 1000, settledCents: 1001 }]));
  const entry = { bookingId: 'a', ownerFeeCents: 1000, settledCents: 0 };
  assert.throws(() => settlementSummary([entry, entry]));
});
test('REG-09: grafo respeita etapas e não reabre concluída', () => {
  assert.equal(transition('requested', 'awaiting_payment'), 'awaiting_payment');
  assert.equal(transition('awaiting_payment', 'confirmed'), 'confirmed');
  assert.throws(() => transition('requested', 'completed'));
  assert.throws(() => transition('completed', 'confirmed'));
});
