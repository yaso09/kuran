import React, { createContext, useContext, useEffect, useState } from 'react';

type AuthContextType = {
    signIn: () => void;
    signOut: () => void;
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType>({
    signIn: () => { },
    signOut: () => { },
    isAuthenticated: false,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const signIn = () => setIsAuthenticated(true);
    const signOut = () => setIsAuthenticated(false);

    return (
        <AuthContext.Provider
            value={{
                signIn,
                signOut,
                isAuthenticated,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}
