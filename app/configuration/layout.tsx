'use client';

import React, { useState, Suspense } from 'react';
import { SetupProvider } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
import MobileSideNav from '@/components/ui/MobileSideNav';
import GlobalStickyNotes from '@/components/ui/GlobalStickyNotes';
import OfflineBanner from '@/components/ui/OfflineBanner';
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
			<OfflineBanner />
			<DashboardHeader
				companyName={lineOfBusinessData?.companyName || ''}
				onMobileMenuToggle={toggleMobileMenu}
			/>

			{/* Desktop SideNav */}
			<Suspense fallback={null}>
				<DashboardSideNav
					activeItem="configuration"
					isMobileOpen={false}
					onMobileClose={() => { }}
				/>
			</Suspense>

			{/* Mobile SideNav */}
			<Suspense fallback={null}>
				<MobileSideNav
					activeItem="configuration"
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
