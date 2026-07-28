'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Checkbox from '@/components/ui/Checkbox';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useGetTeamMembersByCompanyIdQuery, useCreateTeamMemberMutation, useDeleteTeamMemberMutation, ApiTeamMember } from '@/store/services/teamMembersApi';
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
	const [deleteTeamMember] = useDeleteTeamMemberMutation();

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

	const existingCampaignIdsSerialized = useMemo(() => {
		return Array.from(existingCampaignIds).sort().join(',');
	}, [existingCampaignIds]);

	// Map campaign ID to TeamMember ID for the selected user
	const campaignToMemberIdMap = useMemo(() => {
		if (!selectedUserEmail || !companyTeamMembersData?.teamMembers) return new Map<string, string>();
		const list = companyTeamMembersData.teamMembers;
		const map = new Map<string, string>();
		for (const m of list) {
			if (m.email?.toLowerCase() === selectedUserEmail.toLowerCase() && m.campaignId) {
				const cId = typeof m.campaignId === 'object' ? m.campaignId._id || m.campaignId.id : m.campaignId;
				const memberId = m._id || m.id;
				if (cId && memberId) {
					map.set(cId.toString(), memberId.toString());
				}
			}
		}
		return map;
	}, [selectedUserEmail, companyTeamMembersData]);

	// Initialize selected campaigns when selected user changes
	useEffect(() => {
		if (selectedUserEmail) {
			setSelectedCampaignIds(new Set(existingCampaignIds));
		} else {
			setSelectedCampaignIds(new Set());
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedUserEmail, existingCampaignIdsSerialized]);

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

	const campaignIdsToAssign = useMemo(() => {
		return Array.from(selectedCampaignIds).filter(id => !existingCampaignIds.has(id));
	}, [selectedCampaignIds, existingCampaignIds]);

	const handleSave = async () => {
		if (!selectedUser || selectedCampaignIds.size === 0) {
			toast.error('Please select a user and at least one campaign');
			return;
		}

		const campaignIdsToUnassign = Array.from(existingCampaignIds).filter(id => !selectedCampaignIds.has(id));

		if (campaignIdsToAssign.length > 0 && !selectedRoleId) {
			toast.error('Please select a target role for the new campaign(s)');
			return;
		}

		setIsSubmitting(true);
		let assignSuccessCount = 0;
		let assignFailedCount = 0;
		let unassignSuccessCount = 0;
		let unassignFailedCount = 0;

		try {
			// 1. Process assignments
			if (campaignIdsToAssign.length > 0) {
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
							assignSuccessCount++;
						} catch (err) {
							console.error(`Failed to assign user to campaign ${cId}:`, err);
							assignFailedCount++;
						}
					})
				);
			}

			// 2. Process unassignments
			if (campaignIdsToUnassign.length > 0) {
				await Promise.all(
					campaignIdsToUnassign.map(async (cId) => {
						try {
							const memberIdToDelete = campaignToMemberIdMap.get(cId);
							if (memberIdToDelete) {
								await deleteTeamMember(memberIdToDelete).unwrap();
								unassignSuccessCount++;
							}
						} catch (err) {
							console.error(`Failed to unassign user from campaign ${cId}:`, err);
							unassignFailedCount++;
						}
					})
				);
			}

			// Show comprehensive feedback
			const messages = [];
			if (assignSuccessCount > 0) {
				messages.push(`assigned to ${assignSuccessCount} campaign(s)`);
			}
			if (unassignSuccessCount > 0) {
				messages.push(`unassigned from ${unassignSuccessCount} campaign(s)`);
			}

			if (messages.length > 0) {
				toast.success(`Successfully ${messages.join(' and ')}`);
				if (refetchUsers) refetchUsers();
				onClose();
			} else if (assignFailedCount > 0 || unassignFailedCount > 0) {
				toast.error('Failed to update campaign assignments');
			} else {
				// No changes made
				onClose();
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
							Manage Campaign Assignments
						</h2>
						<p className="text-[10px] md:text-[11px] text-gray-500 mt-1">
							Assign or unassign the user from campaigns under the company.
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
						placeholder="Choose a user to manage"
						options={userOptions}
						value={selectedUserEmail}
						onChange={(val) => setSelectedUserEmail(val as string)}
					/>

					<Dropdown
						label="Target Role"
						placeholder={campaignIdsToAssign.length > 0 ? "Select role for new campaigns" : "Select role (optional)"}
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
								{campaignsList.map(camp => {
									const isLastRemaining = selectedCampaignIds.size === 1 && selectedCampaignIds.has(camp.id);
									return (
										<div
											key={camp.id}
											onClick={() => {
												if (!isLastRemaining) {
													toggleCampaign(camp.id);
												} else {
													toast.warning("A user must be assigned to at least one campaign.");
												}
											}}
											className={`flex items-center justify-between p-3.5 text-xs transition-colors select-none ${
												isLastRemaining
													? 'opacity-60 bg-gray-50 dark:bg-gray-800/30 cursor-not-allowed' 
													: 'hover:bg-gray-50/50 dark:hover:bg-gray-700/50 cursor-pointer'
											}`}
										>
											<div className="flex items-center gap-3">
												<Checkbox
													checked={selectedCampaignIds.has(camp.id)}
													onChange={() => {}}
													disabled={isLastRemaining}
													size="small"
													className="pointer-events-none"
												/>
												<span className="font-medium dark:text-gray-100">{camp.name}</span>
											</div>
											{camp.alreadyAssigned ? (
												selectedCampaignIds.has(camp.id) ? (
													<span className="text-[9px] px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400 font-semibold border dark:border-green-950">
														Currently Assigned
													</span>
												) : (
													<span className="text-[9px] px-2 py-0.5 rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400 font-semibold border dark:border-red-950">
														To be Unassigned
													</span>
												)
											) : (
												selectedCampaignIds.has(camp.id) && (
													<span className="text-[9px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400 font-semibold border dark:border-blue-950">
														To be Assigned
													</span>
												)
											)}
										</div>
									);
								})}
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
							disabled={!selectedUserEmail || (campaignIdsToAssign.length > 0 && !selectedRoleId) || selectedCampaignIds.size === 0 || isSubmitting}
							loading={isSubmitting}
						>
							Save Assignments
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default MultipleCampaignModal;
