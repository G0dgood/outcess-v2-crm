'use client';

import React, { useEffect, useState } from 'react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	children: React.ReactNode;
	className?: string;
	backdropClassName?: string;
	showCloseButton?: boolean;
	size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
	position?: 'center' | 'right' | 'left';
}

export const Modal: React.FC<ModalProps> = ({
	isOpen,
	onClose,
	title,
	children,
	className = '',
	backdropClassName = '',
	showCloseButton = true,
	size = 'md',
	position = 'center',
}) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	// Handle opening animation
	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			document.body.style.overflow = 'hidden';
			// Trigger animation on next frame
			setTimeout(() => setIsAnimating(true), 10);
		} else {
			// Start closing animation
			setIsAnimating(false);
			// Remove from DOM after animation completes
			const timer = setTimeout(() => {
				setShouldRender(false);
				document.body.style.overflow = 'unset';
			}, 300); // Match transition duration
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	// Close modal when pressing Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape' && isOpen) {
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

	// Size classes
	const getSizeClasses = () => {
		switch (size) {
			case 'sm':
				return 'w-96';
			case 'md':
				return 'w-[500px]';
			case 'lg':
				return 'w-[600px]';
			case 'xl':
				return 'w-[800px]';
			case 'full':
				return 'w-full h-full';
			default:
				return 'w-[500px]';
		}
	};

	// Position classes
	const getPositionClasses = () => {
		switch (position) {
			case 'right':
				return 'top-0 right-0 h-full';
			case 'left':
				return 'top-0 left-0 h-full';
			case 'center':
			default:
				return 'top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
		}
	};

	// Animation classes
	const getAnimationClasses = () => {
		if (!isAnimating) {
			// Closing animation
			switch (position) {
				case 'right':
					return 'translate-x-full';
				case 'left':
					return '-translate-x-full';
				case 'center':
				default:
					return 'scale-95 opacity-0';
			}
		}

		// Opening animation
		switch (position) {
			case 'right':
				return 'translate-x-0';
			case 'left':
				return 'translate-x-0';
			case 'center':
			default:
				return 'scale-100 opacity-100';
		}
	};

	const getBackdropClasses = () => {
		if (!isAnimating) {
			return 'opacity-0';
		}
		return 'opacity-100';
	};

	if (!shouldRender) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-[#0b0d1293]/50 z-40 transition-opacity duration-300 ${getBackdropClasses()} ${backdropClassName}`}
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={`fixed ${getPositionClasses()} ${getSizeClasses()} bg-white dark:bg-gray-800 shadow-xl z-50 transition-all duration-300 ease-in-out ${getAnimationClasses()} ${className}`}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					{(title || showCloseButton) && (
						<div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
							{title && (
								<h2 className="font-inter text-lg font-semibold text-[#050711] dark:text-gray-100">{title}</h2>
							)}
							{showCloseButton && (
								<button
									onClick={onClose}
									className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
								>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
										<path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
									</svg>
								</button>
							)}
						</div>
					)}

					{/* Content */}
					<div className="flex-1 overflow-y-auto">
						{children}
					</div>
				</div>
			</div>
		</>
	);
};

export default Modal;
