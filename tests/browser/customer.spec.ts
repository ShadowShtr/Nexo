import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.route('https://tile.openstreetmap.org/**', route => route.abort());
});

test('customer discovery opens the inline planner before booking', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await expect(page.getByRole('heading', { name: 'Escolhe a tua aventura.', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Pesquisar um tour' })).toBeVisible();
  await expect(page.locator('.pm-client-category')).toHaveCount(6);
  await expect(page.getByRole('button', { name: 'Abrir tour Lisboa Sintra' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir tour do Porto com seis paragens' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir tour Lisboa Sintra' }).locator('img')).toHaveAttribute('src', '/lisbon-sintra-tour.png');
  await expect(page.getByRole('button', { name: 'Abrir tour do Porto com seis paragens' }).locator('img')).toHaveAttribute('src', '/porto-tour.png');
  await page.screenshot({ path: 'artifacts/customer-discover-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Abrir tour Lisboa Sintra' }).click();
  await expect(page).toHaveURL(/#\/customer\/discover$/);
  await expect(page.getByRole('heading', { name: 'Planear a sua viagem', exact: true })).toBeVisible();
  await expect(page.getByLabel('Local de partida', { exact: true })).toHaveValue('Lisboa');
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Sintra');
  await expect(page.getByRole('button', { name: 'Ver rota e preço' })).toBeVisible();
  await page.getByRole('button', { name: 'Ver rota e preço' }).click();
  await expect(page.getByRole('region', { name: 'Pré-visualização do percurso' })).toContainText('62 km');
  await expect(page.locator('.pm-client-route-quote')).toContainText('200,00 €');
  await expect(page.getByRole('button', { name: 'Escolher motorista e carro' })).toBeVisible();
  await page.getByRole('button', { name: 'Escolher motorista e carro' }).click();
  await expect(page).toHaveURL(/#\/customer\/booking$/);
  await expect(page.getByLabel('Serviço', { exact: true })).toHaveValue('tour');
});

test('customer discovery keeps tour cards readable and opens Porto', async ({ page }) => {
  await page.setViewportSize({ width: 744, height: 900 });
  await page.goto('/?demo=1#/customer/discover');
  await expect(page.locator('.pm-client-category')).toHaveCount(6);
  const widths = await page.locator('.pm-client-category').evaluateAll(nodes => nodes.map(node => Math.round(node.getBoundingClientRect().width)));
  expect(widths.every(width => width >= 200)).toBeTruthy();
  await page.getByRole('button', { name: /Tour no Porto/ }).click();
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Porto');
  await expect(page.locator('.pm-client-address-field input[aria-label^="Paragem "]')).toHaveCount(6);
  await expect(page.getByLabel('Paragem 1', { exact: true })).toHaveValue('Ribeira do Porto');
  await expect(page.getByLabel('Paragem 6', { exact: true })).toHaveValue('Foz do Douro');
});

test('customer discovery Porto promo preloads its six stops', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Abrir tour do Porto com seis paragens' }).click();
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Porto');
  await expect(page.locator('.pm-client-address-field input[aria-label^="Paragem "]')).toHaveCount(6);
  await expect(page.getByLabel('Paragem 1', { exact: true })).toHaveValue('Ribeira do Porto');
  await expect(page.getByLabel('Paragem 6', { exact: true })).toHaveValue('Foz do Douro');
});

test('customer planner fills destination from recent places', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await expect(page).toHaveURL(/#\/customer\/discover$/);
  await expect(page.getByRole('heading', { name: 'Planear a sua viagem', exact: true })).toBeVisible();
  await expect(page.locator('.pm-client-suggestion')).toHaveCount(3);
  await expect(page.getByRole('region', { name: 'Pré-visualização do percurso' })).toContainText('Escolha um destino para calcular quilómetros e preço.');
  await page.getByRole('button', { name: /Sintra/ }).click();
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Sintra');
  await expect(page.getByRole('button', { name: 'Ver rota e preço' })).toBeEnabled();
});

test('customer planner redraws the map for a different destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Destino', { exact: true }).fill('CARREGADO');
  await expect(page.getByRole('option', { name: /Carregado Carregado, Alenquer/ })).toBeVisible();
  const map = page.getByRole('region', { name: 'Pré-visualização do percurso' });
  await expect(map).toContainText('CARREGADO');
  await expect(map).not.toContainText('Sintra');
  await page.getByRole('button', { name: 'Ver rota e preço' }).click();
  await expect(page.locator('.pm-client-route-quote')).toContainText('Estimativa do transfer');
  await expect(page.locator('.pm-client-route-quote')).not.toContainText('2 dias');
});

test('customer planner suggests the complete Carregado street address', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Destino', { exact: true }).fill('AVENIDA CABO DA BOA ESPERANÇA');
  await expect(page.getByRole('option', { name: /Avenida Cabo da Boa Esperança L65 Carregado/ })).toBeVisible();
  await page.getByRole('option', { name: /Avenida Cabo da Boa Esperança L65 Carregado/ }).click();
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Avenida Cabo da Boa Esperança L65');
  await expect(page.getByRole('region', { name: 'Pré-visualização do percurso' })).toContainText('Avenida Cabo da Boa Esperança L65');
});

