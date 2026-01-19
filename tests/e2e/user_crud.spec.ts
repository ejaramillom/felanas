import { test, expect } from '@playwright/test';

test.describe('User Management', () => {
  test('Admin can login and manage users', async ({ page }) => {
    // 1. Login as Admin
    await page.goto('http://localhost:8080/login');
    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'adminpassword'); // Assumes seeded admin
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard/users
    await expect(page).toHaveURL(/.*\/users/);

    // 2. Create User
    await page.click('text=Create User');
    await page.fill('input[name="username"]', 'e2e_test_user');
    await page.fill('input[name="password"]', 'password123');
    await page.selectOption('select[name="role"]', 'VIEWER');
    await page.click('button:has-text("Save")');

    // Verify user appears in list
    await expect(page.locator('text=e2e_test_user')).toBeVisible();

    // 3. Delete User
    await page.click('tr:has-text("e2e_test_user") button[aria-label="delete"]');
    await page.click('button:has-text("Confirm")');

    // Verify user removed
    await expect(page.locator('text=e2e_test_user')).not.toBeVisible();
  });
});
