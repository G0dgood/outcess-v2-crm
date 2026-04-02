"use client";
import React, { useState, useEffect } from 'react';
import Icon from './Icon';
import { plusJakartaStyle } from '../Options';
import ThemeToggle from './ThemeToggle';
import { HamburgerMenuIcon, ChevronLeftIcon } from '@radix-ui/react-icons';
import NextImage from 'next/image';

interface User {
	name: string;
	role: string;
	avatar?: string;
	initials?: string;
}

interface SetupHeaderProps {
	title?: string;
	user?: User;
	showLogo?: boolean;
	className?: string;
	onMobileMenuToggle?: () => void;
	onBack?: () => void;
}

export const SetupHeader: React.FC<SetupHeaderProps> = ({
	title = "CRM Setup Configurator",
	user,
	className = '',
	onMobileMenuToggle,
	onBack,
}) => {
	const userData = user;
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<header
			id="header"
			className={`!flex flex-row dark:bg-gray-800 border-b dark:border-gray-700 px-6 py-4 justify-between items-center ${className}`}
			style={{
				backgroundColor: 'var(--accent-white)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="flex items-center">
				<button
					onClick={onMobileMenuToggle}
					className="md:hidden p-2 text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer mr-2"
					aria-label="Open setup menu"
				>
					<HamburgerMenuIcon className="w-6 h-6" />
				</button>

				{onBack && (
					<button
						onClick={onBack}
						className="p-2 text-black dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer mr-2"
						aria-label="Go back"
					>
						<ChevronLeftIcon className="w-6 h-6" />
					</button>
				)}

				<span
					className="font-inter font-semibold text-[12px] md:text-[14px] dark:text-gray-100"
					style={{ color: 'var(--text-primary)' }}
				>
					{title}
				</span>
			</div>

			{mounted && userData && (
				<div className="flex items-center gap-3">
					<ThemeToggle />
					<div
						className="w-10 h-10 dark:bg-gray-700 border-2 dark:border-gray-600 rounded-full flex items-center justify-center"
						style={{
							backgroundColor: 'var(--bg-primary)',
							borderColor: 'var(--light-gray)'
						}}
					>
						{userData.avatar ? (
							<NextImage
								src={userData.avatar}
								alt={userData.name}
								width={40}
								height={40}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<span
								className="font-lato font-semibold text-base leading-[150%] text-center dark:text-gray-300"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{userData.initials || userData.name.split(' ').map(part => part[0]).join('').toUpperCase()}
							</span>
						)}
					</div>
					<div className="flex flex-col">
						<span
							className="font-lato font-medium text-[10px] md:text-[12px] leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							{userData.name}
						</span>
						<span
							className="font-lato font-normal text-[8px] md:text-[10px] leading-[150%] dark:text-gray-400"
							style={{ color: 'var(--text-tertiary)' }}
						>
							{userData.role}
						</span>
					</div>
				</div>
			)}
		</header>
	);
};

export default SetupHeader;
