'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import {
	DashboardIcon,
	FileTextIcon,
	PersonIcon,
	GearIcon,
	BarChartIcon,
	Cross2Icon,
	IdCardIcon,
	ChevronRightIcon,
	ChevronDownIcon,
	ChatBubbleIcon,
	Link2Icon,
	MixerHorizontalIcon,
	ClockIcon,
	LockClosedIcon
} from '@radix-ui/react-icons';
import Group from '@/components/setupIcon/Group';
import Icon from '@/components/ui/Icon';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { usePrivilege, ModuleId } from '@/contexts/PrivilegeContext';

interface MobileSideNavProps {
	activeItem?: string;
	onItemClick?: (item: string) => void;
	isOpen: boolean;
	onClose: () => void;
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

const MobileSideNav: React.FC<MobileSideNavProps> = ({
	activeItem = 'dashboard',
	onItemClick,
	isOpen,
	onClose,
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { lineOfBusinessData } = useLineOfBusiness();
	const { isAdmin, canAccess } = usePrivilege();
	const navRef = useRef<HTMLDivElement>(null);
	const [shouldRender, setShouldRender] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);
	const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);

	const settingsSubItems = [
		{ id: 'fields-tab', label: 'Fields', icon: 'users', path: '/settings?tab=fields' },
		{ id: 'status-tab', label: 'Status', icon: 'id-card', path: '/settings?tab=status' },
		{ id: 'permission-tab', label: 'Permission', icon: 'chart', path: '/settings?tab=permission' },
		{ id: 'company-details-tab', label: 'Company Details', icon: 'settings', path: '/settings?tab=company-details' },
		{ id: 'roles-tab', label: 'Roles', icon: 'book', path: '/settings?tab=roles' },
	];

	// Auto-expand Settings menu if we're on the settings page
	useEffect(() => {
		if (pathname?.startsWith('/settings')) {
			setIsSettingsExpanded(true);
		} else {
			setIsSettingsExpanded(false);
		}
	}, [pathname]);

	const navItems: NavItem[] = [
		{
			id: 'dashboard',
			label: 'Dashboard',
			icon: 'grid',
			path: '/dashboard',
		},
		{
			id: 'pending-request',
			label: 'Pending Request',
			icon: 'clock',
			path: '/superadmin/pending-request',
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
		'fields-tab': 'systemSetting',
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
			// Close mobile menu when item is clicked
			onClose();
		}
	};

