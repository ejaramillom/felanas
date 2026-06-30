import { test, expect, E2E_EMAIL, E2E_PASSWORD } from './fixtures';

test.describe('Auth: login / logout', () => {
    test('login via form shows dashboard', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill(E2E_EMAIL);
        await page.getByLabel('Password').fill(E2E_PASSWORD);
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page.getByTestId('sidebar')).toBeVisible({ timeout: 10_000 });
    });

    test('login with wrong password shows error', async ({ page }) => {
        await page.goto('/login');
        await page.getByLabel('Email').fill(E2E_EMAIL);
        await page.getByLabel('Password').fill('wrong-password');
        await page.getByRole('button', { name: /sign in/i }).click();
        await expect(page.getByRole('alert')).toBeVisible({ timeout: 5_000 });
    });

    test('logout redirects to /login', async ({ authenticatedPage }) => {
        await expect(authenticatedPage.getByTestId('sidebar')).toBeVisible();
        await authenticatedPage.getByRole('button', { name: /sign out/i }).click();
        await expect(authenticatedPage).toHaveURL(/\/login/, { timeout: 5_000 });
    });
});