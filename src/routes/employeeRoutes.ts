import { Router } from "express";
import { EmployeeController } from "../controllers/EmployeeController.js";
import { authMiddleware } from "../shared/middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.get("/", EmployeeController.list);
router.post("/", EmployeeController.create);
router.get("/:id", EmployeeController.get);

export default router;