test('customer planner suggests tourist places and shopping centres', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Destino', { exact: true }).fill('quinta da regaleira');
  await expect(page.getByRole('option', { name: /Quinta da Regaleira Rua Barbosa/ })).toBeVisible();
  await page.getByRole('option', { name: /Quinta da Regaleira Rua Barbosa/ }).click();
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Quinta da Regaleira');
  await page.getByRole('button', { name: 'Adicionar paragem' }).click();
  await page.getByLabel('Paragem 1', { exact: true }).fill('colombo');
  await expect(page.getByRole('option', { name: /Centro Colombo Av\. Lusíada/ })).toBeVisible();
});

test('customer planner geocodes an address outside the curated catalogue', async ({ page }) => {
  await page.route('https://photon.komoot.io/api/**', async route => {
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ features: [{ properties: { name: 'Rua do Alecrim', street: 'Rua do Alecrim', housenumber: '10', city: 'Lisboa', country: 'Portugal' }, geometry: { coordinates: [-9.1434, 38.7095] } }] }),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Destino', { exact: true }).fill('Rua do Alecrim 10');
  await expect(page.getByRole('option', { name: /Rua do Alecrim, n\.º 10.*Lisboa/ })).toBeVisible();
  await page.getByRole('option', { name: /Rua do Alecrim, n\.º 10.*Lisboa/ }).click();
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Rua do Alecrim, n.º 10');
  await expect(page.getByRole('button', { name: 'Ver rota e preço' })).toBeEnabled();
  await expect(page.getByRole('region', { name: 'Pré-visualização do percurso' })).toContainText('Rua do Alecrim, n.º 10');
});

test('customer planner relaxes an over-specified street search', async ({ page }) => {
  const queries: string[] = [];
  await page.route('https://photon.komoot.io/api/**', async route => {
    const query = new URL(route.request().url()).searchParams.get('q') ?? '';
    queries.push(query);
    if (!query.toLocaleLowerCase().includes('rua pedro 40 centro')) {
      await route.fulfill({ contentType: 'application/json', body: '{"features":[]}' });
      return;
    }
    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ features: [{ properties: { name: 'Rua Pedro de Sintra', city: 'Alenquer', postcode: '2580-510', country: 'Portugal' }, geometry: { coordinates: [-8.9707512, 39.0224941] } }] }),
    });
  });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Local de partida', { exact: true }).fill('rua pedro sintra lt 40 centro');
  await expect(page.getByRole('option', { name: /Rua Pedro de Sintra, Lote 40/ })).toBeVisible();
  await page.getByRole('option', { name: /Rua Pedro de Sintra, Lote 40/ }).click();
  await expect(page.getByLabel('Local de partida', { exact: true })).toHaveValue('Rua Pedro de Sintra, Lote 40');
  expect(queries.some(query => query.toLocaleLowerCase().includes('rua pedro 40 centro'))).toBeTruthy();
  await page.getByLabel('Local de partida', { exact: true }).fill('ruapedrodesintralt40');
  await expect(page.getByRole('option', { name: /Rua Pedro de Sintra, Lote 40 Carregado e Cadafais/ })).toBeVisible();
});

test('customer planner prioritises the matching street over nearby numeric results', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Local de partida', { exact: true }).fill('rua pedro sintra n 40');
  await expect(page.getByRole('option', { name: /Rua Pedro de Sintra, Lote 40 Carregado e Cadafais/ })).toBeVisible();
  await expect(page.locator('.pm-client-inline-suggestion')).toHaveCount(1);
  await expect(page.locator('.pm-client-inline-suggestion', { hasText: /Lawrence|^40/ })).toHaveCount(0);
});

