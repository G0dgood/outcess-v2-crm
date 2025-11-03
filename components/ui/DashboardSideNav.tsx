'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useSetup } from '@/contexts/SetupContext';
import {
	DashboardIcon,
	FileTextIcon,
	PersonIcon,
	GearIcon,
	BarChartIcon,
	IdCardIcon,
	ChevronRightIcon,
	ChevronDownIcon
} from '@radix-ui/react-icons';

interface DashboardSideNavProps {
	activeItem?: string;
	onItemClick?: (item: string) => void;
	className?: string;
	isMobileOpen?: boolean;
	onMobileClose?: () => void;
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
	isMobileOpen = false,
	onMobileClose,
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { setupData } = useSetup();
	const navRef = useRef<HTMLElement>(null);
	const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

	// Auto-expand Settings menu if we're on the settings page
	useEffect(() => {
		if (pathname?.startsWith('/settings')) {
			setIsSettingsExpanded(true);
		} else {
			setIsSettingsExpanded(false);
		}
	}, [pathname]);

	const settingsSubItems = [
		{ id: 'fields-tab', label: 'Fields', icon: 'users', path: '/settings?tab=fields' },
		{ id: 'status-tab', label: 'Status', icon: 'id-card', path: '/settings?tab=status' },
		{ id: 'permission-tab', label: 'Permission', icon: 'chart', path: '/settings?tab=permission' },
		{ id: 'company-details-tab', label: 'Company Details', icon: 'settings', path: '/settings?tab=company-details' },
		{ id: 'roles-tab', label: 'Roles', icon: 'book', path: '/settings?tab=roles' },
	];

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
		{
			id: 'settings',
			label: 'Settings',
			icon: 'settings',
			path: '/settings',
		},
	];

	const handleItemClick = (item: NavItem, e?: React.MouseEvent) => {
		if (item.id === 'settings') {
			e?.stopPropagation();
			setIsSettingsExpanded(!isSettingsExpanded);
			// If expanding and not already on settings page, navigate to fields by default
			if (!isSettingsExpanded && !pathname?.startsWith('/settings')) {
				router.push('/settings?tab=fields');
			}
		} else {
			// Collapse settings menu when clicking other items
			setIsSettingsExpanded(false);
			if (onItemClick) {
				onItemClick(item.id);
			} else {
				router.push(item.path);
			}
		}
	};

	const handleSubItemClick = (subItem: typeof settingsSubItems[0]) => {
		router.push(subItem.path);
		if (onItemClick) {
			onItemClick('settings');
		}
	};

	const getIconComponent = (iconType: string) => {
		const iconProps = { className: "w-5 h-5" };

		switch (iconType) {
			case 'grid':
				return <DashboardIcon {...iconProps} />;
			case 'book':
				return <FileTextIcon {...iconProps} />;
			case 'users':
				return <PersonIcon {...iconProps} />;
			case 'settings-book':
				return <GearIcon {...iconProps} />;
			case 'chart':
				return <BarChartIcon {...iconProps} />;
			case 'settings':
				return <GearIcon {...iconProps} />;
			case 'id-card':
				return <IdCardIcon {...iconProps} />;
			default:
				return null;
		}
	};

	return (
		<>
			{/* Side Navigation - Desktop Only */}
			<nav
				ref={navRef}
				id="side-nav"
				className={`
					bg-white w-64 border-r border-gray-200
					hidden md:block relative h-auto
					${className}
				`}
			>
				<div className="p-4">
					{/* Navigation Items */}
					<div className="space-y-2">
						{navItems.map((item) => {
							const isActive = activeItem === item.id;
							const isSettings = item.id === 'settings';

							return (
								<div key={item.id}>
									<button
										onClick={(e) => handleItemClick(item, e)}
										className={`cursor-pointer w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 ${isActive || (isSettings && isSettingsExpanded)
											? 'text-white'
											: 'text-gray-700 hover:text-white'
											}`}
										style={{
											backgroundColor: (isActive || (isSettings && isSettingsExpanded)) ? setupData.primaryColor || '#050711' : 'transparent',
											'--hover-bg': setupData.secondaryColor || '#6C8B7D'
										} as React.CSSProperties}
										onMouseEnter={(e) => {
											if (!isActive && !(isSettings && isSettingsExpanded)) {
												e.currentTarget.style.backgroundColor = setupData.secondaryColor || '#6C8B7D';
												// Update icon and text colors to white on hover
												const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
												const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
												if (icon) icon.style.color = 'white';
												if (text) text.style.color = 'white';
											}
										}}
										onMouseLeave={(e) => {
											if (!isActive && !(isSettings && isSettingsExpanded)) {
												e.currentTarget.style.backgroundColor = 'transparent';
												// Reset icon and text colors
												const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
												const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
												if (icon) icon.style.color = '';
												if (text) text.style.color = '';
											}
										}}
									>
										<div className={`shrink-0 transition-colors duration-200 ${isActive || (isSettings && isSettingsExpanded) ? 'text-white' : 'text-gray-600'
											}`}>
											{getIconComponent(item.icon)}
										</div>
										<span className={`font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px] text-[#3A4050]  transition-colors duration-200 flex-1 text-left ${isActive || (isSettings && isSettingsExpanded) ? 'text-white' : 'text-gray-700'
											}`}>
											{item.label}
										</span>
										{isSettings && (
											<div className={`shrink-0 transition-colors duration-200 ${isSettingsExpanded ? 'text-white' : 'text-gray-600'
												}`}>
												{isSettingsExpanded ? (
													<ChevronDownIcon className="w-4 h-4" />
												) : (
													<ChevronRightIcon className="w-4 h-4" />
												)}
											</div>
										)}
									</button>

									{/* Settings Sub-menu */}
									{isSettings && isSettingsExpanded && (
										<div className="ml-4 mt-1 space-y-1 border-l-2 border-gray-300 pl-2">
											{settingsSubItems.map((subItem) => {
												// Get the tab value from the URL query parameter
												const currentTab = searchParams?.get('tab');
												// Extract tab name from subItem.path (e.g., '/settings?tab=fields' -> 'fields')
												const subItemTab = subItem.path.split('tab=')[1];
												const isSubActive = currentTab === subItemTab || (!currentTab && subItemTab === 'fields');
												return (
													<button
														key={subItem.id}
														onClick={() => handleSubItemClick(subItem)}
														className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 ${isSubActive
															? 'text-white bg-opacity-80'
															: 'text-gray-600 hover:text-white'
															}`}
														style={{
															backgroundColor: isSubActive ? setupData.primaryColor || '#050711' : 'transparent',
														} as React.CSSProperties}
														onMouseEnter={(e) => {
															if (!isSubActive) {
																e.currentTarget.style.backgroundColor = setupData.secondaryColor || '#6C8B7D';
																const icon = e.currentTarget.querySelector('.sub-icon') as HTMLElement;
																const text = e.currentTarget.querySelector('.sub-text') as HTMLElement;
																if (icon) icon.style.color = 'white';
																if (text) text.style.color = 'white';
															}
														}}
														onMouseLeave={(e) => {
															if (!isSubActive) {
																e.currentTarget.style.backgroundColor = 'transparent';
																const icon = e.currentTarget.querySelector('.sub-icon') as HTMLElement;
																const text = e.currentTarget.querySelector('.sub-text') as HTMLElement;
																if (icon) icon.style.color = '';
																if (text) text.style.color = '';
															}
														}}
													>
														<div className={`sub-icon shrink-0 transition-colors duration-200 ${isSubActive ? 'text-white' : 'text-gray-500'
															}`}>
															{getIconComponent(subItem.icon)}
														</div>
														<span className={`sub-text font-inter font-medium text-[13px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 ${isSubActive ? 'text-white' : 'text-gray-600'
															}`}>
															{subItem.label}
														</span>
													</button>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>

					{/* Separator */}
					<div className="border-t border-gray-200 my-4"></div>
				</div>
			</nav>
		</>
	);
};

export default DashboardSideNav;