	const handleSubItemClick = (subItem: typeof settingsSubItems[0]) => {
		router.push(subItem.path);
		if (onItemClick) {
			onItemClick('settings');
		}
		// Close mobile menu when sub-item is clicked
		onClose();
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

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				isOpen &&
				navRef.current &&
				!navRef.current.contains(event.target as Node)
			) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			// Prevent body scroll when menu is open
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	// Close menu on escape key
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	// Close menu on full screen (desktop) sizes
	useEffect(() => {
		const handleResize = () => {
			// Close menu when screen width reaches desktop breakpoint (768px)
			if (window.innerWidth >= 768 && isOpen) {
				onClose();
			}
		};

		// Check on mount and on resize
		handleResize();
		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [isOpen, onClose]);

	// Handle enter/exit animations
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			// Trigger animation after a tiny delay to ensure DOM is ready
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			// Start exit animation
			setIsAnimating(false);
			// Remove from DOM after animation completes (300ms)
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!shouldRender) return null;

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
		<>
			{/* Backdrop Overlay */}
			<div
				className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'
					}`}
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Mobile Side Navigation */}
			<nav
				ref={navRef}
				className={`
					fixed top-0 left-0 h-full w-64 dark:bg-gray-900 border-r dark:border-gray-700 z-50
					transform transition-transform duration-300 ease-in-out
					${isAnimating ? 'translate-x-0' : '-translate-x-full'}
				`}
				role="navigation"
				aria-label="Mobile navigation"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="flex items-center justify-between p-4 pb-2">
					<div className="flex items-center gap-2">
						<Icon name="peoplelyHalf" size="xl" />
						<span className="font-inter font-semibold text-[18px] leading-[22px]" style={{ color: 'var(--text-primary)' }}>Peoplely</span>
					</div>
					<button
						onClick={onClose}
						className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
						aria-label="Close menu"
					>
						<Cross2Icon className="w-5 h-5" />
					</button>
				</div>

				<div className="p-4 pt-0">

					{/* Navigation Items */}
					<div className="space-y-2">
						{visibleNavItems.map((item) => {
							const isActive = activeItem === item.id;
							const isSettings = item.id === 'settings';

							if (item.isRestricted) {
								return (
									<div key={item.id}>
										<div
											className="w-full flex items-center gap-3 px-4 py-3 cursor-not-allowed transition-all duration-200"
										>
											<div className="shrink-0 text-gray-400 dark:text-gray-600">
												<LockClosedIcon className="w-5 h-5" />
											</div>
											<span className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px] text-gray-400 dark:text-gray-600 flex-1 text-left">
												Access Restricted
											</span>
										</div>
									</div>
								);
							}

							return (
								<div key={item.id}>
									<button
										onClick={(e) => handleItemClick(item, e)}
										className="cursor-pointer w-full flex items-center gap-3 px-4 py-3 transition-all duration-200"
										style={{
											backgroundColor: (isActive || (isSettings && isSettingsExpanded)) ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent',
											color: (isActive || (isSettings && isSettingsExpanded)) ? 'white' : 'var(--text-secondary)'
										}}
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
												if (icon) icon.style.color = '';
												if (text) text.style.color = '';
											}
										}}
									>
										<div
											className="shrink-0 transition-colors duration-200"
											style={isActive || (isSettings && isSettingsExpanded)
												? { color: 'white' }
												: { color: 'var(--text-tertiary)' }}
										>
											{getIconComponent(item.icon)}
										</div>
										<span
											className="font-inter font-medium text-[14px] leading-[20px] tracking-[-0.5px] transition-colors duration-200 flex-1 text-left"
											style={isActive || (isSettings && isSettingsExpanded)
												? { color: 'white' }
												: { color: 'var(--text-secondary)' }}
										>
											{item.label}
										</span>
										{isSettings && (
											<div
												className="shrink-0 transition-colors duration-200"
												style={isSettingsExpanded ? { color: 'white' } : { color: 'var(--text-tertiary)' }}
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
															<span className="font-inter font-medium text-[13px] leading-5 tracking-[-0.5px] text-gray-400 dark:text-gray-600">
																Access Restricted
															</span>
														</div>
													);
												}

												// Get the tab value from the URL query parameter
												const currentTab = searchParams?.get('tab');
												// Extract tab name from subItem.path (e.g., '/settings?tab=fields' -> 'fields')
												const subItemTab = subItem.path.split('tab=')[1];
												const isSubActive = currentTab === subItemTab || (!currentTab && subItemTab === 'fields');
												return (
													<button
														key={subItem.id}
														onClick={() => handleSubItemClick(subItem)}
														className="cursor-pointer w-full flex items-center gap-3 px-4 py-2 transition-all duration-200"
														style={{
															backgroundColor: isSubActive ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent',
															color: isSubActive ? 'white' : 'var(--text-tertiary)'
														}}
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
															className="sub-icon shrink-0 transition-colors duration-200"
															style={isSubActive ? { color: 'white' } : { color: 'var(--text-tertiary)' }}
														>
															{getIconComponent(subItem.icon)}
														</div>
														<span
															className="sub-text font-inter font-medium text-[13px] leading-5 tracking-[-0.5px] transition-colors duration-200"
															style={isSubActive ? { color: 'white' } : { color: 'var(--text-tertiary)' }}
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
					<div className="border-t border-gray-200 dark:border-gray-700 my-4"></div>
				</div>
			</nav>
		</>
	);
};

export default MobileSideNav;
