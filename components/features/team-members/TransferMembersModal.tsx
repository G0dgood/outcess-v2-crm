'use client';

import React, { useMemo, useState } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';
import Checkbox from '@/components/ui/Checkbox';
import { toastSuccess, toastError } from '@/utils/toastWithSound';
import { useGetCampaignByCompanyIdForheaderQuery } from '@/store/services/campaignApi';
import { useGetRolesByCompanyIdQuery } from '@/store/services/roleApi';
import { useTransferTeamMembersToCampaignMutation } from '@/store/services/teamMembersApi';

interface TransferMemberOption {
	id: string;
	name: string;
	email?: string;
}

interface TransferMembersModalProps {
	isOpen: boolean;
	onClose: () => void;
	members: TransferMemberOption[];
	currentCampaignId: string;
	companyId: string;
	preselectedIds?: string[];
}

const TransferMembersModal: React.FC<TransferMembersModalProps> = ({
	isOpen,
	onClose,
	members,
	currentCampaignId,
	companyId,
	preselectedIds = [],
}) => {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(preselectedIds));
	const [targetCampaignId, setTargetCampaignId] = useState('');
	const [roleId, setRoleId] = useState('');

	const { data: campaignsData } = useGetCampaignByCompanyIdForheaderQuery(
		{ companyId, limit: 1000 },
		{ skip: !companyId || !isOpen }
	);

	// Roles are company-global, so they are loaded by company (not by campaign).
	const { data: rolesData, isFetching: isRolesLoading } = useGetRolesByCompanyIdQuery(
		companyId,
		{ skip: !companyId }
	);

	const [transferMembers, { isLoading: isTransferring }] = useTransferTeamMembersToCampaignMutation();

	// Reset transient state whenever the modal is (re)opened.
	React.useEffect(() => {
		if (isOpen) {
			setSelectedIds(new Set(preselectedIds));
			setTargetCampaignId('');
			setRoleId('');
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isOpen]);

	const campaignOptions = useMemo(() => {
		const list = campaignsData?.campaigns || [];
		return list
			.filter((c) => (c._id || c.id) !== currentCampaignId)
			.map((c) => ({ value: (c._id || c.id) as string, label: c.campaignName || 'Untitled campaign' }));
	}, [campaignsData, currentCampaignId]);

	const roleOptions = useMemo(() => {
		const roles = rolesData?.roles || [];
		return roles.map((r) => ({ value: r._id, label: r.roleName }));
	}, [rolesData]);

	const allSelected = members.length > 0 && members.every((m) => selectedIds.has(m.id));

	const toggle = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	const toggleAll = () => {
		setSelectedIds(allSelected ? new Set() : new Set(members.map((m) => m.id)));
	};

	const canTransfer = selectedIds.size > 0 && !!targetCampaignId && !!roleId && !isTransferring;

	const handleTransfer = async () => {
		if (!canTransfer) return;
		try {
			const result = await transferMembers({
				teamMemberIds: Array.from(selectedIds),
				targetCampaignId,
				roleId,
			}).unwrap();

			if (result.transferredCount > 0 && result.skippedCount === 0) {
				toastSuccess(`Transferred ${result.transferredCount} member(s)`);
			} else if (result.transferredCount > 0) {
				toastSuccess(`Transferred ${result.transferredCount}, skipped ${result.skippedCount}`);
			} else {
				toastError(result.skipped?.[0]?.reason || 'No members were transferred');
			}

			if (result.transferredCount > 0) onClose();
		} catch (error: unknown) {
			const err = error as { data?: { message?: string } };
			toastError(err?.data?.message || 'Failed to transfer members');
		}
	};

	return (
		<Modal isOpen={isOpen} onClose={onClose} title="Transfer members to another campaign" size="lg">
			<div className="p-6 space-y-5">
				{/* Target campaign + role */}
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Dropdown
						label="Target campaign"
						placeholder="Select campaign"
						options={campaignOptions}
						value={targetCampaignId}
						onChange={(value) => setTargetCampaignId(Array.isArray(value) ? value[0] : value)}
					/>
					<Dropdown
						label="Role"
						placeholder={isRolesLoading ? 'Loading roles…' : 'Select role'}
						options={roleOptions}
						value={roleId}
						onChange={(value) => setRoleId(Array.isArray(value) ? value[0] : value)}
					/>
				</div>

				{/* Member selection */}
				<div>
					<div className="flex items-center justify-between mb-2">
						<span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
							Members to transfer ({selectedIds.size} selected)
						</span>
						{members.length > 0 && (
							<button
								type="button"
								onClick={toggleAll}
								className="text-[11px] font-medium text-primary hover:underline"
							>
								{allSelected ? 'Clear all' : 'Select all'}
							</button>
						)}
					</div>

					<div
						className="max-h-64 overflow-y-auto rounded-[var(--radius)] border divide-y dark:divide-gray-700"
						style={{ borderColor: 'var(--light-gray)' }}
					>
						{members.length === 0 ? (
							<div className="p-4 text-center text-[12px] italic" style={{ color: 'var(--text-tertiary)' }}>
								No members in this campaign
							</div>
						) : (
							members.map((m) => (
								<div
									key={m.id}
									onClick={() => toggle(m.id)}
									className="flex items-center gap-3 p-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/60"
								>
									<Checkbox
										checked={selectedIds.has(m.id)}
										onChange={() => { /* toggled by the row click below */ }}
										size="small"
									/>
									<div className="flex flex-col">
										<span className="text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>{m.name}</span>
										{m.email && (
											<span className="text-[10px]" style={{ color: 'var(--text-tertiary)' }}>{m.email}</span>
										)}
									</div>
								</div>
							))
						)}
					</div>
				</div>

				<p className="text-[11px]" style={{ color: 'var(--text-tertiary)' }}>
					Transferred members get the selected role in the target campaign. Their current
					supervisor and bucket assignments are cleared since those are campaign-specific.
				</p>

				<div className="flex justify-end gap-3 pt-2">
					<Button variant="outline" size="md" onClick={onClose} disabled={isTransferring}>
						Cancel
					</Button>
					<Button variant="primary" size="md" onClick={handleTransfer} disabled={!canTransfer} loading={isTransferring}>
						Transfer{selectedIds.size > 0 ? ` (${selectedIds.size})` : ''}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default TransferMembersModal;
