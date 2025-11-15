'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from '@/components/ui/Icon';

interface WidgetCardProps {
	title: string;
	value: string | number;
	widgetId: string;
	onEdit?: (widgetId: string) => void;
	onDelete?: (widgetId: string) => void;
}

export const WidgetCard: React.FC<WidgetCardProps> = ({ title, value, widgetId, onEdit, onDelete }) => {
	const [isDropdownOpen, setIsDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
				setIsDropdownOpen(false);
			}
		};

		if (isDropdownOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isDropdownOpen]);

	const handleEdit = () => {
		onEdit?.(widgetId);
		setIsDropdownOpen(false);
	};

	const handleDelete = () => {
		onDelete?.(widgetId);
		setIsDropdownOpen(false);
	};

	return (
		<div
			className="dark:bg-gray-800 border dark:border-gray-700 p-6 relative"
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="flex justify-between items-start mb-4">
				<h3
					className="font-lato font-normal text-[18px] leading-[150%] dark:text-gray-300"
					style={{ color: 'var(--text-tertiary)' }}
				>
					{title}
				</h3>
				<div className="relative" ref={dropdownRef}>
					<button
						onClick={(e) => {
							e.stopPropagation();
							setIsDropdownOpen(!isDropdownOpen);
						}}
						className="dark:text-gray-500 dark:hover:text-gray-300 transition-colors cursor-pointer"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Widget options"
					>
						<Icon name="Ellipsis_vertical_light" size="sm" />
					</button>
					{isDropdownOpen && (
						<div
							className="absolute right-0 top-6 z-50 dark:bg-gray-800 border dark:border-gray-700 shadow-lg min-w-[120px]"
							style={{
								backgroundColor: 'var(--accent-white)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<button
								onClick={handleEdit}
								className="w-full px-4 py-2 text-left text-sm dark:text-gray-300 dark:hover:bg-gray-700 transition-colors first:rounded-t-lg cursor-pointer"
								style={{
									color: 'var(--text-secondary)',
									backgroundColor: 'transparent'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
							>
								Edit
							</button>
							<button
								onClick={handleDelete}
								className="w-full px-4 py-2 text-left text-sm dark:text-gray-300 dark:hover:bg-gray-700 transition-colors last:rounded-b-lg cursor-pointer"
								style={{
									color: 'var(--text-secondary)',
									backgroundColor: 'transparent'
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.backgroundColor = 'transparent';
								}}
							>
								Delete
							</button>
						</div>
					)}
				</div>
			</div>
			<div
				className="text-3xl font-bold dark:text-gray-100"
				style={{ color: 'var(--text-primary)' }}
			>
				{value}
			</div>
		</div>
	);
};

export default WidgetCard;

