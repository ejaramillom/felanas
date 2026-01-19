import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database";
import employeeRoutes from "./routes/employeeRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "[Index]Felanas API is running" });
});
app.use("/employees", employeeRoutes)

// Initialize DB and start server only if this file is run directly
if (require.main === module) {
    (async () => {
        try {
            await AppDataSource.initialize();
            console.log("[Index] Database initialized");
            app.listen(PORT, () => {
                console.log(`[Index] Server running on port ${PORT}`);
            });
        } catch (error) {
            console.log(error);
        }
    })();
}

export default app;
