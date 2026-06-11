'use client';

import React from 'react';
import Modal from './Modal';
import Button from './Button';

interface PasswordHelpModalProps {
	isOpen: boolean;
	onClose: () => void;
}

const PasswordHelpModal: React.FC<PasswordHelpModalProps> = ({
	isOpen,
	onClose
}) => {
	const primaryColor = '#050711';

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Password Requirements"
			size="sm"
		>
			<div className="p-6">
				<ul className="space-y-2 text-[12px] dark:text-gray-300" style={{ color: 'var(--text-secondary)' }}>
					<li className="flex items-start gap-2">
						<span style={{ color: primaryColor }}>•</span>
						<span>At least 8 characters</span>
					</li>
					<li className="flex items-start gap-2">
						<span style={{ color: primaryColor }}>•</span>
						<span>Mix of letters and numbers</span>
					</li>
					<li className="flex items-start gap-2">
						<span style={{ color: primaryColor }}>•</span>
						<span>Special characters recommended</span>
					</li>
				</ul>
				<div className="mt-6 flex justify-end">
					<Button onClick={onClose} size="md">
						Got it
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default PasswordHelpModal;
