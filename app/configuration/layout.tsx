'use client';

import React, { useState, Suspense } from 'react';
import { SetupProvider } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
import GlobalStickyNotes from '@/components/ui/GlobalStickyNotes';
import OfflineBanner from '@/components/ui/OfflineBanner';
import { useCampaign } from '@/contexts/CampaignContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
	const { campaignData } = useCampaign();
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	return (
		<div id="page-wrapper" className={isMobileMenuOpen ? 'mobile-nav-open' : ''}>
			<OfflineBanner />
			<DashboardHeader
				companyName={campaignData?.companyName || ''}
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
