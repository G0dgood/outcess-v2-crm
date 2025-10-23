'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSetup } from '@/contexts/SetupContext';

interface DashboardSideNavProps {
	activeItem?: string;
	onItemClick?: (item: string) => void;
	className?: string;
}

interface NavItem {
	id: string;
	label: string;
	icon: string;
	path: string;
}

const DashboardSideNav: React.FC<DashboardSideNavProps> = ({
	activeItem = 'dashboard',
	onItemClick,
	className = '',
}) => {
	const router = useRouter();
	const { setupData } = useSetup();

	const navItems: NavItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'grid',
			path: '/dashboard',
		},
		{
			id: 'customer-book',
			label: 'Customer Book',
			icon: 'book',
			path: '/customer-book',
		},
		{
			id: 'users',
			label: 'Users',
			icon: 'users',
			path: '/users',
		},
		{
			id: 'setup-book',
			label: 'Setup Book',
			icon: 'settings-book',
			path: '/setup-book',
		},
		{
			id: 'report',
			label: 'Report',
			icon: 'chart',
			path: '/report',
		},
	];

	const handleItemClick = (item: NavItem) => {
		if (onItemClick) {
			onItemClick(item.id);
		} else {
			router.push(item.path);
		}
	};

	const getIconComponent = (iconType: string) => {
		switch (iconType) {
			case 'grid':
				return (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
					</svg>
				);
			case 'book':
				return (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
						<path d="M7 3h2v2H7V3zm0 4h2v2H7V7zm0 4h2v2H7v-2z" />
					</svg>
				);
			case 'users':
				return (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.8 0-1.54.37-2.01.99L14 10.5V22h6zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2 16v-7H9l-1.5-4.5A1.5 1.5 0 0 0 6 10H4c-.8 0-1.54.37-2.01.99L1 12.5V22h6.5z" />
					</svg>
				);
			case 'settings-book':
				return (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
						<path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
					</svg>
				);
			case 'chart':
				return (
					<svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
						<path d="M3 13h2v8H3v-8zm4-6h2v14H7V7zm4-4h2v18h-2V3zm4 8h2v10h-2V11zm4-4h2v14h-2V7z" />
					</svg>
				);
			default:
				return null;
		}
	};

	return (
		<nav id="side-nav" className={`bg-white w-64   border-r border-gray-200 ${className}`}>
			<div className="p-4">
				{/* Navigation Items */}
				<div className="space-y-2">
					{navItems.map((item) => {
						const isActive = activeItem === item.id;

						return (
							<button
								key={item.id}
								onClick={() => handleItemClick(item)}
								className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${isActive
									? 'text-white'
									: 'text-gray-700 hover:text-white'
									}`}
								style={{
									backgroundColor: isActive ? setupData.primaryColor || '#050711' : 'transparent',
									'--hover-bg': setupData.secondaryColor || '#6C8B7D'
								} as React.CSSProperties}
								onMouseEnter={(e) => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = setupData.secondaryColor || '#6C8B7D';
										// Update icon and text colors to white on hover
										const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
										const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
										if (icon) icon.style.color = 'white';
										if (text) text.style.color = 'white';
									}
								}}
								onMouseLeave={(e) => {
									if (!isActive) {
										e.currentTarget.style.backgroundColor = 'transparent';
										// Reset icon and text colors
										const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
										const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
										if (icon) icon.style.color = '';
										if (text) text.style.color = '';
									}
								}}
							>
								<div className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-600'
									}`}>
									{getIconComponent(item.icon)}
								</div>
								<span className={`font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px] text-[#3A4050]  transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-700'
									}`}>
									{item.label}
								</span>
							</button>
						);
					})}
				</div>

				{/* Separator */}
				<div className="border-t border-gray-200 my-4"></div>
			</div>
		</nav>
	);
};

export default DashboardSideNav;
