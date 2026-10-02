import { test, expect } from '@playwright/test';
import { tourRoute } from '../../src/web/demo-routes';

const tour = { id: 'review-tour', namePt: 'Tour Teste', nameEn: 'Test Tour', descriptionPt: 'Tour de teste.', descriptionEn: 'Test tour.', durationDays: 2, baseCents: 34500, extraPassengerCents: 4200, minimumNoticeHours: 168, active: true, area: 'Sintra', photoPath: '/lisbon-sintra-tour.webp' };
test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
});

test('customer can recover after choosing a driver without a vehicle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => localStorage.setItem('pm.demo.catalog', JSON.stringify({
    drivers: [
      { id: 'd1', name: 'Motorista com carro', english: 'Assigned driver', phone: '+351910000000', status: 'active', vehicles: ['v1'] },
      { id: 'd2', name: 'Motorista sem carro', english: 'Unassigned driver', phone: '+351910000001', status: 'active', vehicles: [] },
    ],
    vehicles: [{ id: 'v1', registration: '00-AA-00', make: 'Carro', model: 'Teste', capacity: 4, luggage: 2, notice: 2, supplement: 0, status: 'active', driverIds: ['d1'] }],
  })));
  await page.goto('/?demo=1&lang=pt-PT#/customer/booking');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: /Motorista sem carro/ }).click();
  await expect(page.getByLabel('Carro', { exact: true })).toBeDisabled();
  await expect(page.getByRole('status')).toContainText('não tem carro disponível');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Escolha outro');
  await page.getByRole('button', { name: /Motorista com carro/ }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await expect(page.getByLabel('Nome completo')).toBeVisible();
  expect(errors).toEqual([]);
});

test('manual booking rejects excess passengers and recovers with a larger vehicle', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/?demo=1&lang=pt-PT#/owner/bookings');
  await page.getByRole('button', { name: 'Nova marcação manual', exact: true }).click();
  const form = page.getByRole('form', { name: 'Marcação manual' });
  await form.getByLabel(/^Passageiros/).selectOption('6');
  await expect(form.getByRole('status')).toContainText('capacidade');
  await form.getByLabel('Cliente', { exact: true }).fill('Pessoa Teste');
  await form.getByRole('button', { name: 'Guardar marcação' }).click();
  await expect(form.getByRole('alert')).toContainText('não tem capacidade');
  await form.getByLabel(/^Carro/).selectOption('1');
  await expect(form.getByRole('status')).toHaveCount(0);
  await form.getByRole('button', { name: 'Guardar marcação' }).click();
  await expect(form).toHaveCount(0);
  await expect(page.locator('.pm-demo-record', { hasText: 'Pessoa Teste' })).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('planner filters tour slots by elapsed hours including the exact boundary', async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem('pm.demo.tours', JSON.stringify([value])), tour);
  await page.goto('/?demo=1&lang=pt-PT#/customer/discover');
  await page.getByRole('button', { name: 'Abrir tour Tour Teste', exact: true }).click();
  await page.getByRole('button', { name: 'Ver rota e preço', exact: true }).click();
  const times = page.getByRole('listbox', { name: 'Horários disponíveis' });
  await expect(times.getByRole('option', { name: '07:00', exact: true })).toHaveCount(0);
  await expect(times.getByRole('option', { name: '08:00', exact: true })).toBeVisible();
});

test('49-hour notice keeps the first eligible day available', async ({ page }) => {
  await page.addInitScript(value => localStorage.setItem('pm.demo.tours', JSON.stringify([value])), { ...tour, minimumNoticeHours: 49 });
  await page.goto('/?demo=1&lang=pt-PT#/customer/discover');
  await page.getByRole('button', { name: 'Abrir tour Tour Teste', exact: true }).click();
  await page.getByRole('button', { name: 'Ver rota e preço', exact: true }).click();
  const times = page.getByRole('listbox', { name: 'Horários disponíveis' });
  await expect(times.getByRole('option', { name: '08:00', exact: true })).toHaveCount(0);
  await times.getByRole('option', { name: '09:00', exact: true }).click();
  await page.getByRole('button', { name: 'Escolher motorista e carro', exact: true }).click();
  await expect(page.getByLabel('Data e hora escolhidas')).toContainText('12/09/2026 · 09:00');
});

test('final submission revalidates a stale tour slot and accepts exactly 168 hours', async ({ page }) => {
  await page.addInitScript(value => sessionStorage.setItem('pm.customer.route-handoff', JSON.stringify(value)), {
    kind: 'tour', origin: 'Lisboa', destination: 'Sintra', stops: [], route: tourRoute, start: '2026-09-17T07:00', tour,
  });
  await page.goto('/?demo=1&lang=pt-PT#/customer/booking');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Nome completo').fill('Pessoa Teste');
  await page.getByLabel('Email', { exact: true }).fill('test@example.invalid');
  await page.getByLabel('Telefone', { exact: true }).fill('+351910000000');
  await page.getByLabel('NIF', { exact: true }).fill('987654322');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Enviar pedido de teste', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('168 horas');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pm.demo.customer-requests') ?? '[]').length)).toBe(0);
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByLabel('Data e hora de recolha').fill('2026-09-17T08:00');
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Enviar pedido de teste', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('pm.demo.customer-requests') ?? '[]').length)).toBe(1);
});
