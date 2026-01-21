import { Router } from "express";
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

// Public routes
router.post("/login", UserController.login);

// Protected routes
router.use(authMiddleware);
router.get("/", UserController.list);
router.post("/", UserController.create);
// router.get("/:id", UserController.get); // If implemented

export default router;
