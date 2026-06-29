import "reflect-metadata";
import express from "express";
import cors from "cors";
import employeeRoutes from "./routes/employeeRoutes.js";
import paycheckRoutes from "./routes/paycheckRoutes.js";
import salesRoutes from "./routes/salesRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./contexts/identity/interface/authRoutes.js";

const app = express();
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || "http://localhost:8080" }));
app.use(express.json());
app.get("/", (req, res) => {
    res.json({ message: "[Index]Felanas API is running" });
});
app.use("/auth", authRoutes);
app.use("/employees", employeeRoutes);
app.use("/paychecks", paycheckRoutes);
app.use("/sales", salesRoutes);
app.use("/users", userRoutes);

export default app;