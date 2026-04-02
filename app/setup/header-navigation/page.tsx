'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/Button';
import ColorPicker from '@/components/ui/ColorPicker';
import LogoUpload from '@/components/ui/LogoUpload';
import Modal from '@/components/ui/Modal';
import { colors } from '@/lib/colors';
import { useSetup } from '@/contexts/SetupContext';

type ColorChangeHandler = (color: string) => void;
type FileSelectHandler = (file: File | null) => void;

export default function HeaderNavigationPage(): React.JSX.Element {
	const { setupData, updateSetupData, updateNavigationSettings, isDirty, onPersist } = useSetup();
	const [primaryColor, setPrimaryColor] = useState<string>(setupData.primaryColor);
	const [secondaryColor, setSecondaryColor] = useState<string>(setupData.secondaryColor);
	const [textColor, setTextColor] = useState<string>(setupData.textColor);
	const [tableColor, setTableColor] = useState<string>(setupData.tableColor);
	const [backgroundColor, setBackgroundColor] = useState<string>(setupData.backgroundColor);
	const [accentColor, setAccentColor] = useState<string>(setupData.accentColor);
	const [primaryColorDark, setPrimaryColorDark] = useState<string>(setupData.primaryColorDark);
	const [secondaryColorDark, setSecondaryColorDark] = useState<string>(setupData.secondaryColorDark);
	const [textColorDark, setTextColorDark] = useState<string>(setupData.textColorDark);
	const [tableColorDark, setTableColorDark] = useState<string>(setupData.tableColorDark);
	const [backgroundColorDark, setBackgroundColorDark] = useState<string>(setupData.backgroundColorDark);
	const [accentColorDark, setAccentColorDark] = useState<string>(setupData.accentColorDark);
	const [mainForegroundColor, setMainForegroundColor] = useState<string>(setupData.mainForegroundColor);
	const [mainForegroundColorDark, setMainForegroundColorDark] = useState<string>(setupData.mainForegroundColorDark);
	const [logoFile, setLogoFile] = useState<File | null>(null);
	const [isResetModalOpen, setIsResetModalOpen] = useState(false);
	const [isResetting, setIsResetting] = useState(false);

	const handlePrimaryColorChange: ColorChangeHandler = (color: string): void => {
		setPrimaryColor(color);
		updateSetupData({ primaryColor: color });
	};

	const handleSecondaryColorChange: ColorChangeHandler = (color: string): void => {
		setSecondaryColor(color);
		updateSetupData({ secondaryColor: color });
	};

	const handleTextColorChange: ColorChangeHandler = (color: string): void => {
		setTextColor(color);
		updateSetupData({ textColor: color });
	};

	const handleTableColorChange: ColorChangeHandler = (color: string): void => {
		setTableColor(color);
		updateSetupData({ tableColor: color });
	};

	const handleBackgroundColorChange: ColorChangeHandler = (color: string): void => {
		setBackgroundColor(color);
		updateSetupData({ backgroundColor: color });
	};

	const handleAccentColorChange: ColorChangeHandler = (color: string): void => {
		setAccentColor(color);
		updateSetupData({ accentColor: color });
	};

	const handlePrimaryColorDarkChange: ColorChangeHandler = (color: string): void => {
		setPrimaryColorDark(color);
		updateSetupData({ primaryColorDark: color });
	};

	const handleSecondaryColorDarkChange: ColorChangeHandler = (color: string): void => {
		setSecondaryColorDark(color);
		updateSetupData({ secondaryColorDark: color });
	};

	const handleTextColorDarkChange: ColorChangeHandler = (color: string): void => {
		setTextColorDark(color);
		updateSetupData({ textColorDark: color });
	};

	const handleTableColorDarkChange: ColorChangeHandler = (color: string): void => {
		setTableColorDark(color);
		updateSetupData({ tableColorDark: color });
	};

	const handleBackgroundColorDarkChange: ColorChangeHandler = (color: string): void => {
		setBackgroundColorDark(color);
		updateSetupData({ backgroundColorDark: color });
	};

	const handleAccentColorDarkChange: ColorChangeHandler = (color: string): void => {
		setAccentColorDark(color);
		updateSetupData({ accentColorDark: color });
	};

	const handleMainForegroundColorChange: ColorChangeHandler = (color: string): void => {
		setMainForegroundColor(color);
		updateSetupData({ mainForegroundColor: color });
	};

	const handleMainForegroundColorDarkChange: ColorChangeHandler = (color: string): void => {
		setMainForegroundColorDark(color);
		updateSetupData({ mainForegroundColorDark: color });
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
		setIsResetModalOpen(true);
	};

	const confirmReset = (): void => {
		setIsResetting(true);
		
		// Add 1s delay as requested
		setTimeout(() => {
			setPrimaryColor(colors.dark.primary);
			setSecondaryColor(colors.accent.mutedSageGreen);
			setTextColor(colors.dark.primary);
			setTableColor(colors.light.offWhite);
			setBackgroundColor('#FFFFFF');
			setAccentColor(colors.accent.mutedSageGreen);
			setPrimaryColorDark('#F3F4F6');
			setSecondaryColorDark('#6C8B7D');
			setTextColorDark('#F3F4F6');
			setTableColorDark('#1E293B');
			setBackgroundColorDark('#0F172A');
			setAccentColorDark('#6C8B7D');
			setMainForegroundColor('#FFFFFF');
			setMainForegroundColorDark('#0F172A');
			updateSetupData({
				primaryColor: colors.dark.primary,
				secondaryColor: colors.accent.mutedSageGreen,
				textColor: colors.dark.primary,
				tableColor: colors.light.offWhite,
				backgroundColor: '#FFFFFF',
				accentColor: colors.accent.mutedSageGreen,
				primaryColorDark: '#F3F4F6',
				secondaryColorDark: '#6C8B7D',
				textColorDark: '#F3F4F6',
				tableColorDark: '#1E293B',
				backgroundColorDark: '#0F172A',
				accentColorDark: '#6C8B7D',
				mainForegroundColor: '#FFFFFF',
				mainForegroundColorDark: '#0F172A',
			});
			setIsResetting(false);
			setIsResetModalOpen(false);
		}, 1000);
	};

	return (
		<div className="w-full h-full">
			<div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
				<div>
					<h1
						className="font-lato not-italic font-semibold text-[24px] leading-[150%] dark:text-gray-100"
						style={{ color: 'var(--text-secondary)' }}
					>
						Header & Navigation
					</h1>
					<p
						className="font-lato not-italic font-normal text-[12px] md:text-[14px] leading-[150%] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Customize how your CRM navigation and layout will appear to users.
					</p>
				</div>
				{isDirty && onPersist && (
					<Button
						variant="outline"
						size="md"
						onClick={() => onPersist(false)}
						className="w-full sm:w-auto"
					>
						Save
					</Button>
				)}
			</div>

			<div
				className="dark:bg-gray-800 border dark:border-gray-700 w-full h-full rounded-[var(--radius)]"
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
						className="font-inter text-[14px] md:text-[16px] font-semibold dark:text-gray-100 mb-2"
						style={{ color: 'var(--text-primary)' }}
					>
						Navigation Settings
					</h2>
					<p
						className="font-lato text-[10px] md:text-[12px] dark:text-gray-400 mb-6"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Configure your CRM&apos;s main navigation structure
					</p>
				</div>
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
					{/* Left Column */}
					<div className="space-y-8">
						{/* Light Mode Theme Colors */}
						<div>
							<h3
								className="font-inter text-base font-medium dark:text-gray-100 mb-4"
								style={{ color: 'var(--text-primary)' }}
							>
								Light Mode Theme Colors
							</h3>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ColorPicker
										label="Primary Color"
										value={primaryColor}
										onChange={handlePrimaryColorChange}
										onRemove={() => handlePrimaryColorChange(colors.dark.primary)}
									/>
									<ColorPicker
										label="Secondary Color"
										value={secondaryColor}
										onChange={handleSecondaryColorChange}
										onRemove={() => handleSecondaryColorChange(colors.accent.mutedSageGreen)}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ColorPicker
										label="Text Color"
										value={textColor}
										onChange={handleTextColorChange}
										onRemove={() => handleTextColorChange(colors.dark.primary)}
									/>
									<ColorPicker
										label="Table Header Color"
										value={tableColor}
										onChange={handleTableColorChange}
										onRemove={() => handleTableColorChange(colors.light.offWhite)}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ColorPicker
										label="Background Color"
										value={backgroundColor}
										onChange={handleBackgroundColorChange}
										onRemove={() => handleBackgroundColorChange(colors.light.offWhite)}
									/>
									<ColorPicker
										label="Accent Color"
										value={accentColor}
										onChange={handleAccentColorChange}
										onRemove={() => handleAccentColorChange(colors.accent.mutedSageGreen)}
									/>
									<ColorPicker
										label="Main Foreground"
										value={mainForegroundColor}
										onChange={handleMainForegroundColorChange}
										onRemove={() => handleMainForegroundColorChange('#FFFFFF')}
									/>
								</div>
							</div>
						</div>

						{/* Dark Mode Theme Colors */}
						<div>
							<h3
								className="font-inter text-base font-medium dark:text-gray-100 mb-4"
								style={{ color: 'var(--text-primary)' }}
							>
								Dark Mode Theme Colors
							</h3>
							<div className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ColorPicker
										label="Primary Color (Dark)"
										value={primaryColorDark}
										onChange={handlePrimaryColorDarkChange}
										onRemove={() => handlePrimaryColorDarkChange('#F3F4F6')}
									/>
									<ColorPicker
										label="Secondary Color (Dark)"
										value={secondaryColorDark}
										onChange={handleSecondaryColorDarkChange}
										onRemove={() => handleSecondaryColorDarkChange('#6C8B7D')}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ColorPicker
										label="Text Color (Dark)"
										value={textColorDark}
										onChange={handleTextColorDarkChange}
										onRemove={() => handleTextColorDarkChange('#F3F4F6')}
									/>
									<ColorPicker
										label="Table Header Color (Dark)"
										value={tableColorDark}
										onChange={handleTableColorDarkChange}
										onRemove={() => handleTableColorDarkChange('#1E293B')}
									/>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<ColorPicker
										label="Background Color (Dark)"
										value={backgroundColorDark}
										onChange={handleBackgroundColorDarkChange}
										onRemove={() => handleBackgroundColorDarkChange('#0F172A')}
									/>
									<ColorPicker
										label="Accent Color (Dark)"
										value={accentColorDark}
										onChange={handleAccentColorDarkChange}
										onRemove={() => handleAccentColorDarkChange('#6C8B7D')}
									/>
									<ColorPicker
										label="Main Foreground (Dark)"
										value={mainForegroundColorDark}
										onChange={handleMainForegroundColorDarkChange}
										onRemove={() => handleMainForegroundColorDarkChange('#0F172A')}
									/>
								</div>
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

					{/* Right Column - Theme Preview */}
					<div className="space-y-4">
						<div
							className="dark:bg-gray-700 p-6 rounded-[var(--radius)] border"
							style={{ backgroundColor: backgroundColor, borderColor: 'var(--light-gray)' }}
						>
							<div className="flex items-center gap-2 mb-4">
								<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
									<path
										d="M8 1L10.5 5.5L15.5 6L12 9.5L13 14.5L8 12L3 14.5L4 9.5L0.5 6L5.5 5.5L8 1Z"
										style={{ fill: accentColor }}
									/>
								</svg>
								<h3
									className="font-inter text-base font-semibold"
									style={{ color: textColor }}
								>
									Theme Preview
								</h3>
							</div>

							<div className="space-y-6">
								{/* Text Sample */}
								<div className="space-y-2">
									<p className="text-[14px] font-medium" style={{ color: textColor }}>
										This is how your main text looks.
									</p>
									<p className="text-[12px] opacity-70" style={{ color: textColor }}>
										Supporting text and descriptions will follow this style but with reduced opacity.
									</p>
								</div>

								{/* Table Sample */}
								<div className="rounded-lg border overflow-hidden" style={{ borderColor: 'var(--light-gray)' }}>
									<table className="w-full text-left text-[11px]">
										<thead>
											<tr style={{ backgroundColor: tableColor }}>
												<th className="px-3 py-2 font-semibold" style={{ color: textColor }}>Name</th>
												<th className="px-3 py-2 font-semibold" style={{ color: textColor }}>Status</th>
											</tr>
										</thead>
										<tbody style={{ backgroundColor: 'white' }}>
											<tr className="border-t" style={{ borderColor: 'var(--light-gray)' }}>
												<td className="px-3 py-2" style={{ color: textColor }}>John Doe</td>
												<td className="px-3 py-2">
													<span className="px-2 py-0.5 rounded-full text-[10px]" style={{ backgroundColor: accentColor, color: 'white' }}>Active</span>
												</td>
											</tr>
										</tbody>
									</table>
								</div>

								{/* Button Sample */}
								<div className="flex gap-3">
									<Button
										variant="primary"
										size="sm"
										style={{ backgroundColor: primaryColor }}
										className="text-white whitespace-nowrap"
									>
										Primary
									</Button>
									<Button
										style={{ border: `1px solid ${secondaryColor}`, color: secondaryColor }}
										variant="outline"
										size="sm"
										className="whitespace-nowrap bg-transparent"
									>
										Secondary
									</Button>
								</div>
							</div>
						</div>

						<div className="flex justify-start">
							<Button
								variant="ghost"
								size="sm"
								onClick={handleResetToDefault}
								className="text-[12px] underline p-0 h-auto opacity-60 hover:opacity-100"
								style={{ color: textColor }}
							>
								Reset to Default
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Reset Confirmation Modal */}
			<Modal
				isOpen={isResetModalOpen}
				onClose={() => setIsResetModalOpen(false)}
				title="Reset Theme Colors"
				size="sm"
			>
				<div className="p-6 space-y-4 text-center">
					<div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
							<path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0378 2.66667 10.268 4L3.33978 16C2.56998 17.3333 3.53223 19 5.07183 19Z" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
						</svg>
					</div>
					<h3 className="text-lg font-semibold dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>Are you sure?</h3>
					<p className="text-[14px] leading-relaxed dark:text-gray-400" style={{ color: 'var(--text-secondary)' }}>
						This will reset all your theme colors to their original defaults. This action cannot be undone.
					</p>
					<div className="flex flex-col gap-2 pt-4">
						<Button
							variant="primary"
							className="w-full !bg-red-500 hover:!bg-red-600 text-white"
							onClick={confirmReset}
							loading={isResetting}
						>
							Yes, Reset to Default
						</Button>
						<Button
							variant="ghost"
							className="w-full"
							onClick={() => setIsResetModalOpen(false)}
						>
							Cancel
						</Button>
					</div>
				</div>
			</Modal>
		</div>
	);
}
