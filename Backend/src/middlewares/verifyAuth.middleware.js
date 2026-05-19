import {verifyToken} from "../utils/jwt.js"
import {User} from "../models/user.js"

export const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) throw new Error("Please Login/Register");

        const decode = verifyToken(token);
        if(!decode) throw new Error("Please Login/Register");
        
        const user = await User.findOne({_id: decode._id});
        if(!user) throw new Error("User does not exist");

        req.user = user;
        next();

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(401).json(err.message)
    }
}

export const isAdmin = (req, res, next) => {
    try {
        const {role} = req.user;
        if(role !== 'admin') throw new Error("Not Authorized");
        next();
    } catch (err) {
        console.log("Error: ", err.message);
        res.status(403).json(err.message)
    }
}