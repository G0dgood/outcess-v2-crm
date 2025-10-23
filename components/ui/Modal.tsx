'use client';

import React, { useEffect } from 'react';

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
	// Close modal when pressing Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
			document.body.style.overflow = 'hidden';
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
			document.body.style.overflow = 'unset';
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
		if (!isOpen) return '';

		switch (position) {
			case 'right':
				return 'translate-x-0';
			case 'left':
				return 'translate-x-0';
			case 'center':
			default:
				return 'translate-x-0 translate-y-0 scale-100';
		}
	};

	const getInitialAnimationClasses = () => {
		switch (position) {
			case 'right':
				return 'translate-x-full';
			case 'left':
				return '-translate-x-full';
			case 'center':
			default:
				return 'translate-x-0 translate-y-0 scale-95';
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className={`fixed inset-0 bg-[#0b0d1293]/50 z-40 transition-opacity duration-300 ${backdropClassName}`}
				onClick={onClose}
			/>

			{/* Modal */}
			<div
				className={`fixed ${getPositionClasses()} ${getSizeClasses()} bg-white shadow-xl z-50 transform transition-all duration-300 ${isOpen ? getAnimationClasses() : getInitialAnimationClasses()
					} ${className}`}
			>
				<div className="flex flex-col h-full">
					{/* Header */}
					{(title || showCloseButton) && (
						<div className="flex items-center justify-between p-6 border-b border-gray-200">
							{title && (
								<h2 className="font-inter text-lg font-semibold text-[#050711]">{title}</h2>
							)}
							{showCloseButton && (
								<button
									onClick={onClose}
									className="text-gray-400 hover:text-gray-600 transition-colors"
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
