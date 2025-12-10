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
    const [selectedLineOfBusinessId, setSelectedLineOfBusinessId] = useState<string | null>(initialLineOfBusinessId || null);

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
