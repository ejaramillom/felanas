import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database";
import employeeRoutes from "./routes/employeeRoutes";

const app = express();
app.use(express.json());

app.use("/employees", employeeRoutes);

const PORT = process.env.PORT || 3000;

// Initialize DB and start server only if this file is run directly
if (require.main === module) {
    AppDataSource.initialize()
        .then(() => {
            console.log("Database initialized");
            app.listen(PORT, () => {
                console.log(`Server running on port ${PORT}`);
            });
        })
        .catch((error) => console.log(error));
}

export default app;
