import "reflect-metadata";
import express from "express";
import employeeRoutes from "./routes/employeeRoutes.js";
import paycheckRoutes from "./routes/paycheckRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "[Index]Felanas API is running" });
});
app.use("/employees", employeeRoutes);
app.use("/paychecks", paycheckRoutes);
app.use("/sales", salesRoutes);
app.use("/users", userRoutes);

export default app;
