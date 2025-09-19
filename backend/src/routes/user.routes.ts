import { Router } from "express";
import {
  registerUser
} from "@/controllers/user.controller";

const router = Router();

router.post('/register', registerUser);
router.post('/login', )
router.post('/logout', )
router.get('/profile', )


export const userRouter = router;