'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { AddUserModal } from '@/components/features/user/AddUserModal';
import { CopyIcon, PlusIcon } from '@radix-ui/react-icons';
import { toast } from 'sonner';

const OrganizationSettings: React.FC = () => {
	const { user } = useUserInfo();
	const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

	const companyId = user?.companyId || user?.company?._id;
	const planType = 'Pro Plan'; // This would come from Phase 2 subscription logic

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		toast.success('Organization ID copied to clipboard');
	};

	return (
		<div className="space-y-8">
			{/* Organization Info */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				<div className="space-y-4">
					<h3 className="text-[12px] md:text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
						Workspace Information
					</h3>
					<div className="space-y-1">
						<p className="text-[10px] md:text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Organization ID</p>
						<div className="flex items-center gap-2">
							<code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-[10px] md:text-[12px] font-mono">
								{companyId}
							</code>
							<button
								onClick={() => {
									if (companyId) {
										copyToClipboard(companyId);
									}
								}}
								className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
								title="Copy ID"
							>
								<CopyIcon className="w-4 h-4" style={{ color: 'var(--text-tertiary)' }} />
							</button>
						</div>
					</div>
					<div className="space-y-1">
						<p className="text-[10px] md:text-[12px]" style={{ color: 'var(--text-tertiary)' }}>Plan Type</p>
						<div className="flex items-center gap-2">
							<span className="px-2 py-0.5 rounded-full text-[10px] bg-green-100 text-green-700 font-medium">
								{planType}
							</span>
							<button className="text-[10px] text-blue-600 hover:underline">Upgrade Plan</button>
						</div>
					</div>
				</div>

				<div className="space-y-4">
					<h3 className="text-[12px] md:text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
						Usage & Limits
					</h3>
					<div className="space-y-3">
						<div className="space-y-1">
							<div className="flex justify-between text-[10px]">
								<span style={{ color: 'var(--text-secondary)' }}>Team Members</span>
								<span style={{ color: 'var(--text-primary)' }}>8 / 20</span>
							</div>
							<div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
								<div className="h-full bg-blue-500" style={{ width: '40%' }} />
							</div>
						</div>
						<div className="space-y-1">
							<div className="flex justify-between text-[10px]">
								<span style={{ color: 'var(--text-secondary)' }}>API Calls (Monthly)</span>
								<span style={{ color: 'var(--text-primary)' }}>1.2k / 10k</span>
							</div>
							<div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
								<div className="h-full bg-green-500" style={{ width: '12%' }} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Member Management Quick Actions */}
			<div className="pt-6 border-t dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
				<div className="flex items-center justify-between mb-4">
					<div>
						<h3 className="text-[12px] md:text-[14px] font-semibold" style={{ color: 'var(--text-primary)' }}>
							Member Management
						</h3>
						<p className="text-[10px] md:text-[12px]" style={{ color: 'var(--text-tertiary)' }}>
							Invite new members to collaborate in this workspace.
						</p>
					</div>
					<Button
						variant="primary"
						size="sm"
						onClick={() => setIsInviteModalOpen(true)}
						className="flex items-center gap-2"
					>
						<PlusIcon className="w-4 h-4" />
						Invite Member
					</Button>
				</div>
			</div>

			<AddUserModal
				isOpen={isInviteModalOpen}
				onClose={() => setIsInviteModalOpen(false)}
			/>
		</div>
	);
};

export default OrganizationSettings;
