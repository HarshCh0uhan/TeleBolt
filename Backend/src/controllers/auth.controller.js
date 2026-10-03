import {User} from "../models/user.js"
import bcrypt from "bcryptjs"
import { generateToken } from "../utils/jwt.js";
import {validateRegister, validateLogin, validateProfileUpdate} from "../utils/validations.js"


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
        console.log("Token Generated")

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",    
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",  
            maxAge: 7 * 24 * 60 * 60 * 1000,
        }).status(201).json({
            success: true,
            message: "User registered successfully"
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message);
    }
}

export const registerAdmin = async (req, res) => {
    try {
        validateRegister(req.body);

        const {username, email, password, adminSecretKey} = req.body;

        if(!adminSecretKey || adminSecretKey !== process.env.ADMIN_SECRET_KEY) throw new Error("Invalid Secret Key!!!")

        const existingAdmin = await User.findOne({
            $or: [{email}, {username}]
        })

        if(existingAdmin) throw new Error("Admin Already Exist!!!")
        
        const admin = await User.create({
            username,
            email,
            password, 
            role: "admin"
        })

        const token = generateToken(admin)
        console.log("Token Generated")

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).status(201).json({
            success: true,
            message: "Register Successful"
        })
    } catch (err) {
        console.error("Error: ",err.message);
        res.status(400).json(err.message)
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
            sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000
        }).status(200).json({
            success: true,
            message: "User Login Successfully"
        })
    } catch (err) {
        console.error("Error: ", err.message)
        res.status(401).json(err.message)
    }
}

export const logout = async (req, res) => {
    res.clearCookie('token', {
        path: "/"
    }).status(200).json({
        success: true,
        message: "Logout Successful"
    })
}

export const getUser = (req, res) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}

export const updateProfile = async (req, res) => {
    try {
        validateProfileUpdate(req.body);
        const {username, email, currentPassword, newPassword} = req.body;

        const userData = await User.findById(req.user._id).select('+password');
        if(!userData) throw new Error("User does not exist");

        // Reject a username/email that another account already uses.
        if (username || email) {
            const clash = await User.findOne({
                _id: { $ne: userData._id },
                $or: [
                    ...(username ? [{username}] : []),
                    ...(email ? [{email}] : []),
                ],
            });
            if (clash) throw new Error("Username or Email is already taken");
        }

        if (newPassword) {
            const matches = await bcrypt.compare(currentPassword, userData.password);
            if (!matches) throw new Error("Current password is incorrect");
            userData.password = newPassword;
        }

        if (username !== undefined) userData.username = username;
        if (email !== undefined) userData.email = email;

        await userData.save();

        res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user: {
                _id: userData._id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                createdAt: userData.createdAt,
                updatedAt: userData.updatedAt,
            }
        })
    } catch (err) {
        console.error("Error: ", err.message);
        res.status(400).json(err.message)
    }
}