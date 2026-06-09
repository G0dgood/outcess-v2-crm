'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { RowsIcon, GridIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
	view: 'table' | 'card';
	onChange: (view: 'table' | 'card') => void;
	className?: string;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ 
	view, 
	onChange, 
	className 
}) => {
	const options = [
		{ id: 'table', icon: <RowsIcon className="w-4 h-4" />, label: 'Table' },
		{ id: 'card', icon: <GridIcon className="w-4 h-4" />, label: 'Card' }
	] as const;

	return (
		<div 
			className={cn(
				"flex items-center bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border dark:border-gray-700 relative",
				className
			)}
		>
			{options.map((option) => (
				<button
					key={option.id}
					onClick={() => onChange(option.id)}
					className={cn(
						"relative flex items-center justify-center p-1.5 rounded-md transition-colors z-10 w-9 h-9",
						view === option.id 
							? "text-primary dark:text-gray-100" 
							: "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
					)}
					title={`${option.label} View`}
				>
					{view === option.id && (
						<motion.div
							layoutId="view-toggle-active"
							className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-md"
							transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
						/>
					)}
					<span className="relative z-20">
						{option.icon}
					</span>
				</button>
			))}
		</div>
	);
};

export default ViewToggle;
