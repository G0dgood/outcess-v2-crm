'use client';

import React, { useState } from 'react';
import { Menu } from '@/components/setupIcon/Menu';
import { Dashboard } from '@/components/setupIcon/Dashboard';
import Button from '@/components/ui/Button';
import ColorPicker from '@/components/ui/ColorPicker';
import LogoUpload from '@/components/ui/LogoUpload';
import { colors } from '@/lib/colors';
import { useSetup } from '@/contexts/SetupContext';

type MenuStyle = 'layout' | 'compact';
type ColorChangeHandler = (color: string) => void;
type FileSelectHandler = (file: File | null) => void;

export default function HeaderNavigationPage(): React.JSX.Element {
	const { setupData, updateSetupData, updateNavigationSettings } = useSetup();
	const [selectedLayout, setSelectedLayout] = useState<MenuStyle>(setupData.navigationSettings.menuStyle);
	const [primaryColor, setPrimaryColor] = useState<string>(setupData.primaryColor);
	const [secondaryColor, setSecondaryColor] = useState<string>(setupData.secondaryColor);
	const [logoFile, setLogoFile] = useState<File | null>(null);

	const handleMenuStyleChange = (style: MenuStyle): void => {
		setSelectedLayout(style);
		updateNavigationSettings({ menuStyle: style });
	};

	const handlePrimaryColorChange: ColorChangeHandler = (color: string): void => {
		setPrimaryColor(color);
		updateSetupData({ primaryColor: color });
	};

	const handleSecondaryColorChange: ColorChangeHandler = (color: string): void => {
		setSecondaryColor(color);
		updateSetupData({ secondaryColor: color });
	};

	const handleLogoSelect: FileSelectHandler = (file: File | null): void => {
		if (!file) return;

		setLogoFile(file);
		updateSetupData({ logoFile: file });
		const logoUrl: string = URL.createObjectURL(file);
		updateNavigationSettings({
			logo: {
				url: logoUrl,
				alt: file.name,
				width: 120,
				height: 40,
			}
		});
	};

	const handleResetToDefault = (): void => {
		setPrimaryColor(colors.dark.primary);
		setSecondaryColor(colors.accent.mutedSageGreen);
		setSelectedLayout('layout');
		updateSetupData({
			primaryColor: colors.dark.primary,
			secondaryColor: colors.accent.mutedSageGreen,
		});
		updateNavigationSettings({ menuStyle: 'layout' });
	};





	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<h1
					className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
					style={{ color: 'var(--text-secondary)' }}
				>
					Header & Navigation
				</h1>
				<p
					className="font-lato not-italic font-normal text-[16px] leading-[150%] dark:text-gray-400"
					style={{ color: 'var(--text-tertiary)' }}
				>
					Customize how your CRM navigation and layout will appear to users.
				</p>
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div
					className="box-border w-full h-[97px] border-b dark:border-gray-700 mb-6 p-6"
					style={{ borderColor: 'var(--light-gray)' }}
				>
					<h2
						className="font-inter text-xl font-semibold dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						Navigation Settings
					</h2>
					<p
						className="font-lato text-sm dark:text-gray-400 mb-6"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Configure your CRM&apos;s main navigation structure
					</p>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
					{/* Left Column */}
					<div className="space-y-8">
						{/* Navigation Settings */}
						<div>

							{/* Menu Style */}
							<div className="mb-6">
								<h3
									className="font-inter text-base font-medium dark:text-gray-100 mb-4"
									style={{ color: 'var(--text-primary)' }}
								>
									Menu Style
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Layout Style Card */}
									<div
										className={`p-4 border-2 cursor-pointer transition-all ${selectedLayout === 'layout'
											? 'border-[#6C8B7D] dark:border-[#6C8B7D] dark:bg-[#6C8B7D]/20'
											: 'dark:border-gray-700 dark:hover:border-gray-600'
											}`}
										style={selectedLayout === 'layout' ? {
											backgroundColor: 'rgba(108, 139, 125, 0.1)',
											borderColor: '#6C8B7D'
										} : {
											borderColor: 'var(--light-gray)'
										}}
										onClick={() => handleMenuStyleChange('layout')}
										onMouseEnter={(e) => {
											if (selectedLayout !== 'layout') {
												e.currentTarget.style.borderColor = '#94A3B8';
											}
										}}
										onMouseLeave={(e) => {
											if (selectedLayout !== 'layout') {
												e.currentTarget.style.borderColor = 'var(--light-gray)';
											}
										}}
									>
										<div className="flex flex-col">
											<Menu width={24} height={24} strokeColor={selectedLayout === 'layout' ? '#6C8B7D' : colors.dark.primary} className="mb-3" />
											<h4
												className="font-inter text-sm font-medium dark:text-gray-100 mb-1"
												style={{ color: 'var(--text-primary)' }}
											>
												Layout Style
											</h4>
											<p
												className="font-lato text-xs dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Vertical menu on the left
											</p>
										</div>
									</div>

									{/* Compact Card */}
									<div
										className={`p-4 border-2 cursor-pointer transition-all ${selectedLayout === 'compact'
											? 'border-[#6C8B7D] dark:border-[#6C8B7D] dark:bg-[#6C8B7D]/20'
											: 'dark:border-gray-700 dark:hover:border-gray-600'
											}`}
										style={selectedLayout === 'compact' ? {
											backgroundColor: 'rgba(108, 139, 125, 0.1)',
											borderColor: '#6C8B7D'
										} : {
											borderColor: 'var(--light-gray)'
										}}
										onClick={() => handleMenuStyleChange('compact')}
										onMouseEnter={(e) => {
											if (selectedLayout !== 'compact') {
												e.currentTarget.style.borderColor = '#94A3B8';
											}
										}}
										onMouseLeave={(e) => {
											if (selectedLayout !== 'compact') {
												e.currentTarget.style.borderColor = 'var(--light-gray)';
											}
										}}
									>
										<div className="flex flex-col ">
											<Dashboard width={24} height={24} strokeColor={selectedLayout === 'compact' ? '#6C8B7D' : colors.dark.primary} className="mb-3" />
											<h4
												className="font-inter text-sm font-medium dark:text-gray-100 mb-1"
												style={{ color: 'var(--text-primary)' }}
											>
												Compact
											</h4>
											<p
												className="font-lato text-xs dark:text-gray-400"
												style={{ color: 'var(--text-tertiary)' }}
											>
												Collapsed side menu with icons
											</p>
										</div>
									</div>
								</div>
							</div>

							{/* Theme Colors */}
							<div className="mb-6">
								<h3
									className="font-inter text-base font-medium dark:text-gray-100 mb-4"
									style={{ color: 'var(--text-primary)' }}
								>
									Theme Colors
								</h3>
								<div className="space-y-6">
									{/* Primary Color */}
									<ColorPicker
										label="Primary Color"
										value={primaryColor}
										onChange={handlePrimaryColorChange}
									/>

									{/* Secondary Color */}
									<ColorPicker
										label="Secondary Color"
										value={secondaryColor}
										onChange={handleSecondaryColorChange}
									/>
								</div>
							</div>

							{/* Logo Upload */}
							<LogoUpload
								label="Logo"
								value={logoFile || setupData.navigationSettings.logo.url}
								onFileSelect={handleLogoSelect}
								acceptedTypes={['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg']}
								maxSize={5}
								minDimensions={{ width: 174, height: 28 }}
							/>
						</div>
					</div>

					{/* Right Column - Theme Preview */}
					<div>
						<div
							className="dark:bg-gray-700 p-6"
							style={{ backgroundColor: 'var(--bg-primary)' }}
						>
							<div className="flex items-center gap-2 mb-4">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M8 1L10.5 5.5L15.5 6L12 9.5L13 14.5L8 12L3 14.5L4 9.5L0.5 6L5.5 5.5L8 1Z"
										className="dark:fill-gray-400"
										style={{ fill: 'var(--text-tertiary)' }}
									/>
								</svg>
								<h3
									className="font-inter text-base font-medium dark:text-gray-100"
									style={{ color: 'var(--text-primary)' }}
								>
									Theme Preview
								</h3>
							</div>
							<p
								className="font-lato text-sm dark:text-gray-400 mb-4"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Your selected colors will be applied to buttons, links, and UI elements throughout the CRM.
							</p>

							{/* Preview Elements */}
							<div className="space-y-4">
								<div className="flex gap-2">
									<Button
										variant="primary"
										size="sm"
										style={{ backgroundColor: primaryColor }}
										className="text-white whitespace-nowrap"
									>
										Primary Button
									</Button>
									<Button
										variant="outline"
										className="whitespace-nowrap"
										size="sm"
										style={{
											color: secondaryColor,
											borderColor: secondaryColor,
											backgroundColor: 'transparent'
										}}
									>
										Secondary Button
									</Button>
								</div>

								<div className="flex gap-2 ">
									<div
										className="w-4 h-4   cursor-pointer"
										style={{ backgroundColor: primaryColor }}
									/>
									<div
										className="w-4 h-4   cursor-pointer"
										style={{ backgroundColor: secondaryColor }}
									/>
								</div>
							</div>
						</div>

						<div className="mt-4">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleResetToDefault}
								className="text-sm dark:text-gray-400 dark:hover:text-gray-300 underline p-0 h-auto"
								style={{ color: 'var(--text-tertiary)' }}
								onMouseEnter={(e) => {
									e.currentTarget.style.color = 'var(--text-secondary)';
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.color = 'var(--text-tertiary)';
								}}
							>
								Reset to Default
							</Button>
						</div>
					</div>
				</div>
			</div>


		</div >
	);
}
