import test from 'node:test';
import assert from 'node:assert/strict';
import {
  assertAssignmentAvailable,
  assignmentWindowsOverlap,
  saveAssignment,
  saveDriver,
  saveVehicle,
  type CatalogAdminGateway,
} from '../src/application/catalog-admin.ts';

const owner = { userId: '00000000-0000-4000-8000-000000000001', organizationId: '00000000-0000-4000-8000-000000000002', role: 'owner' as const, active: true };
const driverId = '00000000-0000-4000-8000-000000000003';
const vehicleId = '00000000-0000-4000-8000-000000000004';
const profile = {
  displayName: 'Miguel Costa', displayNameEn: 'Michael Costa', biographyPt: 'Perfil', biographyEn: 'Profile',
  phone: '+351910000000', photoPath: 'profiles/miguel.jpg', languages: ['pt-PT', 'en'] as ('pt-PT' | 'en')[], status: 'active' as const,
};
const vehicle = { registration: '00-AA-00', make: 'Mercedes-Benz', model: 'Classe V', passengerCapacity: 6, luggageCapacity: 6, minimumNoticeHours: 48, supplementCents: 3500, status: 'active' as const, amenities: ['Wi-Fi'] };

function gateway(overrides: Partial<CatalogAdminGateway> = {}): CatalogAdminGateway {
  return {
    saveDriver: async input => ({ id: input.id ?? driverId }),
    saveVehicle: async input => ({ id: input.id ?? vehicleId }),
    listAssignments: async () => [],
    saveAssignment: async input => ({ id: input.id ?? '00000000-0000-4000-8000-000000000005' }),
    ...overrides,
  };
}

test('owner command saves a publishable driver with a server publication timestamp', async () => {
  let received: Record<string, unknown> | undefined;
  const result = await saveDriver(owner, profile, gateway({ saveDriver: async input => { received = input; return { id: driverId }; } }), () => '2026-09-14T10:00:00+01:00');
  assert.deepEqual(result, { id: driverId });
  assert.equal(received?.organizationId, owner.organizationId);
  assert.equal(received?.publishedAt, '2026-09-14T10:00:00+01:00');
});

test('driver and inactive owner cannot mutate the catalogue', async () => {
  await assert.rejects(() => saveVehicle({ ...owner, role: 'driver' }, vehicle, gateway()), /FORBIDDEN/);
  await assert.rejects(() => saveDriver({ ...owner, active: false }, profile, gateway()), /FORBIDDEN/);
});

test('vehicle command preserves capacity, amenities and tenant boundary', async () => {
  let received: Record<string, unknown> | undefined;
  await saveVehicle(owner, vehicle, gateway({ saveVehicle: async input => { received = input; return { id: vehicleId }; } }));
  assert.equal(received?.organizationId, owner.organizationId);
  assert.equal((received?.passengerCapacity), 6);
  assert.deepEqual(received?.amenities, ['Wi-Fi']);
  await assert.rejects(() => saveVehicle(owner, { ...vehicle, passengerCapacity: 21 }, gateway()), /Too big|Too small|Number/);
});

test('association windows are half-open and reject overlap on either resource', () => {
  const first = { id: 'a', driverUserId: driverId, vehicleId, startsAt: '2026-09-15T10:00:00+01:00', endsAt: '2026-09-15T12:00:00+01:00' };
  const adjacent = { id: 'b', driverUserId: driverId, vehicleId: '00000000-0000-4000-8000-000000000006', startsAt: '2026-09-15T12:00:00+01:00', endsAt: '2026-09-15T13:00:00+01:00' };
  const overlap = { ...adjacent, id: 'c', startsAt: '2026-09-15T11:59:00+01:00' };
  assert.equal(assignmentWindowsOverlap(first, adjacent), false);
  assert.equal(assignmentWindowsOverlap(first, overlap), true);
  assert.doesNotThrow(() => assertAssignmentAvailable(adjacent, [first]));
  assert.throws(() => assertAssignmentAvailable(overlap, [first]), /ASSIGNMENT_CONFLICT/);
});

test('assignment command checks current server windows before writing', async () => {
  const existing = [{ id: 'a', driverUserId: driverId, vehicleId, startsAt: '2026-09-15T10:00:00+01:00', endsAt: '2026-09-15T12:00:00+01:00' }];
  const input = { driverUserId: driverId, vehicleId: '00000000-0000-4000-8000-000000000006', startsAt: '2026-09-15T11:00:00+01:00', endsAt: '2026-09-15T13:00:00+01:00' };
  let writes = 0;
  await assert.rejects(() => saveAssignment(owner, input, gateway({ listAssignments: async () => existing, saveAssignment: async command => { writes++; return { id: command.id ?? 'x' }; } })), /ASSIGNMENT_CONFLICT/);
  assert.equal(writes, 0);
});
