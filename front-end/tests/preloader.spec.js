import { test, expect } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`preloader counts, flies into the header and releases controls at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const loader = page.locator('.preloader');
    await expect(loader).toBeVisible();
    await expect(page.locator('.portfolio-page')).toHaveAttribute('inert');
    await expect(page.locator('.header-brand')).toBeHidden();
    await expect.poll(async () => Number(await page.getByRole('progressbar').getAttribute('aria-valuenow'))).toBeGreaterThan(0);
    await page.mouse.wheel(0, 700);
    await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
    await expect(loader).toHaveAttribute('data-phase', 'flying');
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '100');
    const landing = await page.locator('.preloader-logo').evaluate(logo => {
      const target = document.querySelector('.header-brand').getBoundingClientRect();
      const animation = logo.getAnimations()[0];
      animation.pause();
      animation.currentTime = animation.effect.getTiming().duration;
      const final = logo.getBoundingClientRect();
      const difference = Math.max(Math.abs(final.x - target.x), Math.abs(final.y - target.y), Math.abs(final.width - target.width));
      animation.play();
      return difference;
    });
    expect(landing).toBeLessThan(1);
    await expect(loader).toHaveCount(0);
    await expect(page.locator('.portfolio-page')).not.toHaveAttribute('inert');
    await expect(page.locator('.header-brand')).toBeVisible();
    await page.locator('.menu-toggle').click();
    await expect(page.locator('.navigation-shell')).toHaveAttribute('data-menu-state', 'open');
  });
}

test('reduced motion and an unavailable logo cannot leave the preloader blocking navigation', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.route('**/assets/bruno-logo-transparent.png', route => route.abort());
  await page.goto('/#contato');
  await expect(page.locator('.preloader')).toHaveCount(0);
  await expect(page.locator('.portfolio-page')).not.toHaveAttribute('inert');
  await expect(page.locator('#contact-title')).toBeInViewport();
  await page.locator('.language-toggle').click();
  await expect(page.locator('#language-options')).toBeVisible();
});