test('customer planner corrects a close street typo and preserves the lot number', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Local de partida', { exact: true }).fill('rua pedro sinta lote 84');
  const suggestion = page.getByRole('option', { name: /Rua Pedro de Sintra, Lote 84 Carregado e Cadafais/ });
  await expect(suggestion).toBeVisible();
  await suggestion.click();
  await expect(page.getByLabel('Local de partida', { exact: true })).toHaveValue('Rua Pedro de Sintra, Lote 84');
});

test('customer planner keeps lots distinct from house numbers and marks street-level precision', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Local de partida', { exact: true }).fill('rua pedro sintra lote');
  await expect(page.getByText('Arruamento encontrado', { exact: true })).toBeVisible();
  await expect(page.getByRole('option', { name: /Rua Pedro de Sintra Carregado e Cadafais/ })).toBeVisible();
  await page.getByLabel('Local de partida', { exact: true }).fill('rua pedro sintra lote 86');
  const lot = page.getByRole('option', { name: /Rua Pedro de Sintra, Lote 86.*ponto aproximado na rua/ });
  await expect(lot).toBeVisible();
  await expect(page.locator('.pm-client-inline-suggestion')).toHaveCount(1);
  await lot.click();
  await expect(page.getByLabel('Local de partida', { exact: true })).toHaveValue('Rua Pedro de Sintra, Lote 86');
});

test('customer adds a stop inline and hides recent places after choosing a destination', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await expect(page.locator('.pm-client-suggestions')).toBeVisible();
  await page.getByLabel('Destino', { exact: true }).fill('Sintra');
  await page.getByRole('option', { name: /Sintra Sintra, Lisboa/ }).click();
  await expect(page.locator('.pm-client-suggestions')).toHaveCount(0);
  await page.getByRole('button', { name: 'Adicionar paragem' }).click();
  await expect(page.getByLabel('Paragem 1', { exact: true })).toBeVisible();
  await expect(page.locator('.pm-client-address-card .pm-client-address-field small')).toHaveText(['Local de partida', 'Paragem 1', 'Destino']);
  await page.getByLabel('Paragem 1', { exact: true }).fill('shopping vasco');
  await expect(page.getByRole('option', { name: /Vasco da Gama Shopping Av\. Dom João II/ })).toBeVisible();
  await page.getByRole('option', { name: /Vasco da Gama Shopping Av\. Dom João II/ }).click();
  await expect(page.getByLabel('Paragem 1', { exact: true })).toHaveValue('Vasco da Gama Shopping');
  await expect(page.getByRole('region', { name: 'Pré-visualização do percurso' })).toContainText('Vasco da Gama Shopping');
  await page.getByRole('button', { name: 'Remover paragem 1' }).click();
  await expect(page.getByLabel('Paragem 1', { exact: true })).toHaveCount(0);
});

