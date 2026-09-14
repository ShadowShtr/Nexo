import { test, expect } from '@playwright/test';

test.beforeEach(async ({page}) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
});

test('customer chooses car, checks conflicts and submits and cancels a test request',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?demo=1#/customer/booking');
  await page.getByLabel('Carro',{exact:true}).selectOption('1');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  const map = page.getByRole('region',{name:'Pré-visualização do percurso'});
  await expect(map).toContainText('35 km');
  await expect(map).toContainText('Aeroporto de Lisboa');
  await expect(map.getByRole('link',{name:'OpenStreetMap'})).toBeVisible();
  await page.getByLabel('Data e hora de recolha').fill('2026-09-11T09:30');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Horário indisponível');
  await page.getByLabel('Serviço',{exact:true}).selectOption('tour');
  await expect(map).toContainText('62 km');
  await expect(map).toContainText('Paragem');
  await page.getByLabel('Data e hora de recolha').fill('2026-09-11T18:00');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('48 horas');
  await page.getByLabel('Data e hora de recolha').fill('2026-09-14T10:00');
  await page.getByLabel('Passageiros',{exact:true}).selectOption('4');
  await expect(page.locator('.pm-summary')).toContainText('270,00');
  await expect(page.locator('.pm-summary')).toContainText('67,50');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.screenshot({path:'artifacts/customer-review-mobile.png',fullPage:true});
  await page.getByRole('button',{name:'Enviar pedido de teste'}).click();
  await expect(page.getByRole('status')).toContainText('A aguardar aceitação');
  await page.getByRole('link',{name:'Consultar pedidos',exact:true}).click();
  await expect(page.getByRole('heading',{name:/CLIENT-/})).toBeVisible();
  const reference=(await page.getByRole('heading',{name:/CLIENT-/}).first().textContent())!;
  await page.getByLabel('Código de confirmação').fill(`  ${reference.toLowerCase()} `);
  await page.getByRole('button',{name:'Consultar',exact:true}).click();
  await expect(page.getByRole('heading',{name:reference,exact:true}).first()).toBeVisible();
  await page.getByRole('button',{name:'Pedir reagendamento (+1h)',exact:true}).first().click();
  await expect(page.locator('.pm-demo-record').first()).toContainText('11:00');
  await page.getByRole('button',{name:'Cancelar pedido de teste'}).first().click();
  await expect(page.getByRole('status')).toContainText('cancelado');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBeTruthy();
});

test('customer English flow restricts cars to selected driver',async({page})=>{
  await page.goto('/?demo=1&lang=en#/customer/booking');
  await page.getByRole('button',{name:/Sofia Martins/}).click();
  await expect(page.getByLabel('Car',{exact:true})).toHaveValue('2');
  await expect(page.getByLabel('Car',{exact:true}).locator('option')).toHaveCount(1);
  await page.getByRole('button',{name:'Continue',exact:true}).click();
  await expect(page.getByLabel('Passengers',{exact:true}).locator('option')).toHaveCount(4);
  await expect(page.getByLabel('Pickup date and time')).toBeVisible();
});

test('driver receives an official Waze destination link',async({page})=>{
  await page.goto('/?demo=1#/driver/services');
  const link=page.getByRole('link',{name:'Abrir destino no Waze'}).first();
  await expect(link).toHaveAttribute('target','_blank');
  const href=await link.getAttribute('href');
  expect(href).toContain('https://waze.com/ul?');
  expect(href).toContain('navigate=yes');
  expect(href).toContain('utm_source=premium_mobility_demo');
});
