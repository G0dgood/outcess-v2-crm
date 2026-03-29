import React from 'react';
import { User, Plus } from 'lucide-react';
import Image from 'next/image';
import { PopulatedMember } from '@/store/services/supportApi';

interface ParticipantAvatarsProps {
	requester: PopulatedMember | null;
	assignees: PopulatedMember[];
	creatorName?: string;
	onAssign?: () => void;
	status?: string;
}

const ParticipantAvatars: React.FC<ParticipantAvatarsProps> = ({
	requester,
	assignees = [],
	creatorName = 'User',
	onAssign,
	status
}) => {
	const getInitials = (member: any) => {
		if (member?.firstName) return member.firstName[0];
		if (member?.name) return member.name[0];
		if (typeof member === 'string') return member[0];
		return '?';
	};

	const getMemberColor = (id?: string) => {
		if (!id) return { border: 'border-gray-300', text: 'text-gray-500' };
		const colors = [
			{ border: 'border-indigo-500', text: 'text-indigo-600' },
			{ border: 'border-rose-500', text: 'text-rose-600' },
			{ border: 'border-violet-500', text: 'text-violet-600' },
			{ border: 'border-emerald-500', text: 'text-emerald-600' },
			{ border: 'border-sky-500', text: 'text-sky-600' },
			{ border: 'border-amber-500', text: 'text-amber-600' },
			{ border: 'border-fuchsia-500', text: 'text-fuchsia-600' },
			{ border: 'border-orange-500', text: 'text-orange-600' },
		];
		// Simple hash function for consistent colors
		const index = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
		return colors[index];
	};

	const requesterColor = getMemberColor(requester?._id || requester?.id);

	const handleAssignClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		onAssign?.();
	};

	return (
		<div className="flex -space-x-3 items-center group/stack">
			<div className="flex -space-x-3 hover:space-x-1 transition-all items-center">
				{/* Requester Avatar */}
				<div
					className={`relative w-8 h-8 rounded-full border-2 ${requesterColor.border} bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-sm z-30`}
					title={`Requester: ${requester?.firstName || creatorName}`}
				>
					{requester?.avatar ? (
						<Image src={requester.avatar} alt="R" width={32} height={32} className="w-full h-full object-cover" />
					) : (
						<span className={`text-[10px] font-bold ${requesterColor.text}`}>
							{getInitials(requester || { name: creatorName })}
						</span>
					)}
				</div>

				{/* Assignee Avatars */}
				{assignees.map((assignee, idx) => {
					const assigneeColor = getMemberColor(assignee._id || assignee.id);
					return (
						<div
							key={assignee._id}
							className={`relative w-8 h-8 rounded-full border-2 ${assigneeColor.border} bg-white dark:bg-gray-800 flex items-center justify-center overflow-hidden shadow-sm hover:z-40`}
							style={{ zIndex: 20 - idx }}
							title={`Assignee: ${assignee.firstName || assignee.name || 'Agent'}`}
						>
							{assignee.avatar ? (
								<Image src={assignee.avatar} alt="A" width={32} height={32} className="w-full h-full object-cover" />
							) : (
								<span className={`text-[10px] font-bold ${assigneeColor.text}`}>
									{getInitials(assignee)}
								</span>
							)}
						</div>
					);
				})}

				{assignees.length === 0 && status !== 'Closed' && (
					<div
						onClick={handleAssignClick}
						className="relative w-8 h-8 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center animate-pulse hover:border-primary hover:bg-primary/5 cursor-pointer z-10 transition-colors"
						title="Click to Assign"
					>
						<User className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary transition-colors" />
					</div>
				)}
			</div>

			{/* Add Member Button - visible on stack hover if there are assignees */}
			{assignees.length > 0 && status !== 'Closed' && (
				<button
					onClick={handleAssignClick}
					className="w-6 h-6 ml-4 bg-gray-100 dark:bg-gray-800 hover:bg-primary hover:text-white rounded-full flex items-center justify-center transition-all opacity-0 group-hover/stack:opacity-100 scale-75 group-hover/stack:scale-100 shadow-sm border dark:border-gray-700"
					title="Invite Member"
				>
					<Plus className="w-3.5 h-3.5" />
				</button>
			)}
		</div>
	);
};

export default ParticipantAvatars;
