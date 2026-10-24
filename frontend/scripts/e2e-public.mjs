import assert from 'node:assert/strict';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright-core';

const baseURL = process.env.E2E_BASE_URL || 'http://127.0.0.1:3100';
const accessURL = process.env.E2E_ACCESS_URL;
const expectedLineCount = Number(process.env.E2E_EXPECTED_LINE_COUNT || 46);
const expectedHistoricalCount = process.env.E2E_EXPECTED_HISTORICAL_COUNT
  ? Number(process.env.E2E_EXPECTED_HISTORICAL_COUNT)
  : null;
const candidates = [
  join(process.env.PROGRAMFILES || '', 'Google/Chrome/Application/chrome.exe'),
  join(process.env['PROGRAMFILES(X86)'] || '', 'Microsoft/Edge/Application/msedge.exe'),
  join(process.env.LOCALAPPDATA || '', 'Google/Chrome/Application/chrome.exe'),
];
const executablePath = candidates.find(existsSync);
assert(executablePath, 'Chrome ou Edge não foi encontrado para o teste E2E.');

const outputDir = new URL('../test-results/', import.meta.url);
mkdirSync(outputDir, { recursive: true });
const screenshotPath = (name) => fileURLToPath(new URL(name, outputDir));
const report = { baseURL, checkedAt: new Date().toISOString(), pages: [], errors: [] };
const browser = await chromium.launch({ executablePath, headless: true });

async function unlockProtectedDeployment(context) {
  if (!accessURL) return;
  const accessPage = await context.newPage();
  await accessPage.goto(accessURL, { waitUntil: 'domcontentloaded' });
  await accessPage.close();
}

async function settle(page) {
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(350);
}

function observe(page, label) {
  page.on('pageerror', (error) => report.errors.push(`${label}: ${error.message}`));
  page.on('console', (message) => {
    if (message.type() === 'error') report.errors.push(`${label}: console: ${message.text()}`);
  });
}

async function visit(page, path, selector) {
  const response = await page.goto(`${baseURL}${path}`, { waitUntil: 'domcontentloaded' });
  assert(response?.ok(), `${path} respondeu HTTP ${response?.status()}`);
  await settle(page);
  await page.waitForSelector(selector, { state: 'visible', timeout: 10000 });
  const text = (await page.locator('body').innerText()).trim();
  assert(text.length > 40, `${path} renderizou conteúdo insuficiente.`);
  report.pages.push(path);
}

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await unlockProtectedDeployment(desktop);
const page = await desktop.newPage();
observe(page, 'desktop');

await visit(page, '/', 'main');
await page.waitForTimeout(1700);
const essentialHidden = await page.locator('main h1, main h2, main a, main button').evaluateAll((nodes) =>
  nodes.filter((node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 &&
      (style.visibility === 'hidden' || Number(style.opacity) < 0.2);
  }).map((node) => node.textContent?.trim()).filter(Boolean),
);
assert.deepEqual(essentialHidden, [], `Elementos essenciais apagados: ${essentialHidden.join(', ')}`);
await page.waitForSelector('.line-result', { state: 'visible', timeout: 10000 });
assert.equal(await page.locator('.line-result').count(), 8, 'A landing deve começar com oito linhas.');
await page.screenshot({ path: screenshotPath('home-desktop.png'), fullPage: true });
while (await page.locator('.line-finder__more').count()) {
  const before = await page.locator('.line-result').count();
  await page.locator('.line-finder__more').click();
  assert((await page.locator('.line-result').count()) > before, 'Ver mais linhas não revelou novos resultados.');
}
assert.equal(await page.locator('.line-result').count(), expectedLineCount, 'Todas as linhas devem permanecer acessíveis após expansão.');

await visit(page, '/linhas', '.lines-list');
const cards = page.locator('.line-card');
assert.equal(await cards.count(), expectedLineCount, `A consulta pública deve listar ${expectedLineCount} linhas vigentes.`);
await page.locator('.lines-search input').fill('Arembepe');
assert((await cards.count()) >= 1, 'A busca por Arembepe não retornou linha.');
await page.locator('.lines-search input').fill('');
const detailPaths = await cards.evaluateAll((nodes) => nodes.map((node) => new URL(node.href).pathname));
assert.equal(new Set(detailPaths).size, expectedLineCount, 'Os links das linhas vigentes devem ser únicos.');

