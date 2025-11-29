'use client';

import React, { useRef, useEffect, useState } from 'react';
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
	const [shouldRender, setShouldRender] = useState(false);
	const [isAnimating, setIsAnimating] = useState(false);

	// Close menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'hidden';
		} else {
			document.body.style.overflow = 'unset';
		}

		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
			document.body.style.overflow = 'unset';
		};
	}, [isOpen, onClose]);

	// Close on escape
	useEffect(() => {
		const handleEscape = (event: KeyboardEvent) => {
			if (event.key === 'Escape' && isOpen) {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	// Handle enter/exit animations
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			setIsAnimating(false);
			const timer = setTimeout(() => {
				setShouldRender(false);
			}, 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!shouldRender) return null;

	return (
		<>
			<div
				className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${isAnimating ? 'opacity-100' : 'opacity-0'}`}
				onClick={onClose}
				aria-hidden="true"
			/>

			<nav
				ref={navRef}
				className={`
					fixed top-0 left-0 h-full w-64 dark:bg-gray-900 border-r dark:border-gray-700 z-50
					transform transition-transform duration-300 ease-in-out
					${isAnimating ? 'translate-x-0' : '-translate-x-full'}
				`}
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				{/* Close Button */}
				<div
					className="flex items-center justify-end p-4 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<button
						onClick={onClose}
						className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
						title="Close menu"
					>
						<Cross2Icon className="w-6 h-6" />
					</button>
				</div>
				{/* Navigation */}
				<AdminSideNav isMobileOpen={isOpen} onMobileClose={onClose} />
			</nav>
		</>
	);
};

export default AdminMobileSideNav;

