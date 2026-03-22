"use client";
import React, { useState } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import { useAuth } from "@/contexts/AuthContext";
import SuperAdminSideNav from "@/components/features/admin/SuperAdminSideNav";
import SuperAdminHeader from "@/components/features/admin/SuperAdminHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user } = useAuth();

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};


	return (
		<div id="page-wrapper" className={isMobileMenuOpen ? 'mobile-nav-open' : ''}>
			<SuperAdminHeader
				userName={user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
				userEmail={user?.email}
				userAvatar={user?.avatar}
				onMobileMenuToggle={toggleMobileMenu}
				isMobileMenuOpen={isMobileMenuOpen}
			/>


			{/* Desktop Sidebar */}
			<SuperAdminSideNav 
				activeItem="dashboard" 
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
