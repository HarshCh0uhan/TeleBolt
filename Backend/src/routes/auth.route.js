import express from "express"
import {register, login, registerAdmin, logout, getUser} from "../controllers/auth.controller.js"
import { isAdmin, userAuth } from "../middlewares/verifyAuth.middleware.js";

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/register-admin', registerAdmin);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', userAuth, getUser)