test('customer reorders stops with up and down controls while keeping destination last', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/discover');
  await page.getByRole('button', { name: 'Pesquisar um tour' }).click();
  await page.getByLabel('Destino', { exact: true }).fill('Sintra');
  await page.getByRole('option', { name: /Sintra Sintra, Lisboa/ }).click();

  await page.getByRole('button', { name: 'Adicionar paragem' }).click();
  await page.getByLabel('Paragem 1', { exact: true }).fill('ubbo');
  await page.getByRole('option', { name: /UBBO Av\. Cruzeiro Seixas/ }).click();
  await page.getByRole('button', { name: 'Adicionar paragem' }).click();
  await page.getByLabel('Paragem 2', { exact: true }).fill('shopping vasco');
  await page.getByRole('option', { name: /Vasco da Gama Shopping Av\. Dom João II/ }).click();

  await expect(page.getByRole('button', { name: 'Subir paragem 1' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Descer paragem 2' })).toBeDisabled();
  await page.getByRole('button', { name: 'Subir paragem 2' }).click();
  await expect(page.getByLabel('Paragem 1', { exact: true })).toHaveValue('Vasco da Gama Shopping');
  await expect(page.getByLabel('Paragem 2', { exact: true })).toHaveValue('UBBO');
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Sintra');

  await expect(page.locator('.pm-route-points li strong')).toHaveText([
    'Lisboa',
    'Vasco da Gama Shopping',
    'UBBO',
    'Sintra',
  ]);
  await expect(page.locator('.pm-route-points li small')).toHaveText(['Recolha', 'Paragem', 'Paragem', 'Destino']);

  await page.getByRole('button', { name: 'Descer paragem 1' }).click();
  await expect(page.getByLabel('Paragem 1', { exact: true })).toHaveValue('UBBO');
  await expect(page.getByLabel('Paragem 2', { exact: true })).toHaveValue('Vasco da Gama Shopping');
  await expect(page.getByLabel('Destino', { exact: true })).toHaveValue('Sintra');
});

test('customer chooses route, car, checks conflicts and submits and cancels a test request', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/?demo=1#/customer/booking');
  const map = page.getByRole('region', { name: 'Pré-visualização do percurso' });
  await expect(map).toContainText('35 km');
  await expect(map).toContainText('Aeroporto de Lisboa');
  await expect(map.getByRole('link', { name: 'OpenStreetMap' })).toBeVisible();

  await page.getByLabel('Data e hora de recolha').fill('2026-09-11T09:30');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Carro', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Enviar pedido de teste', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Horário indisponível');

  for (let index = 0; index < 3; index += 1) await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByLabel('Serviço', { exact: true }).selectOption('tour');
  await expect(map).toContainText('62 km');
  await expect(map).toContainText('Paragem');
  await page.getByLabel('Data e hora de recolha').fill('2026-09-11T18:00');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Carro', { exact: true }).selectOption('1');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Enviar pedido de teste', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('48 horas');

  for (let index = 0; index < 3; index += 1) await page.getByRole('button', { name: 'Voltar', exact: true }).click();
  await page.getByLabel('Data e hora de recolha').fill('2026-09-14T10:00');
  await page.getByLabel('Passageiros', { exact: true }).selectOption('4');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByLabel('Carro', { exact: true }).selectOption('1');
  await expect(page.locator('.pm-summary').first()).toContainText('270,00');
  await expect(page.locator('.pm-summary').first()).toContainText('67,50');
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.getByRole('button', { name: 'Continuar', exact: true }).click();
  await page.screenshot({ path: 'artifacts/customer-review-mobile.png', fullPage: true });
  await page.getByRole('button', { name: 'Enviar pedido de teste' }).click();
  await expect(page.getByRole('status')).toContainText('A aguardar aceitação');
  await page.getByRole('link', { name: 'Consultar pedidos', exact: true }).click();
  await expect(page.getByRole('heading', { name: /CLIENT-/ })).toBeVisible();
  const reference = (await page.getByRole('heading', { name: /CLIENT-/ }).first().textContent())!;
  await page.getByLabel('Código de confirmação').fill(`  ${reference.toLowerCase()} `);
  await page.getByRole('button', { name: 'Consultar', exact: true }).click();
  await expect(page.getByRole('heading', { name: reference, exact: true }).first()).toBeVisible();
  await page.getByRole('button', { name: 'Pedir reagendamento (+1h)', exact: true }).first().click();
  await expect(page.locator('.pm-demo-record').first()).toContainText('11:00');
  await page.getByRole('button', { name: 'Cancelar pedido de teste' }).first().click();
  await expect(page.getByRole('status')).toContainText('cancelado');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBeTruthy();
});

test('customer English flow restricts cars to selected driver', async ({ page }) => {
  await page.goto('/?demo=1&lang=en#/customer/booking');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByRole('button', { name: /Sofia Martins/ }).click();
  await expect(page.getByLabel('Car', { exact: true })).toHaveValue('2');
  await expect(page.getByLabel('Car', { exact: true }).locator('option')).toHaveCount(1);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Phone')).toBeVisible();
});

test('driver receives an official Waze destination link', async ({ page }) => {
  await page.goto('/?demo=1#/driver/services');
  const link = page.getByRole('link', { name: 'Abrir destino no Waze' }).first();
  await expect(link).toHaveAttribute('target', '_blank');
  const href = await link.getAttribute('href');
  expect(href).toContain('https://waze.com/ul?');
  expect(href).toContain('navigate=yes');
  expect(href).toContain('utm_source=premium_mobility_demo');
});
