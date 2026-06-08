'use client';

import React from 'react';
import { GearIcon, TrashIcon } from '@radix-ui/react-icons';
import moment from 'moment';
import Button from '@/components/ui/Button';
import { NoRecordFound, SVGLoaderFetch } from '@/components/Options';
import { SMSConfig } from '@/store/services/smsApi';

interface SMSConfigTableProps {
	configsList: SMSConfig[];
	isLoading: boolean;
	onEdit: (config: SMSConfig) => void;
	onDelete: (id: string) => void;
}

const SMSConfigTable: React.FC<SMSConfigTableProps> = ({
	configsList,
	isLoading,
	onEdit,
	onDelete,
}) => {
	return (
		<div
			className="dark:bg-gray-800 border dark:border-gray-700 overflow-hidden rounded-[var(--radius)]"
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y dark:divide-gray-700" style={{ borderColor: 'var(--light-gray)' }}>
					<thead
						className="dark:bg-gray-700 border-b dark:border-gray-700"
						style={{
							backgroundColor: 'var(--bg-primary)',
							borderColor: 'var(--light-gray)'
						}}
					>
						<tr>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Name</th>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Provider</th>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Sender ID</th>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Assigned To</th>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Scope</th>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Date Created</th>
							<th className="px-6 py-3 text-left text-[8px] md:text-[10px] font-medium uppercase tracking-wider" style={{ color: 'var(--text-primary)' }}>Action</th>
						</tr>
					</thead>
					<tbody className="divide-y dark:divide-gray-700">
						{isLoading ? (
							<SVGLoaderFetch colSpan={7} text="Loading configurations..." />
						) : configsList.length === 0 ? (
							<NoRecordFound colSpan={7} />
						) : (
							configsList.map((cfg) => (
								<tr
									key={cfg._id}
									className="dark:hover:bg-gray-700/50 transition-colors border-b dark:border-gray-700 last:border-0"
									style={{ borderColor: 'var(--light-gray)' }}
								>
									<td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-gray-800 dark:text-gray-100">{cfg.name}</td>
									<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">{cfg.provider}</td>
									<td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600 dark:text-gray-300">{cfg.senderId}</td>
									<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-200">{cfg.assignedName}</td>
									<td className="px-6 py-4 whitespace-nowrap text-xs capitalize text-gray-500">
										<span className={`px-2 py-0.5 rounded-full text-[9px] font-medium ${cfg.assignType === 'campaign'
											? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
											: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
											}`}>
											{cfg.assignType}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600 dark:text-gray-300">
										{cfg.createdAt ? moment(cfg.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-xs">
										<div className="flex items-center gap-2">
											<Button
												variant="ghost"
												size="sm"
												onClick={() => onEdit(cfg)}
												className="p-2 transition-colors h-auto rounded-full"
												title="Edit"
											>
												<GearIcon width={16} height={16} style={{ color: 'var(--text-secondary)' }} />
											</Button>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => cfg._id && onDelete(cfg._id)}
												className="p-2 hover:bg-red-50 rounded-full transition-colors dark:hover:bg-red-900/20 h-auto"
												title="Delete"
											>
												<TrashIcon width={16} height={16} className="text-red-500" />
											</Button>
										</div>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default SMSConfigTable;
