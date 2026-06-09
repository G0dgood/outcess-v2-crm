import React from 'react';
import moment from 'moment';
import StatusBadge from '@/components/ui/StatusBadge';
import { SMSLog } from '@/store/services/smsApi';
import Button from '@/components/ui/Button';

interface SMSMessagePreviewProps {
	sms: SMSLog;
	onViewFull: (sms: SMSLog) => void;
}

const SMSMessagePreview: React.FC<SMSMessagePreviewProps> = ({
	sms,
	onViewFull,
}) => {
	const getDirectionColor = (direction: SMSLog['direction']) => {
		return direction === 'inbound'
			? { bg: 'rgba(139, 92, 246, 0.1)', text: '#8B5CF6', border: 'rgba(139, 92, 246, 0.2)' }
			: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', border: 'rgba(59, 130, 246, 0.2)' };
	};

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
							{sms._id}
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
				&quot;{sms.message}&quot;
			</div>

			{/* Timestamp */}
			<div className="flex justify-between items-center mt-3">
				<p
					className="text-[8px] md:text-[10px] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					{moment(sms.createdAt).fromNow()}
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
			>
				View Full Details
			</Button>
		</div>
	);
};

export default SMSMessagePreview;
