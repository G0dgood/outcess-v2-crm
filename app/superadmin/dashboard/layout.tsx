"use client";
import React, { useState } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import { useAuth } from "@/contexts/AuthContext";
import SuperAdminSideNav from "@/components/ui/SuperAdminSideNav";
import SuperAdminMobileSideNav from "@/components/ui/SuperAdminMobileSideNav";
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
				userName={user?.name || `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || "Admin User"}
				userEmail={user?.email || "admin@example.com"}
				userAvatar={user?.avatar}
				isOnline={true}
				onEditProfileClick={() => console.log('Edit profile clicked')}
				onMobileMenuToggle={toggleMobileMenu}
			/>


			{/* Desktop Sidebar */}
			<SuperAdminSideNav activeItem="dashboard" />

			{/* Mobile Sidebar */}
			{isMobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div className="fixed inset-0 bg-black/10 bg-opacity-50" onClick={closeMobileMenu}></div>
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
