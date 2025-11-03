'use client';

import React, { useRef, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Cross2Icon } from '@radix-ui/react-icons';
import AdminSideNav from './AdminSideNav';

interface AdminMobileSideNavProps {
	isOpen: boolean;
	onClose: () => void;
}

const AdminMobileSideNav: React.FC<AdminMobileSideNavProps> = ({
	isOpen,
	onClose,
}) => {
	const navRef = useRef<HTMLDivElement>(null);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen, onClose]);

	if (!isOpen) return null;

	return (
		<div
			ref={navRef}
			className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-200 z-50 shadow-xl"
		>
			{/* Close Button */}
			<div className="flex items-center justify-end p-4 border-b border-gray-200">
				<button
					onClick={onClose}
					className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
					title="Close menu"
				>
					<Cross2Icon className="w-6 h-6" />
				</button>
			</div>

			{/* Navigation */}
			<AdminSideNav isMobileOpen={isOpen} onMobileClose={onClose} />
		</div>
	);
};

export default AdminMobileSideNav;

