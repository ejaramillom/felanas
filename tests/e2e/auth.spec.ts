import { test, expect } from '@playwright/test';
import { AppDataSource } from '../../src/config/database.js';
import { ActivationKey } from '../../src/entities/ActivationKey.js';
import { EncryptionUtils } from '../../src/utils/EncryptionUtils.js';
import { Company } from '../../src/entities/Company.js';
import { User } from '../../src/entities/User.js';

test.describe('Authentication & Registration Flow', () => {
  const companyName = 'E2E Test Company';
  const rawKey = 'E2E-KEY-123';
  const email = 'e2e-admin@test.com';
  const password = 'Password123!';

  test.beforeAll(async () => {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }
    // Cleanup and Seed
    const keyRepo = AppDataSource.getRepository(ActivationKey);
    await AppDataSource.getRepository(User).delete({ username: email });
    await AppDataSource.getRepository(Company).delete({ name: companyName });
    await keyRepo.delete({ companyName });

    await keyRepo.save(keyRepo.create({
      companyName,
      encryptedKey: EncryptionUtils.encrypt(rawKey)
    }));
  });

  test.afterAll(async () => {
    await AppDataSource.destroy();
  });

  test('User can register a company and then login', async ({ page }) => {
    // 1. Registration
    await page.goto('http://localhost:5173/register');
    await page.fill('input[name="companyName"]', companyName);
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.fill('input[name="activationKey"]', rawKey);
    await page.click('button[type="submit"]');

    // Should redirect to dashboard placeholder
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();

    // 2. Logout (Manual by clearing local storage for now as there's no UI button)
    await page.evaluate(() => localStorage.removeItem('token'));
    await page.reload();
    await expect(page.locator('[data-testid="sidebar"]')).not.toBeVisible();

    // 3. Login
    await page.goto('http://localhost:5173/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect back to dashboard
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible();
  });

  test('Registration fails with invalid key', async ({ page }) => {
    await page.goto('http://localhost:5173/register');
    await page.fill('input[name="companyName"]', companyName);
    await page.fill('input[name="email"]', 'fail@test.com');
    await page.fill('input[name="password"]', 'Password123!');
    await page.fill('input[name="activationKey"]', 'WRONG-KEY');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Invalid activation key')).toBeVisible();
  });
});
