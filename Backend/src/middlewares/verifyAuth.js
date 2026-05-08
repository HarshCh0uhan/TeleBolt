import {verifyToken} from "../utils/jwt.js"
import {User} from "../models/user.js"

const userAuth = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token) throw new Error("Please Login/Register");

        const decode = verifyToken(token);
        if(!decode) throw new Error("Please Login/Register");
        
        const user = await User.findOne(decode._id);
        if(!user) throw new Error("User does not exist");

        req.user = user;
        next();

    } catch (err) {
        console.error("Error: ", err.message);
        res.status(401).json(err.message)
    }
}

export default userAuth