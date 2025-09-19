import { Router } from "express";
import { registerBatch, transferBatch, getBatch } from "@/controllers/batch.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post('/create', authMiddleware, registerBatch);
router.post('/transfer', authMiddleware, transferBatch);

router.get('/:batchId', getBatch);

export const batchRouter = router;