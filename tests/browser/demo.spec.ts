import { test, expect } from '@playwright/test';

test('test data can be searched, translated and removed', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?demo=1#/owner/settlements');
  await expect(page.locator('.pm-demo-record')).toHaveCount(3);
  await page.getByRole('searchbox').fill('Sofia');
  await expect(page.locator('.pm-demo-record')).toHaveCount(1);
  await page.getByLabel('Idioma',{exact:true}).selectOption('en');
  await expect(page.getByText('Example X amount, not agreed',{exact:true})).toBeVisible();
  for (const route of ['owner/home','owner/bookings','owner/customers','owner/tours','owner/finance','driver/services','customer/discover']) {
    await page.goto(`/?demo=1&lang=en#/${route}`);
    if (route === 'customer/discover') {
      await expect(page.getByRole('heading', { name: 'Choose your adventure.', exact: true })).toBeVisible();
      await expect(page.locator('.pm-client-tour-promo img').first()).toBeVisible();
    } else {
      await expect(page.locator('.pm-demo-record').first()).toBeVisible();
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  }
  await page.goto('/?demo=1#/owner/home');
  await page.screenshot({path:'artifacts/demo-home-mobile.png',fullPage:true});
  await page.getByRole('checkbox',{name:'Dados de teste',exact:true}).evaluate((element:HTMLInputElement)=>element.click());
  await expect(page.getByRole('heading',{name:'Ligue a conta da aplicação'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading',{name:'Ligue a conta da aplicação'})).toBeVisible();
  await page.goto('/?demo=1#/owner/calendar');
  await expect(page.locator('.fc-list-event')).toHaveCount(2);
  await page.locator('.fc-list-event-title').first().click();
  await expect(page.getByRole('form')).toContainText('TEST-001');
});

test('calendar blocks overlap and short margins, saves, cancels and resets', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?demo=1#/owner/calendar');
  await page.getByRole('button',{name:'Nova viagem de teste'}).click();
  await page.getByLabel('Início',{exact:true}).fill('2026-09-11T09:30');
  await page.getByLabel('Fim',{exact:true}).fill('2026-09-11T10:00');
  await page.getByRole('button',{name:'Guardar teste'}).click();
  await expect(page.getByRole('alert')).toContainText('sobreposição');
  await page.getByLabel('Início',{exact:true}).fill('2026-09-11T10:45');
  await page.getByLabel('Fim',{exact:true}).fill('2026-09-11T11:00');
  await page.getByRole('button',{name:'Guardar teste'}).click();
  await expect(page.getByRole('alert')).toContainText('margem insuficiente');
  await page.getByLabel('Início',{exact:true}).fill('2026-09-11T11:30');
  await page.getByLabel('Fim',{exact:true}).fill('2026-09-11T12:00');
  await page.getByRole('button',{name:'Guardar teste'}).click();
  await expect(page.getByRole('status')).toContainText('guardada');
  await expect(page.locator('.fc-list-event')).toHaveCount(3);
  await page.locator('.fc-list-event-title').nth(1).click();
  await page.getByRole('button',{name:'Cancelar viagem de teste'}).click();
  await expect(page.locator('.fc-list-event')).toHaveCount(2);
  await expect(page.getByRole('status')).toContainText('cancelada');
  await page.getByRole('button',{name:'Repor dados de teste'}).click();
  await expect(page.getByRole('status')).toContainText('reposto');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  await page.screenshot({path:'artifacts/calendar-interactive-mobile.png',fullPage:true});
});

test('catalog demo adds and disables drivers and vehicles with passenger capacity', async ({ page }) => {
  await page.goto('/?demo=1#/owner/drivers');
  await expect(page.locator('.pm-demo-record')).toHaveCount(3);
  await page.getByRole('button',{name:'Novo motorista',exact:true}).click();
  const driverForm=page.getByRole('form',{name:'Novo registo de catálogo'});
  await driverForm.getByLabel('Nome completo').fill('Carla Teste');
  await driverForm.getByLabel('Nome em inglês').fill('Carla Test');
  await driverForm.getByLabel('Telefone').fill('+351 910 000 099');
  await driverForm.getByRole('button',{name:'Adicionar',exact:true}).click();
  const driverCard=page.locator('.pm-demo-record').filter({hasText:'Carla Teste'});
  await expect(driverCard).toBeVisible();
  await driverCard.getByRole('button',{name:'Desativar',exact:true}).click();
  await expect(driverCard.getByText('INATIVO',{exact:true})).toBeVisible();

  await page.goto('/?demo=1#/owner/vehicles');
  await page.getByRole('button',{name:'Novo veículo',exact:true}).click();
  const vehicleForm=page.getByRole('form',{name:'Novo registo de catálogo'});
  await vehicleForm.getByLabel('Matrícula').fill('99-ZZ-99');
  await vehicleForm.getByLabel('Marca').fill('Lexus');
  await vehicleForm.getByLabel('Modelo').fill('LM');
  await vehicleForm.getByLabel('Lugares de passageiros').fill('6');
  await vehicleForm.getByLabel('Bagagem').fill('6');
  await vehicleForm.getByLabel('Antecedência (horas)').fill('48');
  await vehicleForm.getByLabel('Suplemento (€)').fill('35');
  await vehicleForm.getByRole('button',{name:'Adicionar',exact:true}).click();
  const vehicleCard=page.locator('.pm-demo-record').filter({hasText:'Lexus LM'});
  await expect(vehicleCard).toContainText('6 lugares de passageiros');
  await expect(vehicleCard).toContainText('Aceita lotação');
  await vehicleCard.getByLabel('Sofia Martins').check();
  await expect(vehicleCard).toContainText('Sofia Martins');
});

test('owner can create a manual WhatsApp booking after schedule validation', async ({ page }) => {
  await page.goto('/?demo=1#/owner/bookings');
  await page.getByRole('button', { name: 'Nova marcação manual', exact: true }).click();
  const form = page.getByRole('form', { name: 'Marcação manual' });
  await form.getByLabel('Cliente').fill('João WhatsApp');
  await form.getByLabel('Data e hora').fill('2026-09-14T10:00');
  await form.getByRole('button', { name: 'Guardar marcação', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Marcação manual criada');
  await expect(page.getByText('João WhatsApp', { exact: true })).toBeVisible();
  await expect(page.locator('.pm-demo-record').filter({ hasText: 'João WhatsApp' })).toContainText('WhatsApp');
});

test('owner keeps the mobile navigation available while creating a booking', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/owner/bookings');
  await page.getByRole('button', { name: 'Nova marcação manual', exact: true }).click();
  const nav = page.locator('.pm-bottom-nav');
  await expect(nav).toBeVisible();
  await expect(nav).toHaveCSS('position', 'static');
  await nav.getByRole('link', { name: 'Início', exact: true }).click();
  await expect(page).toHaveURL(/#\/owner\/home$/);
  await page.goto('/?demo=1#/owner/bookings');
  await page.getByRole('button', { name: 'Nova marcação manual', exact: true }).click();
  await nav.getByRole('link', { name: 'Agenda', exact: true }).click();
  await expect(page).toHaveURL(/#\/owner\/calendar$/);
});

test('owner receives the complete customer request in the demo inbox', async ({ page }) => {
  await page.goto('/?demo=1#/owner/bookings');
  await page.evaluate(() => localStorage.setItem('pm.demo.customer-requests', JSON.stringify([{
    id: 'CLIENT-INBOX-1', allocation: { id: 'CLIENT-INBOX-1', driverId: '0', vehicleId: '0', startsAt: '2026-09-14T09:00:00Z', endsAt: '2026-09-14T10:00:00Z', status: 'requested' },
    driver: 0, car: 0, service: 'transfer', routeIndex: 0, origin: 'Lisboa', destination: 'Sintra', stops: [], people: 2,
    name: 'Cliente recebido', email: 'recebido@example.invalid', phone: '+351 910 000 090', nif: '987654321', total: 20000, deposit: 5000, balance: 15000, cancelled: false, rescheduled: false,
  }])));
  await page.reload();
  const card = page.locator('.pm-owner-request').filter({ hasText: 'Cliente recebido' });
  await expect(card).toContainText('recebido@example.invalid');
  await expect(card).toContainText('+351 910 000 090');
  await expect(card).toContainText('987654321');
  await expect(card).toContainText('Lisboa → Sintra');
  await expect(card).toContainText('200,00');
});

test('driver advances a service through execution states and opens Waze', async ({ page }) => {
  await page.goto('/?demo=1#/driver/services');
  const card = page.locator('.pm-demo-record').first();
  await expect(card.getByRole('link', { name: 'Abrir destino no Waze' })).toHaveAttribute('target', '_blank');
  for (const action of ['Marcar a caminho', 'Marcar chegada', 'Iniciar viagem', 'Concluir serviço']) {
    await card.getByRole('button', { name: action, exact: true }).click();
  }
  await expect(card.getByText('Concluído', { exact: true })).toBeVisible();
  await expect(card.getByRole('button')).toHaveCount(0);
});

test('owner CRM adds and searches a customer with NIF', async ({ page }) => {
  await page.goto('/?demo=1#/owner/customers');
  await page.getByRole('button', { name: 'Novo cliente', exact: true }).click();
  const form = page.getByRole('form', { name: 'Novo cliente' });
  await form.getByLabel('Nome completo').fill('Rita CRM');
  await form.getByLabel('Email').fill('rita@example.invalid');
  await form.getByLabel('Telefone').fill('+351 910 000 099');
  await form.getByLabel('NIF').fill('987654321');
  await form.getByRole('button', { name: 'Guardar cliente', exact: true }).click();
  await expect(page.getByRole('status')).toContainText('Cliente adicionado');
  await page.getByRole('searchbox').fill('Rita');
  const card = page.locator('.pm-demo-record').filter({ hasText: 'Rita CRM' });
  await expect(card).toContainText('987654321');
});

test('owner adds a bilingual two-day tour package', async ({ page }) => {
  await page.goto('/?demo=1#/owner/tours');
  await page.getByRole('button', { name: 'Novo pacote', exact: true }).click();
  const form = page.getByRole('form', { name: 'Novo pacote' });
  await form.getByLabel('Nome em português').fill('Douro Premium');
  await form.getByLabel('Nome em inglês').fill('Premium Douro');
  await form.getByLabel('Descrição em português').fill('Vinhos e paisagens.');
  await form.getByLabel('Descrição em inglês').fill('Wine and landscapes.');
  await form.getByLabel('Área/local do tour').fill('Douro');
  await form.getByLabel('Foto principal').selectOption('/porto-tour.png');
  await form.getByLabel('Antecedência mínima (horas)').fill('48');
  await form.getByRole('button', { name: 'Guardar pacote', exact: true }).click();
  const card = page.locator('.pm-demo-record').filter({ hasText: 'Douro Premium' }).last();
  await expect(card).toContainText('2 dias');
  await expect(card).toContainText('200,00');
  await expect(card).toContainText('Douro');
  await expect(card.locator('img.pm-tour-cover')).toHaveAttribute('src', '/porto-tour.png');
});

test('owner can save a demo tariff from settings', async ({ page }) => {
  await page.goto('/?demo=1#/owner/settings');
  const form = page.getByRole('form', { name: 'Simulador de preço' });
  await form.getByLabel('Preço base (€)').fill('12');
  await form.getByLabel('Preço por km (€)').fill('2.5');
  await form.getByRole('button', { name: 'Guardar tarifa', exact: true }).click();
  await expect(form.getByRole('status')).toContainText('Tarifa guardada');
});
