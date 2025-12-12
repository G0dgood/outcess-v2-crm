'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useGetLineOfBusinessQuery } from '@/store/services/lineOfBusinessApi';

interface LineOfBusinessContextType {
    selectedLineOfBusinessId: string | null;
    setSelectedLineOfBusinessId: (id: string | null) => void;
    isLoading: boolean;
    lineOfBusinessData: any;
}

const LineOfBusinessContext = createContext<LineOfBusinessContextType | undefined>(undefined);

interface LineOfBusinessProviderProps {
    children: ReactNode;
    initialLineOfBusinessId?: string;
}

export const LineOfBusinessProvider: React.FC<LineOfBusinessProviderProps> = ({ children, initialLineOfBusinessId }) => {
    const [selectedLineOfBusinessId, setSelectedLineOfBusinessIdState] = useState<string | null>(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('selectedLineOfBusinessId');
            if (saved) return saved;
        }
        return initialLineOfBusinessId || null;
    });

    const setSelectedLineOfBusinessId = (id: string | null) => {
        setSelectedLineOfBusinessIdState(id);
        if (typeof window !== 'undefined') {
            if (id) {
                localStorage.setItem('selectedLineOfBusinessId', id);
            } else {
                localStorage.removeItem('selectedLineOfBusinessId');
            }
        }
    };

    const { data: lineOfBusinessData, isLoading, isFetching } = useGetLineOfBusinessQuery(
        selectedLineOfBusinessId || '',
        { skip: !selectedLineOfBusinessId }
    );

    return (
        <LineOfBusinessContext.Provider value={{
            selectedLineOfBusinessId,
            setSelectedLineOfBusinessId,
            isLoading: isLoading || isFetching,
            lineOfBusinessData
        }}>
            {children}
        </LineOfBusinessContext.Provider>
    );
};

export const useLineOfBusiness = () => {
    const context = useContext(LineOfBusinessContext);
    if (context === undefined) {
        throw new Error('useLineOfBusiness must be used within a LineOfBusinessProvider');
    }
    return context;
};
