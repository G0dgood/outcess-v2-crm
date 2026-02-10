'use client';

import React, { useEffect } from 'react';
import SetupPage from './setup-page/page';
import HeaderNavigationPage from './header-navigation/page';
import DashboardPage from './dashboard/page';
import CustomerBookPage from './customer-book/page';
import ReviewConfigurationPage from './review-configuration/page';
import { useSetup } from '@/contexts/SetupContext';
import { useLazyGetUserByIdQuery } from '@/store/services/authApi';
import { useUserInfo } from '@/contexts/UserInfoContext';

export default function Setup() {
	const { currentStep } = useSetup();
	const { user, updateUser } = useUserInfo();
	const [triggerGetUser] = useLazyGetUserByIdQuery();

	const userId = user?.id || (user as { _id?: string } | null)?._id;

	useEffect(() => {
		const fetchUserData = async () => {
			if (userId) {
				try {
					const response = await triggerGetUser(userId).unwrap();
					if (response?.user) {
						const normalizedUser = {
							...response.user,
							id: response.user.id || response.user._id
						};
						updateUser(normalizedUser);
						localStorage.setItem('peoplely-user', JSON.stringify(normalizedUser));
					}
				} catch (error) {
					console.error('Failed to fetch user data:', error);
				}
			}
		};

		fetchUserData();
	}, [userId, triggerGetUser, updateUser]);

	return (
		<div className="w-full">
			{currentStep === 1 && <SetupPage />}
			{currentStep === 2 && <HeaderNavigationPage />}
			{currentStep === 3 && <DashboardPage />}
			{currentStep === 4 && <CustomerBookPage />}
			{currentStep === 5 && <ReviewConfigurationPage />}
		</div>
	);
}
