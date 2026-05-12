import {User} from "../models/user.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/jwt.js";
import {validateRegister, validateLogin} from "../utils/validations.js"


export const register = async(req, res) => {
    try {
        validateRegister(req.body)
        const {username, email, password} = req.body

        const existingUser = await User.findOne({
            $or: [{username}, {email}]
        });

        if(existingUser) throw new Error("User Already Exists");

        const userData = await User.create({
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

        res.status(200).json({
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
        res.status(401).json(err.message);
    }
}

export const login = async(req, res) => {
    try {
        validateLogin(req.body);
        const {email, password} = req.body;
        
        const userData = await User.findOne({email}).select('+password');
        if(!userData) throw new Error("Invalid Email or Password");

        const verifyPassword = await bcrypt.compare(
            password,
            userData.password
        );

        if(!verifyPassword)
            throw new Error("Invalid Email or Password");

        const token = generateToken(userData);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "None",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        
        res.status(200).json({
            message: "User Login Successfully",
            token,
            user: {
                id: userData._id,
                username: userData.username,
                email: userData.email
            }
        })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(401).json(err.message)
    }
}