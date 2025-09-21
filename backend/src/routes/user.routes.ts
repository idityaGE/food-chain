import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile,
  getUserBatches
} from "@/controllers/user.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/batches', authMiddleware, getUserBatches);
router.get('/profile', authMiddleware, getUserProfile);


export const userRouter = router;