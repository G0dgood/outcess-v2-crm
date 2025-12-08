'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, setUser, User } from '@/store/slices/authSlice';

interface UserInfoContextType {
    user: User | null;
    updateUser: (userData: User) => void;
    isAuthenticated: boolean;
}

const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const UserInfoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isAuthenticated = !!user;

    // Hydrate user state from local storage on mount
    React.useEffect(() => {
        if (!user) {
            const storedUser = localStorage.getItem('peoplely-user');
            if (storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    dispatch(setUser(parsedUser));
                } catch (e) {
                    console.error('Failed to parse user from local storage', e);
                }
            }
        }
    }, [user, dispatch]);

    const updateUserHandler = React.useCallback((userData: User) => {
        dispatch(setUser(userData));
    }, [dispatch]);

    const value = React.useMemo(() => ({
        user,
        updateUser: updateUserHandler,
        isAuthenticated
    }), [user, updateUserHandler, isAuthenticated]);

    return (
        <UserInfoContext.Provider value={value}>
            {children}
        </UserInfoContext.Provider>
    );
};

export const useUserInfo = () => {
    const context = useContext(UserInfoContext);
    if (context === undefined) {
        throw new Error('useUserInfo must be used within a UserInfoProvider');
    }
    return context;
};
