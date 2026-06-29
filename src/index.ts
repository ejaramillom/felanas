import "reflect-metadata";
import { AppDataSource } from "./config/database.js";
import app from "./app.js";

const PORT = process.env.PORT || 3000;

if (process.env.NODE_ENV !== 'test') {
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
            console.log(error);
        }
    })();
}

export default app;
