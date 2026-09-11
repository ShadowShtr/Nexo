import { test, expect } from '@playwright/test';

test('preview navigation, English and mobile layout across all areas', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Tudo preparado para começar.' })).toBeVisible();
  await page.screenshot({ path: 'artifacts/home-desktop.png', fullPage: true });
  await page.getByLabel('Idioma', { exact: true }).selectOption('en');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.getByRole('heading', { name: 'Ready for a fresh start.' })).toBeVisible();
  for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['owner/home', 'owner/calendar', 'owner/bookings', 'owner/customers', 'owner/drivers', 'owner/vehicles', 'owner/tours', 'owner/finance', 'owner/settlements', 'owner/settings', 'owner/more', 'driver/services', 'driver/availability', 'driver/earnings', 'driver/profile', 'customer/discover', 'customer/booking', 'customer/lookup']) {
      await page.goto(`/?lang=en#/${route}`);
      await expect(page.locator('h1')).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${route} at ${width}`).toBeTruthy();
    }
  }
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/owner/home');
  await page.screenshot({path:'artifacts/home-mobile.png',fullPage:true});
  await page.getByRole('link',{name:'Mais',exact:true}).click();
  await page.getByRole('link',{name:'Configurações',exact:true}).click();
  await expect(page.locator('h1')).toHaveText('Configurações');
  await page.screenshot({path:'artifacts/settings-mobile.png',fullPage:true});
  expect(errors).toEqual([]);
});

test('tour uses domain price and deposit; settings simulation does not persist', async ({ page }) => {
  await page.goto('/#/owner/tours');
  await page.getByRole('button', {name:'Mais passageiros'}).click();
  await expect(page.locator('.pm-value')).toContainText('235');
  await expect(page.locator('.pm-summary-split')).toContainText('58,75');
  await expect(page.locator('.pm-summary-split')).toContainText('176,25');
  await page.goto('/#/owner/settings');
  await page.getByLabel('Deslocação estimada (min)').fill('90');
  await page.getByRole('button',{name:'Simular margem'}).click();
  await expect(page.locator('.pm-simulation-result')).toHaveText('Margem necessária: 105 min');
  await page.getByLabel('Margem mínima (min)').fill('-1');
  await page.getByRole('button',{name:'Simular margem'}).click();
  await expect(page.locator('#minimum-error')).toBeVisible();
  await expect(page.locator('.pm-simulation-result')).toBeEmpty();
  await page.reload();
  await expect(page.getByLabel('Margem mínima (min)')).toHaveValue('60');
});

test('calendar samples are opt-in, show Lisbon time outside Lisbon and open accessible details', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/#/owner/calendar');
  await expect(page.getByText('Sem viagens neste período')).toBeVisible();
  await page.getByRole('checkbox',{name:'Mostrar exemplo'}).check();
  await expect(page.locator('.fc-list-event-time').first()).toContainText('09:00');
  await page.locator('.fc-list-event-title').first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Não representa uma reserva');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByLabel('Agenda',{exact:true}).selectOption('timeGridDay');
  await expect(page.locator('.fc-bg-event')).toHaveCount(1);
  await page.screenshot({path:'artifacts/calendar-mobile.png',fullPage:true});
  await page.getByLabel('Idioma',{exact:true}).selectOption('en');
  await expect(page.getByRole('checkbox',{name:'Show example'})).toBeChecked();
  await page.getByRole('checkbox',{name:'Show example'}).uncheck();
  await expect(page.locator('.fc-event')).toHaveCount(0);
});
