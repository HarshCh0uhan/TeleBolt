import express from "express"
import {register, login, registerAdmin} from "../controllers/auth.controller.js"

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/register-admin', registerAdmin);
authRouter.post('/login', login);