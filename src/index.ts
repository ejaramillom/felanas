import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import paycheckRoutes from "./routes/paycheckRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "[Index]Felanas API is running" });
});
app.use("/employees", employeeRoutes);
app.use("/paychecks", paycheckRoutes);

// Initialize DB and start server
(async () => {
    // Check if we are in a test environment to avoid port conflicts or double init
    if (process.env.NODE_ENV !== 'test') {
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
    }
})();

export default app;
