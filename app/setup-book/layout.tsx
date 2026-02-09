'use client';

import React, { useState, Suspense } from 'react';
import { SetupProvider } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
import GlobalStickyNotes from '@/components/ui/GlobalStickyNotes';

function LayoutContent({ children }: { children: React.ReactNode }) { 
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<div id="page-wrapper" className={isMobileMenuOpen ? 'mobile-nav-open' : ''}>
			<DashboardHeader 
				userIsOnline={true} 
				onMobileMenuToggle={toggleMobileMenu}
				isMobileMenuOpen={isMobileMenuOpen}
			/>

			{/* Desktop SideNav */}
			<Suspense fallback={null}>
				<DashboardSideNav
					activeItem="setup-book"
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
