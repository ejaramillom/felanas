import { Router } from "express";
import { UserController } from "../controllers/UserController.js";
import { authMiddleware } from "../middleware/auth.js";

const router = Router();

// Protected routes
router.use(authMiddleware);
router.get("/", UserController.list);
router.post("/", UserController.create);

export default router;