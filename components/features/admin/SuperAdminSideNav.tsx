'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useRouter } from '@bprogress/next/app';
import {
	DashboardIcon,
	BackpackIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
	GearIcon,
} from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { useCampaign } from '@/contexts/CampaignContext';
import { useTheme } from '@/contexts/ThemeContext';
import { plusJakartaStyle } from '@/components/Options';
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
	const { campaignData } = useCampaign();
	const { isDarkMode } = useTheme();
	// const primaryColor = campaignData?.primaryColor || '#050711';
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
		},
		{
			id: 'settings',
			label: 'Account Settings',
			icon: <GearIcon className="w-5 h-5" />,
			path: '/superadmin/settings',
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

	const currentCampaign = campaignData?.campaign;
	const headerLogo = currentCampaign?.logo;
	const headerName = currentCampaign?.companyName || 'Outcess';

	return (
		<TooltipProvider>
			{/* Side Navigation - Desktop Only */}
			<nav
				ref={navRef}
				id={isMobile ? 'side-nav-mobile' : 'side-nav'}
				className={` dark:bg-gray-900 ${isCollapsed ? 'w-[70px]' : 'w-64'} border-r dark:border-gray-700
                    ${isMobile ? 'block' : 'hidden md:flex flex-col'} relative h-full transition-all duration-300
                    ${className}
                `}
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
					<div className={`mb-6 flex items-center ${isCollapsed ? 'justify-center' : 'px-4 gap-2'}`}>
						{headerLogo ? (
							<div className="relative h-8 w-auto min-w-[32px] rounded-[var(--radius)] overflow-hidden">
								<Image src={headerLogo} alt="Logo" height={32} width={100} className="h-8 w-auto object-contain" unoptimized priority />
							</div>
						) : <Icon name="outcessHalf" size="lg" className="dark:inline-block" />}
						{!isCollapsed && <span className="font-semibold text-[18px] md:text-[20px] leading-7 flex items-center text-[#050711]" style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}>{headerName}</span>}
					</div>

					{/* Navigation Items */}
					<div className="space-y-2">
						{navItems.map((item) => {
							const isActive = currentActiveItem === item.id;
							const itemContent = (
								<Button
									variant="ghost"
									size="md"
									fullWidth
									onClick={() => handleItemClick(item)}
									className={`cursor-pointer w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 transition-all duration-200 rounded-[var(--radius)] ${isActive
										? (isDarkMode ? 'text-black' : 'text-white')
										: 'dark:text-gray-300 hover:text-white dark:hover:text-white'
										}`}
									style={{
										backgroundColor: isActive ? campaignData?.primaryColor || '#050711' : 'transparent',
										color: isActive ? (isDarkMode ? '#000000' : 'white') : 'var(--text-secondary)',
										'--hover-bg': campaignData?.secondaryColor || '#6C8B7D'
									} as React.CSSProperties}
									onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
										if (!isActive) {
											e.currentTarget.style.backgroundColor = campaignData?.secondaryColor || '#6C8B7D';
											// Update icon and text colors to white on hover
											const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
											const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
											if (icon) icon.style.color = 'white';
											if (text) text.style.color = 'white';
										}
									}}
									onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
										if (!isActive) {
											e.currentTarget.style.backgroundColor = 'transparent';
											// Reset icon and text colors
											const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
											const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
											if (icon) icon.style.color = 'var(--text-tertiary)';
											if (text) text.style.color = 'var(--text-secondary)';
										}
									}}
									title={item.label}
								>
									<div
										className={`shrink-0 transition-colors duration-200 ${isActive ? (isDarkMode ? 'text-black' : 'text-white') : 'dark:text-gray-400'}`}
										style={!isActive ? { color: 'var(--text-tertiary)' } : {}}
									>
										{item.icon}
									</div>
									{!isCollapsed && (
										<span
											className={`font-inter whitespace-nowrap font-medium text-[10px] md:text-[12px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 flex-1 text-left ${isActive ? (isDarkMode ? 'text-black' : 'text-white') : 'dark:text-gray-300'}`}
											style={!isActive ? { color: 'var(--text-secondary)' } : {}}
										>
											{item.label}
										</span>
									)}
								</Button>
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
					<Button
						variant="ghost"
						size="sm"
						onClick={toggleCollapse}
						className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors h-auto rounded-[var(--radius)]"
						style={{ color: 'var(--text-secondary)' }}
						title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
					>
						{isCollapsed ? <DoubleArrowRightIcon className="w-5 h-5" /> : <DoubleArrowLeftIcon className="w-5 h-5" />}
					</Button>
				</div>
			</nav>
		</TooltipProvider>
	);
};

export default SuperAdminSideNav;
