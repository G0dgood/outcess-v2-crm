'use client';

import React, { useState, useRef } from 'react';
import Button from './Button';
import DateInput from './DateInput';
import { CalendarIcon } from '@radix-ui/react-icons';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';

interface DateFilterProps {
	initialFilter?: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange';
	initialFromDate?: string;
	initialToDate?: string;
	onApply?: (filter: {
		startDate: string;
		endDate: string;
		filterType: 'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange';
		fromDate?: string;
		toDate?: string;
	}) => void;
	onClose?: () => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({
	onApply,
	onClose,
	initialFilter = 'today',
	initialFromDate = '',
	initialToDate = ''
}) => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [selectedFilter, setSelectedFilter] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'all' | 'dateRange'>(initialFilter);
	const [fromDate, setFromDate] = useState(initialFromDate);
	const [toDate, setToDate] = useState(initialToDate);
	const fromDateInputRef = useRef<HTMLInputElement>(null);
	const toDateInputRef = useRef<HTMLInputElement>(null);

	const formatDate = (date: Date) => {
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, '0');
		const day = String(date.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const toStartOfDayISO = (dateStr: string) => {
		if (!dateStr) return '';
		return `${dateStr}T00:00:00.000Z`;
	};

	const toEndOfDayISO = (dateStr: string) => {
		if (!dateStr) return '';
		return `${dateStr}T23:59:59.999Z`;
	};

	const handleApply = () => {
		const today = new Date();
		let start = '';
		let end = '';

		switch (selectedFilter) {
			case 'today':
				const todayStr = formatDate(today);
				start = toStartOfDayISO(todayStr);
				end = toEndOfDayISO(todayStr);
				break;
			case 'yesterday':
				const yesterday = new Date(today);
				yesterday.setDate(today.getDate() - 1);
				const yesterdayStr = formatDate(yesterday);
				start = toStartOfDayISO(yesterdayStr);
				end = toEndOfDayISO(yesterdayStr);
				break;
			case 'last7days':
				const last7 = new Date(today);
				last7.setDate(today.getDate() - 7);
				start = toStartOfDayISO(formatDate(last7));
				end = toEndOfDayISO(formatDate(today));
				break;
			case 'last30days':
				const last30 = new Date(today);
				last30.setDate(today.getDate() - 30);
				start = toStartOfDayISO(formatDate(last30));
				end = toEndOfDayISO(formatDate(today));
				break;
			case 'dateRange':
				if (fromDate && toDate) {
					start = toStartOfDayISO(fromDate);
					end = toEndOfDayISO(toDate);
				}
				break;
			case 'all':
				start = '';
				end = '';
				break;
		}

		onApply?.({
			startDate: start,
			endDate: end,
			filterType: selectedFilter,
			fromDate: selectedFilter === 'dateRange' ? fromDate : undefined,
			toDate: selectedFilter === 'dateRange' ? toDate : undefined
		});
		onClose?.();
	};

	const handleFromIconClick = () => {
		fromDateInputRef.current?.click();
	};

	const handleToIconClick = () => {
		toDateInputRef.current?.click();
	};

	return (
		<div
			className="dark:bg-gray-800 border dark:border-gray-700 shadow-lg dark:shadow-xl p-6 w-full md:w-[283px] whitespace-nowrap"
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="space-y-4">
				{/* Radio Options */}
				<div className="space-y-3">
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="radio"
							name="dateFilter"
							value="today"
							checked={selectedFilter === 'today'}
							onChange={() => setSelectedFilter('today')}
							className="w-4 h-4 dark:border-gray-600 dark:bg-gray-700"
							style={{
								accentColor: primaryColor,
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)'
							}}
						/>
						<span
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Today
						</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="radio"
							name="dateFilter"
							value="yesterday"
							checked={selectedFilter === 'yesterday'}
							onChange={() => setSelectedFilter('yesterday')}
							className="w-4 h-4 dark:border-gray-600 dark:bg-gray-700"
							style={{
								accentColor: primaryColor,
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)'
							}}
						/>
						<span
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Yesterday
						</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="radio"
							name="dateFilter"
							value="last7days"
							checked={selectedFilter === 'last7days'}
							onChange={() => setSelectedFilter('last7days')}
							className="w-4 h-4 dark:border-gray-600 dark:bg-gray-700"
							style={{
								accentColor: primaryColor,
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)'
							}}
						/>
						<span
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Last 7 days
						</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="radio"
							name="dateFilter"
							value="last30days"
							checked={selectedFilter === 'last30days'}
							onChange={() => setSelectedFilter('last30days')}
							className="w-4 h-4 dark:border-gray-600 dark:bg-gray-700"
							style={{
								accentColor: primaryColor,
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)'
							}}
						/>
						<span
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Last 30 days
						</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="radio"
							name="dateFilter"
							value="all"
							checked={selectedFilter === 'all'}
							onChange={() => setSelectedFilter('all')}
							className="w-4 h-4 dark:border-gray-600 dark:bg-gray-700"
							style={{
								accentColor: primaryColor,
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)'
							}}
						/>
						<span
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							All time record
						</span>
					</label>
					<label className="flex items-center gap-3 cursor-pointer">
						<input
							type="radio"
							name="dateFilter"
							value="dateRange"
							checked={selectedFilter === 'dateRange'}
							onChange={() => setSelectedFilter('dateRange')}
							className="w-4 h-4 dark:border-gray-600 dark:bg-gray-700"
							style={{
								accentColor: primaryColor,
								borderColor: 'var(--light-gray)',
								backgroundColor: 'var(--accent-white)'
							}}
						/>
						<span
							className="text-[10px] md:text-[12px] font-medium dark:text-gray-100"
							style={{ color: 'var(--text-primary)' }}
						>
							Date Range
						</span>
					</label>
				</div>

				{/* Date Range Inputs */}
				{selectedFilter === 'dateRange' ? (
					<div className="grid grid-cols-2 gap-3 pt-2">
						<div className="relative">
							<DateInput
								ref={fromDateInputRef}
								label="From"
								value={fromDate}
								onChange={setFromDate}
								placeholder="Select date"
								inputClassName="pr-10"
							/>
							<button
								type="button"
								onClick={handleFromIconClick}
								className="absolute right-3 bottom-3 cursor-pointer dark:hover:text-gray-300 transition-colors"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}}
								aria-label="Open date picker"
							>
								<CalendarIcon
									className="w-4 h-4 dark:text-gray-500"
									style={{ color: 'var(--text-tertiary)' }}
								/>
							</button>
						</div>
						<div className="relative">
							<DateInput
								ref={toDateInputRef}
								label="To"
								value={toDate}
								onChange={setToDate}
								placeholder="Select date"
								inputClassName="pr-10"
							/>
							<button
								type="button"
								onClick={handleToIconClick}
								className="absolute right-3 bottom-3 cursor-pointer dark:hover:text-gray-300 transition-colors"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}}
								aria-label="Open date picker"
							>
								<CalendarIcon
									className="w-4 h-4 dark:text-gray-500"
									style={{ color: 'var(--text-tertiary)' }}
								/>
							</button>
						</div>
					</div>
				) : null}

				{/* Apply Button */}
				<div className="flex justify-end pt-2">
					<Button
						variant="primary"
						size="md"
						onClick={handleApply}
					>
						Apply
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DateFilter;

