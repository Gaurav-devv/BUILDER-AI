import { Router } from "express";
import { login, logout, me, register } from "../controllers/authController.js";
import { authMiddleware, optionalAuthMiddleware } from "../middleware/authMiddleware.js";

const authRouter = Router();

authRouter.post('/register', register)
authRouter.post('/login', login)
authRouter.post('/logout', logout)
authRouter.get('/me', optionalAuthMiddleware, me)

export default authRouter;