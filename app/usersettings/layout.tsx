'use client';

import React, { useState, Suspense } from 'react';
import { SetupProvider, useSetup } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
import MobileSideNav from '@/components/ui/MobileSideNav';
import GlobalStickyNotes from '@/components/ui/GlobalStickyNotes';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
	const { lineOfBusinessData } = useLineOfBusiness();
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
				companyName={lineOfBusinessData?.companyName || ''}
				userName="John Doe"
				userEmail="johndoe@example.com"
				userIsOnline={true}
				onCompanyChange={(company) => console.log('Company changed:', company)}
				onSettingsClick={() => console.log('Settings clicked')}
				onStatusClick={() => console.log('Status clicked')}
				onEditProfileClick={() => console.log('Edit profile clicked')}
				onMobileMenuToggle={toggleMobileMenu}
			/>

			{/* Desktop SideNav */}
			<Suspense fallback={null}>
				<DashboardSideNav
					activeItem="customer-book"
					isMobileOpen={false}
					onMobileClose={() => { }}
				/>
			</Suspense>

			{/* Mobile SideNav */}
			<Suspense fallback={null}>
				<MobileSideNav
					activeItem="customer-book"
					isOpen={isMobileMenuOpen}
					onClose={closeMobileMenu}
				/>
			</Suspense>
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
