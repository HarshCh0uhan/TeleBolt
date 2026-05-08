import {User} from "../models/user"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/jwt";


export const register = async(req, res) => {
    try {
        validateSignUpData(req.body)
        const {username, email, password} = req.body

        const existingUser = await User.findOne({
            $or: [{username}, {email}]
        });

        if(existingUser) throw new Error("User Already Exists");

        const userData = User.create({
            username,
            email,
            password
        })

        const token = generateToken(userData)
        console.log("Token Generated: ", token)

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",    
            sameSite: "None",   
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: userData._id,
                username: userData.username,
                email: userData.email
            }
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message);
    }
}