"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { app } from "@lib/firebaseConfig";

type AuthState = {
    user: User | null;
    uid: string | null;
    loading: boolean;
};

const AuthContext = createContext<AuthState>({ user: null, uid: null, loading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({ user: null, uid: null, loading: true });

    useEffect(() => {
        const auth = getAuth(app);
        const unsub = onAuthStateChanged(auth, (user) => {
            setState({ user, uid: user?.uid ?? null, loading: false });
        });
        return () => unsub();
    }, []);

    return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    return useContext(AuthContext);
}
