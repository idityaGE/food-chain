import { Router } from "express";
import { registerBatch } from "@/controllers/batch.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post('/create', authMiddleware, registerBatch);
// router.post('/transfer', authMiddleware, );
// router.post('/quality-check', authMiddleware, );

// router.get('/:batchId', );

export const batchRouter = router;