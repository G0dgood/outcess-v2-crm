'use client';

import React, { useState, Suspense } from 'react';
import { SetupProvider } from '@/contexts/SetupContext';
import DashboardHeader from '@/components/ui/DashboardHeader';
import DashboardSideNav from '@/components/ui/DashboardSideNav';
import MobileSideNav from '@/components/ui/MobileSideNav';
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
		<div id="page-wrapper">
			<DashboardHeader
				onMobileMenuToggle={toggleMobileMenu}
			/>
			<Suspense fallback={null}>
				<DashboardSideNav activeItem="settings" />
			</Suspense>
			<Suspense fallback={null}>
				<MobileSideNav
					isOpen={isMobileMenuOpen}
					onClose={closeMobileMenu}
					activeItem="settings"
				/>
			</Suspense>
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
