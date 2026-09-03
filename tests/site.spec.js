const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:3000';

test.describe('Ollie\'s Website', () => {

  test('home page loads and has all buttons', async ({ page }) => {
    await page.goto(BASE_URL);

    // Check title
    await expect(page).toHaveTitle(/Ollie/);

    // Check all nav buttons exist and are clickable
    await expect(page.locator('.btn-stories')).toBeVisible();
    await expect(page.locator('.btn-videos')).toBeVisible();
    await expect(page.locator('.btn-about')).toBeVisible();
    await expect(page.locator('.btn-fun')).toBeVisible();

    // All buttons should be links now
    await expect(page.locator('a.btn-fun')).toHaveAttribute('href', 'fun/');
  });

  test('stories page loads with all books', async ({ page }) => {
    await page.goto(`${BASE_URL}/stories/`);

    // Check all book cards
    const books = page.locator('.book-card');
    await expect(books).toHaveCount(5); // 4 books + coming soon

    // Check book images load (no broken images)
    const images = page.locator('.book-cover');
    for (const img of await images.all()) {
      const src = await img.getAttribute('src');
      if (src) {
        const response = await page.request.get(`${BASE_URL}/stories/${src}`);
        expect(response.ok(), `Image ${src} should load`).toBeTruthy();
      }
    }
  });

  test('duckling crooked story - navigation works', async ({ page }) => {
    await page.goto(`${BASE_URL}/stories/duckling-crooked.html`);

    // Cover should be visible
    await expect(page.locator('#cover')).toBeVisible();

    // Click start button
    await page.click('.start-btn');

    // Page 1 should now be visible
    await expect(page.locator('#page1')).toBeVisible();
    await expect(page.locator('#cover')).not.toBeVisible();

    // Navigate to page 2 to verify nav works
    await page.locator('#page1 .nav-btn:has-text("Next")').click();
    await page.waitForTimeout(600);

    // Page 2 should be visible
    await expect(page.locator('#page2')).toBeVisible();

    // Use keyboard to go back
    await page.keyboard.press('ArrowLeft');
    await page.waitForTimeout(600);

    // Page 1 should be visible again
    await expect(page.locator('#page1')).toBeVisible();
  });

  test('hedgie book - page turning works', async ({ page }) => {
    await page.goto(`${BASE_URL}/stories/ollie-saves-hedgie/`);

    // Cover should be visible
    const cover = page.locator('.page.cover');
    await expect(cover).toBeVisible();

    // Click next
    await page.click('.click-zone.right');
    await page.waitForTimeout(700);

    // Page 1 should be active
    await expect(page.locator('.page[data-page="1"]')).toHaveClass(/active/);

    // Check all images exist
    const imgSrcs = ['cover.png', 'pages-01-02.png', 'pages-03-04.png'];
    for (const src of imgSrcs) {
      const response = await page.request.get(`${BASE_URL}/stories/ollie-saves-hedgie/${src}`);
      expect(response.ok(), `Image ${src} should exist`).toBeTruthy();
    }
  });

  test('videos page loads with working videos', async ({ page }) => {
    await page.goto(`${BASE_URL}/videos/`);

    // Check video cards
    const videoCards = page.locator('.video-card');
    await expect(videoCards).toHaveCount(2);

    // Check video files exist
    const videos = ['first_flight.mp4', 'the_cactus_who_needed_a_hug.mp4'];
    for (const vid of videos) {
      const response = await page.request.get(`${BASE_URL}/videos/${vid}`);
      expect(response.ok(), `Video ${vid} should exist`).toBeTruthy();
    }

    // Check poster image
    const posterResponse = await page.request.get(`${BASE_URL}/videos/first-flight-poster.png`);
    expect(posterResponse.ok(), 'First flight poster should exist').toBeTruthy();
  });

  test('about page loads correctly', async ({ page }) => {
    await page.goto(`${BASE_URL}/about/`);

    await expect(page.locator('h1')).toContainText('Ollie');
    await expect(page.locator('.fact-value:has-text("Wiggle")')).toBeVisible();
    await expect(page.locator('.fact-value:has-text("August 22nd")')).toBeVisible();
  });

  test('fun page shows coming soon with ideas', async ({ page }) => {
    await page.goto(`${BASE_URL}/fun/`);

    await expect(page.locator('h1')).toContainText('Fun');
    await expect(page.locator('.message-box h2')).toContainText('Coming Soon');

    // Should show planned game ideas
    await expect(page.locator('.idea')).toHaveCount(4);
  });

  test('navigation is consistent across pages', async ({ page }) => {
    const pages = ['/stories/', '/videos/', '/about/'];

    for (const path of pages) {
      await page.goto(`${BASE_URL}${path}`);

      // Should have nav-bar
      await expect(page.locator('.nav-bar')).toBeVisible();

      // Should have home link
      await expect(page.locator('.nav-home')).toBeVisible();
    }
  });

  test('mobile - home buttons are tap-friendly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone size
    await page.goto(BASE_URL);

    // Buttons should still be visible and large enough
    const storiesBtn = page.locator('.btn-stories');
    const box = await storiesBtn.boundingBox();

    // Should be at least 80px (tap friendly)
    expect(box.width).toBeGreaterThan(80);
    expect(box.height).toBeGreaterThan(80);
  });

  test('cactus hug story loads and navigates', async ({ page }) => {
    await page.goto(`${BASE_URL}/stories/cactus-hug.html`);

    // Should have cover
    await expect(page.locator('#cover')).toBeVisible();

    // Start reading
    await page.click('.start-btn');
    await expect(page.locator('#page1')).toBeVisible();
  });

  test('crybaby story loads and navigates', async ({ page }) => {
    await page.goto(`${BASE_URL}/stories/crybaby.html`);

    // Should have cover
    await expect(page.locator('#cover')).toBeVisible();

    // Start reading
    await page.click('.start-btn');
    await expect(page.locator('#page1')).toBeVisible();
  });

  test('all story images exist', async ({ page }) => {
    // Check duckling story images
    const ducklingImages = [
      '/images/duckling-cover.png',
      '/images/page1.png',
      '/images/page2.png',
      '/images/page3.png',
      '/images/page4.png',
      '/images/page5.png',
      '/images/page6.png',
      '/images/page7.png',
      '/images/page8.png'
    ];

    for (const img of ducklingImages) {
      const response = await page.request.get(`${BASE_URL}${img}`);
      expect(response.ok(), `Image ${img} should exist`).toBeTruthy();
    }

    // Check cactus images folder exists
    const cactusResponse = await page.request.get(`${BASE_URL}/images/cactus/cover.png`);
    expect(cactusResponse.ok(), 'Cactus cover should exist').toBeTruthy();

    // Check crybaby images folder exists
    const crybabyResponse = await page.request.get(`${BASE_URL}/images/crybaby/cover.png`);
    expect(crybabyResponse.ok(), 'Crybaby cover should exist').toBeTruthy();
  });

  test('hedgie book has all page images', async ({ page }) => {
    const hedgiePages = [
      'cover.png',
      'pages-01-02.png',
      'pages-03-04.png',
      'pages-05-06.png',
      'pages-07-08.png',
      'pages-09-10.png',
      'pages-11-12.png',
      'pages-13-14.png',
      'pages-15-16.png',
      'pages-17-18.png',
      'pages-19-20.png',
      'pages-21-22.png',
      'pages-23-24.png',
      'pages-25-26.png',
      'pages-27-28.png'
    ];

    for (const img of hedgiePages) {
      const response = await page.request.get(`${BASE_URL}/stories/ollie-saves-hedgie/${img}`);
      expect(response.ok(), `Hedgie page ${img} should exist`).toBeTruthy();
    }
  });
});
