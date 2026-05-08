import jwt from "jsonwebtoken"

export const generateToken = ({_id, role}) => {
    return jwt.sign(
            { id: _id, role },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        )
}

export const verifyToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET)
}