'use client';

import React from 'react';
import SetupPage from './setup-page/page';
import HeaderNavigationPage from './header-navigation/page';
import DashboardPage from './dashboard/page';
import CustomerBookPage from './customer-book/page';
import UserManagementPage from './user-management/page';
import ReviewConfigurationPage from './review-configuration/page';
import { useSetup } from '@/contexts/SetupContext';

export default function Setup() {
	const { currentStep } = useSetup();

	return (
		<div className="w-full">
			{currentStep === 1 && <SetupPage />}
			{currentStep === 2 && <HeaderNavigationPage />}
			{currentStep === 3 && <DashboardPage />}
			{currentStep === 4 && <CustomerBookPage />}
			{currentStep === 5 && <UserManagementPage />}
			{currentStep === 6 && <ReviewConfigurationPage />}
		</div>
	);
}
