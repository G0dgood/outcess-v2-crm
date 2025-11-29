'use client';

import React, { useState, useEffect, useRef } from 'react';
import StickyNote, { StickyNoteData } from './StickyNote';

type StoredStickyNote = {
    id?: string;
    title?: string;
    content?: string;
    color?: string;
    reminder?: string;
    todos?: Array<{ id: string; text: string; completed: boolean }>;
    position?: { x: number; y: number };
    rotation?: number;
    isHidden?: boolean;
    createdAt?: string;
    updatedAt?: string;
};

const GlobalStickyNotes: React.FC = () => {
	const [stickyNotes, setStickyNotes] = useState<StickyNoteData[]>([]);
	const [isVisible, setIsVisible] = useState(false);
	const [isLoaded, setIsLoaded] = useState(false);
	const [shouldShow, setShouldShow] = useState(false);
	const isLoadingRef = useRef(false);
	const lastSavedRef = useRef<string>('');

	const loadStickyNotes = () => {
		isLoadingRef.current = true;
		try {
            const savedNotes = localStorage.getItem('stickyNotes');
            if (savedNotes) {
                const parsed = JSON.parse(savedNotes) as unknown as StoredStickyNote[];
                if (Array.isArray(parsed) && parsed.length > 0) {
                    const loadedNotes = parsed.map((note: StoredStickyNote) => ({
                        id: note.id || Date.now().toString() + Math.random(),
                        title: note.title || '',
                        content: note.content || '',
                        color: note.color || '#FFFACD',
                        todos: Array.isArray(note.todos) ? note.todos : [],
                        position: note.position && typeof note.position === 'object' ? note.position : { x: 100 + (parsed.indexOf(note) * 20), y: 100 + (parsed.indexOf(note) * 20) },
                        rotation: note.rotation !== undefined ? note.rotation : Math.random() * 6 - 3,
                        isHidden: note.isHidden !== undefined ? note.isHidden : false,
                        createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
                        updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date(),
                        reminder: note.reminder ? new Date(note.reminder) : undefined,
                    }));
                    setStickyNotes(loadedNotes);
                    setIsLoaded(true);
                    // Update last saved ref to prevent re-saving what we just loaded
                    lastSavedRef.current = JSON.stringify(parsed);
                    return loadedNotes;
                } else {
					setStickyNotes([]);
					setIsLoaded(true);
					lastSavedRef.current = '[]';
					return [];
				}
			} else {
				setStickyNotes([]);
				setIsLoaded(true);
				lastSavedRef.current = '';
				return [];
			}
		} catch (error) {
			console.error('Error loading sticky notes:', error);
			setIsLoaded(true);
			return [];
		} finally {
			// Reset loading flag after a brief delay to allow state to settle
			setTimeout(() => {
				isLoadingRef.current = false;
			}, 50);
		}
	};

	// Load sticky notes from localStorage on mount
	useEffect(() => {
		loadStickyNotes();

		// Listen for show sticky notes event
		const handleShowNotes = () => {
			// Reload notes first to get latest state
			loadStickyNotes();
			
			// Also check localStorage directly to ensure we have latest data
			try {
                const savedNotes = localStorage.getItem('stickyNotes');
                if (savedNotes) {
                    const parsed = JSON.parse(savedNotes) as unknown as StoredStickyNote[];
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        const hasVisibleNotes = parsed.some((note: StoredStickyNote) => !note.isHidden);
                        if (hasVisibleNotes) {
                            setIsVisible(true);
                            return;
                        }
                    }
                }
			} catch (error) {
				console.error('Error checking notes for visibility:', error);
			}
			
			// Set flag to show after notes are loaded
			setShouldShow(true);
		};

		// Check localStorage for show flag
		const checkShowFlag = () => {
			const showFlag = localStorage.getItem('showStickyNotes');
			if (showFlag === 'true') {
				localStorage.removeItem('showStickyNotes');
				loadStickyNotes();
				setShouldShow(true);
			}
		};

		checkShowFlag();
		window.addEventListener('showStickyNotes', handleShowNotes as EventListener);

		// Listen for storage changes to update notes (cross-tab)
		const handleStorageChange = (e: StorageEvent) => {
			if (e.key === 'stickyNotes') {
				loadStickyNotes();
			}
		};
		window.addEventListener('storage', handleStorageChange);

		// Listen for same-window localStorage changes via custom event
		const handleNotesUpdate = () => {
			// Only reload if we're not the one who triggered the update (prevents loop)
			if (!isLoadingRef.current) {
				loadStickyNotes();
			}
		};
		window.addEventListener('stickyNotesUpdated', handleNotesUpdate as EventListener);

		return () => {
			window.removeEventListener('showStickyNotes', handleShowNotes as EventListener);
			window.removeEventListener('storage', handleStorageChange);
			window.removeEventListener('stickyNotesUpdated', handleNotesUpdate as EventListener);
		};
	}, []);

	// Save sticky notes to localStorage whenever they change
	useEffect(() => {
		if (!isLoaded) return;
		// Don't save if we're currently loading (prevents infinite loop)
		if (isLoadingRef.current) return;

		try {
			const notesToSave = stickyNotes.map(note => ({
				id: note.id,
				title: note.title || '',
				content: note.content || '',
				color: note.color || '#FFFACD',
				reminder: note.reminder ? note.reminder.toISOString() : undefined,
				todos: note.todos || [],
				position: note.position || { x: 100, y: 100 },
				rotation: note.rotation !== undefined ? note.rotation : 0,
				isHidden: note.isHidden !== undefined ? note.isHidden : false,
				createdAt: note.createdAt ? note.createdAt.toISOString() : new Date().toISOString(),
				updatedAt: note.updatedAt ? note.updatedAt.toISOString() : new Date().toISOString(),
			}));
			const notesString = JSON.stringify(notesToSave);
			
			// Only save if data actually changed from what we last saved
			if (notesString !== lastSavedRef.current) {
				localStorage.setItem('stickyNotes', notesString);
				lastSavedRef.current = notesString;
				// Dispatch event to notify other instances to reload (but not if we're loading)
				if (!isLoadingRef.current) {
					window.dispatchEvent(new CustomEvent('stickyNotesUpdated'));
				}
			}
		} catch (error) {
			console.error('Error saving sticky notes:', error);
		}
	}, [stickyNotes, isLoaded]);

	// Reset loading flag after notes have been loaded and state has updated
	useEffect(() => {
		if (isLoaded && isLoadingRef.current) {
			const timer = setTimeout(() => {
				isLoadingRef.current = false;
			}, 100);
			return () => clearTimeout(timer);
		}
	}, [isLoaded, stickyNotes]);

	// Sync visibility when shouldShow flag is set and notes are loaded
	useEffect(() => {
		if (shouldShow && isLoaded) {
			// Use a small delay to ensure state has updated
			const timer = setTimeout(() => {
				const visibleNotes = stickyNotes.filter(note => !note.isHidden);
				if (visibleNotes.length > 0) {
					setIsVisible(true);
				} else if (stickyNotes.length > 0) {
					// If there are notes but all are hidden, still show (they might have restore buttons)
					setIsVisible(true);
				}
				setShouldShow(false);
			}, 10);
			return () => clearTimeout(timer);
		}
	}, [shouldShow, isLoaded, stickyNotes]);

	const handleUpdateStickyNote = (updatedNote: StickyNoteData) => {
		const updatedNotes = stickyNotes.map(note => note.id === updatedNote.id ? { ...updatedNote, updatedAt: new Date() } : note);
		setStickyNotes(updatedNotes);
		// Dispatch event to notify other instances to reload
		window.dispatchEvent(new CustomEvent('stickyNotesUpdated'));
	};

	const handleDeleteStickyNote = (noteId: string) => {
		const updatedNotes = stickyNotes.filter(note => note.id !== noteId);
		setStickyNotes(updatedNotes);
	};

	if (!isVisible) {
		return null;
	}

	// Filter out hidden notes
	const visibleNotes = stickyNotes.filter(note => !note.isHidden);

	if (visibleNotes.length === 0) {
		return null;
	}

	return (
		<>
			{visibleNotes.map((note) => (
				<StickyNote
					key={note.id}
					note={note}
					onUpdate={handleUpdateStickyNote}
					onDelete={handleDeleteStickyNote}
				/>
			))}
		</>
	);
};

export default GlobalStickyNotes;
