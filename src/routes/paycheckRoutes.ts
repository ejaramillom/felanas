import { Router } from "express";
import { PaycheckController } from "../controllers/PaycheckController.js";
import { authMiddleware } from "../shared/middleware/auth.js"; // Assuming auth middleware exists

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.post("/generate", PaycheckController.generate);
router.get("/:id/pdf", PaycheckController.downloadPdf);
router.get("/", PaycheckController.list);

export default router;
