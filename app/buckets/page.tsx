'use client';

import React from 'react';
import CallDisposition from '@/components/CallDisposition';
import PageHeader from '@/components/ui/PageHeader';
import { usePrivilege } from '@/contexts/PrivilegeContext';
import AccessRestricted from '@/components/ui/AccessRestricted';
import BucketsSkeleton from '@/components/skeletons/BucketsSkeleton';
import Button from '@/components/ui/Button';
import { ArchiveIcon, IdCardIcon } from '@radix-ui/react-icons';
import ManageMembersModal from '@/components/features/team-members/ManageMembersModal';
import { useCampaign } from '@/contexts/CampaignContext';
import { useState } from 'react';

const BucketsPage = () => {
	const { canAccess, isLoading } = usePrivilege();
	const { campaignData } = useCampaign();
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const hasAccess = canAccess('buckets', 'view');

	if (isLoading) {
		return (
			<div>
				<PageHeader
					title="Buckets"
					description="Organize and monitor call categories and team assignments."
					icon={ArchiveIcon}
				/>
				<BucketsSkeleton />
			</div>
		);
	}

	if (!hasAccess) {
		return (
			<AccessRestricted
				title="Access Restricted"
				message="You do not have permission to access the Buckets module."
			/>
		);
	}

	return (
		<div>
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<PageHeader
					title="Buckets"
					description="Organize and monitor call categories and team assignments."
					icon={ArchiveIcon}
					className="mb-0"
				/>
				<div className="flex items-center gap-3">
					<Button
						variant="outline"
						size="md"
						onClick={() => setIsManageModalOpen(true)}
						className="flex items-center gap-2"
					>
						<IdCardIcon className="w-4 h-4" />
						Manage Members
					</Button>
				</div>
			</div>
			<div className="dark:bg-gray-800 border dark:border-gray-700  rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}>
				<CallDisposition />
			</div>

			<ManageMembersModal
				isOpen={isManageModalOpen}
				onClose={() => setIsManageModalOpen(false)}
				campaignData={campaignData}
			/>
		</div>
	);
};

export default BucketsPage;
