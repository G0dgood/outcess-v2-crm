'use client';

import React, { createContext, useContext, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectUser, selectIsAuthenticated, User, updateUser as updateAuthUser } from '@/store/slices/authSlice';

interface UserInfoContextType {
    user: User | null;
    isAuthenticated: boolean;
    updateUser: (userData: User) => void;
}

export const UserInfoContext = createContext<UserInfoContextType | undefined>(undefined);

export const useUserInfo = () => {
    const context = useContext(UserInfoContext);
    if (!context) {
        throw new Error('useUserInfo must be used within a UserInfoProvider');
    }
    return context;
};

export const UserInfoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const dispatch = useDispatch();
    const user = useSelector(selectUser);
    const isAuthenticated = useSelector(selectIsAuthenticated);

    const updateUser = useCallback((userData: User) => {
        dispatch(updateAuthUser(userData));
    }, [dispatch]);

    const value = React.useMemo(() => ({
        user,
        isAuthenticated,
        updateUser
    }), [user, isAuthenticated, updateUser]);

    return (
        <UserInfoContext.Provider value={value}>
            {children}
        </UserInfoContext.Provider>
    );
};
