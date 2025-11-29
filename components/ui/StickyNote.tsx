'use client';

import React, { useState, useRef, useEffect } from 'react';
import Icon from './Icon';
import { Cross2Icon, EnterIcon } from '@radix-ui/react-icons';

export interface StickyNoteData {
	id: string;
	title: string;
	content: string;
	color: string;
	reminder?: Date;
	todos: Array<{ id: string; text: string; completed: boolean }>;
	position: { x: number; y: number };
	rotation?: number; // Rotation angle in degrees for natural sticky note look
	isHidden?: boolean; // Whether the note is hidden/closed
	createdAt: Date;
	updatedAt: Date;
}

interface StickyNoteProps {
	note: StickyNoteData;
	onUpdate: (note: StickyNoteData) => void;
	onDelete: (id: string) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ note, onUpdate, onDelete }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [position, setPosition] = useState(note.position);
	const [rotation, setRotation] = useState(note.rotation || Math.random() * 6 - 3); // Random rotation between -3 and 3 degrees
	const [isEditing, setIsEditing] = useState(false);
	const [title, setTitle] = useState(note.title);
	const [content, setContent] = useState(note.content);
	const [isHidden, setIsHidden] = useState(note.isHidden || false);
	const noteRef = useRef<HTMLDivElement>(null);
	const dragStartPos = useRef({ x: 0, y: 0 });
	const zIndexRef = useRef(40);

	// Handle mouse drag - entire note is draggable
	const handleMouseDown = (e: React.MouseEvent) => {
		// Don't drag if note is hidden
		if (isHidden) {
			return;
		}
		// Don't start dragging if clicking on interactive elements
		const target = e.target as HTMLElement;
		if (target.closest('button, input, textarea, svg') ||
			target.tagName === 'BUTTON' ||
			target.tagName === 'INPUT' ||
			target.tagName === 'TEXTAREA' ||
			target.tagName === 'SVG') {
			return;
		}

		e.preventDefault();
		e.stopPropagation();
		setIsDragging(true);
		// Bring to front when dragging starts
		zIndexRef.current = Date.now();
		dragStartPos.current = {
			x: e.clientX - position.x,
			y: e.clientY - position.y,
		};
	};

	// Update position, rotation, and hidden state when note prop changes
	useEffect(() => {
		setPosition(note.position);
		if (note.rotation !== undefined) {
			setRotation(note.rotation);
		}
		if (note.isHidden !== undefined) {
			setIsHidden(note.isHidden);
		}
	}, [note.position, note.rotation, note.isHidden]);

	const handleClose = () => {
		const updatedNote = { ...note, isHidden: true, updatedAt: new Date() };
		setIsHidden(true);
		onUpdate(updatedNote);
	};

	const handleRestore = () => {
		const updatedNote = { ...note, isHidden: false, updatedAt: new Date() };
		setIsHidden(false);
		onUpdate(updatedNote);
	};

	useEffect(() => {
		if (!isDragging) return;

		const handleMouseMove = (e: MouseEvent) => {
			e.preventDefault();
			const newX = e.clientX - dragStartPos.current.x;
			const newY = e.clientY - dragStartPos.current.y;

			// Snap to grid (10px grid)
			const snappedX = Math.round(newX / 10) * 10;
			const snappedY = Math.round(newY / 10) * 10;

			// Keep within viewport bounds
			const maxX = window.innerWidth - (noteRef.current?.offsetWidth || 300);
			const maxY = window.innerHeight - (noteRef.current?.offsetHeight || 200);
			const boundedX = Math.max(0, Math.min(snappedX, maxX));
			const boundedY = Math.max(0, Math.min(snappedY, maxY));

			setPosition({ x: boundedX, y: boundedY });
		};

		const handleMouseUp = () => {
			if (isDragging) {
				setIsDragging(false);
				onUpdate({ ...note, position, rotation, updatedAt: new Date() });
			}
		};

		document.addEventListener('mousemove', handleMouseMove, { passive: false });
		document.addEventListener('mouseup', handleMouseUp);

		return () => {
			document.removeEventListener('mousemove', handleMouseMove);
			document.removeEventListener('mouseup', handleMouseUp);
		};
	}, [isDragging, note, position, onUpdate]);

	const handleSave = () => {
		onUpdate({
			...note,
			title,
			content,
			position,
			updatedAt: new Date(),
		});
		setIsEditing(false);
	};



	const toggleTodo = (todoId: string) => {
		const updatedTodos = note.todos.map(todo =>
			todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
		);
		onUpdate({ ...note, todos: updatedTodos, updatedAt: new Date() });
	};

	const addTodo = () => {
		const newTodo = {
			id: Date.now().toString(),
			text: 'New todo',
			completed: false,
		};
		onUpdate({
			...note,
			todos: [...note.todos, newTodo],
			updatedAt: new Date(),
		});
	};

	const deleteTodo = (todoId: string) => {
		const updatedTodos = note.todos.filter(todo => todo.id !== todoId);
		onUpdate({ ...note, todos: updatedTodos, updatedAt: new Date() });
	};

	const colorPalette = [
		'#FFFACD', // Light yellow
		'#C8F0C8', // Light green
		'#FFC8E0', // Light pink
		'#D8C8F8', // Light purple
		'#C8E0F8', // Light blue
		'#E0E0E0', // Light gray
		'#606060', // Dark gray
	];

	// Determine text color based on background brightness
	const getTextColor = (backgroundColor: string) => {
		// For dark gray background, use white text
		if (backgroundColor === '#606060') {
			return '#FFFFFF';
		}
		// For all light backgrounds, use black text
		return '#000000';
	};

	const textColor = getTextColor(note.color || '#FFFACD');

	// Auto-edit new empty notes
	useEffect(() => {
		if (!note.title && !note.content && note.todos.length === 0) {
			setIsEditing(true);
		}
	}, [note.id]);

	// Completely hide the note when closed
	if (isHidden) {
		return null;
	}

	return (
		<div
			ref={noteRef}
			data-note-id={note.id}
			className={`fixed border border-gray-300 rounded-sm shadow-lg w-[280px] select-none hover:shadow-xl transition-all ${isHidden ? '' : isDragging ? 'cursor-grabbing opacity-90 scale-105' : 'cursor-grab'
				}`}
			style={{
				left: `${position.x}px`,
				top: `${position.y}px`,
				backgroundColor: note.color || '#FFFACD',
				transform: `rotate(${rotation}deg)`,
				zIndex: isDragging ? Math.min(zIndexRef.current, 39) : 30, // Behind modal (z-40 backdrop, z-50 modal)
				boxShadow: isDragging
					? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)'
					: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
			}}
			onMouseDown={handleMouseDown}
		>
			{/* Header - Darker yellow bar */}
			<div
				className="flex justify-between items-center p-2 border-b border-gray-300"
				style={{ backgroundColor: 'rgba(255, 235, 142, 0.6)' }}
			>
				{isHidden ? (
					<div className="flex gap-1 items-center">
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleRestore();
							}}
							className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
							title="Restore"
						>
							<EnterIcon className="w-4 h-4 text-black" />
						</button>
					</div>
				) : (
					<div className="flex gap-1 items-center">
						<button
							onClick={(e) => {
								e.stopPropagation();
								addTodo();
							}}
							className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
							title="Add"
						>
							<svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
							</svg>
						</button>
						{isEditing && (
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleSave();
								}}
								className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
								title="Done"
							>
								<svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</button>
						)}
					</div>
				)}
				{!isHidden && (
					<div className="flex gap-1 items-center">
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleClose();
							}}
							className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
							title="Close"
						>
							<Cross2Icon className="w-4 h-4 text-black" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								onDelete(note.id);
							}}
							className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
							title="Delete"
						>
							<Icon name="Trash_light" size="sm" className="text-black" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								handleSave();
							}}
							className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
							title="Save"
						>
							<svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
							</svg>
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setIsEditing(!isEditing);
							}}
							className="p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
							title="Edit"
						>
							<svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</button>
					</div>
				)}
			</div>

			{/* Content Area - Hidden when note is closed */}
			{!isHidden && (
				<div className="p-3 min-h-[150px] max-h-[300px] overflow-y-auto bg-transparent">
					{isEditing ? (
						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value)}
							className="w-full px-2 py-1 text-sm bg-transparent border-0 focus:outline-none resize-none cursor-text placeholder-opacity-60"
							rows={5}
							onMouseDown={(e) => e.stopPropagation()}
							placeholder="Write your note here..."
							style={{
								color: textColor,
								caretColor: textColor,
							}}
						/>
					) : (
						<p
							className="text-sm whitespace-pre-wrap font-sans leading-relaxed"
							style={{ color: textColor }}
						>
							{note.content || 'No content'}
						</p>
					)}

					{/* Todos */}
					{note.todos.length > 0 && (
						<div className="mt-3 space-y-2">
							<div className="text-xs font-semibold" style={{ color: textColor, opacity: 0.8 }}>To-dos:</div>
							{note.todos.map((todo) => (
								<div key={todo.id} className="flex items-center gap-2 text-xs">
									<input
										type="checkbox"
										checked={todo.completed}
										onChange={() => toggleTodo(todo.id)}
										onMouseDown={(e) => e.stopPropagation()}
										className="cursor-pointer"
									/>
									{isEditing ? (
										<input
											type="text"
											value={todo.text}
											onChange={(e) => {
												const updatedTodos = note.todos.map(t =>
													t.id === todo.id ? { ...t, text: e.target.value } : t
												);
												onUpdate({ ...note, todos: updatedTodos, updatedAt: new Date() });
											}}
											onMouseDown={(e) => e.stopPropagation()}
											className="flex-1 px-1 py-0.5 text-xs bg-transparent rounded border-0 focus:outline-none cursor-text"
											style={{ color: textColor, caretColor: textColor }}
										/>
									) : (
										<span
											className={todo.completed ? 'line-through' : ''}
											style={{
												color: textColor,
												opacity: todo.completed ? 0.6 : 1
											}}
										>
											{todo.text}
										</span>
									)}
									{isEditing && (
										<button
											onMouseDown={(e) => e.stopPropagation()}
											onClick={(e) => {
												e.stopPropagation();
												deleteTodo(todo.id);
											}}
											className="text-red-500 hover:text-red-700"
										>
											<Icon name="Close_round_light" size="xs" />
										</button>
									)}
								</div>
							))}
							{isEditing && (
								<button
									onMouseDown={(e) => e.stopPropagation()}
									onClick={(e) => {
										e.stopPropagation();
										addTodo();
									}}
									className="text-xs mt-1 hover:opacity-80 transition-opacity"
									style={{ color: textColor, opacity: 0.7 }}
								>
									+ Add todo
								</button>
							)}
						</div>
					)}

					{!isEditing && note.todos.length === 0 && (
						<button
							onMouseDown={(e) => e.stopPropagation()}
							onClick={(e) => {
								e.stopPropagation();
								addTodo();
							}}
							className="text-xs mt-2 hover:opacity-80 transition-opacity"
							style={{ color: textColor, opacity: 0.7 }}
						>
							+ Add todo
						</button>
					)}
				</div>
			)}

			{/* Footer - Color Palette - Hidden when note is closed */}
			{!isHidden && (
				<div className="p-2 border-t border-gray-300 flex gap-1 justify-center items-center">
					{colorPalette.map((colorOption) => (
						<button
							key={colorOption}
							onClick={(e) => {
								e.stopPropagation();
								onUpdate({ ...note, color: colorOption, updatedAt: new Date() });
							}}
							className={`w-6 h-6 rounded-sm border transition-all ${note.color === colorOption || (!note.color && colorOption === '#FFFACD')
								? 'border-gray-800 scale-110 ring-2 ring-gray-400'
								: 'border-gray-300 hover:scale-110'
								}`}
							style={{ backgroundColor: colorOption }}
							title={colorOption}
							onMouseDown={(e) => e.stopPropagation()}
						/>
					))}
				</div>
			)}
		</div>
	);
};

export default StickyNote;

