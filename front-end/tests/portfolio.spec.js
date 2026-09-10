import { test, expect } from '@playwright/test';

async function home(page) {
  await page.goto('/');
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'idle');
  await page.mouse.move(200, 600);
}

async function forward(page) {
  await page.mouse.wheel(0, 160);
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'animating');
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'ready');
}

async function menu(page, destination) {
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.navigation-shell')).toHaveAttribute('data-menu-state', 'open');
  await page.locator(`.record-link[href="#${destination}"]`).click();
  await expect(page.locator('.navigation-shell')).toHaveAttribute('data-menu-state', 'closed');
}

test('automatic return keeps pinned artwork stable and selects Início', async ({ page }) => {
  await home(page);
  await forward(page);
  await page.evaluate(() => {
    window.swapFrames = [];
    window.sampleSwap = true;
    const sample = () => {
      window.swapFrames.push({
        logo: document.querySelector('.hero-logo').getBoundingClientRect().y,
        workstation: document.querySelector('.workstation').getBoundingClientRect().y,
      });
      if (window.sampleSwap) requestAnimationFrame(sample);
    };
    requestAnimationFrame(sample);
  });
  await page.mouse.wheel(0, -1000);
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'animating');
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'idle');
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await expect(page.locator('.record-link[aria-current]')).toHaveAttribute('href', '#inicio');
  const drift = await page.evaluate(() => {
    window.sampleSwap = false;
    return ['logo', 'workstation'].map(key => {
      const values = window.swapFrames.map(frame => frame[key]);
      return Math.max(...values) - Math.min(...values);
    });
  });
  drift.forEach(value => expect(value).toBeLessThan(1));
});

test('continuous wheel input completes once and then releases scrolling', async ({ page }) => {
  await home(page);
  await page.mouse.wheel(0, 1500);
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'animating');
  for (let index = 0; index < 4; index++) await page.mouse.wheel(0, 700);
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'animating');
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'ready');
  const landing = await page.evaluate(() => scrollY);
  await page.mouse.wheel(0, 250);
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(landing);
});

test('opening the menu during a swap preserves it; all menu destinations work', async ({ page }) => {
  await home(page);
  await page.mouse.wheel(0, 160);
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'animating');
  await page.locator('.menu-toggle').click();
  await expect(page.locator('.navigation-shell')).toHaveAttribute('data-menu-state', 'open');
  await page.keyboard.press('Escape');
  await expect(page.locator('.navigation-shell')).toHaveAttribute('data-menu-state', 'closed');
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'ready');
  for (const destination of ['inicio', 'sobre', 'projetos', 'conhecimentos', 'inicio']) {
    await menu(page, destination);
    await expect(page.locator('.record-link[aria-current]')).toHaveAttribute('href', `#${destination}`);
    if (destination === 'inicio') await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  }
  await expect(page.locator('main')).not.toHaveAttribute('inert');
});

for (const width of [320, 390, 768, 1440]) {
  test(`layout, assets and dialogs at ${width}px`, async ({ page }) => {
    const errors = [];
    const badResponses = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => { if (response.status() >= 400) badResponses.push(response.url()); });
    await page.setViewportSize({ width, height: 900 });
    await home(page);
    await forward(page);
    for (const id of ['sobre', 'projetos', 'conhecimentos', 'contato']) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await expect.poll(() => page.locator('img').evaluateAll(images => images.every(image => image.complete && image.naturalWidth > 0))).toBe(true);
    await expect(page.locator('.technologies-list').first().locator('li')).toHaveCount(10);
    await expect(page.locator('.technologies-track')).toHaveCSS('animation-play-state', 'running');
    const opener = page.locator('.project-open').first();
    await opener.click();
    await expect(page.locator('#project-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('#project-dialog')).toHaveCount(0);
    await expect(opener).toBeFocused();
    await expect(page.locator('body')).not.toHaveClass(/dialog-open/);
    await page.locator('.back-top').click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    expect(errors).toEqual([]);
    expect(badResponses).toEqual([]);
  });
}

test('direct anchors and motion preference changes do not leave invisible controls', async ({ page }) => {
  await page.goto('/#sobre');
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'ready');
  await page.locator('.header-brand').click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('#inicio')).toHaveCSS('position', 'relative');
  await expect(page.locator('#sobre')).not.toHaveAttribute('inert');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(page.locator('#sobre')).toHaveAttribute('data-swap-state', 'idle');
  await expect(page.locator('#sobre')).not.toHaveCSS('clip-path', 'none');
  await forward(page);
});

test('a missing project fallback does not retry indefinitely', async ({ page }) => {
  let requests = 0;
  await page.route('**/assets/project-world.png', route => { requests++; return route.abort(); });
  await page.goto('/#projetos');
  await expect(page.locator('.project-image img').first()).toHaveAttribute('data-fallback-applied', 'true');
  await page.waitForTimeout(250);
  expect(requests).toBeLessThanOrEqual(2);
});
