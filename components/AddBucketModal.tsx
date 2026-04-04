import React from 'react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Icon from '@/components/ui/Icon';

interface AddBucketModalProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	bucketForm: {
		name: string;
		description: string;
		color: string;
	};
	setBucketForm: React.Dispatch<React.SetStateAction<{
		name: string;
		description: string;
		color: string;
	}>>;
	onSave: () => void;
}

const AddBucketModal: React.FC<AddBucketModalProps> = ({
	isOpen,
	onClose,
	title = "Add New Bucket",
	bucketForm,
	setBucketForm,
	onSave,
}) => {
	if (!isOpen) return null;

	return (
		<div
			className="fixed inset-0 bg-[#0b0d1293]/50 dark:bg-black/50 flex items-center justify-center z-50"
			onClick={(e) => {
				if (e.target === e.currentTarget) {
					onClose();
				}
			}}
		>
			<div
				className="dark:bg-gray-800 w-full max-w-md mx-4 rounded-[var(--radius)] overflow-hidden"
				style={{ backgroundColor: 'var(--accent-white)' }}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="flex justify-between items-center p-6 border-b dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{title}
					</h2>
					<Button
						variant="ghost"
						size="sm"
						onClick={onClose}
						className="p-1 h-auto rounded-full"
						style={{ color: 'var(--text-tertiary)' }}
						onMouseEnter={(e) => {
							e.currentTarget.style.color = 'var(--text-secondary)';
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.color = 'var(--text-tertiary)';
						}}
						title="Close"
					>
						<Icon name="Close_round_light" size="lg" />
					</Button>
				</div>
				<div className="p-6 space-y-4">
					<Input
						label="Bucket Name"
						placeholder="Enter bucket name (e.g., Sales, Support)"
						value={bucketForm.name}
						onChange={(value) => setBucketForm(prev => ({ ...prev, name: value }))}
						type="text"
					/>
					<div className="space-y-1.5">
						<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
							Description (Optional)
						</label>
						<textarea
							className="w-full p-3 text-[12px] rounded-[var(--radius)] border dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px]"
							style={{ 
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)',
								color: 'var(--text-primary)'
							}}
							placeholder="Describe the purpose of this bucket"
							value={bucketForm.description}
							onChange={(e) => setBucketForm(prev => ({ ...prev, description: e.target.value }))}
						/>
					</div>
					<div className="space-y-1.5">
						<label className="text-[10px] md:text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
							Bucket Color
						</label>
						<div className="flex flex-wrap gap-2 pt-1">
							{['#050711', '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280'].map((c) => (
								<button
									key={c}
									type="button"
									onClick={() => setBucketForm(prev => ({ ...prev, color: c }))}
									className={`w-8 h-8 rounded-full border-2 transition-all ${bucketForm.color === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105'}`}
									style={{ backgroundColor: c }}
									title={c}
								/>
							))}
							<div className="flex items-center gap-2 ml-2">
								<input
									type="color"
									value={bucketForm.color}
									onInput={(e) => setBucketForm(prev => ({ ...prev, color: e.currentTarget.value }))}
									className="w-8 h-8 rounded-full border-none p-0 bg-transparent cursor-pointer"
								/>
								<span className="text-[10px] text-gray-500 font-mono uppercase">{bucketForm.color}</span>
							</div>
						</div>
					</div>
				</div>
				<div
					className="flex justify-end gap-3 p-6 border-t dark:border-gray-700"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<Button variant="outline" size="md" onClick={onClose}>Cancel</Button>
					<Button variant="primary" size="md" onClick={onSave}>Save Bucket</Button>
				</div>
			</div>
		</div>
	);
};

export default AddBucketModal;
