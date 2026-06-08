'use client';

import React from 'react';
import { PersonIcon } from '@radix-ui/react-icons';
import TeamMemberCard from '@/components/TeamMemberCard';
import Pagination from '@/components/ui/Pagination';
import EmptyState from '@/components/ui/EmptyState';
import AssignBucketModal from './AssignBucketModal';
import { Bucket } from '@/contexts/SetupContext';

interface TeamMember {
	_id: string;
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: string | { roleName?: string; name?: string };
	supervisor: string;
	status: string;
	statusColor?: string;
	reason?: string;
	team: string;
	shiftHourTitle?: string;
}

interface TeamMembersCardsProps {
	isLoading: boolean;
	filteredMembers: TeamMember[];
	currentMembers: TeamMember[];
	currentPage: number;
	totalPages: number;
	setCurrentPage: (page: number) => void;
	campaignData: {
		primaryColor?: string;
		secondaryColor?: string;
		campaign?: {
			_id?: string;
			id?: string;
			dashboardSettings?: {
				buckets?: Bucket[];
			};
		};
		dashboardSettings?: {
			buckets?: Bucket[];
		};
	};
	handleEditMemberClick: (member: TeamMember) => void;
	handleDeleteMember: (id: string) => void;
	setStatusModalMember: (member: TeamMember) => void;
}

const TeamMembersCards: React.FC<TeamMembersCardsProps> = ({
	isLoading,
	filteredMembers,
	currentMembers,
	currentPage,
	totalPages,
	setCurrentPage,
	campaignData,
	handleEditMemberClick,
	handleDeleteMember,
	setStatusModalMember,
}) => {
	const [selectedMemberForBucket, setSelectedMemberForBucket] = React.useState<TeamMember | null>(null);

	const handleAssignBucket = (member: TeamMember) => {
		setSelectedMemberForBucket(member);
	};
	return (
		<div className="space-y-6">
			{isLoading ? (
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
						<div key={i} className="h-64 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-[var(--radius)]" />
					))}
				</div>
			) : filteredMembers.length === 0 ? (
				<EmptyState
					icon={PersonIcon}
					title="No Team Members Found"
					description="No team members match your current filters. Try adjusting your search or supervisor filter."
					className="py-10 bg-white dark:bg-gray-800/50 border dark:border-gray-700 rounded-[var(--radius)]"
				/>
			) : (
				<>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{filteredMembers.map(member => (
							<TeamMemberCard
								key={member._id}
								member={member}
								onEdit={handleEditMemberClick}
								onDelete={handleDeleteMember}
								onStatusClick={setStatusModalMember}
								onAssignBucket={handleAssignBucket}
							/>
						))}
					</div>
					{currentMembers.length > 0 && (
						<div className=" pt-4">
							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
								primaryColor={campaignData?.primaryColor || 'var(--primary)'}
								secondaryColor={campaignData?.secondaryColor || 'var(--primary)'}
							/>
						</div>
					)}
				</>
			)}

			<AssignBucketModal
				isOpen={!!selectedMemberForBucket}
				onClose={() => setSelectedMemberForBucket(null)}
				member={selectedMemberForBucket ? {
					_id: selectedMemberForBucket._id,
					fullName: selectedMemberForBucket.fullName,
					agentId: selectedMemberForBucket.agentId
				} : null}
				campaignData={campaignData}
			/>
		</div>
	);
};

export default TeamMembersCards;
