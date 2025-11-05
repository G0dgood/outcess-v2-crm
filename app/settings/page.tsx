'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Roles from '@/components/ui/Roles';
import CompanyDetails from '@/components/ui/CompanyDetails';
import Fields from '@/components/ui/Fields';
import Status from '@/components/ui/Status';
import Permission from '@/components/ui/Permission';

type SettingsTab = 'settings' | 'fields' | 'status' | 'permission' | 'company-details' | 'roles';

const SettingsPage: React.FC = () => {
	const searchParams = useSearchParams();
	const [activeTab, setActiveTab] = useState<SettingsTab | null>(null);

	useEffect(() => {
		const tab = searchParams.get('tab') as SettingsTab;
		if (tab && ['settings', 'fields', 'status', 'permission', 'company-details', 'roles'].includes(tab)) {
			setActiveTab(tab);
		} else {
			// Default to 'fields' if no tab is specified
			setActiveTab('fields');
		}
	}, [searchParams]);

	const renderContent = () => {
		switch (activeTab) {
			case 'roles':
				return <Roles />;
			case 'fields':
				return <Fields />;
			case 'status':
				return <Status />;
			case 'permission':
				return <Permission />;
			case 'company-details':
				return <CompanyDetails />;
			default:
				return <Fields />;
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
		<Suspense fallback={<div>Loading...</div>}>
			<SettingsPage />
		</Suspense>
	);
};

export default SettingsPageWrapper;
