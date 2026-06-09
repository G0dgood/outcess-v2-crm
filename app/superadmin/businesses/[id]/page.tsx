'use client';

import BusinessDetailSkeleton from '@/components/skeletons/BusinessDetailSkeleton';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import DeactivateBusinessModal from '@/components/ui/DeactivateBusinessModal';
import ActivateBusinessModal from '@/components/ui/ActivateBusinessModal';
import { useCampaign } from '@/contexts/CampaignContext';
import { useSuperAdminGetCompanyDetailsQuery, useSuperAdminGetTeamMembersByCompanyIdQuery, useDeactivateCompanyMutation, useActivateCompanyMutation } from '@/store/services/companyApi';
import React, { use as usePromise, useMemo, useState } from 'react';
import { toast } from 'sonner';
import OverviewTabContent from './OverviewTabContent';
import UsersTabContent, { User } from './UsersTabContent';
import Tabs from '@/components/ui/Tabs';
import { tabs } from '@/components/Options';

interface TeamMemberResponse {
	_id: string;
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	role?: User['role'];
	status?: string;
	createdAt?: string;
	isActive?: boolean;
	[key: string]: unknown;
}

interface TeamMembersData {
	teamMembers?: TeamMemberResponse[];
	data?: TeamMemberResponse[];
}

interface ActivityLogResponse {
	_id: string;
	id?: string;
	createdAt?: string;
	timestamp?: string;
	user?: unknown;
	role?: string;
	action?: string;
	details?: string;
	description?: string;
	[key: string]: unknown;
}

interface ActivityLogsData {
	activityLogs?: ActivityLogResponse[];
	data?: ActivityLogResponse[];
}

export default function BusinessDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = usePromise(params);
	const { campaignData } = useCampaign();
	const [activeTab, setActiveTab] = useState('overview');
	const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
	const [isActivateModalOpen, setIsActivateModalOpen] = useState(false);

	const { data: companyDetailsData, isLoading: isLoadingCompanyDetails } = useSuperAdminGetCompanyDetailsQuery(id);

	const businessData = useMemo(() => {
		if (!companyDetailsData?.businessData) return null;
		return companyDetailsData.businessData;
	}, [companyDetailsData]);

	const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useSuperAdminGetTeamMembersByCompanyIdQuery(id);
	const [deactivateCompany, { isLoading: isDeactivating }] = useDeactivateCompanyMutation();
	const [activateCompany, { isLoading: isActivating }] = useActivateCompanyMutation();

	const users = useMemo(() => {
		if (!teamMembersData) return [];
		const data = teamMembersData as TeamMembersData | TeamMemberResponse[];
		const members = Array.isArray(data) ? data : (data.teamMembers || data.data || []);

		return members?.map((member: TeamMemberResponse) => ({
			_id: member?._id || member.id || '',
			name: member?.name || (member.firstName && member.lastName ? `${member?.firstName} ${member?.lastName}` : 'Unknown User'),
			email: member?.email || 'No Email',
			phone: member?.phone || '-',
			role: member?.role || { roleName: 'User', _id: 'temp' },
			status: member?.status || 'Unknown',
			createdAt: member?.createdAt || new Date().toISOString(),
			isActive: member?.isActive || false
		}));
	}, [teamMembersData]);

	const handleDeactivate = () => {
		setIsDeactivateModalOpen(true);
	};

	const handleActivate = () => {
		setIsActivateModalOpen(true);
	};

	const handleConfirmActivate = async () => {
		try {
			await activateCompany(id).unwrap();
			toast.success('Business activated successfully');
			setIsActivateModalOpen(false);
		} catch (error: unknown) {
			console.error('Activation error:', error);
			const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || (error as { data?: { error?: string; message?: string } })?.data?.message || 'Failed to activate business';
			toast.error(errorMessage);
		}
	};

	const handleConfirmDeactivate = async (reason: string) => {
		try {
			await deactivateCompany({ companyId: id, reason }).unwrap();
			toast.success('Business deactivated successfully');
			setIsDeactivateModalOpen(false);
		} catch (error: unknown) {
			console.error('Deactivation error:', error);
			const errorMessage = (error as { data?: { error?: string; message?: string } })?.data?.error || (error as { data?: { error?: string; message?: string } })?.data?.message || 'Failed to deactivate business';
			toast.error(errorMessage);
		}
	};

	if (isLoadingCompanyDetails) {
		return <BusinessDetailSkeleton />;
	}

	if (!businessData) {
		return (
			<div className="flex h-[50vh] items-center justify-center text-[12px] md:text-[14px]" style={{ color: 'var(--text-primary)' }}>
				Business not found
			</div>
		);
	}

	return (
		<div>
			{/* Header Section */}
			<div className="mb-6">
				<div className="mb-4">
					<BackButton />
				</div>
				<h1
					className="text-[18px] md:text-[20px] font-semibold dark:text-gray-100 mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Business Details
				</h1>
			</div>

			{/* Tabs and Deactivate Button */}
			<div
				className="flex items-center justify-between mb-6 border-b dark:border-gray-700"
				style={{ borderColor: 'var(--light-gray)' }}
			>
				<Tabs
					tabs={tabs}
					activeTab={activeTab}
					onTabChange={(id) => setActiveTab(id)}
					activeColor={campaignData?.primaryColor || '#2563EB'}
					className="border-b-0"
				/>
				{businessData.status === 'Deactivated' ? (
					<Button
						variant="primary"
						size="md"
						onClick={handleActivate}
						className="mb-4"
						loading={isActivating}
					>
						Activate Business
					</Button>
				) : (
					<Button
						variant="danger"
						size="md"
						onClick={handleDeactivate}
						className="mb-4"
						loading={isDeactivating}
					>
						Deactivate Business
					</Button>
				)}
			</div>

			{/* Overview Content */}
			{activeTab === 'overview' && (
				<OverviewTabContent businessData={businessData} />
			)}

			{/* Users Tab Content */}
			{activeTab === 'users' && (
				<UsersTabContent
					isLoading={isLoadingTeamMembers}
					users={users}
				/>
			)}

			{/* Billing Tab Content */}
			{/* {activeTab === 'billing' && (
				<BillingTabContent
					billingHistory={billingHistory} />
			)} */}

			{/* Activity Log Tab Content */}
			{/* {activeTab === 'activity-log' && (
				<ActivityLogTabContent
					isLoading={isLoadingActivityLogs}
					activityLog={mappedActivityLogs}
				/>
			)} */}

			{/* Deactivate Business Modal */}
			<DeactivateBusinessModal
				isOpen={isDeactivateModalOpen}
				onClose={() => setIsDeactivateModalOpen(false)}
				onConfirm={handleConfirmDeactivate}
				businessName={businessData.businessName}
				isLoading={isDeactivating}
			/>

			{/* Activate Business Modal */}
			<ActivateBusinessModal
				isOpen={isActivateModalOpen}
				onClose={() => setIsActivateModalOpen(false)}
				onConfirm={handleConfirmActivate}
				businessName={businessData.businessName}
				isLoading={isActivating}
			/>
		</div>
	);
}
