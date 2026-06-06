import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('loads with correct title and empty state', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=学习导师')).toBeVisible();
    await expect(page.locator('text=开始你的学习旅程')).toBeVisible();
  });

  test('shows phase banner with default phase', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=当前阶段：摸底测试')).toBeVisible();
  });
});

test.describe('Sidebar', () => {
  test('opens sidebar via toolbar button', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button').first().click();
    // Tab buttons should be visible
    await expect(page.getByRole('button', { name: '会话', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '笔记', exact: true })).toBeVisible();
  });

  test('opens sidebar via Ctrl+B', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+b');
    await expect(page.getByRole('button', { name: '会话', exact: true })).toBeVisible();
  });

  test('closes sidebar when clicking ×', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button').first().click();
    await expect(page.getByRole('button', { name: '会话', exact: true })).toBeVisible();
    // Click the close × button
    await page.locator('aside').getByText('×').click();
    // Sidebar should collapse
    await expect(page.locator('aside')).toHaveClass(/w-0/);
  });
});

test.describe('Create book and session', () => {
  test('shows new book modal when clicking + 新会话 with no book', async ({ page }) => {
    await page.goto('/');
    // Open sidebar
    await page.locator('header button').first().click();
    // Click + 新会话 without selecting a book
    await page.locator('button:has-text("+ 新会话")').click();
    // Modal should appear
    await expect(page.locator('text=新建书籍')).toBeVisible();
    await expect(page.locator('input[placeholder="书名"]')).toBeVisible();
  });

  test('creates a book through the modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('header button').first().click();
    await page.locator('button:has-text("+ 新会话")').click();

    // Fill book form with unique name to avoid collision
    const uniqueTitle = `测试书_${Date.now()}`;
    await page.fill('input[placeholder="书名"]', uniqueTitle);
    await page.fill('input[placeholder*="领域"]', '测试领域');
    await page.fill('input[placeholder*="学习目标"]', '测试目标');
    await page.locator('button:has-text("创建")').click();

    // Modal should close
    await expect(page.locator('text=新建书籍')).not.toBeVisible();
    // Book selected in sidebar dropdown
    await expect(page.getByRole('complementary').getByRole('combobox')).toHaveValue(/.+/);
  });
});

test.describe('Messaging', () => {
  test('sends a message and displays it as answer bubble', async ({ page }) => {
    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill('这是我的回答');
    // Click send button
    await page.locator('button:has(svg)').last().click();
    // Message should appear
    await expect(page.locator('text=这是我的回答')).toBeVisible();
  });

  test('does not send empty message', async ({ page }) => {
    await page.goto('/');
    const btn = page.locator('button:has(svg)').last();
    await expect(btn).toBeDisabled();
  });

  test('sends message on Enter key', async ({ page }) => {
    await page.goto('/');
    const textarea = page.locator('textarea');
    await textarea.fill('快捷键测试');
    await textarea.press('Enter');
    await expect(page.locator('text=快捷键测试')).toBeVisible();
  });
});

test.describe('Phase switching', () => {
  test('changes phase banner when switching via dropdown', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('header select');
    await select.selectOption('全景收网');
    await expect(page.locator('text=当前阶段：全景收网')).toBeVisible();
  });

  test('cycles through all phases', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('header select');
    for (const phase of ['精准补漏', '循环迭代', '全景收网', '摸底测试']) {
      await select.selectOption(phase);
      await expect(page.locator(`text=当前阶段：${phase}`)).toBeVisible();
    }
  });
});
