import { test, expect } from '@playwright/test';

test.describe('App shell', () => {
  test('loads with correct title and empty state', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner').locator('text=学习导师')).toBeVisible();
    await expect(page.locator('text=你好，我是学习导师')).toBeVisible();
  });

  test('shows sidebar with default phase in footer', async ({ page }) => {
    await page.goto('/');
    // Phase now shown in footer
    await expect(page.getByRole('complementary').getByText('摸底测试', { exact: true })).toBeVisible();
  });
});

test.describe('Sidebar', () => {
  test('sidebar is open by default with tabs visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('button', { name: '会话', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: '笔记', exact: true })).toBeVisible();
  });

  test('toggles sidebar via Ctrl+B', async ({ page }) => {
    await page.goto('/');
    // Focus page first, then close sidebar with keyboard
    await page.locator('body').click();
    await page.keyboard.press('Control+b');
    // Sidebar should collapse (288px = w-72)
    await expect(page.locator('aside')).toHaveClass(/w-0/);
    // Re-open
    await page.keyboard.press('Control+b');
    await expect(page.getByRole('button', { name: '会话', exact: true })).toBeVisible();
  });

  test('toggles sidebar via hamburger button', async ({ page }) => {
    await page.goto('/');
    // Hamburger is the second button in sidebar header (after settings)
    await page.locator('aside button[title="关闭侧栏"]').click();
    await expect(page.locator('aside')).toHaveClass(/w-0/);
    await page.keyboard.press('Control+b');
    await expect(page.getByRole('button', { name: '会话', exact: true })).toBeVisible();
  });
});

test.describe('Create book and session', () => {
  test('shows new book modal when clicking + 新会话 with no book', async ({ page }) => {
    await page.goto('/');
    // Sidebar already open — click + 新会话 without selecting a book
    await page.locator('button:has-text("+ 新会话")').click();
    // Modal should appear
    await expect(page.locator('text=新建书籍')).toBeVisible();
    await expect(page.locator('input[placeholder="书名"]')).toBeVisible();
  });

  test('creates a book through the modal', async ({ page }) => {
    await page.goto('/');
    await page.locator('button:has-text("+ 新会话")').click();

    // Fill book form with unique name to avoid collision
    const uniqueTitle = `测试书_${Date.now()}`;
    await page.fill('input[placeholder="书名"]', uniqueTitle);
    await page.fill('input[placeholder*="领域"]', '测试领域');
    await page.fill('input[placeholder*="学习目标"]', '测试目标');
    await page.locator('button:has-text("创建")').click();

    // Modal should close
    await expect(page.locator('text=新建书籍')).not.toBeVisible();
    // Book selected — check the book selector has a value
    await expect(page.getByRole('complementary').getByRole('combobox').first()).toHaveValue(/.+/);
  });
});

test.describe('Messaging', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Ensure a book exists for messaging tests
    await page.evaluate(() => {
      const store = (window as any).__STORE__;
      if (store) {
        const book = {
          id: 'book_test_msg',
          title: '测试书',
          domain: '测试',
          goal: '测试',
          createdAt: new Date().toISOString(),
          notes: [],
        };
        store.setState({ currentBook: book, books: [book] });
      }
    });
    await page.waitForTimeout(200);
  });

  test('sends a message and displays it as answer bubble', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('这是我的回答');
    await page.locator('button:has(svg)').last().click();
    await expect(page.locator('text=这是我的回答')).toBeVisible();
  });

  test('does not send empty message', async ({ page }) => {
    const btn = page.locator('button:has(svg)').last();
    await expect(btn).toBeDisabled();
  });

  test('sends message on Enter key', async ({ page }) => {
    const textarea = page.locator('textarea');
    await textarea.fill('快捷键测试');
    await textarea.press('Enter');
    await expect(page.locator('text=快捷键测试')).toBeVisible();
  });
});

test.describe('Phase display', () => {
  test('shows default phase in sidebar footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('complementary').getByText('摸底测试', { exact: true })).toBeVisible();
  });

  test('phase changes via suggestion confirm', async ({ page }) => {
    await page.goto('/');
    // Trigger phase suggestion
    await page.evaluate(() => {
      const store = (window as any).__STORE__;
      if (store) {
        store.setState({
          suggestedPhase: '精准补漏',
          suggestedPhaseReason: '测试切换',
        });
      }
    });
    await page.waitForTimeout(200);
    // Confirm the suggestion
    await page.getByRole('complementary').getByRole('button', { name: '确认' }).click();
    // Phase should update in footer
    await expect(page.getByRole('complementary').getByText('精准补漏', { exact: true })).toBeVisible();
  });
});

test.describe('Phase suggestion', () => {
  test('shows in sidebar and handles confirm', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const store = (window as any).__STORE__;
      if (store) {
        store.setState({
          suggestedPhase: '精准补漏',
          suggestedPhaseReason: '已完成摸底，识别到盲区',
        });
      }
    });
    await page.waitForTimeout(300);

    // Suggestion appears in sidebar
    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByText(/建议切换至/)).toBeVisible();
    await expect(sidebar.getByRole('button', { name: '确认' })).toBeVisible();
    await expect(sidebar.getByRole('button', { name: '忽略' })).toBeVisible();

    // Click confirm
    await sidebar.getByRole('button', { name: '确认' }).click();
    await expect(sidebar.getByText(/建议切换至/)).not.toBeVisible();
  });

  test('clicking ignore dismisses', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      const store = (window as any).__STORE__;
      if (store) {
        store.setState({ suggestedPhase: '全景收网' });
      }
    });
    await page.waitForTimeout(300);

    const sidebar = page.getByRole('complementary');
    await expect(sidebar.getByRole('button', { name: '忽略' })).toBeVisible();
    await sidebar.getByRole('button', { name: '忽略' }).click();
    await expect(sidebar.getByText(/建议切换至/)).not.toBeVisible();
  });
});
