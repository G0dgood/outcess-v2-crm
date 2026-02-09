'use client';

import React, { useState, Suspense } from 'react';
import { SetupProvider } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
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
		<div id="page-wrapper" className={isMobileMenuOpen ? 'mobile-nav-open' : ''}>
			<OfflineBanner />
			<DashboardHeader
				companyName={lineOfBusinessData?.companyName || ''}
				onMobileMenuToggle={toggleMobileMenu}
				isMobileMenuOpen={isMobileMenuOpen}
			/>

			{/* Desktop SideNav */}
			<Suspense fallback={null}>
				<DashboardSideNav
					activeItem="configuration"
					isMobileOpen={isMobileMenuOpen}
					onMobileClose={() => setIsMobileMenuOpen(false)}
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
