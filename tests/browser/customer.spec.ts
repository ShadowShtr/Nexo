import { test, expect } from '@playwright/test';

test('customer chooses car, checks conflicts and submits and cancels a test request',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?demo=1#/customer/booking');
  await page.getByLabel('Carro',{exact:true}).selectOption('1');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await page.getByLabel('Data e hora de recolha').fill('2026-09-11T09:30');
  await page.getByRole('button',{name:'Continuar',exact:true}).click();
  await expect(page.getByRole('alert')).toContainText('Horário indisponível');
  await page.getByLabel('Serviço',{exact:true}).selectOption('tour');
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
  await page.getByRole('button',{name:'Cancelar pedido de teste'}).click();
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
