"use client";
import React from 'react';
import Icon from './Icon';
import { plusJakartaStyle } from '../Options';
import ThemeToggle from './ThemeToggle';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';

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
}

export const SetupHeader: React.FC<SetupHeaderProps> = ({
	title = "CRM Setup Configurator",
	user,
	showLogo = true,
	className = '',
	onMobileMenuToggle,
}) => {
	// If no user is provided, we don't display user info
	const userData = user;

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
				{showLogo && (
					<div className="flex items-center gap-3">
						<div className="flex-1 md:flex-none">
							<div className="hidden md:flex items-center gap-2">
								<Icon name="peoplelyHalf" size="xl" color="black" className="dark:hidden" />
								<Icon name="peoplelyHalf" size="xl" className="hidden dark:inline-block" />
								<span className="font-semibold text-[25px] leading-[28px] flex items-center text-[#050711]"
									style={{ color: 'var(--text-primary)', ...plusJakartaStyle }}>Peoplely</span>

							</div>
							{/* <Image src="/logo/peoplelyHalf.svg" alt="Peoplely logo" width={140} height={40} priority /> */}
							{/* This space can be used for logo or main title */}
						</div>
						<span
							className="font-lato not-italic font-medium text-[14px] leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							{title}
						</span>
					</div>
				)}
				{!showLogo && (
					<span
						className="font-inter font-semibold text-lg dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						{title}
					</span>
				)}
			</div>

			{userData && (
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
							<img
								src={userData.avatar}
								alt={userData.name}
								className="w-10 h-10 rounded-full object-cover"
							/>
						) : (
							<span
								className="font-lato font-semibold text-base leading-[150%] text-center dark:text-gray-300"
								style={{ color: 'var(--text-tertiary)' }}
							>
								{userData.initials || userData.name.split(' ').map(n => n[0]).join('').toUpperCase()}
							</span>
						)}
					</div>
					<div className="flex flex-col">
						<span
							className="font-lato font-medium text-sm leading-[150%] dark:text-gray-100"
							style={{ color: 'var(--text-secondary)' }}
						>
							{userData.name}
						</span>
						<span
							className="font-lato font-normal text-xs leading-[150%] dark:text-gray-400"
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
