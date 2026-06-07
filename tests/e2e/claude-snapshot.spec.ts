import { chromium } from '@playwright/test';
import fs from 'node:fs';

(async () => {
  const browser = await chromium.launch({
    proxy: { server: 'http://127.0.0.1:10808' },
    headless: false,
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto('about:blank');

  console.log('========================================');
  console.log('BROWSER OPEN');
  console.log('Go to https://claude.ai/new and log in');
  console.log('When done, tell me "好了"');
  console.log('========================================');

  const flagPath = 'tests/e2e/login-done.flag';
  if (fs.existsSync(flagPath)) fs.unlinkSync(flagPath);

  for (let i = 0; i < 600; i++) {
    try { if (fs.existsSync(flagPath)) break; } catch {}
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('Extracting UI...');
  try { await page.goto('https://claude.ai/new', { waitUntil: 'domcontentloaded', timeout: 15000 }); } catch {}
  await new Promise(r => setTimeout(r, 5000));

  const data = await page.evaluate(() => {
    const sidebar = document.querySelector('nav, aside, [class*="sidebar"]');
    if (!sidebar) return { sidebarFound: false, bodyText: document.body.innerText.substring(0, 2000) };
    const cs = getComputedStyle(sidebar);
    const buttons = Array.from(sidebar.querySelectorAll('button')).map(b => ({
      text: b.textContent?.trim().slice(0, 80),
      cls: b.className?.slice(0, 150),
    })).filter(b => b.text);
    return {
      sidebarFound: true,
      tag: sidebar.tagName, className: sidebar.className?.slice(0, 300),
      bg: cs.backgroundColor, width: cs.width, borderRight: cs.borderRight,
      fontSize: cs.fontSize, padding: cs.padding,
      textLines: sidebar.innerText.split('\n').filter(l => l.trim()).slice(0, 40),
      buttons,
      html: sidebar.innerHTML.substring(0, 10000),
    };
  });

  console.log('\n=== SIDEBAR ===');
  console.log(JSON.stringify({...data, html: '...'}, null, 2));
  if (data.sidebarFound) {
    console.log('\n--- TEXT ---');
    console.log(data.textLines?.join('\n'));
    console.log('\n--- HTML (6000 chars) ---');
    console.log(data.html?.substring(0, 6000));
  }

  await page.screenshot({ path: 'tests/e2e/claude-ui.png' });
  if (fs.existsSync(flagPath)) fs.unlinkSync(flagPath);
  await browser.close();
  console.log('\nDone!');
})();
