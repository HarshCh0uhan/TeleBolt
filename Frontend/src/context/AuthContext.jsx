import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import {login, register, logout} from "../api/auth.api"



const AuthContext = createContext();

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get("/auth/me")
        .then((res) => setUser(res.data.user))
        .catch(() => setUser(null))
        .finally(() => setLoading(false));
    }, []);

    const loginUser = async (email, password) => {
        const res = await login({ email, password });
        setUser(res.data.user);
        return res.data.user;
    };

    const registerUser = async (data) => {
        const res = await register(data);
        setUser(res.data.user);
        return res.data.user;
    };

    const logoutUser = async () => {
        await logout();
        setUser(null);
    };

    return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, logoutUser }}>
        {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);