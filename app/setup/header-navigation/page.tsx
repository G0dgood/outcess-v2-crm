'use client';

import React, { useState } from 'react';
import { Menu } from '@/components/setupIcon/Menu';
import { Dashboard } from '@/components/setupIcon/Dashboard';
import Input from '@/components/ui/Input';
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
				<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050]">Header & Navigation</h1>
				<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280]">Customize how your CRM navigation and layout will appear to users.</p>
			</div>

			<div className="bg-(--accent-white) border border-gray-200  w-full h-full">
				<div className="box-border w-full h-[97px] border-b border-[#E5E7EB] mb-6 p-6">
					<h2 className="font-inter text-xl font-semibold text-[#050711] mb-2">Navigation Settings</h2>
					<p className="font-lato text-sm text-gray-600 mb-6">Configure your CRM's main navigation structure</p>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
					{/* Left Column */}
					<div className="space-y-8">
						{/* Navigation Settings */}
						<div>

							{/* Menu Style */}
							<div className="mb-6">
								<h3 className="font-inter text-base font-medium text-[#050711] mb-4">Menu Style</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Layout Style Card */}
									<div
										className={`p-4 border-2 cursor-pointer transition-all ${selectedLayout === 'layout'
											? 'border-[#6C8B7D] bg-[#6C8B7D]/10'
											: 'border-gray-200 hover:border-gray-300'
											}`}
										onClick={() => handleMenuStyleChange('layout')}
									>
										<div className="flex flex-col">
											<Menu width={24} height={24} strokeColor={selectedLayout === 'layout' ? '#6C8B7D' : colors.dark.primary} className="mb-3" />
											<h4 className="font-inter text-sm font-medium text-[#050711] mb-1">Layout Style</h4>
											<p className="font-lato text-xs text-gray-600">Vertical menu on the left</p>
										</div>
									</div>

									{/* Compact Card */}
									<div
										className={`p-4 border-2 cursor-pointer transition-all ${selectedLayout === 'compact'
											? 'border-[#6C8B7D] bg-[#6C8B7D]/10'
											: 'border-gray-200 hover:border-gray-300'
											}`}
										onClick={() => handleMenuStyleChange('compact')}
									>
										<div className="flex flex-col ">
											<Dashboard width={24} height={24} strokeColor={selectedLayout === 'compact' ? '#6C8B7D' : colors.dark.primary} className="mb-3" />
											<h4 className="font-inter text-sm font-medium text-[#050711] mb-1">Compact</h4>
											<p className="font-lato text-xs text-gray-600">Collapsed side menu with icons</p>
										</div>
									</div>
								</div>
							</div>

							{/* Theme Colors */}
							<div className="mb-6">
								<h3 className="font-inter text-base font-medium text-[#050711] mb-4">Theme Colors</h3>
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
								onFileSelect={handleLogoSelect}
								acceptedTypes={['image/svg+xml', 'image/png', 'image/jpeg', 'image/jpg']}
								maxSize={5}
								minDimensions={{ width: 174, height: 28 }}
							/>
						</div>
					</div>

					{/* Right Column - Theme Preview */}
					<div>
						<div className="bg-gray-50   p-6">
							<div className="flex items-center gap-2 mb-4">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path d="M8 1L10.5 5.5L15.5 6L12 9.5L13 14.5L8 12L3 14.5L4 9.5L0.5 6L5.5 5.5L8 1Z" fill="#6B7280" />
								</svg>
								<h3 className="font-inter text-base font-medium text-[#050711]">Theme Preview</h3>
							</div>
							<p className="font-lato text-sm text-gray-600 mb-4">Your selected colors will be applied to buttons, links, and UI elements throughout the CRM.</p>

							{/* Preview Elements */}
							<div className="space-y-4">
								<div className="flex gap-2">
									<Button
										variant="primary"
										size="sm"
										style={{ backgroundColor: primaryColor }}
										className="text-white"
									>
										Primary Button
									</Button>
									<Button
										variant="outline"
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
								className="text-sm text-gray-600 hover:text-gray-800 underline p-0 h-auto"
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
