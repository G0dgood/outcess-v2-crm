'use client';

import React, { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Dropdown from '@/components/ui/Dropdown';

export interface CampaignOption {
	_id?: string;
	id?: string;
	name?: string;
	campaignName?: string;
}

export interface BucketOption {
	_id?: string;
	id?: string;
	name: string;
}

export interface TeamMemberOption {
	_id?: string;
	id?: string;
	name?: string;
	firstName?: string;
	lastName?: string;
	email?: string;
}

export interface ReportFilterOptionsModalProps {
	isOpen: boolean;
	onClose: () => void;
	campaignsList: CampaignOption[];
	accessibleBuckets: BucketOption[];
	teamMembersList: TeamMemberOption[];
	currentCampaignId: string;
	currentBucketId: string;
	currentAgentId: string;
	hasFullBucketAccess?: boolean;
	onApply: (params: { campaignId: string; bucketId: string; agentId: string }) => void;
}

const ReportFilterOptionsModal: React.FC<ReportFilterOptionsModalProps> = ({
	isOpen,
	onClose,
	campaignsList,
	accessibleBuckets,
	teamMembersList,
	currentCampaignId,
	currentBucketId,
	currentAgentId,
	hasFullBucketAccess = false,
	onApply,
}) => {
	const [modalCampaignId, setModalCampaignId] = useState<string>('');
	const [modalBucketId, setModalBucketId] = useState<string>('');
	const [modalAgentId, setModalAgentId] = useState<string>('');

	useEffect(() => {
		if (isOpen) {
			setModalCampaignId(currentCampaignId || '');
			setModalBucketId(currentBucketId || '');
			setModalAgentId(currentAgentId || '');
		}
	}, [isOpen, currentCampaignId, currentBucketId, currentAgentId]);

	const handleReset = () => {
		setModalCampaignId(currentCampaignId || '');
		setModalBucketId('');
		setModalAgentId('');
	};

	const handleApply = () => {
		onApply({
			campaignId: modalCampaignId,
			bucketId: modalBucketId,
			agentId: modalAgentId,
		});
		onClose();
	};

	const safeCampaignsList = Array.isArray(campaignsList) ? campaignsList : [];
	const safeAccessibleBuckets = Array.isArray(accessibleBuckets) ? accessibleBuckets : [];
	const safeTeamMembersList = Array.isArray(teamMembersList) ? teamMembersList : [];

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Report Filter Options"
			size="md"
		>
			<div className="p-6 space-y-6">
				<p className="text-xs text-gray-500 dark:text-gray-400">
					Select parameter options below to query and display reports by Campaign ID, Bucket ID, or User/Agent ID.
				</p>

				{/* 1. Filter by Campaign ID */}
				<div className="space-y-2">
					<label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
						1. Get Report by Campaign ID
					</label>
					<Dropdown
						label=""
						placeholder="Select Campaign"
						options={safeCampaignsList.map(c => ({
							value: String(c._id || c.id || ''),
							label: c.name || c.campaignName || 'Unnamed Campaign'
						}))}
						value={modalCampaignId || currentCampaignId}
						onChange={(val) => {
							const newCampId = Array.isArray(val) ? val[0] || '' : val;
							setModalCampaignId(newCampId);
							setModalBucketId(''); // reset bucket selection when campaign changes
						}}
					/>
				</div>

				{/* 2. Filter by Bucket ID */}
				<div className="space-y-2">
					<label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
						2. Get Report by Bucket ID
					</label>
					<Dropdown
						label=""
						placeholder="Select Bucket"
						options={[
							...(hasFullBucketAccess ? [{ value: '', label: 'All Buckets' }] : []),
							...safeAccessibleBuckets.map(b => ({
								value: String(b.id || b._id || ''),
								label: b.name
							}))
						]}
						value={modalBucketId}
						onChange={(val) => {
							setModalBucketId(Array.isArray(val) ? val[0] || '' : val);
						}}
					/>
				</div>

				{/* 3. Filter by User / Agent ID */}
				<div className="space-y-2">
					<label className="text-xs font-semibold text-gray-700 dark:text-gray-200">
						3. Get Report by User / Agent ID
					</label>
					<Dropdown
						label=""
						placeholder="Select User / Agent"
						options={[
							{ value: '', label: 'All Users / Agents' },
							...safeTeamMembersList.map(m => ({
								value: String(m._id || m.id || ''),
								label: m.name || `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email || 'Team Member'
							}))
						]}
						value={modalAgentId}
						onChange={(val) => {
							setModalAgentId(Array.isArray(val) ? val[0] || '' : val);
						}}
					/>
				</div>

				{/* Modal Actions */}
				<div className="flex items-center justify-end gap-3 pt-4 border-t dark:border-gray-700">
					<Button
						variant="outline"
						size="sm"
						onClick={handleReset}
					>
						Reset
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={handleApply}
					>
						Apply Parameters
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ReportFilterOptionsModal;
