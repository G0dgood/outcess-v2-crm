'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
    useGetCampaignQuery, 
    useGetCampaignByCompanyIdQuery, 
    useGetCampaignByCompanyIdForheaderQuery, 
    useGetCampaignsByUserIdQuery,
    useSwitchCampaignMutation,
    Campaign 
} from '@/store/services/campaignApi';
import { useAuth } from './AuthContext';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsAdmin, selectUserPrivileges } from '@/store/slices/privilegeSlice';
import { dispositionApi } from '@/store/services/dispositionApi';
import { campaignApi } from '@/store/services/campaignApi';
import { setupBookApi } from '@/store/services/setupBookApi';
import { teamMembersApi } from '@/store/services/teamMembersApi';
import { roleApi } from '@/store/services/roleApi';
import { statusApi } from '@/store/services/statusApi';
import { supportApi } from '@/store/services/supportApi';
import { login as loginAction } from '@/store/slices/authSlice';
import { setPrivileges as setReduxPrivileges } from '@/store/slices/privilegeSlice';

interface CampaignContextType {
    selectedCampaignId: string | null;
    setSelectedCampaignId: (id: string | null) => void;
    isLoading: boolean;
    campaignData: Campaign | undefined;
    campaigns: Campaign[];
    selectedBucketId: string | null;
    setSelectedBucketId: (id: string | null) => void;
}

const CampaignContext = createContext<CampaignContextType | undefined>(undefined);

interface CampaignProviderProps {
    children: ReactNode;
    initialCampaignId?: string;
}

