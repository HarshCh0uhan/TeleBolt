import {validator} from "express-validator"

export const validateRegister = ({username, email, password}) => {
    if(!username || !email || !password) throw new Error("Fill All Entries");
    else if(username.length < 3 || username.length > 30) throw new Error("Username must be between 3-30 characters");
    else if(!validator.isEmail(email)) throw new Error("Invalid Email")
    else if(!validator.isStrongPassword(password)) throw new Error("Password is not Strong")
}

export const validateLogin = ({email, password}) => {
    if(!email || !password) throw new Error("Fill All Entries");
    else if(!validator.isEmail(email)) throw new Error("Invalid Email")
}