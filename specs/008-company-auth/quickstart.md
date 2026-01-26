# Quickstart: Company Authentication

## Prerequisites

1.  Ensure `.env` contains:
    ```bash
    ACTIVATION_KEY_SECRET="your-32-char-secret-key-for-aes-256"
    JWT_SECRET="your-jwt-secret"
    ```
    > Note: `ACTIVATION_KEY_SECRET` must be exactly 32 bytes for AES-256.

## Database Setup

1.  Run migrations to create `activation_key` table and update `company`:
    ```bash
    npm run migration:run
    ```

## Running the App

1.  Start Backend:
    ```bash
    npm run dev
    ```
2.  Start Frontend:
    ```bash
    cd frontend && npm run dev
    ```

## Verification

### Create an Activation Key (Manual)
Since there's no UI for this yet, you can run the seed script or use the `create-key` script (if implemented):
```bash
# Example if script exists
npx ts-node src/scripts/create-activation-key.ts --company "Felanas" --key "SECRET-KEY-123"
```

### Register
1.  Go to `http://localhost:5173/register`
2.  Enter Company: "Felanas", Key: "SECRET-KEY-123"
3.  Submit -> Should redirect to Dashboard.

### Login
1.  Go to `http://localhost:5173/login`
2.  Enter credentials created above.
3.  Submit -> Should redirect to Dashboard.
