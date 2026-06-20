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
import { useSetup } from '@/contexts/SetupContext';
import { useUpdateCampaignMutation } from '@/store/services/campaignApi';
import { toast } from 'sonner';

const BucketsPage = () => {
	const { canAccess, isLoading } = usePrivilege();
	const { campaignData } = useCampaign();
	const [isManageModalOpen, setIsManageModalOpen] = useState(false);
	const hasAccess = canAccess('buckets', 'view');

	const { setupData, isDirty, resetDirty, discardChanges } = useSetup();
	const [updateCampaign, { isLoading: isSaving }] = useUpdateCampaignMutation();

	const handleSave = async () => {
		const campaignId = campaignData?._id || campaignData?.id || setupData?.campaignId;
		if (!campaignId) {
			toast.error('Campaign ID is missing.');
			return;
		}

		toast.loading('Saving changes...', { id: 'save-buckets-progress' });

		try {
			await updateCampaign({
				id: campaignId,
				data: {
					dashboardSettings: setupData.dashboardSettings,
					customerBookSettings: setupData.customerBookSettings,
				},
			}).unwrap();

			toast.success('Buckets configuration saved successfully!', { id: 'save-buckets-progress' });
			resetDirty();
		} catch (err: unknown) {
			console.error('Failed to save buckets:', err);
			toast.error('Failed to save changes. Please try again.', { id: 'save-buckets-progress' });
		}
	};

	const handleDiscard = () => {
		discardChanges();
		toast.info('Changes discarded.');
	};

	if (isLoading) {
		return (
			<div>
				<PageHeader
					title="Buckets"
					description="Organize and monitor call categories and team assignments."
					icon={ArchiveIcon}
					className="mb-0"
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
					{isDirty && (
						<>
							<Button
								variant="outline"
								size="md"
								onClick={handleDiscard}
								disabled={isSaving}
							>
								Discard
							</Button>
							<Button
								variant="primary"
								size="md"
								onClick={handleSave}
								disabled={isSaving}
								loading={isSaving}
							>
								Save Changes
							</Button>
						</>
					)}
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
			<CallDisposition />

			<ManageMembersModal
				isOpen={isManageModalOpen}
				onClose={() => setIsManageModalOpen(false)}
				campaignData={campaignData}
			/>
		</div>
	);
};

export default BucketsPage;
