import "reflect-metadata";
import { AppDataSource } from "./config/database.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
    if (process.env.NODE_ENV === 'production' && (!process.env.JWT_SECRET || !process.env.ACTIVATION_KEY_SECRET)) {
        console.error("[Index] FATAL: JWT_SECRET and ACTIVATION_KEY_SECRET must be set in production");
        process.exit(1);
    }

    (async () => {
        try {
            if (!AppDataSource.isInitialized) {
                await AppDataSource.initialize();
                console.log("[Index] Database initialized");
            }
            app.listen(PORT, () => {
                console.log(`[Index] Server running on port ${PORT}`);
            });
        } catch (error) {
            console.error("[Index] Failed to initialize:", error);
            process.exit(1);
        }
    })();
}

export default app;