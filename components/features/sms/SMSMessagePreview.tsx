import React from 'react';
import StatusBadge from '@/components/ui/StatusBadge';
import { SMS } from './SMSMessageModal';
import Button from '@/components/ui/Button';

interface SMSMessagePreviewProps {
	sms: SMS;
	onViewFull: (sms: SMS) => void;
	getDirectionColor: (direction: SMS['direction']) => { bg: string; text: string; border: string };
}

const SMSMessagePreview: React.FC<SMSMessagePreviewProps> = ({
	sms,
	onViewFull,
	getDirectionColor
}) => {
	const directionColors = getDirectionColor(sms.direction);

	return (
		<div
			className="p-4 dark:bg-gray-700 border dark:border-gray-600 rounded-lg transition-all hover:shadow-md grow"
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--light-gray)'
			}}
		>
			{/* SMS Header */}
			<div className="flex justify-between items-start mb-3">
				<div className="flex-1">
					<div className="flex items-center gap-2 mb-2">
						<span
							className="text-[8px] md:text-[10px] font-medium dark:text-gray-300"
							style={{ color: 'var(--text-secondary)' }}
						>
							{sms.id}
						</span>
						<span
							className="inline-flex items-center px-2 py-0.5 rounded-full text-[8px] md:text-[10px] font-medium"
							style={{
								backgroundColor: directionColors.bg,
								color: directionColors.text,
								border: `1px solid ${directionColors.border}`
							}}
						>
							{sms.direction === 'inbound' ? 'Inbound' : 'Outbound'}
						</span>
						<StatusBadge status={sms.status} />
					</div>
					{sms.contactName && (
						<p
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100 mb-1"
							style={{ color: 'var(--text-primary)' }}
						>
							{sms.contactName}
						</p>
					)}
					<p
						className="text-[8px] md:text-[10px] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						{sms.phoneNumber}
					</p>
				</div>
			</div>

			{/* Message Preview */}
			<div
				className="mt-3 p-3 dark:bg-gray-800 border dark:border-gray-600 rounded text-[10px] md:text-[12px] dark:text-gray-200 line-clamp-3 italic"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)',
					color: 'var(--text-primary)'
				}}
			>
				"{sms.message}"
			</div>

			{/* Timestamp */}
			<div className="flex justify-between items-center mt-3">
				<p
					className="text-[8px] md:text-[10px] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					{sms.timestamp}
				</p>
			</div>

			{/* View Full Message Button */}
			<Button
				variant="outline"
				size="sm"
				fullWidth
				onClick={() => onViewFull(sms)}
				className="mt-3 text-[8px] md:text-[10px] py-2 px-3 rounded border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600 font-medium !justify-center"
				style={{
					borderColor: 'var(--light-gray)',
					color: 'var(--text-secondary)',
					backgroundColor: 'transparent'
				}}
				onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
					e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
				}}
				onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
					e.currentTarget.style.backgroundColor = 'transparent';
				}}
				title="View Full SMS Details"
			>
				View Full Message
			</Button>
		</div>
	);
};

export default SMSMessagePreview;
