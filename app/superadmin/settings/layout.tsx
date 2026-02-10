"use client";
import React, { useState } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import SuperAdminMobileSideNav from "@/components/ui/SuperAdminMobileSideNav";
import SuperAdminSideNav from "@/components/ui/SuperAdminSideNav";
import SuperAdminHeader from "@/components/ui/SuperAdminHeader";

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
			<SuperAdminHeader
				onMobileMenuToggle={toggleMobileMenu}
				isMobileMenuOpen={isMobileMenuOpen}
			/>


			{/* Desktop Sidebar */}
			<SuperAdminSideNav 
				activeItem="settings" 
				isMobileOpen={isMobileMenuOpen}
				onMobileClose={() => setIsMobileMenuOpen(false)}
			/>

			{/* Main Content */}
			<main>{children}</main>
		</div>
	);
}

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SetupProvider>
			<LayoutContent>{children}</LayoutContent>
		</SetupProvider>
	);
}

