'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
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
	const { user } = useAuth() as any;
	const firstName = (user?.firstname || user?.name?.split(' ')[0] || 'User') as string;

	const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [input, setInput] = useState(value);
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		setInput(value);
	}, [value]);

	// Close suggestions dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
				setShowSuggestions(false);
			}
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

	const SuggestionsListComponent = () => {
		return filteredSuggestions.length ? (
			<ul className="absolute z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md shadow-lg border text-[10px] md:text-[12px] dark:border-gray-700 bg-white dark:bg-gray-800 divide-y dark:divide-gray-700">
				{filteredSuggestions.map((suggestion, index) => {
					let className = "relative cursor-pointer select-none py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors";
					if (index === activeSuggestionIndex) {
						className += " bg-gray-50 dark:bg-gray-700";
					}
					return (
						<li
							className={className}
							key={suggestion}
							onClick={() => handleSelectSuggestion(suggestion)}
						>
							{suggestion}
						</li>
					);
				})}
			</ul>
		) : (
			<div className="absolute z-50 mt-1 p-3 rounded-md shadow-lg border text-[10px] md:text-[12px] dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-400 w-full italic">
				No suggestions for you {firstName}, you're on your own!
			</div>
		);
	};

	return (
		<div ref={containerRef} className="relative w-full">
			<input
				className="w-full px-3 py-2 border dark:border-gray-600 rounded text-[10px] md:text-[12px] dark:bg-gray-700 dark:text-gray-300 dark:placeholder:text-gray-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500 transition-all"
				style={{
					borderColor: 'var(--light-gray)',
					backgroundColor: 'var(--accent-white)',
					color: 'var(--text-primary)'
				}}
				type="text"
				onChange={handleInputChange}
				onKeyDown={handleKeyDown}
				onFocus={() => setShowSuggestions(true)}
				value={input}
				required={required}
				placeholder="Type or select a suggestion..."
			/>
			{showSuggestions && input && <SuggestionsListComponent />}
		</div>
	);
};

export default Autosuggestions;