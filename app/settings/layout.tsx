'use client';

import React, { useState } from 'react';
import { SetupProvider, useSetup } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
import MobileSideNav from '@/components/ui/MobileSideNav';
import GlobalStickyNotes from '@/components/ui/GlobalStickyNotes';

function LayoutContent({ children }: { children: React.ReactNode }) {
	const { setupData } = useSetup();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<div id="page-wrapper">
			<DashboardHeader
				companyName={setupData.companyName || 'Fairmoney'}
				userName="John Doe"
				userEmail="johndoe@example.com"
				isOnline={true}
				onCompanyChange={(company) => console.log('Company changed:', company)}
				onSettingsClick={() => console.log('Settings clicked')}
				onStatusClick={() => console.log('Status clicked')}
				onEditProfileClick={() => console.log('Edit profile clicked')}
				onLogoutClick={() => {
					console.log('Logout clicked');
				}}
				onMobileMenuToggle={toggleMobileMenu}
			/>
			<DashboardSideNav activeItem="settings" />
			<MobileSideNav
				isOpen={isMobileMenuOpen}
				onClose={closeMobileMenu}
				activeItem="settings"
			/>
			<GlobalStickyNotes />
			<main className="flex-1 overflow-y-auto p-6 md:p-8">
				{children}
			</main>
		</div>
	);
}

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SetupProvider>
			<LayoutContent>{children}</LayoutContent>
		</SetupProvider>
	);
}

