'use client';

import React, { useState, useEffect } from 'react';
import { ChatBubbleIcon, Cross2Icon } from '@radix-ui/react-icons';
import SMSMessagePreview from '@/components/features/sms/SMSMessagePreview';
import { SMSLog } from '@/store/services/smsApi';

interface SelectedSMSDrawerProps {
	isOpen: boolean;
	selectedSMSList: SMSLog[];
	onClose: () => void;
	onViewFull: (sms: SMSLog) => void;
}

const SelectedSMSDrawer: React.FC<SelectedSMSDrawerProps> = ({
	isOpen,
	selectedSMSList,
	onClose,
	onViewFull,
}) => {
	const [isAnimating, setIsAnimating] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			const timer = setTimeout(() => setIsAnimating(true), 10);
			return () => clearTimeout(timer);
		} else {
			setIsAnimating(false);
			const timer = setTimeout(() => setShouldRender(false), 300);
			return () => clearTimeout(timer);
		}
	}, [isOpen]);

	if (!shouldRender) return null;

	return (
		<div
			className={`fixed top-0 right-0 h-full w-full max-w-md dark:bg-gray-800 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${isAnimating ? 'translate-x-0' : 'translate-x-full'}`}
			style={{ backgroundColor: 'var(--accent-white)' }}
		>
			{/* Drawer Header */}
			<div
				className="flex justify-between items-center border-b dark:border-gray-700 p-6"
				style={{ borderColor: 'var(--light-gray)' }}
			>
				<div className="flex items-center gap-3">
					<ChatBubbleIcon
						className="w-5 h-5 dark:text-gray-300"
						style={{ color: 'var(--text-primary)' }}
					/>
					<h2
						className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Selected Messages ({selectedSMSList.length})
					</h2>
				</div>
				<button
					onClick={onClose}
					className="p-2 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700 transition-colors rounded-full"
					style={{ color: 'var(--text-tertiary)' }}
				>
					<Cross2Icon className="w-5 h-5" />
				</button>
			</div>

			{/* Drawer Content */}
			<div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
				<div className="space-y-4">
					{selectedSMSList.map((sms) => (
						<SMSMessagePreview
							key={sms._id}
							sms={sms}
							onViewFull={() => onViewFull(sms)}
						/>
					))}
				</div>
			</div>
		</div>
	);
};

export default SelectedSMSDrawer;
