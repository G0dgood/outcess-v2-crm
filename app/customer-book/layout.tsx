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
				onNotificationsClick={() => console.log('Notifications clicked')}
				onSettingsClick={() => console.log('Settings clicked')}
				onStatusClick={() => console.log('Status clicked')}
				onEditProfileClick={() => console.log('Edit profile clicked')}
				onLogoutClick={() => {
					console.log('Logout clicked');
					// Add logout logic here
				}}
				onMobileMenuToggle={toggleMobileMenu}
			/>

			{/* Desktop SideNav */}
			<DashboardSideNav 
				activeItem="customer-book"
				isMobileOpen={false}
				onMobileClose={() => {}}
			/>

			{/* Mobile SideNav */}
			<MobileSideNav
				activeItem="customer-book"
				isOpen={isMobileMenuOpen}
				onClose={closeMobileMenu}
			/>
			<main>{children}</main>
			<GlobalStickyNotes />
		</div>
	);
}

function Layout({ children }: { children: React.ReactNode }) {
	return (
		<SetupProvider>
			<LayoutContent>{children}</LayoutContent>
		</SetupProvider>
	);
}

export default Layout;
