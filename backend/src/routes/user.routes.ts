import { Router } from "express";
import {
  registerUser
} from "@/controllers/user.controller";

const router = Router();

router.post('/register', registerUser);

export const userRouter = router;