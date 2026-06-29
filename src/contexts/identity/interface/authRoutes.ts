import { Router } from "express";
import { AuthController } from "./AuthController.js";
import { authMiddleware } from "../../../shared/middleware/auth.js";

const router = Router();

router.post("/register", AuthController.register);
router.post("/login", AuthController.login);
router.get("/me", authMiddleware, AuthController.me);

export default router;