/**
 * Sticky Note Utility Functions
 * Handles serialization and deserialization of sticky notes
 */

import type { StickyNoteData } from '@/components/ui/StickyNote';

export type StoredStickyNote = {
	id?: string;
	title?: string;
	content?: string;
	color?: string;
	reminder?: string;
	todos?: StickyNoteData['todos'];
	position?: StickyNoteData['position'];
	rotation?: number;
	isHidden?: boolean;
	createdAt?: string;
	updatedAt?: string;
};

/**
 * Serialize sticky note for localStorage
 */
export const serializeStickyNote = (note: StickyNoteData): StoredStickyNote => ({
	id: note.id,
	title: note.title || '',
	content: note.content || '',
	color: note.color || '#FFFACD',
	reminder: note.reminder ? note.reminder.toISOString() : undefined,
	todos: note.todos || [],
	position: note.position || { x: 100, y: 100 },
	rotation: note.rotation ?? 0,
	createdAt: note.createdAt.toISOString(),
	updatedAt: note.updatedAt.toISOString(),
	isHidden: note.isHidden ?? false,
});

/**
 * Deserialize sticky note from localStorage
 */
export const deserializeStickyNote = (stored: StoredStickyNote): StickyNoteData => ({
	id: stored.id || Date.now().toString(),
	title: stored.title || '',
	content: stored.content || '',
	color: stored.color || '#FFFACD',
	reminder: stored.reminder ? new Date(stored.reminder) : undefined,
	todos: stored.todos || [],
	position: stored.position || { x: 100, y: 100 },
	rotation: stored.rotation ?? 0,
	createdAt: stored.createdAt ? new Date(stored.createdAt) : new Date(),
	updatedAt: stored.updatedAt ? new Date(stored.updatedAt) : new Date(),
	isHidden: stored.isHidden ?? false,
});

