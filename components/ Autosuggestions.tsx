'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import { useAuth } from '@/contexts/AuthContext';

interface AutosuggestionsProps {
	suggestions?: string[];
	value?: string;
	onChange?: (value: string) => void;
	setComment?: (value: string) => void;
	required?: boolean;
}

const Autosuggestions: React.FC<AutosuggestionsProps> = ({
	suggestions = [],
	value = "",
	onChange,
	setComment,
	required = false
}) => {
	const { user } = useAuth() as { user?: { firstname?: string; name?: string } };
	const firstName = (user?.firstname || user?.name?.split(' ')[0] || 'User') as string;

	const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [input, setInput] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);

	const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, bottom: 0 });
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	const updateCoords = useCallback(() => {
		if (containerRef.current) {
			const rect = containerRef.current.getBoundingClientRect();
			setCoords({
				top: rect.top,
				left: rect.left,
				width: rect.width,
				bottom: rect.bottom
			});
		}
	}, []);

	useEffect(() => {
		if (showSuggestions && input) {
			updateCoords();
			window.addEventListener('resize', updateCoords);
			window.addEventListener('scroll', updateCoords, true);
		}
		return () => {
			window.removeEventListener('resize', updateCoords);
			window.removeEventListener('scroll', updateCoords, true);
		};
	}, [showSuggestions, input, updateCoords]);

	useEffect(() => {
		setInput(value);
	}, [value]);

	// Close suggestions dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (containerRef.current && containerRef.current.contains(target)) {
				return;
			}
			if (target.closest('.dropdown-menu')) {
				return;
			}
			setShowSuggestions(false);
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const userInput = e.target.value;

		const unLinked = suggestions.filter((suggestion) =>
			suggestion?.toLowerCase()?.includes(userInput?.toLowerCase())
		);

		setInput(userInput);
		setFilteredSuggestions(unLinked);
		setActiveSuggestionIndex(0);
		setShowSuggestions(true);

		if (onChange) {
			onChange(userInput);
		}
		if (setComment) {
			setComment(userInput);
		}
	};

	const handleSelectSuggestion = (suggestionText: string) => {
		setFilteredSuggestions([]);
		setInput(suggestionText);
		setActiveSuggestionIndex(0);
		setShowSuggestions(false);

		if (onChange) {
			onChange(suggestionText);
		}
		if (setComment) {
			setComment(suggestionText);
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Enter") {
			if (filteredSuggestions[activeSuggestionIndex]) {
				handleSelectSuggestion(filteredSuggestions[activeSuggestionIndex]);
				e.preventDefault();
			}
		} else if (e.key === "ArrowUp") {
			if (activeSuggestionIndex === 0) {
				return;
			}
			setActiveSuggestionIndex(activeSuggestionIndex - 1);
			e.preventDefault();
		} else if (e.key === "ArrowDown") {
			if (activeSuggestionIndex === filteredSuggestions.length - 1) {
				return;
			}
			setActiveSuggestionIndex(activeSuggestionIndex + 1);
			e.preventDefault();
		}
	};

	return (
		<div ref={containerRef} className="relative w-full">
			<input
				className="dropdown-trigger rounded-[var(--radius)] pr-10 w-full"
				type="text"
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={() => setShowSuggestions(true)}
				value={input}
				required={required}
				placeholder="Type or select a suggestion..."
			/>
			<svg
				className={`dropdown-chevron ${showSuggestions && input ? 'open' : ''} absolute right-4 top-1/2 -translate-y-1/2`}
				width="12"
				height="12"
				viewBox="0 0 12 12"
				fill="none"
				style={{ pointerEvents: 'none' }}
			>
				<path
					d="M3 4.5L6 7.5L9 4.5"
					stroke="currentColor"
					strokeWidth="1.5"
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>

			{showSuggestions && input && mounted && typeof document !== 'undefined' && createPortal(
				<div
					className="dropdown-menu rounded-[var(--radius)]"
					style={{
						position: 'fixed',
						top: `${coords.bottom + 4}px`,
						left: `${coords.left}px`,
						width: `${coords.width}px`,
						zIndex: 10000,
					}}
				>
					{filteredSuggestions.length ? (
						<div className="dropdown-options" style={{ maxHeight: '200px', overflowY: 'auto' }}>
							{filteredSuggestions.map((suggestion, index) => {
								const isSelected = index === activeSuggestionIndex;
								return (
									<button
										key={suggestion}
										type="button"
										className={`dropdown-option ${isSelected ? 'selected' : ''}`}
										onClick={() => handleSelectSuggestion(suggestion)}
										style={{ width: '100%', textAlign: 'left' }}
									>
										{suggestion}
									</button>
								);
							})}
						</div>
					) : (
						<div className="dropdown-empty-state !p-3">
							<div className="dropdown-empty-text">
								<p className="dropdown-empty-title">
									No suggestions for you {firstName}, you&apos;re on your own!
								</p>
							</div>
						</div>
					)}
				</div>,
				document.body
			)}
		</div>
	);
};

export default Autosuggestions;