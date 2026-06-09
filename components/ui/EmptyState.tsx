'use client';

import React from 'react';
import Icon from '@/components/ui/Icon';
import Button from '@/components/ui/Button';

interface EmptyStateProps {
	/** Icon name from the /public/Icon/ directory (without .svg) */
	iconName?: string;
	/** Optional Radix icon or other React component */
	icon?: React.ElementType;
	/** Main heading text */
	title: string;
	/** Descriptive subtext below the heading */
	description: React.ReactNode;
	/** Optional label for the action button */
	actionLabel?: string;
	/** Callback when the action button is clicked */
	onAction?: () => void;
	/** Extra CSS classes on the outer wrapper */
	className?: string;
}

/**
	* A reusable empty state component for displaying a friendly message
	* when data is unavailable or a collection is empty.
	*
	* @example
	* <EmptyState
	*   iconName="user"
	*   title="No Roles Found"
	*   description="Create roles in the Setup Book to manage permissions."
	*   actionLabel="Go to Setup Book"
	*   onAction={() => router.push('/setup')}
	* />
	*/
const EmptyState: React.FC<EmptyStateProps> = ({
	iconName = 'user',
	icon: IconComponent,
	title,
	description,
	actionLabel,
	onAction,
	className = '',
}) => {
	return (
		<div className={`flex flex-col items-center justify-center py-20 px-6 text-center ${className}`}>
			{/* Icon container */}
			<div
				className="w-16 min-h-16 rounded-full flex items-center justify-center mb-5"
				style={{ backgroundColor: 'var(--bg-primary)' }}
			>
				{IconComponent ? (
					<IconComponent className="w-8 h-8 opacity-40 text-[var(--primary)]" />
				) : (
					<Icon
						name={iconName}
						size="xl"
						className="opacity-40"
					/>
				)}
			</div>

			{/* Title */}
			<h3
				className="text-[14px] md:text-[16px] font-semibold mb-2"
				style={{ color: 'var(--text-primary)' }}
			>
				{title}
			</h3>

			{/* Description */}
			<p
				className="text-[11px] md:text-[13px] max-w-sm leading-relaxed"
				style={{ color: 'var(--text-tertiary)' }}
			>
				{description}
			</p>

			{/* Optional action button */}
			{actionLabel && onAction && (
				<Button
					variant="outline"
					size="sm"
					onClick={onAction}
					className="mt-6"
				>
					{actionLabel}
				</Button>
			)}
		</div>
	);
};

export default EmptyState;
