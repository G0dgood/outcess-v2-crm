'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useRouter } from '@bprogress/next/app';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePrivilege, ModuleId } from '@/contexts/PrivilegeContext';
import Icon from './Icon';
import { plusJakartaStyle } from '../Options';
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
	LockClosedIcon,
	QuestionMarkCircledIcon
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

interface SubNavItem {
	id: string;
	label: string;
	icon: string;
	path: string;
	privilege?: { module: string; action: string };
	restrictedToAdmin?: boolean;
}

const DashboardSideNav: React.FC<DashboardSideNavProps> = ({
	activeItem = 'dashboard',
	onItemClick,
	className = '',
	isMobileOpen,
	onMobileClose,
}) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { lineOfBusinessData } = useLineOfBusiness();
	useAuth();
	const { canAccess, isAdmin } = usePrivilege();

	const currentLOB = lineOfBusinessData?.lineOfBusiness;
	const headerLogo = currentLOB?.logo;
	const headerName = currentLOB?.companyName || 'Peoplely';

	const navRef = useRef<HTMLElement>(null);
	const [isSettingsExpanded, setIsSettingsExpanded] = useState(false);
	const [isSupportExpanded, setIsSupportExpanded] = useState(false);
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [settingsMenuPos, setSettingsMenuPos] = useState<{ top: number; left: number } | null>(null);
	const [supportMenuPos, setSupportMenuPos] = useState<{ top: number; left: number } | null>(null);
	const [hasHydrated, setHasHydrated] = useState(false);

	useEffect(() => {
		const stored = localStorage.getItem('dashboard-sidenav-collapsed');
		if (stored) {
			setIsCollapsed(stored === 'true');
		}
	}, []);

	useEffect(() => {
		setHasHydrated(true);
	}, []);

	// Handle click outside to close menus when collapsed
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node) && isCollapsed) {
				if (isSettingsExpanded) setIsSettingsExpanded(false);
				if (isSupportExpanded) setIsSupportExpanded(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isSettingsExpanded, isSupportExpanded, isCollapsed]);

	const toggleCollapse = () => {
		const newState = !isCollapsed;
		setIsCollapsed(newState);
		localStorage.setItem('dashboard-sidenav-collapsed', String(newState));
		if (newState) {
			setIsSettingsExpanded(false);
			setIsSupportExpanded(false);
		}
	};

	// Auto-expand menus based on pathname
	useEffect(() => {
		if (isCollapsed) {
			setIsSettingsExpanded(false);
			setIsSupportExpanded(false);
			return;
		}

		if (pathname?.startsWith('/settings')) {
			setIsSettingsExpanded(true);
		} else {
			setIsSettingsExpanded(false);
		}

		if (pathname?.startsWith('/support')) {
			setIsSupportExpanded(true);
		} else {
			setIsSupportExpanded(false);
		}
	}, [pathname, isCollapsed]);

	if (!hasHydrated) {
		return <DashboardSideNavSkeleton />;
	}

	const settingsSubItems = [
		{ id: 'general-settings-tab', label: 'General', icon: 'settings', path: '/settings?tab=settings' },
		{ id: 'status-tab', label: 'Status', icon: 'id-card', path: '/settings?tab=status' },
		{ id: 'permission-tab', label: 'Permission', icon: 'chart', path: '/settings?tab=permission' },
		{ id: 'company-details-tab', label: 'Company Details', icon: 'settings', path: '/settings?tab=company-details' },
		{ id: 'roles-tab', label: 'Roles', icon: 'book', path: '/settings?tab=roles' },
		{ id: 'supervisors-tab', label: 'Supervisors', icon: 'users', path: '/settings?tab=supervisors' },
		{ id: 'audit-logs-tab', label: 'Audit Logs', icon: 'clock', path: '/settings?tab=audit-logs' },
	];

	const supportSubItems = [
		{ id: 'support-mine', label: 'Support', icon: 'support', path: '/support', privilege: { module: 'support', action: 'view' } },
		{ id: 'support-team', label: 'Team Support', icon: 'users', path: '/support/team', privilege: { module: 'support', action: 'view' } },
		{ id: 'support-all', label: 'All Support', icon: 'support', path: '/support/all', privilege: { module: 'allSupport', action: 'view' } },
	];

	const navItems: NavItem[] = [
		{ id: 'dashboard', label: 'Dashboard', icon: 'grid', path: '/dashboard' },
		{ id: 'customer-book', label: 'Customer Book', icon: 'book', path: '/customer-book' },
		{ id: 'users', label: 'Users', icon: 'users', path: '/users' },
		{ id: 'team-members', label: 'Team Members', icon: 'group', path: '/team-members' },
		{ id: 'sms', label: 'SMS', icon: 'sms', path: '/sms' },
		{ id: 'integrations', label: 'Integrations', icon: 'integrations', path: '/integrations' },
		{ id: 'setup-book', label: 'Setup Book', icon: 'settings-book', path: '/setup-book' },
		{ id: 'report', label: 'Report', icon: 'chart', path: '/report' },
		{ id: 'configuration', label: 'LOB Plan', icon: 'configuration', path: '/configuration' },
		{ id: 'support', label: 'Support', icon: 'support', path: '/support' },
		{ id: 'settings', label: 'Settings', icon: 'settings', path: '/settings' }
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
		'configuration': 'lobPlan',
		'support': 'support',
		'settings': 'systemSetting',
	};

	const subModuleMapping: Record<string, ModuleId> = {
		'general-settings-tab': 'systemSetting',
		'status-tab': 'systemSetting',
		'permission-tab': 'userManagement',
		'company-details-tab': 'systemSetting',
		'roles-tab': 'userManagement',
		'supervisors-tab': 'userManagement',
		'audit-logs-tab': 'systemSetting',
		'support-mine': 'support',
		'support-team': 'teamMemberSupport',
		'support-all': 'allSupport',
	};

	const visibleNavItems: NavItem[] = [];
	let hasRestrictedNav = false;

	navItems.forEach(item => {
		if (item.id === 'pending-request' && !isAdmin) return;
		let isRestricted = false;
		const moduleId = moduleMapping[item.id];
		if (moduleId === 'support') {
			if (!canAccess('support', 'view') && !canAccess('allSupport', 'view')) isRestricted = true;
		} else if (moduleId && !canAccess(moduleId, 'view')) {
			isRestricted = true;
		}
		if (!isRestricted) visibleNavItems.push(item);
		else hasRestrictedNav = true;
	});

	if (visibleNavItems.length === 0 && hasRestrictedNav) {
		visibleNavItems.push({ id: 'access-restricted', label: 'Access Restricted', icon: 'lock', path: '#', isRestricted: true });
	}

	const getVisibleSubItems = (items: SubNavItem[]) => {
		const visible: SubNavItem[] = [];
		items.forEach(subItem => {
			if (subItem.restrictedToAdmin && !isAdmin) return;
			const moduleId = subModuleMapping[subItem.id];
			const hasAccess = moduleId ? canAccess(moduleId, 'view') : true;
			


			if (hasAccess) visible.push(subItem);
		});
		return visible;
	};

	const visibleSettingsSubItems = getVisibleSubItems(settingsSubItems);
	const visibleSupportSubItems = getVisibleSubItems(supportSubItems);

	const handleItemClick = (item: NavItem, e?: React.MouseEvent) => {
		if (item.id === 'settings') {
			e?.stopPropagation();
			setIsSettingsExpanded(!isSettingsExpanded);
			if (isCollapsed && e) {
				const rect = e.currentTarget.getBoundingClientRect();
				setSettingsMenuPos({ top: rect.top, left: rect.right });
			}
			if (!isCollapsed && !isSettingsExpanded && !pathname?.startsWith('/settings')) {
				router.push('/settings?tab=settings');
			}
		} else if (item.id === 'support') {
			e?.stopPropagation();
			setIsSupportExpanded(!isSupportExpanded);
			if (isCollapsed && e) {
				const rect = e.currentTarget.getBoundingClientRect();
				setSupportMenuPos({ top: rect.top, left: rect.right });
			}
			if (!isCollapsed && !isSupportExpanded && !pathname?.startsWith('/support')) {
				router.push('/support');
			}
		} else {
			setIsSettingsExpanded(false);
			setIsSupportExpanded(false);
			if (onMobileClose) onMobileClose();
			if (onItemClick) onItemClick(item.id);
			else router.push(item.path);
		}
	};

	const handleView = (_id: string, path: string) => {
		router.push(path);
		if (onMobileClose) onMobileClose();
	};

	const handleSubItemClick = (path: string) => {
		router.push(path);
		if (onMobileClose) onMobileClose();
	};

	const getIconComponent = (iconType: string) => {
		const iconProps = { className: "w-5 h-5" };
		switch (iconType) {
			case 'grid': return <DashboardIcon {...iconProps} />;
			case 'book': return <FileTextIcon {...iconProps} />;
			case 'users': return <PersonIcon {...iconProps} />;
			case 'settings-book': return <GearIcon {...iconProps} />;
			case 'chart': return <BarChartIcon {...iconProps} />;
			case 'settings': return <GearIcon {...iconProps} />;
			case 'id-card': return <IdCardIcon {...iconProps} />;
			case 'group': return <Group width={20} height={20} strokeColor="currentColor" fillColor="currentColor" />;
			case 'sms': return <ChatBubbleIcon {...iconProps} />;
			case 'integrations': return <Link2Icon {...iconProps} />;
			case 'configuration': return <MixerHorizontalIcon {...iconProps} />;
			case 'clock': return <ClockIcon {...iconProps} />;
			case 'lock': return <LockClosedIcon {...iconProps} />;
			case 'support': return <QuestionMarkCircledIcon {...iconProps} />;
			default: return null;
		}
	};

	const FloatingMenu = ({ items, pos, isOpen, onClose }: { items: SubNavItem[], pos: { top: number; left: number } | null, isOpen: boolean, onClose: () => void }) => {
		if (!isOpen || !isCollapsed || !pos) return null;
		return (
			<div
				className="fixed w-48 bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50"
				style={{ top: pos.top, left: pos.left + 8, backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
			>
				{items.map((subItem) => (
					<button
						key={subItem.id}
						onClick={(e) => { e.stopPropagation(); handleSubItemClick(subItem.path); onClose(); }}
						className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 hover-bg-custom !rounded-none`}
						style={{ color: 'var(--text-secondary)', '--hover-bg': lineOfBusinessData?.secondaryColor || '#6C8B7D' } as React.CSSProperties}
					>
						<div className="shrink-0" style={{ color: 'var(--text-tertiary)' }}>{getIconComponent(subItem.icon)}</div>
						<span className="font-inter font-medium text-[13px]">{subItem.label}</span>
					</button>
				))}
			</div>
		);
	};

	return (
		<TooltipProvider>
			<nav
				ref={navRef}
				id="side-nav"
				className={`dark:bg-gray-900 ${isCollapsed ? 'w-[70px]' : 'w-64'} border-r dark:border-gray-700 ${isMobileOpen ? 'flex' : 'hidden'} md:flex flex-col relative h-full transition-all duration-300 ${className}`}
				style={{ backgroundColor: 'var(--accent-white)', borderColor: 'var(--light-gray)' }}
			>
				<div className="flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
					<div className={`mb-6 flex items-center ${isCollapsed ? 'justify-center' : 'px-4 gap-2'}`}>
						{headerLogo ? (
							<div className="relative h-8 w-auto min-w-[32px]">
								<Image src={headerLogo} alt="Logo" height={32} width={100} className="h-8 w-auto object-contain" unoptimized priority />
							</div>
						) : <Icon name="peoplelyHalf" size="lg" className="dark:inline-block" />}
						{!isCollapsed && <span className="font-semibold text-[18px] md:text-[20px] leading-7 flex items-center text-[#050711]" style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}>{headerName}</span>}
					</div>

					<div className="space-y-2">
						{visibleNavItems.map((item) => {
							const isActive = activeItem === item.id;
							const isSettings = item.id === 'settings';
							const isSupport = item.id === 'support';
							const isExpanded = (isSettings && isSettingsExpanded) || (isSupport && isSupportExpanded);

							const itemContent = (
								<button
									onClick={(e) => handleItemClick(item, e)}
									className={`cursor-pointer w-full flex items-center ${isCollapsed ? 'justify-center px-2' : 'gap-3 px-4'} py-3 transition-all duration-200 !rounded-none ${isActive || isExpanded ? 'text-white' : 'dark:text-gray-300 hover:text-white'} hover-bg-custom`}
									style={{
										backgroundColor: (isActive || isExpanded) ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent',
										color: (isActive || isExpanded) ? 'white' : 'var(--text-secondary)',
										'--hover-bg': lineOfBusinessData?.secondaryColor || '#6C8B7D'
									} as React.CSSProperties}
								>
									<div className={`shrink-0 transition-colors duration-200 ${isActive || isExpanded ? 'text-white' : 'dark:text-gray-400'}`} style={!(isActive || isExpanded) ? { color: 'var(--text-tertiary)' } : {}}>{getIconComponent(item.icon)}</div>
									{!isCollapsed && <span className={`font-inter font-medium text-[10px] md:text-[12px] leading-5 tracking-[-0.5px] transition-colors duration-200 flex-1 text-left ${isActive || isExpanded ? 'text-white' : 'dark:text-gray-300'}`} style={!(isActive || isExpanded) ? { color: 'var(--text-secondary)' } : {}}>{item.label}</span>}
									{!isCollapsed && (isSettings || isSupport) && (
										<div className={`shrink-0 transition-colors duration-200 ${isExpanded ? 'text-white' : 'dark:text-gray-400'}`} style={!isExpanded ? { color: 'var(--text-tertiary)' } : {}}>
											{isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
										</div>
									)}
								</button>
							);

							return (
								<div key={item.id}>
									{isCollapsed ? <Tooltip delayDuration={0}><TooltipTrigger asChild>{itemContent}</TooltipTrigger>
										<TooltipContent side="right">{item.label}</TooltipContent>
									</Tooltip> : itemContent}
									{isExpanded && !isCollapsed && (
										<div className="ml-4 mt-1 space-y-1 border-l-2 dark:border-gray-600 pl-2" style={{ borderColor: 'var(--light-gray)' }}>
											{(isSettings ? visibleSettingsSubItems : visibleSupportSubItems).map((subItem) => {
												const pathTab = subItem.path.split('tab=')[1] || subItem.path.split('view=')[1];
												const currentVal = isSettings ? searchParams?.get('tab') : searchParams?.get('view');
												const isSubActive = isSettings
													? (currentVal === pathTab || (!currentVal && pathTab === 'settings'))
													: (pathname === subItem.path);

												return (
													<button
														key={subItem.id}
														onClick={(e) => { e.stopPropagation(); handleSubItemClick(subItem.path); }}
														className={`cursor-pointer w-full flex items-center gap-3 px-4 py-2 transition-all duration-200 !rounded-none ${isSubActive ? 'text-white bg-opacity-80' : 'dark:text-gray-400 hover:text-white'} hover-bg-custom`}
														style={{ backgroundColor: isSubActive ? lineOfBusinessData?.primaryColor || '#050711' : 'transparent', color: isSubActive ? 'white' : 'var(--text-tertiary)', '--hover-bg': lineOfBusinessData?.secondaryColor || '#6C8B7D' } as React.CSSProperties}
													>
														<div className={`shrink-0 transition-colors duration-200 ${isSubActive ? 'text-white' : 'dark:text-gray-400'}`} style={!isSubActive ? { color: 'var(--text-tertiary)' } : {}}>{getIconComponent(subItem.icon)}</div>
														<span className={`font-inter font-medium text-[13px] leading-5 tracking-[-0.5px] transition-colors duration-200 ${isSubActive ? 'text-white' : 'dark:text-gray-300'}`} style={!isSubActive ? { color: 'var(--text-tertiary)' } : {}}>{subItem.label}</span>
													</button>
												);
											})}
										</div>
									)}
								</div>
							);
						})}
					</div>
					<div className="border-t dark:border-gray-700 my-4" style={{ borderColor: 'var(--light-gray)' }}></div>
				</div>
				<div className={`p-4 border-t ${isCollapsed ? 'flex justify-center' : 'flex justify-end'}`} style={{ borderColor: 'var(--light-gray)' }}>
					<button onClick={toggleCollapse} className="p-2 transition-colors !rounded-none" style={{ color: 'var(--text-secondary)' }}>{isCollapsed ? <DoubleArrowRightIcon className="w-5 h-5" /> : <DoubleArrowLeftIcon className="w-5 h-5" />}</button>
				</div>
			</nav>
			<FloatingMenu items={visibleSettingsSubItems} pos={settingsMenuPos} isOpen={isSettingsExpanded} onClose={() => setIsSettingsExpanded(false)} />
			<FloatingMenu items={visibleSupportSubItems} pos={supportMenuPos} isOpen={isSupportExpanded} onClose={() => setIsSupportExpanded(false)} />
		</TooltipProvider>
	);
};

export default DashboardSideNav;
