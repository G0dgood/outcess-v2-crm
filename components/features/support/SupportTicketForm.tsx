import React from 'react';
import { Input } from '../../ui/Input';
import { Dropdown } from '../../ui/Dropdown';
import Textarea from '../../ui/Textarea';

interface Role {
	_id?: string;
	roleName?: string;
	name?: string;
}

interface TeamMember {
	_id: string;
	id?: string;
	firstName?: string;
	lastName?: string;
	name?: string;
	fullName?: string;
	role?: string | Role;
}

interface SupportTicketFormProps {
	title: string;
	setTitle: (val: string) => void;
	description: string;
	setDescription: (val: string) => void;
	priority: 'Low' | 'Medium' | 'High';
	setPriority: (val: 'Low' | 'Medium' | 'High') => void;
	assignedToIds: string[];
	setAssignedToIds: (val: string[]) => void;
	teamMembers: TeamMember[];
	campaignData: {
		primaryColor?: string;
	};
	onSubmit?: (e: React.FormEvent) => void;
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({
	title,
	setTitle,
	description,
	setDescription,
	priority,
	setPriority,
	assignedToIds,
	setAssignedToIds,
	teamMembers,
	campaignData,
	onSubmit,
}) => {
	const activeColor = campaignData?.primaryColor || 'var(--primary)';

	const getRoleName = (role: string | Role | undefined): string => {
		if (!role) return 'Agent';
		if (typeof role === 'string') return role;
		if (typeof role === 'object') return role.roleName || role.name || 'Agent';
		return 'Agent';
	};

	const getFullName = (m: TeamMember | undefined): string => {
		if (!m) return 'Unknown Member';
		if (m.firstName && m.lastName) return `${m.firstName} ${m.lastName}`;
		return m.name || m.fullName || 'Unknown Member';
	};

	const sortedMembers = [...teamMembers].sort((a, b) => {
		const roleA = getRoleName(a.role).toLowerCase();
		const roleB = getRoleName(b.role).toLowerCase();
		if (roleA.includes('supervisor') && !roleB.includes('supervisor')) return -1;
		if (!roleA.includes('supervisor') && roleB.includes('supervisor')) return 1;
		return 0;
	});

	const getPrioritySettings = (p: 'Low' | 'Medium' | 'High') => {
		switch (p) {
			case 'Low':
				return { color: '#10b981', width: '33.33%', label: 'Routine issue' };
			case 'Medium':
				return { color: '#f59e0b', width: '66.66%', label: 'Requires attention' };
			case 'High':
				return { color: '#ef4444', width: '100%', label: 'Urgent priority' };
			default:
				return { color: '#94a3b8', width: '0%', label: '' };
		}
	};

	const prioritySettings = getPrioritySettings(priority);

	return (
		<div className="p-6 overflow-y-auto flex-1">
			<form onSubmit={onSubmit} className="space-y-6">
				<Input
					label="Subject"
					placeholder="Enter ticket title"
					value={title}
					onChange={(val) => setTitle(val)}
					required
				/>

				<div className="space-y-1.5">
					<label className="text-sm font-medium transition-colors" style={{ color: 'var(--text-secondary)' }}>
						Priority
					</label>
					<div className="flex items-center gap-3">
						{(['Low', 'Medium', 'High'] as const).map((p) => {
							const isSelected = priority === p;
							return (
								<button
									key={p}
									type="button"
									onClick={() => setPriority(p)}
									className={`px-4 py-2 text-[10px] md:text-[12px] font-medium border transition-all duration-200 rounded-[var(--radius)] ${isSelected ? 'shadow-sm' : 'hover:bg-gray-50 dark:hover:bg-gray-700'
										}`}
									style={isSelected ? {
										backgroundColor: activeColor + '1A', // 10% opacity
										borderColor: activeColor + '33', // 20% opacity
										color: activeColor
									} : {
										backgroundColor: 'var(--accent-white)',
										borderColor: 'var(--light-gray)',
										color: 'var(--text-secondary)'
									}}
								>
									{p}
								</button>
							);
						})}
					</div>

					{/* Priority Progress Bar */}
					<div className="mt-4 space-y-2">
						<div className="h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
							<div 
								className="h-full transition-all duration-500 ease-out rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]"
								style={{ 
									width: prioritySettings.width, 
									backgroundColor: prioritySettings.color 
								}}
							/>
						</div>
						<p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: prioritySettings.color }}>
							{prioritySettings.label}
						</p>
					</div>
				</div>

				<Dropdown
					label="Assign To"
					placeholder="Select supervisor or agent"
					multiple={true}
					options={sortedMembers.map((m) => {
						const roleName = getRoleName(m.role);
						const fullName = getFullName(m);
						const isSupervisor = roleName.toLowerCase().includes('supervisor');
						return {
							value: m._id || m.id || '',
							label: `${fullName} (${roleName})${isSupervisor ? ' ⭐' : ''}`
						};
					})}
					value={assignedToIds}
					onChange={(val) => setAssignedToIds(val as string[])}
					required
				/>

				<Textarea
					label="Description"
					placeholder="Describe your issue in detail"
					value={description}
					onChange={(val) => setDescription(val)}
					className="min-h-[120px]"
					required
				/>
			</form>
		</div>
	);
};
