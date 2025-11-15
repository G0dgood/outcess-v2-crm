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
					className="dark:bg-gray-800 border dark:border-gray-700 p-6"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center justify-between">
						<div>
							<p 
								className="text-sm font-medium dark:text-gray-400 mb-1"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{card.title}
							</p>
							<p 
								className="text-3xl font-bold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								{card.value}
							</p>
						</div>
						<div
							className={`p-3 rounded-lg ${
								card.iconBgColor || 'dark:bg-blue-900/30'
							} ${card.iconBgColor === 'bg-blue-50' ? 'dark:bg-blue-900/30' : ''} ${card.iconBgColor === 'bg-green-50' ? 'dark:bg-green-900/30' : ''} ${card.iconBgColor === 'bg-purple-50' ? 'dark:bg-purple-900/30' : ''}`}
							style={card.iconBgColor === 'bg-blue-50' ? {
								backgroundColor: 'rgba(59, 130, 246, 0.1)'
							} : card.iconBgColor === 'bg-green-50' ? {
								backgroundColor: 'rgba(34, 197, 94, 0.1)'
							} : card.iconBgColor === 'bg-purple-50' ? {
								backgroundColor: 'rgba(168, 85, 247, 0.1)'
							} : {
								backgroundColor: 'rgba(59, 130, 246, 0.1)'
							}}
						>
							<div 
								className={`${card.iconColor || ''} ${card.iconColor === 'text-blue-600' ? 'dark:text-blue-400' : ''} ${card.iconColor === 'text-green-600' ? 'dark:text-green-400' : ''} ${card.iconColor === 'text-purple-600' ? 'dark:text-purple-400' : ''}`}
								style={card.iconColor === 'text-blue-600' ? {
									color: '#2563EB'
								} : card.iconColor === 'text-green-600' ? {
									color: '#16A34A'
								} : card.iconColor === 'text-purple-600' ? {
									color: '#9333EA'
								} : {
									color: '#2563EB'
								}}
							>
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

