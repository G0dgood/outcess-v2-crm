'use client';

import React, { useState } from 'react';
import Modal from './Modal';
import Input from './Input';
import Textarea from './Textarea';
import Button from './Button';
import DateInput from './DateInput';
import { StickyNoteData } from './StickyNote';

interface StickyNoteModalProps {
	isOpen: boolean;
	onClose: () => void;
	onSave: (note: Omit<StickyNoteData, 'id' | 'createdAt' | 'updatedAt'>) => void;
	note?: StickyNoteData;
}

const colorOptions = [
	'#FFEB3B', // Yellow
	'#FFC107', // Amber
	'#FF9800', // Orange
	'#4CAF50', // Green
	'#2196F3', // Blue
	'#9C27B0', // Purple
	'#F44336', // Red
	'#E91E63', // Pink
];

const StickyNoteModal: React.FC<StickyNoteModalProps> = ({ isOpen, onClose, onSave, note }) => {
	const [title, setTitle] = useState(note?.title || '');
	const [content, setContent] = useState(note?.content || '');
	const [color, setColor] = useState(note?.color || '#FFEB3B');
	const [reminder, setReminder] = useState<Date | undefined>(note?.reminder);
	const [position, setPosition] = useState(note?.position || { x: 100, y: 100 });
	const [rotation] = useState(note?.rotation || Math.random() * 6 - 3);

	const handleSave = () => {
		onSave({
			title,
			content,
			color,
			reminder,
			todos: note?.todos || [],
			position,
			rotation,
		});
		handleClose();
	};

	const handleClose = () => {
		setTitle('');
		setContent('');
		setColor('#FFEB3B');
		setReminder(undefined);
		onClose();
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={note ? 'Edit Note' : 'Create New Note'}
			position="center"
			size="md"
		>
			<div className="space-y-4 p-6">
				<Input
					label="Title"
					value={title}
					onChange={setTitle}
					placeholder="Enter note title"
					required
				/>

				<Textarea
					label="Content"
					value={content}
					onChange={setContent}
					placeholder="Write your note content..."
					rows={5}
				/>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Color
					</label>
					<div className="flex gap-2 flex-wrap">
						{colorOptions.map((colorOption) => (
							<button
								key={colorOption}
								onClick={() => setColor(colorOption)}
								className={`w-8 h-8 rounded-full border-2 ${color === colorOption ? 'border-gray-800 scale-110' : 'border-gray-300'
									}`}
								style={{ backgroundColor: colorOption }}
								title={colorOption}
							/>
						))}
					</div>
				</div>

				<div>
					<DateInput
						label="Reminder (Optional)"
						value={reminder?.toISOString().split('T')[0] || ''}
						onChange={(value) => setReminder(value ? new Date(value) : undefined)}
						placeholder="Select reminder date"
					/>
				</div>

				<div className="flex gap-3 justify-end pt-4">
					<Button variant="outline" onClick={handleClose}>
						Cancel
					</Button>
					<Button variant="primary" onClick={handleSave} disabled={!title.trim()}>
						{note ? 'Update' : 'Create'} Note
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default StickyNoteModal;

