'use client';

import React from 'react';
import { BackpackIcon, BarChartIcon, PersonIcon } from '@radix-ui/react-icons';

interface SummaryCard {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	iconBgColor?: string;
	iconColor?: string;
}

interface SummaryCardsProps {
	cards?: SummaryCard[];
	className?: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({
	cards,
	className = '',
}) => {
	// Default cards if none provided
	const defaultCards: SummaryCard[] = [
		{
			title: 'Total Businesses',
			value: 123,
			icon: <BackpackIcon className="w-8 h-8" />,
			iconBgColor: 'bg-blue-50',
			iconColor: 'text-blue-600',
		},
		{
			title: 'Total Active Businesses',
			value: 104,
			icon: <BarChartIcon className="w-8 h-8" />,
			iconBgColor: 'bg-green-50',
			iconColor: 'text-green-600',
		},
		{
			title: 'Total Users',
			value: 150,
			icon: <PersonIcon className="w-8 h-8" />,
			iconBgColor: 'bg-purple-50',
			iconColor: 'text-purple-600',
		},
	];

	const displayCards = cards || defaultCards;

	return (
		<div className={`grid grid-cols-1 md:grid-cols-3 gap-6 ${className}`}>
			{displayCards.map((card, index) => (
				<div
					key={index}
					className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-6"
				>
					<div className="flex items-center justify-between">
						<div>
							<p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
								{card.title}
							</p>
							<p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
								{card.value}
							</p>
						</div>
						<div
							className={`p-3 rounded-lg ${
								card.iconBgColor || 'bg-blue-50 dark:bg-blue-900/30'
							} ${card.iconBgColor === 'bg-blue-50' ? 'dark:bg-blue-900/30' : ''} ${card.iconBgColor === 'bg-green-50' ? 'dark:bg-green-900/30' : ''} ${card.iconBgColor === 'bg-purple-50' ? 'dark:bg-purple-900/30' : ''}`}
						>
							<div className={`${card.iconColor || 'text-blue-600'} ${card.iconColor === 'text-blue-600' ? 'dark:text-blue-400' : ''} ${card.iconColor === 'text-green-600' ? 'dark:text-green-400' : ''} ${card.iconColor === 'text-purple-600' ? 'dark:text-purple-400' : ''}`}>
								{card.icon}
							</div>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default SummaryCards;

