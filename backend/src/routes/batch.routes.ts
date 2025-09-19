import { Router } from "express";
import { registerBatch, transferBatch } from "@/controllers/batch.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post('/create', authMiddleware, registerBatch);
router.post('/transfer', authMiddleware, transferBatch);

// router.get('/:batchId', );

export const batchRouter = router;