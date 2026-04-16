import { test, expect, type Page } from '@playwright/test';

const tableId = 'tbl_ads_app_qsj_agg_cate_conv';
const tableDetailPath = `/tables/${tableId}`;

function unique(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

async function selectTab(page: Page, label: string) {
  const tab = page.locator('.tabs .tab', { hasText: label });
  await tab.click();
  await expect(tab).toHaveClass(/active/);
}

test.describe('knowledge assets full flow', () => {
  test.beforeEach(async ({ page }) => {
    page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
  });

  test('test case create, edit, and delete flow works', async ({ page }) => {
    const createdName = unique('pw-test-case');
    const updatedName = `${createdName}-updated`;

    await page.goto(tableDetailPath);
    await expect(page.getByRole('heading', { name: 'ads_app_qsj_agg_cate_conv' })).toBeVisible();

    await page.getByRole('button', { name: '新增测试用例' }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3000/test-cases/new?tableId=${tableId}`);

    await page.locator('#name').fill(createdName);
    await page.locator('#logicDesc').fill('Playwright 创建的测试用例逻辑说明');
    await page.locator('#thresholdDesc').fill('差异小于 1%');
    await page.locator('#sqlTemplate').fill('select 1 as result');
    await page.locator('#oneServiceParser').fill('playwright_parser');
    await page.getByRole('button', { name: '创建测试用例' }).click();

    await expect(page).toHaveURL(/\/test-cases\//);
    await expect(page.getByRole('heading', { name: createdName })).toBeVisible();
    await expect(page.getByText('Playwright 创建的测试用例逻辑说明')).toBeVisible();

    await page.getByRole('button', { name: '编辑测试用例' }).click();
    await page.locator('#name').fill(updatedName);
    await page.locator('#logicDesc').fill('Playwright 更新后的测试用例逻辑说明');
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.getByText('Playwright 更新后的测试用例逻辑说明')).toBeVisible();

    await page.goto(tableDetailPath);
    const row = page.locator('tr', { hasText: updatedName });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: '删除' }).click();
    await expect(row).toHaveCount(0);
  });

  test('observation point create, edit, and delete flow works', async ({ page }) => {
    const createdName = unique('pw-observation');
    const updatedName = `${createdName}-updated`;

    await page.goto(tableDetailPath);
    await selectTab(page, '观测点');
    await page.getByRole('button', { name: '新增观测点' }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3000/observations/new?tableId=${tableId}`);

    await page.locator('#name').fill(createdName);
    await page.locator('#metricCode').fill(unique('metric_code'));
    await page.locator('#metricName').fill('Playwright 观测指标');
    await page.locator('#aggregationExpr').fill('sum(order_cnt)');
    await page.locator('#timeGrain').fill('day');
    await page.locator('#dimensions').fill('dt, platform');
    await page.getByRole('button', { name: '创建观测点' }).click();

    await expect(page).toHaveURL(/\/observations\//);
    await expect(page.getByRole('heading', { name: createdName })).toBeVisible();
    await expect(page.getByText('Playwright 观测指标')).toBeVisible();

    await page.getByRole('button', { name: '编辑观测点' }).click();
    await page.locator('#name').fill(updatedName);
    await page.locator('#metricName').fill('Playwright 更新后的观测指标');
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.getByText('Playwright 更新后的观测指标')).toBeVisible();

    await page.goto(tableDetailPath);
    await selectTab(page, '观测点');
    const item = page.locator('.list-item', { hasText: updatedName }).first();
    await expect(item).toBeVisible();
    await item.getByRole('button', { name: '删除' }).click();
    await expect(page.locator('.list-item', { hasText: updatedName })).toHaveCount(0);
  });

  test('business rule create, edit, and delete flow works', async ({ page }) => {
    const createdName = unique('pw-business-rule');
    const updatedName = `${createdName}-updated`;

    await page.goto(tableDetailPath);
    await selectTab(page, '业务规则');
    await page.getByRole('button', { name: '新增业务规则' }).click();
    await expect(page).toHaveURL(`http://127.0.0.1:3000/business-rules/new?tableId=${tableId}`);

    await page.locator('#name').fill(createdName);
    await page.locator('#semanticDesc').fill('Playwright 创建的业务规则语义说明');
    await page.locator('#applicableScope').fill('平台=抖音');
    await page.locator('#analysisHint').fill('优先查看埋点与口径');
    await page.getByRole('button', { name: '创建业务规则' }).click();

    await expect(page).toHaveURL(/\/business-rules\//);
    await expect(page.getByRole('heading', { name: createdName })).toBeVisible();
    await expect(page.getByText('Playwright 创建的业务规则语义说明')).toBeVisible();

    await page.getByRole('button', { name: '编辑业务规则' }).click();
    await page.locator('#name').fill(updatedName);
    await page.locator('#analysisHint').fill('Playwright 更新后的排查建议');
    await page.getByRole('button', { name: '保存' }).click();

    await expect(page.getByRole('heading', { name: updatedName })).toBeVisible();
    await expect(page.getByText('Playwright 更新后的排查建议')).toBeVisible();

    await page.goto(tableDetailPath);
    await selectTab(page, '业务规则');
    const item = page.locator('.list-item', { hasText: updatedName }).first();
    await expect(item).toBeVisible();
    await item.getByRole('button', { name: '删除' }).click();
    await expect(page.locator('.list-item', { hasText: updatedName })).toHaveCount(0);
  });
});
