import { test as base, request as apiRequest } from '@playwright/test';
import type { Page } from '@playwright/test';
import { E2E_EMAIL, E2E_PASSWORD } from './global-setup';

export { expect } from '@playwright/test';
export { E2E_EMAIL, E2E_PASSWORD };

const API_URL = process.env.API_URL || 'http://localhost:3000';

type AuthFixtures = { authenticatedPage: Page };

export const test = base.extend<AuthFixtures>({
    authenticatedPage: async ({ page }, use) => {
        const ctx = await apiRequest.newContext({ baseURL: API_URL });
        const res = await ctx.post('/auth/login', {
            data: { email: E2E_EMAIL, password: E2E_PASSWORD },
        });
        const { token } = (await res.json()) as { token: string };
        await ctx.dispose();

        // Inject token then navigate — AuthContext picks it up on mount
        await page.goto('/login');
        await page.evaluate((t) => localStorage.setItem('token', t), token);
        await page.goto('/');
        await page.waitForSelector('[data-testid="sidebar"]');

        await use(page);
    },
});