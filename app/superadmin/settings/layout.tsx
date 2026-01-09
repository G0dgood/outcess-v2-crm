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
		<div id="page-wrapper">
			<SuperAdminHeader
				onMobileMenuToggle={toggleMobileMenu}
			/>


			{/* Desktop Sidebar */}
			<SuperAdminSideNav activeItem="settings" />

			{/* Mobile Sidebar */}
			{isMobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
					<SuperAdminMobileSideNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
				</div>
			)}

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

