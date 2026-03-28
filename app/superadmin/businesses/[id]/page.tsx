'use client';

import { tabs } from '@/components/Options';
import BusinessDetailSkeleton from '@/components/skeletons/BusinessDetailSkeleton';
import BackButton from '@/components/ui/BackButton';
import Button from '@/components/ui/Button';
import DeactivateBusinessModal from '@/components/ui/DeactivateBusinessModal';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useSuperAdminGetActivityLogsByCompanyIdQuery, useSuperAdminGetCompanyDetailsQuery, useSuperAdminGetTeamMembersByCompanyIdQuery } from '@/store/services/companyApi';
import React, { use as usePromise, useMemo, useState } from 'react';
import { ActivityLogItem } from './ActivityLogTabContent';
import ActivityLogTabContent from './ActivityLogTabContent';
import BillingTabContent from './BillingTabContent';
import OverviewTabContent from './OverviewTabContent';
import UsersTabContent, { User } from './UsersTabContent';
import Tabs from '@/components/ui/Tabs';

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
	const { lineOfBusinessData } = useLineOfBusiness();
	const [activeTab, setActiveTab] = useState('overview');
	const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);

	const { data: companyDetailsData, isLoading: isLoadingCompanyDetails } = useSuperAdminGetCompanyDetailsQuery(id);

	const businessData = useMemo(() => {
		if (!companyDetailsData?.businessData) return null;
		return companyDetailsData.businessData;
	}, [companyDetailsData]);

	const { data: teamMembersData, isLoading: isLoadingTeamMembers } = useSuperAdminGetTeamMembersByCompanyIdQuery(id);
	const { data: activityLogsData, isLoading: isLoadingActivityLogs } = useSuperAdminGetActivityLogsByCompanyIdQuery({ companyId: id, page: 1, limit: 100 });

	const users = useMemo(() => {
		if (!teamMembersData) return [];
		const data = teamMembersData as TeamMembersData | TeamMemberResponse[];
		const members = Array.isArray(data) ? data : (data.teamMembers || data.data || []);

		return members?.map((member: TeamMemberResponse) => ({
			_id: member?._id || member.id || '',
			name: member?.name || (member.firstName && member.lastName ? `${member.firstName} ${member.lastName}` : 'Unknown User'),
			email: member?.email || 'No Email',
			phone: member?.phone || '-',
			role: member?.role || { roleName: 'User', _id: 'temp' },
			status: member?.status || 'Unknown',
			createdAt: member?.createdAt || new Date().toISOString(),
			isActive: member?.isActive || false
		}));
	}, [teamMembersData]);

	const mappedActivityLogs = useMemo(() => {
		if (!activityLogsData) return [];
		const data = activityLogsData as ActivityLogsData | ActivityLogResponse[];
		const logs = Array.isArray(data) ? data : (data.activityLogs || data.data || []);

		return logs?.map((log: ActivityLogResponse) => ({
			_id: log._id || log.id || '',
			timestamp: log.createdAt || log.timestamp || new Date().toISOString(),
			user: log.user as ActivityLogItem['user'],
			role: log.role || '',
			action: log.action || '',
			details: log.details || log.description || '-'
		}));
	}, [activityLogsData]);

	const billingHistory = [
		{ id: '1', date: '13-11-2023', amount: 'N500,000', status: 'Paid' },
		{ id: '2', date: '13-12-2023', amount: 'N500,000', status: 'Paid' },
		{ id: '3', date: '11-02-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '4', date: '11-03-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '5', date: '11-04-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '6', date: '11-05-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '7', date: '11-06-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '8', date: '11-07-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '9', date: '11-08-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '10', date: '11-09-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '11', date: '11-10-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '12', date: '11-11-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '13', date: '11-12-2024', amount: 'N500,000', status: 'Paid' },
		{ id: '14', date: '11-01-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '15', date: '11-02-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '16', date: '11-03-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '17', date: '11-04-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '18', date: '11-05-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '19', date: '11-06-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '20', date: '11-07-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '21', date: '11-08-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '22', date: '11-09-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '23', date: '11-10-2025', amount: 'N500,000', status: 'Paid' },
		{ id: '24', date: '01-03-2025', amount: 'N500,000', status: 'Paid' },
	];

	const handleDeactivate = () => {
		setIsDeactivateModalOpen(true);
	};

	const handleConfirmDeactivate = (reason: string) => {
		// TODO: Implement deactivate business logic with reason
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
					activeColor={lineOfBusinessData?.primaryColor || '#2563EB'}
					className="border-b-0"
				/>
				<Button
					variant="danger"
					size="md"
					onClick={handleDeactivate}
					className="mb-4"
				>
					Deactivate Business
				</Button>
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
			{activeTab === 'billing' && (
				<BillingTabContent
					billingHistory={billingHistory} />
			)}

			{/* Activity Log Tab Content */}
			{activeTab === 'activity-log' && (
				<ActivityLogTabContent
					isLoading={isLoadingActivityLogs}
					activityLog={mappedActivityLogs}
				/>
			)}

			{/* Deactivate Business Modal */}
			<DeactivateBusinessModal
				isOpen={isDeactivateModalOpen}
				onClose={() => setIsDeactivateModalOpen(false)}
				onConfirm={handleConfirmDeactivate}
				businessName={businessData.businessName}
			/>
		</div>
	);
}
