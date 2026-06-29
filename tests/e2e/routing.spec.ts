import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:8080';

test.describe('Routing & Protection', () => {

  test('Unauthenticated user is redirected to login when accessing protected route', async ({ page }) => {
    await page.goto(`${BASE_URL}/users`);
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('Non-existent route shows 404 page', async ({ page }) => {
    await page.goto(`${BASE_URL}/some-random-page-that-does-not-exist`);
    // Expect URL to stay the same (or whatever the router behavior is), but content to be 404
    // We implemented a specific NotFoundPage
    await expect(page.getByText('Page Not Found')).toBeVisible();
    await expect(page.getByText('404')).toBeVisible();
  });

  test('Authenticated user can access protected route', async ({ page }) => {
    // 1. Login first
    await page.goto(`${BASE_URL}/login`);
    await page.fill('input[name="username"]', 'admin'); 
    await page.fill('input[name="password"]', 'adminpassword');
    await page.click('button[type="submit"]');
    
    // Wait for redirect to dashboard
    await expect(page).toHaveURL(`${BASE_URL}/`);

    // 2. Navigate to users
    await page.click('text=Users');
    await expect(page).toHaveURL(`${BASE_URL}/users`);
    await expect(page.getByText('Users')).toBeVisible();
  });
});
