import React from 'react';
import Button from '@/components/ui/Button';
import Icon from '@/components/ui/Icon';
import { ChatBubbleIcon } from '@radix-ui/react-icons';
import { SMSLog } from '@/store/services/smsApi';

interface SMSMessageModalProps {
	isOpen: boolean;
	sms: SMSLog | null;
	onClose: () => void;
}

const SMSMessageModal: React.FC<SMSMessageModalProps> = ({ isOpen, sms, onClose }) => {
	if (!isOpen || !sms) return null;

	const getStatusColor = (status: SMSLog['status']) => {
		switch (status) {
			case 'delivered':
				return { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', border: 'rgba(34, 197, 94, 0.2)' };
			case 'sent':
				return { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
			case 'pending':
				return { bg: 'rgba(251, 191, 36, 0.1)', text: '#FBBF24', border: 'rgba(251, 191, 36, 0.2)' };
			case 'failed':
				return { bg: 'rgba(239, 68, 68, 0.1)', text: '#EF4444', border: 'rgba(239, 68, 68, 0.2)' };
			default:
				return { bg: 'rgba(156, 163, 175, 0.1)', text: '#9CA3AF', border: 'rgba(156, 163, 175, 0.2)' };
		}
	};

	const getDirectionColor = (direction: SMSLog['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

	return (
		<div
			className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300"
			onClick={onClose}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-2xl mx-4 shadow-lg animate-in fade-in zoom-in duration-200 rounded-[var(--radius)]"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Modal Header */}
				<div
					className="flex justify-between items-center border-b dark:border-gray-700 pb-4 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<div className="flex items-center gap-3">
						<ChatBubbleIcon
							className="w-6 h-6 dark:text-gray-300"
							style={{ color: 'var(--text-primary)' }}
						/>
						<h2
							className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							SMS Message Details
						</h2>
					</div>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-full p-1 h-auto"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close Modal"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>

				{/* Modal Content */}
				<div className="p-6 space-y-6">
					{/* Message Content */}
					<div>
						<label
							className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
							style={{ color: 'var(--text-secondary)' }}
						>
							Message
						</label>
						<div
							className="p-4 dark:bg-gray-700 border dark:border-gray-600 rounded-lg min-h-[120px] whitespace-pre-wrap break-words"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)',
								color: 'var(--text-primary)'
							}}
						>
							{sms.message}
						</div>
					</div>

					{/* SMS Details Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								SMS ID
							</label>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								{sms._id}
							</p>
						</div>
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								Contact Name
							</label>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								{sms.contactName || '-'}
							</p>
						</div>
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								Phone Number
							</label>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								{sms.phoneNumber}
							</p>
						</div>
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								Timestamp
							</label>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								{sms.createdAt}
							</p>
						</div>
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								Direction
							</label>
							<span
								className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
								style={getDirectionColor(sms.direction)}
							>
								{sms.direction === 'inbound' ? 'Inbound' : 'Outbound'}
							</span>
						</div>
						<div>
							<label
								className="block text-[10px] md:text-[12px] font-medium mb-2 dark:text-gray-300"
								style={{ color: 'var(--text-secondary)' }}
							>
								Status
							</label>
							<span
								className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
								style={getStatusColor(sms.status)}
							>
								{sms.status.charAt(0).toUpperCase() + sms.status.slice(1)}
							</span>
						</div>
					</div>
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
						Close
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SMSMessageModal;
