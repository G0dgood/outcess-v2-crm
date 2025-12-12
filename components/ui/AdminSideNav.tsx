'use client';

import React, { useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSetup } from '@/contexts/SetupContext';
import {
	DashboardIcon,
	BackpackIcon,
	ClockIcon,
	GearIcon,
} from '@radix-ui/react-icons';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface AdminSideNavProps {
	activeItem?: string;
	onItemClick?: (item: string) => void;
	className?: string;
	isMobileOpen?: boolean;
	onMobileClose?: () => void;
	isMobile?: boolean;
}

interface NavItem {
	id: string;
	label: string;
	icon: React.ReactNode;
	path: string;
}

const AdminSideNav: React.FC<AdminSideNavProps> = ({
	activeItem = 'dashboard',
	onItemClick,
	className = '',
	isMobileOpen = false,
	onMobileClose,
	isMobile = false,
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const { lineOfBusinessData } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const navRef = useRef<HTMLElement>(null);

	const navItems: NavItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <DashboardIcon className="w-5 h-5" />,
			path: '/admin/dashboard',
		},
		{
			id: 'businesses-management',
			label: 'Businesses Management',
			icon: <BackpackIcon className="w-5 h-5" />,
			path: '/admin/businesses',
		},
		{
			id: 'pending-request',
			label: 'Pending Request',
			icon: <ClockIcon className="w-5 h-5" />,
			path: '/admin/pending-request',
		},
		{
			id: 'settings',
			label: 'Settings',
			icon: <GearIcon className="w-5 h-5" />,
			path: '/admin/settings',
		},
	];

	const handleItemClick = (item: NavItem) => {
		if (onItemClick) {
			onItemClick(item.id);
		} else {
			router.push(item.path);
		}
		// Close mobile menu if open
		if (isMobileOpen && onMobileClose) {
			onMobileClose();
		}
	};

	// Determine active item based on pathname
	const getActiveItem = () => {
		if (pathname?.startsWith('/admin/dashboard')) return 'dashboard';
		if (pathname?.startsWith('/admin/businesses')) return 'businesses-management';
		if (pathname?.startsWith('/admin/pending-request')) return 'pending-request';
		if (pathname?.startsWith('/admin/settings')) return 'settings';
		return activeItem;
	};

	const currentActiveItem = getActiveItem();

	return (
		<>
			{/* Side Navigation - Desktop Only */}
			<nav
				ref={navRef}
				id={isMobile ? 'side-nav-mobile' : 'side-nav'}
				className={`
                    w-64 border-r dark:border-gray-700
                    ${isMobile ? 'block' : 'hidden md:block'} relative h-auto transition-colors duration-300
                    ${className}
                `}
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="p-4 mt-4">
					{/* Navigation Items */}
					<div className="space-y-2">
						{navItems.map((item) => {
							const isActive = currentActiveItem === item.id;
							return (
								<div key={item.id}>
									<button
										onClick={() => handleItemClick(item)}
										className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${isActive
											? 'text-white'
											: 'dark:text-gray-300 hover:text-white dark:hover:text-white'
											}`}
										style={{
											backgroundColor: isActive ? lineOfBusinessData.primaryColor || '#050711' : 'transparent',
											color: isActive ? 'white' : 'var(--text-secondary)',
											'--hover-bg': lineOfBusinessData.secondaryColor || '#6C8B7D'
										} as React.CSSProperties}
										onMouseEnter={(e) => {
											if (!isActive) {
												e.currentTarget.style.backgroundColor = lineOfBusinessData.secondaryColor || '#6C8B7D';
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
												if (icon) icon.style.color = 'var(--text-tertiary)';
												if (text) text.style.color = 'var(--text-secondary)';
											}
										}}
									>
										<div
											className={`shrink-0 transition-colors duration-200 ${isActive ? 'text-white' : 'dark:text-gray-400'}`}
											style={!isActive ? { color: 'var(--text-tertiary)' } : {}}
										>
											{item.icon}
										</div>
										<span
											className={`font-inter whitespace-nowrap font-medium text-[14px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 flex-1 text-left ${isActive ? 'text-white' : 'dark:text-gray-300'}`}
											style={!isActive ? { color: 'var(--text-secondary)' } : {}}
										>
											{item.label}
										</span>
									</button>
								</div>
							);
						})}
					</div>

					{/* Separator */}
					<div
						className="border-t dark:border-gray-700 my-4"
						style={{ borderColor: 'var(--light-gray)' }}
					></div>
				</div>
			</nav>
		</>
	);
};

export default AdminSideNav;
