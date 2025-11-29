"use client";
import React, { useState } from "react";
import { SetupProvider } from "@/contexts/SetupContext";
import AdminHeader from "@/components/ui/AdminHeader";
import AdminSideNav from "@/components/ui/AdminSideNav";
import AdminMobileSideNav from "@/components/ui/AdminMobileSideNav";

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
			<AdminHeader
				userName="Admin User"
				userEmail="admin@example.com"
				isOnline={true}
				onEditProfileClick={() => console.log('Edit profile clicked')}
				onMobileMenuToggle={toggleMobileMenu}
			/>


			{/* Desktop Sidebar */}
			<AdminSideNav activeItem="dashboard" />

			{/* Mobile Sidebar */}
			{isMobileMenuOpen && (
				<div className="lg:hidden fixed inset-0 z-50">
					<div className="fixed inset-0 bg-black bg-opacity-50" onClick={closeMobileMenu}></div>
					<AdminMobileSideNav isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
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
