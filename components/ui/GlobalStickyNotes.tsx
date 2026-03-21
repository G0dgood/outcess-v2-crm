'use client';

import React, { useState, useEffect } from 'react';
import StickyNote, { StickyNoteData } from './StickyNote';
import { useSelector } from 'react-redux';
import { User } from '@/store/slices/authSlice';
import {
	useGetStickyNotesQuery,
	useCreateStickyNoteMutation,
	useUpdateStickyNoteMutation,
	useDeleteStickyNoteMutation
} from '@/store/services/stickyNoteApi';
import { toastError } from '@/utils/toastWithSound';

const GlobalStickyNotes: React.FC = () => {
	const user = useSelector((state: { auth: { user: User | null } }) => state.auth.user);
	const userId = user?.id || '';

	const { data: apiResponse, isLoading: isFetching } = useGetStickyNotesQuery(userId, {
		skip: !userId
	});
	const [createStickyNote] = useCreateStickyNoteMutation();
	const [updateStickyNote] = useUpdateStickyNoteMutation();
	const [deleteStickyNote] = useDeleteStickyNoteMutation();

	const stickyNotes = apiResponse?.stickyNotes || [];
	const [isVisible, setIsVisible] = useState(false);

	// Migration logic: If API is empty but localStorage has notes, migrate them once
	useEffect(() => {
		if (!isFetching && userId && apiResponse && stickyNotes.length === 0) {
			const savedNotes = localStorage.getItem('stickyNotes');
			if (savedNotes) {
				try {
					const parsed = JSON.parse(savedNotes);
					if (Array.isArray(parsed) && parsed.length > 0) {
						// Migrate each note to the backend
						parsed.forEach((note: any) => {
							createStickyNote({
								...note,
								userId,
							});
						});
						// Clear localStorage after migration attempt
						localStorage.removeItem('stickyNotes');
					}
				} catch (error) {
					console.error('Migration error:', error);
				}
			}
		}
	}, [apiResponse, isFetching, userId, stickyNotes.length, createStickyNote]);

	// Listen for show/create sticky notes events
	useEffect(() => {
		const handleShowNotes = async () => {
			setIsVisible(true);
			// If there are hidden notes, restore them when user clicks "Show Notes"
			const hiddenNotes = stickyNotes.filter(n => n.isHidden);
			if (hiddenNotes.length > 0) {
				try {
					for (const note of hiddenNotes) {
						await updateStickyNote({
							...note,
							id: note._id || note.id,
							userId,
							isHidden: false,
							updatedAt: new Date().toISOString()
						} as any).unwrap();
					}
				} catch (error) {
					console.error('Failed to restore notes:', error);
				}
			}
		};

		const handleCreateNote = async () => {
			if (!userId) return;
			try {
				const newNote = {
					userId,
					title: '',
					content: '',
					color: '#FFFACD',
					todos: [],
					position: {
						x: 100 + (stickyNotes.length * 30),
						y: 100 + (stickyNotes.length * 30)
					},
					rotation: Math.random() * 6 - 3,
					isHidden: false
				};
				await createStickyNote(newNote).unwrap();
				setIsVisible(true);
			} catch (error) {
				console.error('Failed to create note:', error);
				toastError('Failed to create note in the cloud');
			}
		};

		// Check localStorage for show flag (set by Header)
		const checkShowFlag = () => {
			const showFlag = localStorage.getItem('showStickyNotes');
			if (showFlag === 'true') {
				localStorage.removeItem('showStickyNotes');
				handleShowNotes();
			}
		};

		checkShowFlag();
		window.addEventListener('showStickyNotes', handleShowNotes as EventListener);
		window.addEventListener('createStickyNote', handleCreateNote as EventListener);

		return () => {
			window.removeEventListener('showStickyNotes', handleShowNotes as EventListener);
			window.removeEventListener('createStickyNote', handleCreateNote as EventListener);
		};
	}, [userId, stickyNotes, createStickyNote, updateStickyNote]);

	const handleUpdateStickyNote = async (updatedNote: StickyNoteData) => {
		try {
			// Convert Dates to ISO strings for the API if they are Date objects
			const noteToUpdate = {
				...updatedNote,
				id: updatedNote.id || (updatedNote as any)._id,
				userId,
				createdAt: updatedNote.createdAt instanceof Date ? updatedNote.createdAt.toISOString() : updatedNote.createdAt,
				updatedAt: new Date().toISOString(),
				reminder: updatedNote.reminder instanceof Date ? updatedNote.reminder.toISOString() : updatedNote.reminder,
			};

			await updateStickyNote(noteToUpdate as any).unwrap();
		} catch (error) {
			console.error('Failed to update note:', error);
			toastError('Failed to save changes to the cloud');
		}
	};

	const handleDeleteStickyNote = async (noteId: string) => {
		try {
			await deleteStickyNote({ id: noteId, userId }).unwrap();
		} catch (error) {
			console.error('Failed to delete note:', error);
			toastError('Failed to delete note from the cloud');
		}
	};

	// Only return null if not visible OR if we are doing the INITIAL fetch (stickyNotes length is 0 and isFetching)
	if (!isVisible || (stickyNotes.length === 0 && isFetching)) {
		return null;
	}

	// Filter out hidden notes for display
	const visibleNotes = stickyNotes.filter(note => !note.isHidden);

	if (visibleNotes.length === 0 && !isVisible) {
		return null;
	}

	return (
		<>
			{visibleNotes.map((note) => (
				<StickyNote
					key={note._id || note.id}
					note={{
						...note,
						id: note._id || note.id || '',
						createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
						updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
						reminder: note.reminder ? new Date(note.reminder) : undefined,
					} as any}
					onUpdate={handleUpdateStickyNote}
					onDelete={handleDeleteStickyNote}
				/>
			))}
		</>
	);
};

export default GlobalStickyNotes;
