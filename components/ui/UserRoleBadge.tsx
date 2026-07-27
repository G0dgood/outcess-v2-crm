'use client';

import React from 'react';

export interface UserRoleBadgeProps {
	role?: string;
	className?: string;
}

export const getRoleBadgeStyle = (role: string) => {
	const r = role.toLowerCase();
	if (r.includes('admin') || r.includes('administrator') || r.includes('super')) {
		return 'bg-purple-50 text-purple-700 border-purple-200/80 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800/50';
	}
	if (r.includes('supervisor') || r.includes('lead')) {
		return 'bg-amber-50 text-amber-700 border-amber-200/80 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/50';
	}
	return 'bg-blue-50 text-blue-700 border-blue-200/80 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800/50';
};

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role, className = '' }) => {
	if (!role) return null;

	return (
		<div
			className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] md:text-[12px] font-semibold border shadow-xs transition-colors ${getRoleBadgeStyle(
				role
			)} ${className}`}
			title={`Role: ${role}`}
		>
			<span className="w-1.5 h-1.5 rounded-full bg-current opacity-70" />
			<span className="capitalize">{role}</span>
		</div>
	);
};

export default UserRoleBadge;
