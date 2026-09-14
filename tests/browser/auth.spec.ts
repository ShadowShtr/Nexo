import { test, expect } from '@playwright/test';

test('internal areas require configured authentication outside demo mode',async({page})=>{
  await page.goto('/#/owner/home');
  await expect(page.getByRole('heading',{name:'Ligue a conta da aplicação'})).toBeVisible();
  await expect(page.getByText('VITE_SUPABASE_URL')).toBeVisible();
  await expect(page.getByText('Tudo preparado para começar.')).not.toBeVisible();
});

test('customer pages remain public without internal credentials',async({page})=>{
  await page.goto('/#/customer/discover');
  await expect(page.getByRole('heading',{name:'Descobrir'})).toBeVisible();
  await expect(page.getByRole('heading',{name:'A sua próxima viagem começa aqui.'})).toBeVisible();
});
