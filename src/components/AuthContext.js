import React, {createContext, useEffect, useState} from 'react';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        const token = localStorage.getItem('token');
        return !!token;
    });
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
    }, []);

    const login = (login, password) => {
        setIsAuthenticated(true);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
    };
    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
