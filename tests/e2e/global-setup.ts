import dotenv from 'dotenv';
dotenv.config();

import { Client } from 'pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export const E2E_EMAIL = 'e2e@test.com';
export const E2E_PASSWORD = 'Test123!';
const E2E_COMPANY = 'E2E Test Co';

function encryptActivationKey(text: string): string {
    const secret = process.env.ACTIVATION_KEY_SECRET;
    if (!secret) throw new Error('ACTIVATION_KEY_SECRET must be set');
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(secret), iv);
    const enc = cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
    return `${iv.toString('hex')}:${cipher.getAuthTag().toString('hex')}:${enc}`;
}

export default async function globalSetup() {
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        user: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'felanas',
    });

    await client.connect();

    // Clean previous run (order: user → company → key)
    await client.query(`DELETE FROM "user" WHERE username = $1`, [E2E_EMAIL]);
    await client.query(`DELETE FROM company WHERE name = $1`, [E2E_COMPANY]);
    await client.query(`DELETE FROM activation_key WHERE company_name = $1`, [E2E_COMPANY]);

    // Seed test company
    const trialEndsAt = new Date(Date.now() + 30 * 86_400_000);
    const { rows: [{ id: companyId }] } = await client.query<{ id: string }>(
        `INSERT INTO company (id, name, currency_code, created_at, trial_ends_at)
         VALUES (gen_random_uuid(), $1, 'USD', NOW(), $2) RETURNING id`,
        [E2E_COMPANY, trialEndsAt]
    );

    // Seed test user (bcrypt hash — matches what AuthController expects)
    const passwordHash = await bcrypt.hash(E2E_PASSWORD, 10);
    await client.query(
        `INSERT INTO "user" (id, username, password_hash, role, company_id)
         VALUES (gen_random_uuid(), $1, $2, 'ADMIN', $3)`,
        [E2E_EMAIL, passwordHash, companyId]
    );

    // Seed unused activation key for future registration tests
    await client.query(
        `INSERT INTO activation_key (id, company_name, encrypted_key, is_used, created_at)
         VALUES (gen_random_uuid(), $1, $2, false, NOW())`,
        [E2E_COMPANY, encryptActivationKey('E2E-TEST-KEY')]
    );

    await client.end();
}