for (const [detailIndex, path] of detailPaths.entries()) {
  await visit(page, path, '.line-detail-title');
  assert((await page.locator('.line-detail-time').count()) > 0, `${path} não exibiu horários úteis.`);
  const mapStatus = await page.locator('.line-detail-map p[role="status"]').innerText();
  assert(/Trajeto|dados do mapa/i.test(mapStatus), `${path} não informou o estado geográfico.`);
  if (detailIndex === 0) await page.screenshot({ path: screenshotPath('line-detail-desktop.png'), fullPage: true });
  if (detailIndex === 0 && await page.locator('.line-detail-times-toggle').count()) {
    const before = await page.locator('.line-detail-time').count();
    await page.locator('.line-detail-times-toggle').first().click();
    assert((await page.locator('.line-detail-time').count()) > before, `${path} não expandiu os horários.`);
  }
}

if (expectedHistoricalCount != null) {
  await visit(page, '/linhas/historico', '.lines-list');
  assert.equal(await page.locator('.line-card').count(), expectedHistoricalCount, `O acervo deve listar ${expectedHistoricalCount} linhas históricas.`);
}

await visit(page, '/register', 'form.auth-card');
assert(await page.locator('#name').isVisible(), 'Cadastro sem campo de nome.');
assert(await page.locator('#email').isVisible(), 'Cadastro sem campo de e-mail.');
assert(await page.locator('#password').isVisible(), 'Cadastro sem campo de senha.');
assert(await page.getByRole('tab', { name: 'Empresa' }).isVisible(), 'Cadastro empresarial não está acessível.');
assert(await page.getByRole('tab', { name: 'Funcionário' }).isVisible(), 'Cadastro de funcionário não está acessível.');
assert(await page.locator('#company_name').isVisible(), 'Cadastro empresarial sem nome da empresa.');
await page.getByRole('tab', { name: 'Funcionário' }).click();
assert(await page.locator('#company_code').isVisible(), 'Cadastro de funcionário sem código da empresa.');
assert.equal(await page.locator('#company_name').count(), 0, 'Cadastro de funcionário exibiu campos empresariais.');
await page.screenshot({ path: screenshotPath('cadastro-desktop.png'), fullPage: true });

await visit(page, '/login', 'form.auth-card');
assert(await page.getByText('Esqueci minha senha').isVisible(), 'Recuperação de senha não está acessível.');
await page.locator('a[href="/register"]').click();
await page.waitForURL('**/register');
await page.waitForSelector('form.auth-card', { state: 'visible' });
assert(await page.locator('#email').isVisible(), 'Transição login→cadastro ocultou o formulário.');
report.pages.push('/login→/register');
await desktop.close();

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  reducedMotion: 'reduce',
});
await unlockProtectedDeployment(mobile);
const mobilePage = await mobile.newPage();
observe(mobilePage, 'mobile');
await visit(mobilePage, '/', 'main');
await mobilePage.waitForSelector('.line-result', { state: 'visible', timeout: 10000 });
assert.equal(await mobilePage.locator('.line-result').count(), 8, 'Mobile deve começar com oito linhas na landing.');
await mobilePage.screenshot({ path: screenshotPath('home-mobile.png'), fullPage: true });
await visit(mobilePage, '/linhas', '.lines-list');
assert.equal(
  await mobilePage.locator('.line-card').count(),
  expectedLineCount,
  `Mobile deve listar ${expectedLineCount} linhas vigentes.`,
);
await mobilePage.screenshot({ path: screenshotPath('linhas-mobile.png'), fullPage: true });
await visit(mobilePage, '/login', 'form.auth-card');
await mobilePage.locator('a[href="/register"]').click();
await mobilePage.waitForURL('**/register');
await mobilePage.waitForSelector('form.auth-card', { state: 'visible' });
assert(await mobilePage.locator('#email').isVisible(), 'Cadastro mobile não ficou visível após a transição.');
assert(await mobilePage.locator('#company_name').isVisible(), 'Cadastro empresarial mobile não ficou visível.');
await mobilePage.getByRole('tab', { name: 'Funcionário' }).click();
assert(await mobilePage.locator('#company_code').isVisible(), 'Cadastro de funcionário mobile não ficou visível.');
report.pages.push('/login→/register?mobile');
await mobilePage.screenshot({ path: screenshotPath('cadastro-mobile.png'), fullPage: true });
await mobile.close();
await browser.close();

writeFileSync(new URL('report.json', outputDir), `${JSON.stringify(report, null, 2)}\n`);
if (report.errors.length) {
  throw new Error(`Erros de navegador:\n${report.errors.join('\n')}`);
}
console.log(`E2E público aprovado: ${report.pages.length} navegações, ${expectedLineCount} linhas vigentes, desktop e mobile.`);
