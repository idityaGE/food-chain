import { Router } from "express";
import {
  registerUser,
  loginUser,
  getUserProfile
} from "@/controllers/user.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);

router.get('/profile', authMiddleware, getUserProfile);

export const userRouter = router;