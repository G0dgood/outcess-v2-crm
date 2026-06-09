'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCampaignQuery, Campaign } from '@/store/services/campaignApi';

interface CampaignContextType {
    selectedCampaignId: string | null;
    setSelectedCampaignId: (id: string | null) => void;
    isLoading: boolean;
    campaignData: Campaign | undefined;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
    children: ReactNode;
    initialCampaignId?: string;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children, initialCampaignId }) => {
    const [selectedCampaignId, setSelectedCampaignIdState] = useState<string | null>(initialCampaignId || null);

    useEffect(() => {
        const saved = localStorage.getItem('selectedCampaignId');
        if (saved) {
            setSelectedCampaignIdState(saved);
        }
    }, []);

    const setSelectedCampaignId = (id: string | null) => {
        setSelectedCampaignIdState(id);
        if (typeof window !== 'undefined') {
            if (id) {
                localStorage.setItem('selectedCampaignId', id);
            } else {
                localStorage.removeItem('selectedCampaignId');
            }
        }
    };

    const { data: campaignData, isLoading, isFetching } = useGetCampaignQuery(
        selectedCampaignId || '',
        { skip: !selectedCampaignId || selectedCampaignId === 'new' }
    );

    return (
        <CampaignContext.Provider value={{
            selectedCampaignId,
            setSelectedCampaignId,
            isLoading: isLoading || isFetching,
            campaignData
        }}>
            {children}
        </CampaignContext.Provider>
    );
};

export const useCampaign = () => {
    const context = useContext(CampaignContext);
    if (context === undefined) {
        throw new Error('useCampaign must be used within a CampaignProvider');
    }
    return context;
};
