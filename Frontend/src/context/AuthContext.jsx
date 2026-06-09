import { createContext, useContext, useEffect, useState } from "react";
import api from "../api/axios";
import {login, register, logout, registerAdmin} from "../api/auth.api"



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

    const registerUser = async (username, email, password) => {
        const res = await register({username, email, password});
        setUser(res.data.user);
        return res.data.user;
    };

    const registerAdminUser = async (username, email, password, adminSecretKey) => {
        const res = await registerAdmin({username, email, password, adminSecretKey});
        setUser(res.data.user);
        return res.data.user;
    };

    const logoutUser = async () => {
        await logout();
        setUser(null);
    };

    return (
    <AuthContext.Provider value={{ user, loading, loginUser, registerUser, registerAdminUser, logoutUser }}>
        {children}
    </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);