export const CampaignProvider: React.FC<CampaignProviderProps> = ({ children, initialCampaignId }) => {
    const [selectedCampaignId, setSelectedCampaignIdState] = useState<string | null>(initialCampaignId || null);
    const { user, login: authContextLogin } = useAuth();
    const isAdmin = useSelector(selectIsAdmin);
    const userPrivileges = useSelector(selectUserPrivileges);
    const [switchCampaign] = useSwitchCampaignMutation();
    const [selectedBucketId, setSelectedBucketIdState] = useState<string | null>(null);

    // Save and load selected bucket ID from local storage
    useEffect(() => {
        if (selectedCampaignId) {
            const saved = localStorage.getItem(`selectedBucketId_${selectedCampaignId}`);
            setSelectedBucketIdState(saved);
        } else {
            setSelectedBucketIdState(null);
        }
    }, [selectedCampaignId]);

    const setSelectedBucketId = (id: string | null) => {
        setSelectedBucketIdState(id);
        if (typeof window !== 'undefined') {
            if (id) {
                localStorage.setItem(`selectedBucketId_${selectedCampaignId}`, id);
            } else {
                localStorage.removeItem(`selectedBucketId_${selectedCampaignId}`);
            }
        }
    };

    const dispatch = useDispatch();

    // Check if user has dashboard edit permission
    const hasDashboardEditPermission = () => {
        if (!userPrivileges?.role?.permissions) return false;
        const dashboardPermission = userPrivileges.role.permissions.find(
            (p) => p.moduleName.toLowerCase().replace(/\s+/g, '') === 'dashboard'
        );
        return dashboardPermission?.access && dashboardPermission.permissions.edit;
    };

    const userRoleName = typeof user?.role === 'object' ? user?.role?.roleName : user?.role;
    const isUserAdmin = isAdmin || userRoleName === 'Administrator' || userRoleName === 'admin';
    const hasEditDashboard = hasDashboardEditPermission();
    const hasAllBucketAccess = !!userPrivileges?.role?.allBucketAccess;
    const canSeeAllCampaigns = isUserAdmin || hasEditDashboard || hasAllBucketAccess;

    // Get all campaigns for the company (only for admins/users with permission to view all)
    const { data: adminCampaignsData } = useGetCampaignByCompanyIdForheaderQuery(
        user?.companyId && canSeeAllCampaigns ? { companyId: user.companyId } : { companyId: '' },
        { skip: !user?.companyId || !canSeeAllCampaigns }
    );

    // Get assigned campaigns for team members
    const { data: teamMemberCampaignsData } = useGetCampaignsByUserIdQuery(
        user?.email || user?.userId || user?.id || user?._id || '',
        { skip: !user || canSeeAllCampaigns }
    );

    // Combine campaignsData
    const campaignsList = canSeeAllCampaigns
        ? adminCampaignsData?.campaigns || []
        : teamMemberCampaignsData?.campaigns || [];

    // Get first campaign for the company if needed
    const { data: companyCampaign } = useGetCampaignByCompanyIdQuery(
        user?.companyId || '',
        { skip: !user?.companyId }
    );

    useEffect(() => {
        const userRoleName = typeof user?.role === 'object' ? user.role?.roleName : user?.role;
        const isUserAdmin = isAdmin || userRoleName === 'Administrator' || userRoleName === 'admin';
        const hasEditDashboard = hasDashboardEditPermission();
        const hasAllBucketAccess = !!userPrivileges?.role?.allBucketAccess;
        const canSeeAll = isUserAdmin || hasEditDashboard || hasAllBucketAccess;

        if (!canSeeAll && typeof user?.campaignId === 'string' && (!teamMemberCampaignsData || teamMemberCampaignsData.campaigns.length <= 1)) {
            setSelectedCampaignIdState(user.campaignId);
            return;
        }

        const saved = localStorage.getItem('selectedCampaignId');
        if (saved) {
            setSelectedCampaignIdState(saved);
        } else if (companyCampaign) {
            const campaignId = companyCampaign._id || companyCampaign.id;
            if (campaignId) {
                setSelectedCampaignIdState(campaignId);
            }
        } else if (campaignsList && campaignsList.length > 0) {
            const firstCampaign = campaignsList[0];
            const campaignId = firstCampaign._id || firstCampaign.id;
            if (campaignId) {
                setSelectedCampaignIdState(campaignId);
            }
        }
    }, [companyCampaign, adminCampaignsData, teamMemberCampaignsData, user, userPrivileges, isAdmin]);

    const setSelectedCampaignId = async (id: string | null) => {
        if (!id) return;

        const userRoleName = typeof user?.role === 'object' ? user?.role?.roleName : user?.role;
        const isUserAdmin = isAdmin || userRoleName === 'Administrator' || userRoleName === 'admin';
        const hasEditDashboard = hasDashboardEditPermission();
        const hasAllBucketAccess = !!userPrivileges?.role?.allBucketAccess;
        const canSeeAll = isUserAdmin || hasEditDashboard || hasAllBucketAccess;

        // If team member switches campaign, call backend switch campaign
        if (!canSeeAll && user && id !== selectedCampaignId) {
            try {
                const response = await switchCampaign({ campaignId: id }).unwrap();
                if (response && response.token && response.teamMember) {
                    const rawUser = response.teamMember;
                    const token = response.token;
                    const normalizedUser = {
                        ...rawUser,
                        _id: rawUser._id,
                        id: rawUser._id || rawUser.id || '',
                        email: rawUser.email || '',
                        name: rawUser.name || (rawUser.firstName && rawUser.lastName ? `${rawUser.firstName} ${rawUser.lastName}` : ''),
                        isTeamMember: true
                    };

                    // Update Auth Context and Redux Store
                    authContextLogin(normalizedUser, { accessToken: token });
                    dispatch(loginAction({
                        user: normalizedUser as unknown as import('@/store/slices/authSlice').User,
                        tokens: { accessToken: token }
                    }));

                    // Update Privilege Context
                    if (normalizedUser.role && typeof normalizedUser.role === 'object') {
                        const roleObj = normalizedUser.role as { _id?: string; id?: string; roleName: string; permissions: any[] };
                        const privileges = {
                            userId: normalizedUser.id,
                            roleId: roleObj._id || roleObj.id || roleObj.roleName,
                            role: {
                                ...roleObj,
                                roleName: roleObj.roleName,
                                permissions: roleObj.permissions
                            },
                        };
                        dispatch(setReduxPrivileges(privileges));
                        localStorage.setItem('userPrivileges', JSON.stringify(privileges));
                    }
                    
                    // Reload to fully reset all state and variables for the new campaign
                    window.location.reload();
                }
            } catch (err: any) {
                console.error("Failed to switch campaign:", err);
                const { toast } = await import('sonner');
                toast.error(err?.data?.message || "Failed to switch campaign");
                return;
            }
        }

        setSelectedCampaignIdState(id);
        if (typeof window !== 'undefined') {
            if (id) {
                localStorage.setItem('selectedCampaignId', id);
            } else {
                localStorage.removeItem('selectedCampaignId');
            }
            window.dispatchEvent(new CustomEvent('campaignChanged', { detail: { campaignId: id } }));
        }
        dispatch(dispositionApi.util.resetApiState());
        dispatch(campaignApi.util.resetApiState());
        dispatch(setupBookApi.util.resetApiState());
        dispatch(teamMembersApi.util.resetApiState());
        dispatch(roleApi.util.resetApiState());
        dispatch(statusApi.util.resetApiState());
        dispatch(supportApi.util.resetApiState());
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
            campaignData,
            campaigns: campaignsList,
            selectedBucketId,
            setSelectedBucketId
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
