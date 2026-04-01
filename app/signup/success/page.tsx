'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';

export default function SignupSuccessPage() {
	const router = useRouter();
	const { isDarkMode } = useTheme();
	const primaryColor = '#050711';

	return (
		<div className="login-container h-screen flex items-center justify-center">
			{/* Success Content */}
			<div className="w-full max-w-md flex items-center justify-center p-6">
				<div className="login-form-container text-center py-12 w-full">
					<div className="flex justify-center mb-8">
						<div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
							<svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M7 13L10 16L17 9" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
								<circle cx="12" cy="12" r="10" stroke="#10B981" strokeWidth="2" />
							</svg>
						</div>
					</div>

					<div className="login-header mb-8">
						<h1 className="welcome-title font-lato not-italic mb-4" style={{ color: isDarkMode ? '#F3F4F6' : primaryColor }}>
							Account Created Successfully!
						</h1>
						<p className="font-lato not-italic font-normal text-base leading-[150%] text-[#6D7280] dark:text-gray-400 max-w-sm mx-auto">
							Welcome to Peoplely CRM. Your account and company profile have been set up. You can now log in to start managing your business.
						</p>
					</div>

					<div className="space-y-4 pt-4">
						<Button
							onClick={() => router.push('/login')}
							size="sm"
							fullWidth
							className="flex items-center justify-center gap-2 px-6 !py-6 text-[14px] md:text-[16px] font-semibold transition-all rounded-[var(--radius)] h-12"
						>
							Go to Login
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
