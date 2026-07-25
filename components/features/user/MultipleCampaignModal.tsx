'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Checkbox from '@/components/ui/Checkbox';
import Icon from '@/components/ui/Icon';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useGetTeamMembersByCompanyIdQuery, useCreateTeamMemberMutation, ApiTeamMember } from '@/store/services/teamMembersApi';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import { useGetRolesByCompanyIdQuery } from '@/store/services/roleApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { toast } from 'sonner';

interface MultipleCampaignModalProps {
	isOpen: boolean;
	onClose: () => void;
	refetchUsers?: () => void;
}

export const MultipleCampaignModal: React.FC<MultipleCampaignModalProps> = ({
	isOpen,
	onClose,
	refetchUsers,
}) => {
	const { user } = useUserInfo();
	const companyId = user?.companyId || user?.company?._id || '';

	const [selectedUserEmail, setSelectedUserEmail] = useState('');
	const [selectedRoleId, setSelectedRoleId] = useState('');
	const [selectedCampaignIds, setSelectedCampaignIds] = useState<Set<string>>(new Set());
	const [isSubmitting, setIsSubmitting] = useState(false);

	// API Hooks
	const { data: companyTeamMembersData } = useGetTeamMembersByCompanyIdQuery(companyId, { skip: !companyId || !isOpen });
	const { data: campaignsResponse } = useGetCampaignByCompanyIdForheaderQuery({ companyId, limit: 1000 }, { skip: !companyId || !isOpen });
	const { data: rolesResponse } = useGetRolesByCompanyIdQuery(companyId, { skip: !companyId || !isOpen });
	const [createTeamMember] = useCreateTeamMemberMutation();

	// Reset form when modal opens/closes
	useEffect(() => {
		if (!isOpen) {
			setSelectedUserEmail('');
			setSelectedRoleId('');
			setSelectedCampaignIds(new Set());
			setIsSubmitting(false);
		}
	}, [isOpen]);

	// Filter unique users by email to avoid duplicates in the dropdown
	const uniqueUsers = useMemo(() => {
		const list = companyTeamMembersData?.teamMembers || [];
		const seen = new Set<string>();
		const result: ApiTeamMember[] = [];
		for (const m of list) {
			if (m.email && !seen.has(m.email.toLowerCase())) {
				seen.add(m.email.toLowerCase());
				result.push(m);
			}
		}
		return result;
	}, [companyTeamMembersData]);

	// Options for user select dropdown
	const userOptions = useMemo(() => {
		return uniqueUsers.map(u => ({
			value: u.email || '',
			label: `${u.firstName || ''} ${u.lastName || u.name || ''} (${u.email})`
		}));
	}, [uniqueUsers]);

	// Find the currently selected user object
	const selectedUser = useMemo(() => {
		return uniqueUsers.find(u => u.email === selectedUserEmail);
	}, [selectedUserEmail, uniqueUsers]);

	// Retrieve roles list options
	const roleOptions = useMemo(() => {
		const roles = rolesResponse?.roles || [];
		return roles.map(r => ({
			value: r._id as string,
			label: r.roleName as string,
		}));
	}, [rolesResponse]);

	// Track which campaigns the selected user is already assigned to
	const existingCampaignIds = useMemo(() => {
		if (!selectedUserEmail || !companyTeamMembersData?.teamMembers) return new Set<string>();
		const list = companyTeamMembersData.teamMembers;
		const campaignIds = new Set<string>();
		for (const m of list) {
			if (m.email?.toLowerCase() === selectedUserEmail.toLowerCase() && m.campaignId) {
				const cId = typeof m.campaignId === 'object' ? m.campaignId._id || m.campaignId.id : m.campaignId;
				if (cId) campaignIds.add(cId.toString());
			}
		}
		return campaignIds;
	}, [selectedUserEmail, companyTeamMembersData]);

	// Campaign options with assignment status
	const campaignsList = useMemo(() => {
		const list = campaignsResponse?.campaigns || [];
		return list.map(c => {
			const cId = (c._id || c.id) as string;
			return {
				id: cId,
				name: c.campaignName || 'Untitled Campaign',
				alreadyAssigned: existingCampaignIds.has(cId)
			};
		});
	}, [campaignsResponse, existingCampaignIds]);

	// Toggle target campaign selection
	const toggleCampaign = (id: string) => {
		setSelectedCampaignIds(prev => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSave = async () => {
		if (!selectedUser || !selectedRoleId || selectedCampaignIds.size === 0) {
			toast.error('Please fill in all fields and select at least one campaign');
			return;
		}

		setIsSubmitting(true);
		let successCount = 0;
		let failedCount = 0;

		try {
			const campaignIdsToAssign = Array.from(selectedCampaignIds);

			// Submit create mutations in parallel
			await Promise.all(
				campaignIdsToAssign.map(async (cId) => {
					try {
						const payload = {
							name: selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`,
							email: selectedUser.email || '',
							phone: selectedUser.phone || '',
							role: selectedRoleId,
							companyId: companyId,
							campaignId: cId,
							password: '123456', // default password as required by API
							userId: selectedUser.userId,
							status: 'inactive'
						};
						await createTeamMember(payload).unwrap();
						successCount++;
					} catch (err) {
						console.error(`Failed to assign user to campaign ${cId}:`, err);
						failedCount++;
					}
				})
			);

			if (successCount > 0) {
				toast.success(`Successfully assigned user to ${successCount} campaigns`);
				if (refetchUsers) refetchUsers();
				onClose();
			} else {
				toast.error('Failed to assign user to campaigns');
			}
		} catch (error) {
			console.error('Campaign assignment error:', error);
			toast.error('Failed to process assignments');
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
			<div
				className="dark:bg-gray-800 w-full max-w-lg overflow-hidden rounded-[var(--radius)] bg-white flex flex-col max-h-[90vh] shadow-2xl border dark:border-gray-800"
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div>
						<h2
							className="text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Assign User to Multiple Campaigns
						</h2>
						<p className="text-[10px] md:text-[11px] text-gray-500 mt-1">
							Assign an existing user to other campaigns under the company.
						</p>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
						aria-label="Close"
					>
						<Cross2Icon className="w-5 h-5" />
					</Button>
				</div>

				{/* Modal Body */}
				<div className="p-6 space-y-6 overflow-y-auto flex-1">
					<Dropdown
						label="Select User"
						placeholder="Choose a user to assign"
						options={userOptions}
						value={selectedUserEmail}
						onChange={(val) => setSelectedUserEmail(val as string)}
					/>

					<Dropdown
						label="Target Role"
						placeholder="Select role for target campaigns"
						options={roleOptions}
						value={selectedRoleId}
						onChange={(val) => setSelectedRoleId(val as string)}
					/>

					{/* Campaign Checklist */}
					<div className="space-y-2">
						<label className="text-[10px] md:text-[12px] font-semibold uppercase tracking-wider text-gray-400">
							Select Campaigns ({selectedCampaignIds.size} selected)
						</label>
						{!selectedUserEmail ? (
							<div className="p-8 border border-dashed rounded-xl dark:border-gray-700 text-center text-xs text-gray-500">
								Please select a user first to check campaign eligibility.
							</div>
						) : campaignsList.length === 0 ? (
							<div className="p-8 border border-dashed rounded-xl dark:border-gray-700 text-center text-xs text-gray-500">
								No campaigns available.
							</div>
						) : (
							<div className="border rounded-xl dark:border-gray-700 max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
								{campaignsList.map(camp => (
									<div
										key={camp.id}
										onClick={() => !camp.alreadyAssigned && toggleCampaign(camp.id)}
										className={`flex items-center justify-between p-3.5 text-xs transition-colors select-none ${
											camp.alreadyAssigned 
												? 'opacity-60 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed' 
												: 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50 cursor-pointer'
										}`}
									>
										<div className="flex items-center gap-3">
											<Checkbox
												checked={camp.alreadyAssigned || selectedCampaignIds.has(camp.id)}
												onChange={() => {}}
												disabled={camp.alreadyAssigned}
												size="small"
												className="pointer-events-none"
											/>
											<span className="font-medium dark:text-gray-100">{camp.name}</span>
										</div>
										{camp.alreadyAssigned && (
											<span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 font-semibold border dark:border-green-950">
												Already Assigned
											</span>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-between items-center p-6 border-t dark:border-gray-700 w-full"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex gap-3 w-full justify-end">
						<Button
							variant="outline"
							size="md"
							onClick={onClose}
							disabled={isSubmitting}
						>
							Cancel
						</Button>
						<Button
							variant="primary"
							size="md"
							onClick={handleSave}
							disabled={!selectedUserEmail || !selectedRoleId || selectedCampaignIds.size === 0 || isSubmitting}
							loading={isSubmitting}
						>
							Assign
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MultipleCampaignModal;
