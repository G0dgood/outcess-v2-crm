import React from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';

interface DeleteRecordModalProps {
	isOpen: boolean;
	recordName: string;
	onClose: () => void;
	onConfirm: () => void;
}

const DeleteRecordModal: React.FC<DeleteRecordModalProps> = ({
	isOpen,
	recordName,
	onClose,
	onConfirm,
}) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
			onClick={onClose}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 shadow-lg"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						Delete Record
					</h2>
					<button
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
					>
						<Icon name="Close_round_light" size="lg" />
					</button>
				</div>

				{/* Modal Content */}
				<div className="p-6">
					<p
						className="text-[10px] md:text-[12px] dark:text-gray-300 mb-6"
						style={{ color: 'var(--text-secondary)' }}
					>
						Are you sure you want to delete the record <strong>{recordName}</strong>? This action cannot be undone.
					</p>
				</div>

				{/* Modal Footer */}
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button
						variant="outline"
						size="md"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="md"
						onClick={onConfirm}
						style={{
							backgroundColor: '#DC2626',
							color: 'white'
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.backgroundColor = '#B91C1C';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.backgroundColor = '#DC2626';
						}}
					>
						Delete
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DeleteRecordModal;
