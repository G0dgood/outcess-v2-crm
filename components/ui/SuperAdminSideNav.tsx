'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
	DashboardIcon,
	BackpackIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
} from '@radix-ui/react-icons';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/Tooltip";

interface SuperAdminSideNavProps {
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

const SuperAdminSideNav: React.FC<SuperAdminSideNavProps> = ({
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
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem('admin-sidenav-collapsed');
		if (stored) {
			setIsCollapsed(stored === 'true');
		}
	}, []);

	const toggleCollapse = () => {
		const newState = !isCollapsed;
		setIsCollapsed(newState);
		localStorage.setItem('admin-sidenav-collapsed', String(newState));
	};

	const navItems: NavItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: <DashboardIcon className="w-5 h-5" />,
			path: '/superadmin/dashboard',
		},
		{
			id: 'businesses-management',
			label: 'Businesses Management',
			icon: <BackpackIcon className="w-5 h-5" />,
			path: '/superadmin/businesses',
		}
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
		if (pathname?.startsWith('/superadmin/dashboard')) return 'dashboard';
		if (pathname?.startsWith('/superadmin/businesses')) return 'businesses-management';
		if (pathname?.startsWith('/superadmin/settings')) return 'settings';
		return activeItem;
	};

	const currentActiveItem = getActiveItem();

	return (
		<TooltipProvider>
			{/* Side Navigation - Desktop Only */}
			<nav
				ref={navRef}
				id={isMobile ? 'side-nav-mobile' : 'side-nav'}
				className={`
                    dark:bg-gray-900 ${isCollapsed ? 'w-[70px]' : 'w-64'} border-r dark:border-gray-700
                    ${isMobile ? 'block' : 'hidden md:flex flex-col'} relative h-full transition-all duration-300
                    ${className}
                `}
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="p-4 mt-4 flex-1">
					{/* Navigation Items */}
					<div className="space-y-2">
						{navItems.map((item) => {
							const isActive = currentActiveItem === item.id;
							const itemContent = (
								<button
									onClick={() => handleItemClick(item)}
									className={`cursor-pointer w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 transition-all duration-200 ${isActive
										? 'text-white'
										: 'dark:text-gray-300 hover:text-white dark:hover:text-white'
										}`}
									style={{
										backgroundColor: isActive ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent',
										color: isActive ? 'white' : 'var(--text-secondary)',
										'--hover-bg': lineOfBusinessData?.secondaryColor || '#6C8B7D'
									} as React.CSSProperties}
									onMouseEnter={(e) => {
										if (!isActive) {
											e.currentTarget.style.backgroundColor = lineOfBusinessData?.secondaryColor || '#6C8B7D';
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
									{!isCollapsed && (
										<span
											className={`font-inter whitespace-nowrap font-medium text-[14px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 flex-1 text-left ${isActive ? 'text-white' : 'dark:text-gray-300'}`}
											style={!isActive ? { color: 'var(--text-secondary)' } : {}}
										>
											{item.label}
										</span>
									)}
								</button>
							);

							return (
								<div key={item.id}>
									{isCollapsed ? (
										<Tooltip delayDuration={0}>
											<TooltipTrigger asChild>{itemContent}</TooltipTrigger>
											<TooltipContent side="right">{item.label}</TooltipContent>
										</Tooltip>
									) : (
										itemContent
									)}
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

				{/* Toggle Button */}
				<div className={`p-4 border-t ${isCollapsed ? 'flex justify-center' : 'flex justify-end'}`} style={{ borderColor: 'var(--light-gray)' }}>
					<button
						onClick={toggleCollapse}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
						style={{ color: 'var(--text-secondary)' }}
					>
						{isCollapsed ? <DoubleArrowRightIcon className="w-5 h-5" /> : <DoubleArrowLeftIcon className="w-5 h-5" />}
					</button>
				</div>
			</nav>
		</TooltipProvider>
	);
};

export default SuperAdminSideNav;
