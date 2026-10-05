import express from "express"
import {register, login, registerAdmin, logout, getUser, updateProfile, getFavoritePlans, toggleFavoritePlan, removeFavoritePlan} from "../controllers/auth.controller.js"
import { userAuth } from "../middlewares/verifyAuth.middleware.js";

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/register-admin', registerAdmin);
authRouter.post('/login', login);
authRouter.post('/logout', logout);
authRouter.get('/me', userAuth, getUser)
authRouter.patch('/me', userAuth, updateProfile)
authRouter.get('/favorites', userAuth, getFavoritePlans)
authRouter.post('/favorites/:planId', userAuth, toggleFavoritePlan)
authRouter.delete('/favorites/:planId', userAuth, removeFavoritePlan)
