"use client";
import React, { useState } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import { useAuth } from "@/contexts/AuthContext";
import SuperAdminMobileSideNav from "@/components/ui/SuperAdminMobileSideNav";
import SuperAdminSideNav from "@/components/ui/SuperAdminSideNav";
import SuperAdminHeader from "@/components/ui/SuperAdminHeader";

function LayoutContent({ children }: { children: React.ReactNode }) {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const { user } = useAuth();

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const closeMobileMenu = () => {
		setIsMobileMenuOpen(false);
	};

	return (
		<div id="page-wrapper">
			<SuperAdminHeader
				userName={user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || ""}
				userEmail={user?.email || ""}
				userAvatar={user?.avatar}
				onMobileMenuToggle={toggleMobileMenu}
			/>

			{/* Desktop Sidebar */}
			<SuperAdminSideNav activeItem="businesses-management" />

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

export default function AdminBusinessesLayout({ children }: { children: React.ReactNode }) {
	return (
		<SetupProvider>
			<LayoutContent>{children}</LayoutContent>
		</SetupProvider>
	);
}
