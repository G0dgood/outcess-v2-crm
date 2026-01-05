'use client';

import React, { useRef, useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { usePrivilege, ModuleId } from '@/contexts/PrivilegeContext';
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
	Link2Icon,
	MixerHorizontalIcon,
	DoubleArrowLeftIcon,
	DoubleArrowRightIcon,
	ClockIcon,
	LockClosedIcon
} from '@radix-ui/react-icons';
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/Tooltip";
import Group from '@/components/setupIcon/Group';
import DashboardSideNavSkeleton from '@/components/skeletons/DashboardSideNavSkeleton';

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
	isRestricted?: boolean;
}

interface SettingsSubItem {
	id: string;
	label: string;
	icon: string;
	path: string;
	isRestricted?: boolean;
}

const DashboardSideNav: React.FC<DashboardSideNavProps> = ({
	activeItem = 'dashboard',
	onItemClick,
	className = '',
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { lineOfBusinessData, isLoading: isLobLoading } = useLineOfBusiness();
	const { canAccess, isLoading: isPrivilegeLoading, isAdmin } = usePrivilege();
	const navRef = useRef<HTMLElement>(null);
	const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [settingsMenuPos, setSettingsMenuPos] = useState<{ top: number; left: number } | null>(null);

	useEffect(() => {
		const stored = localStorage.getItem('dashboard-sidenav-collapsed');
		if (stored) {
			setIsCollapsed(stored === 'true');
		}
	}, []);

	// Handle click outside to close settings menu when collapsed
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				navRef.current &&
				!navRef.current.contains(event.target as Node) &&
				isSettingsExpanded &&
				isCollapsed
			) {
				setIsSettingsExpanded(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isSettingsExpanded, isCollapsed]);

	const toggleCollapse = () => {
		const newState = !isCollapsed;
		setIsCollapsed(newState);
		localStorage.setItem('dashboard-sidenav-collapsed', String(newState));
		if (newState) {
			setIsSettingsExpanded(false);
		}
	};

	// Auto-expand Settings menu if we're on the settings page
	useEffect(() => {
		if (pathname?.startsWith('/settings') && !isCollapsed) {
			setIsSettingsExpanded(true);
		} else {
			setIsSettingsExpanded(false);
		}
	}, [pathname, isCollapsed]);

	if (isLobLoading || isPrivilegeLoading) {
		return <DashboardSideNavSkeleton />;
	}

	const settingsSubItems = [
		{
			id: 'general-settings-tab',
			label: 'General',
			icon: 'settings',
			path: '/settings?tab=settings'
		},
		// {
		// 	id: 'fields-tab',
		// 	label: 'Fields',
		// 	icon: 'users',
		// 	path: '/settings?tab=fields'
		// },
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
			id: 'configuration',
			label: 'Configuration',
			icon: 'configuration',
			path: '/configuration',
		},
		{
			id: 'pending-request',
			label: 'Pending Request',
			icon: 'clock',
			path: '/pending-request',
		},
		{
			id: 'settings',
			label: 'Settings',
			icon: 'settings',
			path: '/settings',
		},
	];

	const moduleMapping: Record<string, ModuleId> = {
		'dashboard': 'dashboard',
		'customer-book': 'customerBook',
		'users': 'userManagement',
		'team-members': 'teamMembers',
		'sms': 'customerSMS',
		'integrations': 'systemSetting',
		'setup-book': 'setupBook',
		'report': 'report',
		'configuration': 'systemSetting',
		'settings': 'systemSetting',
	};

	const subModuleMapping: Record<string, ModuleId> = {
		'general-settings-tab': 'systemSetting',
		'status-tab': 'systemSetting',
		'permission-tab': 'userManagement',
		'company-details-tab': 'systemSetting',
		'roles-tab': 'userManagement',
	};

	const visibleNavItems: NavItem[] = [];
	let hasRestrictedNav = false;

	navItems.forEach(item => {
		if (item.id === 'pending-request' && !isAdmin) return;

		let isRestricted = false;
		const moduleId = moduleMapping[item.id];
		if (moduleId && !canAccess(moduleId, 'view')) isRestricted = true;

		if (!isRestricted) {
			visibleNavItems.push(item);
		} else {
			hasRestrictedNav = true;
		}
	});

	if (visibleNavItems.length === 0 && hasRestrictedNav) {
		visibleNavItems.push({
			id: 'access-restricted',
			label: 'Access Restricted',
			icon: 'lock',
			path: '#',
			isRestricted: true
		});
	}

	const visibleSettingsSubItems: SettingsSubItem[] = [];
	let hasRestrictedSettings = false;

	settingsSubItems.forEach(subItem => {
		const moduleId = subModuleMapping[subItem.id];
		const hasAccess = moduleId ? canAccess(moduleId, 'view') : true;
		if (hasAccess) {
			visibleSettingsSubItems.push(subItem);
		} else {
			hasRestrictedSettings = true;
		}
	});

	if (visibleSettingsSubItems.length === 0 && hasRestrictedSettings) {
		visibleSettingsSubItems.push({
			id: 'access-restricted-settings',
			label: 'Access Restricted',
			icon: 'lock',
			path: '#',
			isRestricted: true
		});
	}

	const handleItemClick = (item: NavItem, e?: React.MouseEvent) => {
		if (item.id === 'settings') {
			e?.stopPropagation();
			setIsSettingsExpanded(!isSettingsExpanded);

			if (isCollapsed && e) {
				const rect = e.currentTarget.getBoundingClientRect();
				setSettingsMenuPos({ top: rect.top, left: rect.right });
			}

			// If expanding and not already on settings page, navigate to settings by default
			// Only in expanded mode
			if (!isCollapsed && !isSettingsExpanded && !pathname?.startsWith('/settings')) {
				router.push('/settings?tab=settings');
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
			case 'configuration':
				return <MixerHorizontalIcon {...iconProps} />;
			case 'clock':
				return <ClockIcon {...iconProps} />;
			case 'lock':
				return <LockClosedIcon {...iconProps} />;
			default:
				return null;
		}
	};

	// Render floating settings menu using Portal if available, otherwise fixed positioning at the end of component
	const FloatingSettingsMenu = () => {
		if (!isSettingsExpanded || !isCollapsed || !settingsMenuPos) return null;

		const visibleSettingsSubItems: SettingsSubItem[] = [];
		let hasRestrictedSettings = false;

		settingsSubItems.forEach(subItem => {
			const moduleId = subModuleMapping[subItem.id];
			const hasAccess = moduleId ? canAccess(moduleId, 'view') : true;
			if (hasAccess) {
				visibleSettingsSubItems.push(subItem);
			} else {
				hasRestrictedSettings = true;
			}
		});

		if (visibleSettingsSubItems.length === 0 && hasRestrictedSettings) {
			visibleSettingsSubItems.push({
				id: 'access-restricted-settings',
				label: 'Access Restricted',
				icon: 'lock',
				path: '#',
				isRestricted: true
			});
		}

		return (
			<div
				className="fixed w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
				style={{
					top: settingsMenuPos.top,
					left: settingsMenuPos.left + 8, // Add some spacing
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				{visibleSettingsSubItems.map((subItem) => {
					if (subItem.isRestricted) {
						return (
							<div
								key={subItem.id}
								className="w-full flex items-center gap-3 px-4 py-2 cursor-not-allowed"
							>
								<div className="shrink-0 text-gray-400 dark:text-gray-600">
									<LockClosedIcon className="w-4 h-4" />
								</div>
								<span className="font-inter font-medium text-[13px] text-gray-400 dark:text-gray-600">
									Access Restricted
								</span>
							</div>
						);
					}

					const currentTab = searchParams?.get('tab');
					const subItemTab = subItem.path.split('tab=')[1];
					const isSubActive = currentTab === subItemTab || (!currentTab && subItemTab === 'settings');
					return (
						<button
							key={subItem.id}
							onClick={(e) => {
								e.stopPropagation();
								handleSubItemClick(subItem);
								setIsSettingsExpanded(false);
							}}
							className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 ${isSubActive
								? 'font-medium'
								: ''
								}`}
							style={{
								color: isSubActive ? 'var(--text-primary)' : 'var(--text-secondary)',
							}}
						>
							<div className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>
								{getIconComponent(subItem.icon)}
							</div>
							<span className="font-inter font-medium text-[13px]">
								{subItem.label}
							</span>
						</button>
					);
				})}
			</div>
		);
	};

	return (
		<TooltipProvider>
			{/* Side Navigation - Desktop Only */}
			<nav
				ref={navRef}
				id="side-nav"
				className={`
					dark:bg-gray-900 ${isCollapsed ? 'w-[70px]' : 'w-64'} border-r dark:border-gray-700
					hidden md:flex flex-col relative h-full transition-all duration-300
					${className}
				`}
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
					{/* Navigation Items */}
					<div className="space-y-2">
						{visibleNavItems.map((item) => {
							const isActive = activeItem === item.id;
							const isSettings = item.id === 'settings';

							if (item.isRestricted) {
								const restrictedContent = (
									<div
										className={`w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 cursor-not-allowed transition-all duration-200`}
									>
										<div className="shrink-0 text-gray-400 dark:text-gray-600">
											<LockClosedIcon className="w-5 h-5" />
										</div>
										{!isCollapsed && (
											<span className="font-inter font-medium text-[14px] leading-5 tracking-[-0.5px] text-gray-400 dark:text-gray-600 flex-1 text-left">
												Access Restricted
											</span>
										)}
									</div>
								);

								return (
									<div key={item.id}>
										{isCollapsed ? (
											<Tooltip delayDuration={0}>
												<TooltipTrigger asChild>{restrictedContent}</TooltipTrigger>
												<TooltipContent side="right">Access Restricted</TooltipContent>
											</Tooltip>
										) : (
											restrictedContent
										)}
									</div>
								);
							}

							const itemContent = (
								<button
									onClick={(e) => handleItemClick(item, e)}
									className={`cursor-pointer w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 transition-all duration-200 ${isActive || (isSettings && isSettingsExpanded)
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
											const icon = e.currentTarget.querySelector('.shrink-0') as HTMLElement;
											const text = e.currentTarget.querySelector('.font-medium') as HTMLElement;
											if (icon) icon.style.color = 'white';
											if (text) text.style.color = 'white';
										}
									}}
									onMouseLeave={(e) => {
										if (!isActive && !(isSettings && isSettingsExpanded)) {
											e.currentTarget.style.backgroundColor = 'transparent';
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
									{!isCollapsed && (
										<span
											className={`font-inter font-medium text-[14px] leading-5 tracking-[-0.5px] transition-colors duration-200 flex-1 text-left ${isActive || (isSettings && isSettingsExpanded) ? 'text-white' : 'dark:text-gray-300'}`}
											style={!(isActive || (isSettings && isSettingsExpanded)) ? { color: 'var(--text-secondary)' } : {}}
										>
											{item.label}
										</span>
									)}
									{!isCollapsed && isSettings && (
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

									{/* Settings Sub-menu */}
									{isSettings && isSettingsExpanded && !isCollapsed && (
										<div
											className="ml-4 mt-1 space-y-1 border-l-2 dark:border-gray-600 pl-2"
											style={{ borderColor: 'var(--light-gray)' }}
										>
											{visibleSettingsSubItems.map((subItem) => {
												if (subItem.isRestricted) {
													return (
														<div
															key={subItem.id}
															className="w-full flex items-center gap-3 px-4 py-2 cursor-not-allowed"
														>
															<div className="shrink-0 text-gray-400 dark:text-gray-600">
																<LockClosedIcon className="w-4 h-4" />
															</div>
															<span className="font-inter font-medium text-[13px] text-gray-400 dark:text-gray-600">
																Access Restricted
															</span>
														</div>
													);
												}

												const currentTab = searchParams?.get('tab');
												const subItemTab = subItem.path.split('tab=')[1];
												const isSubActive = currentTab === subItemTab || (!currentTab && subItemTab === 'settings');
												return (
													<button
														key={subItem.id}
														onClick={() => handleSubItemClick(subItem)}
														className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 transition-all duration-200  ${isSubActive
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
															className={`sub-text font-inter font-medium text-[13px] leading-5 tracking-[-0.5px] transition-colors duration-200 ${isSubActive ? 'text-white' : 'dark:text-gray-300'}`}
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
			<FloatingSettingsMenu />
		</TooltipProvider>
	);
};

export default DashboardSideNav;
