import { Router } from "express";
import { SalesLogController } from "../controllers/SalesLogController.js";
import { authMiddleware } from "../shared/middleware/auth.js";

const router = Router();

router.use(authMiddleware);

router.post("/", SalesLogController.create);
router.get("/", SalesLogController.list);

export default router;
