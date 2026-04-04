import React from 'react';
import { X, ChevronRight } from 'lucide-react';
import { RowsIcon } from '@radix-ui/react-icons';
import Button from './Button';

interface Bucket {
	id: string;
	name: string;
	color: string;
	description?: string;
}

interface SelectBucketModalProps {
	isOpen: boolean;
	onClose: () => void;
	buckets: Bucket[];
	selectedBucketId: string | null;
	onSelect: (bucketId: string) => void;
	onNavigateToDashboard: () => void;
	getFieldCount?: (bucketId: string) => number;
}

export const SelectBucketModal: React.FC<SelectBucketModalProps> = ({
	isOpen,
	onClose,
	buckets,
	selectedBucketId,
	onSelect,
	onNavigateToDashboard,
	getFieldCount,
}) => {
	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
			{/* Backdrop */}
			<div 
				className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
				onClick={onClose} 
			/>
			
			{/* Modal Container */}
			<div 
				className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border dark:border-gray-800 animate-in fade-in zoom-in duration-200"
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div 
					className="p-6 border-b dark:border-gray-800 flex items-center justify-between"
				>
					<div>
						<h2 
							className="text-xl font-bold dark:text-white" 
							style={{ color: 'var(--text-primary)' }}
						>
							Select a Bucket
						</h2>
						<p 
							className="text-sm dark:text-gray-400" 
							style={{ color: 'var(--text-tertiary)' }}
						>
							Choose a bucket to configure its custom fields
						</p>
					</div>
					<Button 
						variant="ghost" 
						size="sm" 
						onClick={onClose} 
						className="p-2 h-auto rounded-full"
						aria-label="Close"
					>
						<X size={20} />
					</Button>
				</div>

				{/* Content */}
				<div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{buckets.length === 0 ? (
						<div className="col-span-full py-12 flex flex-col items-center justify-center gap-4">
							<p className="text-gray-500">No buckets found. Please create buckets in the Dashboard step first.</p>
							<Button variant="outline" onClick={onNavigateToDashboard}>Go to Dashboard</Button>
						</div>
					) : (
						buckets.map((bucket) => (
							<div
								key={bucket.id}
								onClick={() => onSelect(bucket.id)}
								className="group relative flex flex-col p-6 rounded-2xl border dark:border-gray-800 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:bg-gray-800"
								style={{
									backgroundColor: selectedBucketId === bucket.id ? 'var(--bg-primary)' : 'var(--accent-white)',
									borderColor: selectedBucketId === bucket.id ? bucket.color : 'var(--light-gray)',
									borderWidth: selectedBucketId === bucket.id ? '2px' : '1px'
								}}
							>
								<div
									className="w-12 h-12 rounded-xl mb-4 flex items-center justify-center text-white transition-all group-hover:rotate-12"
									style={{ backgroundColor: bucket.color }}
								>
									<RowsIcon className="w-6 h-6" />
								</div>
								<h3 
									className="font-bold text-lg mb-2 dark:text-white" 
									style={{ color: 'var(--text-primary)' }}
								>
									{bucket.name}
								</h3>
								<p 
									className="text-xs dark:text-gray-400 line-clamp-2 mb-4" 
									style={{ color: 'var(--text-tertiary)' }}
								>
									{bucket.description || 'Configurable fields for customers in this bucket.'}
								</p>
								<div className="mt-auto flex items-center justify-between">
									<span className="text-[10px] font-semibold px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full dark:text-gray-300">
										{getFieldCount ? `${getFieldCount(bucket.id)} Fields` : 'Configurable'}
									</span>
									<ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform" />
								</div>
							</div>
						))
					)}
				</div>

				{/* Footer */}
				<div 
					className="p-6 border-t dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end"
				>
					<Button variant="outline" onClick={onClose}>
						Cancel
					</Button>
				</div>
			</div>
		</div>
	);
};

export default SelectBucketModal;
