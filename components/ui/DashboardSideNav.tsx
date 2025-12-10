'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

import {
	DashboardIcon,
	FileTextIcon,
	PersonIcon,
	GearIcon,
	BarChartIcon,
	IdCardIcon,
	ChevronRightIcon,
	ChevronDownIcon,
	ChatBubbleIcon,
	Link2Icon
} from '@radix-ui/react-icons';
import Group from '@/components/setupIcon/Group';

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
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { lineOfBusinessData } = useLineOfBusiness();
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
		{
			id: 'fields-tab',
			label: 'Fields',
			icon: 'users',
			path: '/settings?tab=fields'
		},
		{
			id: 'status-tab',
			label: 'Status',
			icon: 'id-card',
			path: '/settings?tab=status'
		},
		{
			id: 'permission-tab',
			label: 'Permission',
			icon: 'chart',
			path: '/settings?tab=permission'
		},
		{
			id: 'company-details-tab',
			label: 'Company Details',
			icon: 'settings',
			path: '/settings?tab=company-details'
		},
		{
			id: 'roles-tab',
			label: 'Roles',
			icon: 'book',
			path: '/settings?tab=roles'
		},
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
			id: 'team-members',
			label: 'Team Members',
			icon: 'group',
			path: '/team-members',
		},
		{
			id: 'sms',
			label: 'SMS',
			icon: 'sms',
			path: '/sms',
		},
		{
			id: 'integrations',
			label: 'Integrations',
			icon: 'integrations',
			path: '/integrations',
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
			case 'group':
				return <Group width={20} height={20} strokeColor="currentColor" fillColor="currentColor" />;
			case 'sms':
				return <ChatBubbleIcon {...iconProps} />;
			case 'integrations':
				return <Link2Icon {...iconProps} />;
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
					dark:bg-gray-900 w-64 border-r dark:border-gray-700
					hidden md:block relative h-auto transition-colors duration-300
					${className}
				`}
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
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
											: 'dark:text-gray-300 hover:text-white'
											}`}
										style={{
											backgroundColor: (isActive || (isSettings && isSettingsExpanded)) ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent',
											color: (isActive || (isSettings && isSettingsExpanded)) ? 'white' : 'var(--text-secondary)',
											'--hover-bg': lineOfBusinessData?.secondaryColor || '#6C8B7D'
										} as React.CSSProperties}
										onMouseEnter={(e) => {
											if (!isActive && !(isSettings && isSettingsExpanded)) {
												e.currentTarget.style.backgroundColor = lineOfBusinessData?.secondaryColor || '#6C8B7D';
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
												if (icon) icon.style.color = 'var(--text-tertiary)';
												if (text) text.style.color = 'var(--text-secondary)';
											}
										}}
									>
										<div
											className={`shrink-0 transition-colors duration-200 ${isActive || (isSettings && isSettingsExpanded) ? 'text-white' : 'dark:text-gray-400'}`}
											style={!(isActive || (isSettings && isSettingsExpanded)) ? { color: 'var(--text-tertiary)' } : {}}
										>
											{getIconComponent(item.icon)}
										</div>
										<span
											className={`font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 flex-1 text-left ${isActive || (isSettings && isSettingsExpanded) ? 'text-white' : 'dark:text-gray-300'}`}
											style={!(isActive || (isSettings && isSettingsExpanded)) ? { color: 'var(--text-secondary)' } : {}}
										>
											{item.label}
										</span>
										{isSettings && (
											<div
												className={`shrink-0 transition-colors duration-200 ${isSettingsExpanded ? 'text-white' : 'dark:text-gray-400'}`}
												style={!isSettingsExpanded ? { color: 'var(--text-tertiary)' } : {}}
											>
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
										<div
											className="ml-4 mt-1 space-y-1 border-l-2 dark:border-gray-600 pl-2"
											style={{ borderColor: 'var(--light-gray)' }}
										>
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
															: 'dark:text-gray-400 hover:text-white'
															}`}
														style={{
															backgroundColor: isSubActive ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent',
															color: isSubActive ? 'white' : 'var(--text-tertiary)',
														} as React.CSSProperties}
														onMouseEnter={(e) => {
															if (!isSubActive) {
																e.currentTarget.style.backgroundColor = lineOfBusinessData?.secondaryColor || '#6C8B7D';
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
																if (icon) icon.style.color = 'var(--text-tertiary)';
																if (text) text.style.color = 'var(--text-tertiary)';
															}
														}}
													>
														<div
															className={`sub-icon shrink-0 transition-colors duration-200 ${isSubActive ? 'text-white' : 'dark:text-gray-400'}`}
															style={!isSubActive ? { color: 'var(--text-tertiary)' } : {}}
														>
															{getIconComponent(subItem.icon)}
														</div>
														<span
															className={`sub-text font-inter font-medium text-[13px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 ${isSubActive ? 'text-white' : 'dark:text-gray-300'}`}
															style={!isSubActive ? { color: 'var(--text-tertiary)' } : {}}
														>
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
					<div
						className="border-t dark:border-gray-700 my-4"
						style={{ borderColor: 'var(--light-gray)' }}
					></div>
				</div>
			</nav>
		</>
	);
};

export default DashboardSideNav;
