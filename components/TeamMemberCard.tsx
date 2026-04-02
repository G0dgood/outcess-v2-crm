'use client';

import React from 'react';
import { 
	Pencil1Icon, 
	TrashIcon, 
	PersonIcon, 
	ClockIcon, 
	EnvelopeClosedIcon 
} from '@radix-ui/react-icons';

interface TeamMember {
	_id: string;
	agentId: string;
	fullName: string;
	email: string;
	phone: string;
	role: 'agent' | 'supervisor' | 'qa' | 'admin';
	supervisor: string;
	status: string;
	statusColor?: string;
	reason?: string;
	team: string;
	shiftHourTitle?: string;
}

interface TeamMemberCardProps {
	member: TeamMember;
	onEdit: (member: TeamMember) => void;
	onDelete: (id: string) => void;
	onStatusClick: (member: TeamMember) => void;
}

const TeamMemberCard: React.FC<TeamMemberCardProps> = ({ member, onEdit, onDelete, onStatusClick }) => {
	return (
		<div 
			className="group relative bg-white dark:bg-gray-800 border dark:border-gray-700 p-5 transition-all hover:shadow-md rounded-[var(--radius)]"
			style={{ borderColor: 'var(--light-gray)' }}
		>
			{/* Top Bar: Role & Actions */}
			<div className="flex items-start justify-between mb-4">
				<div className="flex flex-col">
					<span 
						className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary self-start"
					>
						{member.role}
					</span>
				</div>
				<div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
					<button 
						onClick={() => onEdit(member)}
						className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-primary transition-colors"
						title="Edit Member"
					>
						<Pencil1Icon className="w-4 h-4" />
					</button>
					<button 
						onClick={() => onDelete(member._id)}
						className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-gray-400 hover:text-red-500 transition-colors"
						title="Delete Member"
					>
						<TrashIcon className="w-4 h-4" />
					</button>
				</div>
			</div>

			{/* Main Info: Profile & Name */}
			<div className="flex items-center gap-4 mb-5">
				<div className="relative shrink-0">
					<div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center text-primary font-semibold text-sm border-2 border-white dark:border-gray-800 shadow-sm">
						<PersonIcon className="w-6 h-6" />
					</div>
					<div 
						className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-gray-800 cursor-pointer shadow-sm"
						style={{ backgroundColor: member.statusColor || '#9CA3AF' }}
						onClick={() => onStatusClick(member)}
						title={`Status: ${member.status}`}
					/>
				</div>
				<div className="min-w-0">
					<h3 className="font-semibold text-sm truncate dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
						{member.fullName}
					</h3>
					<p className="text-[11px] text-gray-500 truncate">{member.agentId}</p>
				</div>
			</div>

			{/* Details Section */}
			<div className="space-y-3 pt-4 border-t dark:border-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
				<div className="flex items-center gap-3">
					<div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
						<PersonIcon className="w-3.5 h-3.5" />
					</div>
					<div className="min-w-0">
						<p className="text-[10px] text-gray-400 uppercase font-medium">Supervisor</p>
						<p className="text-[11px] font-medium truncate dark:text-gray-200" style={{ color: 'var(--text-secondary)' }}>
							{member.supervisor}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
						<ClockIcon className="w-3.5 h-3.5" />
					</div>
					<div className="min-w-0">
						<p className="text-[10px] text-gray-400 uppercase font-medium">Shift</p>
						<p className="text-[11px] font-medium truncate dark:text-gray-200" style={{ color: 'var(--text-secondary)' }}>
							{member.shiftHourTitle || 'No shift assigned'}
						</p>
					</div>
				</div>

				<div className="flex items-center gap-3">
					<div className="w-7 h-7 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-gray-400">
						<EnvelopeClosedIcon className="w-3.5 h-3.5" />
					</div>
					<div className="min-w-0 overflow-hidden">
						<p className="text-[10px] text-gray-400 uppercase font-medium">Contact</p>
						<p className="text-[11px] font-medium truncate dark:text-gray-200" style={{ color: 'var(--text-secondary)' }}>
							{member.email}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TeamMemberCard;

