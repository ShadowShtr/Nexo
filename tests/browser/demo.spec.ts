import { test, expect } from '@playwright/test';

test('test data can be searched, translated and removed', async ({ page }) => {
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?demo=1#/owner/vehicles');
  await expect(page.locator('.pm-demo-record')).toHaveCount(4);
  await page.getByRole('searchbox').fill('Volvo');
  await expect(page.locator('.pm-demo-record')).toHaveCount(1);
  await page.getByLabel('Idioma',{exact:true}).selectOption('en');
  await expect(page.getByText('Test vehicle',{exact:true})).toBeVisible();
  for (const route of ['owner/home','owner/bookings','owner/customers','owner/tours','owner/finance','driver/services','customer/discover']) {
    await page.goto(`/?demo=1&lang=en#/${route}`);
    await expect(page.locator('.pm-demo-record').first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
  }
  await page.goto('/?demo=1#/owner/home');
  await page.screenshot({path:'artifacts/demo-home-mobile.png',fullPage:true});
  await page.getByRole('checkbox',{name:'Dados de teste',exact:true}).uncheck();
  await expect(page.locator('.pm-demo-record')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('checkbox',{name:'Dados de teste',exact:true})).not.toBeChecked();
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
