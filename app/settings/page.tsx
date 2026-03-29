'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Roles from '@/components/features/role/Roles';
import Supervisors from '@/components/ui/Supervisors';
import GeneralSettings from '@/components/features/settings/GeneralSettings';
import CompanyDetails from '@/components/ui/CompanyDetails';
import Status from '@/components/ui/Status';
import Permission from '@/components/ui/Permission';
import AuditLogs from '@/components/ui/AuditLogs';
import { usePrivilege, ModuleId } from '@/contexts/PrivilegeContext';

type SettingsTab = 'settings' | 'fields' | 'status' | 'permission' | 'company-details' | 'roles' | 'supervisors' | 'audit-logs';

const subModuleMapping: Record<string, ModuleId> = {
	'settings': 'systemSetting',
	'status': 'status',
	'permission': 'permissions',
	'company-details': 'systemSetting',
	'roles': 'roles',
	'supervisors': 'userManagement',
	'audit-logs': 'systemSetting',
};

const SettingsPage: React.FC = () => {
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);
	const { canAccess } = usePrivilege();

	useEffect(() => {
		const tab = searchParams.get('tab') as SettingsTab;
		if (tab && ['settings', 'fields', 'status', 'permission', 'company-details', 'roles', 'supervisors', 'audit-logs'].includes(tab)) {
			setActiveTab(tab);
		} else {
			// Default to 'settings' if no tab is specified or invalid tab
			setActiveTab('settings');
		}
	}, [searchParams]);

	const renderContent = () => {
		if (!activeTab) return <Status />;

		const moduleId = subModuleMapping[activeTab];
		if (moduleId && !canAccess(moduleId, 'view')) {
			return (
				<div className="flex items-center justify-center h-full">
					<p className="text-gray-500">You do not have permission to view this section.</p>
				</div>
			);
		}

		switch (activeTab) {
			case 'settings':
				return <GeneralSettings />;
			case 'roles':
				return <Roles />;
			case 'supervisors':
				return <Supervisors />;
			case 'status':
				return <Status />;
			case 'permission':
				return <Permission />;
			case 'company-details':
				return <CompanyDetails />;
			case 'audit-logs':
				return <AuditLogs />;
			default:
				return <Status />;
		}
	};

	return (
		<div className="w-full h-full">
			{renderContent()}
		</div>
	);
};

const SettingsPageWrapper = () => {
	return (
		<Suspense fallback={<div className="flex items-center justify-center h-full">Loading settings...</div>}>
			<SettingsPage />
		</Suspense>
	);
};

export default SettingsPageWrapper;
