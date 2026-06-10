'use client';

import React, { useEffect } from 'react';
import SetupPage from './setup-page/page';
import DashboardPage from './dashboard/page';
import CustomerBookPage from './customer-book/page';
import ReviewConfigurationPage from './review-configuration/page';
import { useSetup } from '@/contexts/SetupContext';
import { useLazyGetUserByIdQuery } from '@/store/services/authApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import { User } from '@/store/slices/authSlice';

export default function Setup() {
	const { currentStep } = useSetup();
	const { user, updateUser } = useUserInfo();
	const [triggerGetUser] = useLazyGetUserByIdQuery();

	const userId = React.useMemo(() => {
		return user?.id || user?._id;
	}, [user]);

	useEffect(() => {
		const fetchUserData = async () => {
			if (userId) {
				try {
					const response = await triggerGetUser(userId).unwrap();
					if (response?.user) {
						const rawUser = response.user as Record<string, any>;
						const normalizedUser: User = {
							...response.user,
							id: rawUser.id || rawUser._id || ''
						};
						updateUser(normalizedUser);
						localStorage.setItem('outcess-user', JSON.stringify(normalizedUser));
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
			{currentStep === 2 && <DashboardPage />}
			{currentStep === 3 && <CustomerBookPage />}
			{currentStep === 4 && <ReviewConfigurationPage />}
		</div>
	);
}
