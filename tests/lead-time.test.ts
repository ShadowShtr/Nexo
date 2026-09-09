import test from 'node:test';
import assert from 'node:assert/strict';
import { checkLeadTime, requiredLeadMinutes } from '../src/domain/lead-time.ts';
import { approvedDefaults } from '../src/domain/defaults.ts';

test('DEC-26: transferência permite 2h exatas e rejeita menos 1ms', () => {
  assert.equal(checkLeadTime('2026-09-09T10:00:00Z', '2026-09-09T12:00:00Z', 'transfer').eligible, true);
  assert.equal(checkLeadTime('2026-09-09T10:00:00.001Z', '2026-09-09T12:00:00Z', 'transfer').eligible, false);
});
test('DEC-26: tour exige 48h exatas, não apenas data dois dias depois', () => {
  assert.equal(checkLeadTime('2026-09-09T10:00:00Z', '2026-09-11T10:00:00Z', 'tour').eligible, true);
  assert.equal(checkLeadTime('2026-09-09T10:00:00.001Z', '2026-09-11T10:00:00Z', 'tour').eligible, false);
});
test('CAL-R05: maior antecedência de recurso prevalece', () => {
  assert.equal(requiredLeadMinutes('transfer', { vehicleMinutes: 1440 }), 1440);
  assert.equal(requiredLeadMinutes('tour', { vehicleMinutes: 4320 }), 4320);
  assert.equal(requiredLeadMinutes('tour', { tourMinutes: 60 }), 2880);
});
test('CAL-R05: regra específica de tour não contamina transfer', () => {
  assert.equal(requiredLeadMinutes('transfer', { tourMinutes: 10000 }), 120);
});
test('DEC-26: limite em horas decorridas mantém-se na mudança de hora', () => {
  assert.equal(checkLeadTime('2026-03-27T11:00:00Z', '2026-03-29T12:00:00+01:00', 'tour').eligible, true);
});
test('Configurações rejeitam antecedência inválida e conservam prazos aprovados', () => {
  assert.throws(() => requiredLeadMinutes('transfer', { vehicleMinutes: -1 }));
  assert.equal(approvedDefaults.acceptanceTtlMinutes, 30);
  assert.equal(approvedDefaults.paymentTtlMinutes, 30);
});
