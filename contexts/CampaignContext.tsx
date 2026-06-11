'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useGetCampaignQuery, useGetCampaignByCompanyIdQuery, useGetCampaignByCompanyIdForheaderQuery, Campaign } from '@/store/services/campaignApi';
import { useAuth } from './AuthContext';

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
    const { user } = useAuth();

    // Get all campaigns for the company
    const { data: campaignsData } = useGetCampaignByCompanyIdForheaderQuery(
        user?.companyId ? { companyId: user.companyId } : { companyId: '' },
        { skip: !user?.companyId }
    );

    // Get first campaign for the company if needed
    const { data: companyCampaign } = useGetCampaignByCompanyIdQuery(
        user?.companyId || '',
        { skip: !user?.companyId }
    );

    useEffect(() => {
        const saved = localStorage.getItem('selectedCampaignId');
        if (saved) {
            setSelectedCampaignIdState(saved);
        } else if (companyCampaign) {
            const campaignId = companyCampaign._id || companyCampaign.id;
            if (campaignId) {
                setSelectedCampaignIdState(campaignId);
            }
        } else if (campaignsData?.campaigns && campaignsData.campaigns.length > 0) {
            const firstCampaign = campaignsData.campaigns[0];
            const campaignId = firstCampaign._id || firstCampaign.id;
            if (campaignId) {
                setSelectedCampaignIdState(campaignId);
            }
        }
    }, [companyCampaign, campaignsData]);

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
