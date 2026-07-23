import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmChangeTypeModalProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: () => void;
	dispositionName: string;
}

export const ConfirmChangeTypeModal: React.FC<ConfirmChangeTypeModalProps> = ({
	isOpen,
	onClose,
	onConfirm,
	dispositionName,
}) => {
	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title="Change Field Type"
			size="sm"
		>
			<div className="p-6 text-center">
				<div className="flex justify-center mb-4">
					<div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500">
						<AlertTriangle size={24} />
					</div>
				</div>

				<h3 
					className="text-[14px] md:text-[16px] font-semibold mb-2"
					style={{ color: 'var(--text-primary)' }}
				>
					Warning: Data Loss Risk
				</h3>
				<p 
					className="text-[11px] md:text-[12px] mb-6 leading-relaxed"
					style={{ color: 'var(--text-secondary)' }}
				>
					Changing the field type for <strong>{dispositionName}</strong> may result in the loss of configured options (such as dropdown items) or existing dashboard metrics for this field.
				</p>

				<div className="flex gap-3 justify-end">
					<Button
						variant="outline"
						size="sm"
						onClick={onClose}
					>
						Cancel
					</Button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							onConfirm();
							onClose();
						}}
						className="bg-amber-500 hover:bg-amber-600 border-amber-500 text-white"
					>
						Proceed
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmChangeTypeModal;
