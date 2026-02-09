'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import PageHeading from './PageHeading';
import SubPageHeading from './SubPageHeading';
import Dropdown from './Dropdown';
import Button from './Button';
import {
	loadSoundPreferences,
	saveSoundPreferences,
	type SoundPreferences,
} from '@/utils/soundPreferences';
import { playNotificationSound, type SoundType } from '@/utils/soundEffects';
import { SpeakerLoudIcon, SpeakerOffIcon } from '@radix-ui/react-icons';

const SoundSettings: React.FC = () => {
	const pathname = usePathname();
	const [preferences, setPreferences] = useState<SoundPreferences>(loadSoundPreferences());
	const [hasChanges, setHasChanges] = useState(false);

	useEffect(() => {
		setPreferences(loadSoundPreferences());
	}, []);

	const handleGlobalToggle = (enabled: boolean) => {
		const newPreferences = { ...preferences, globalSoundEnabled: enabled };
		setPreferences(newPreferences);
		setHasChanges(true);
	};

	const handleComponentToggle = (component: keyof SoundPreferences['components'], enabled: boolean) => {
		const newPreferences = {
			...preferences,
			components: {
				...preferences.components,
				[component]: {
					...preferences.components[component],
					enabled,
				},
			},
		};
		setPreferences(newPreferences);
		setHasChanges(true);
	};

	const handleSoundTypeChange = (component: keyof SoundPreferences['components'], soundType: string) => {
		const newPreferences = {
			...preferences,
			components: {
				...preferences.components,
				[component]: {
					...preferences.components[component],
					soundType: soundType as SoundType,
				},
			},
		};
		setPreferences(newPreferences);
		setHasChanges(true);
	};

	const handleSave = () => {
		saveSoundPreferences(preferences);
		setHasChanges(false);
	};

	const handleTestSound = (component: keyof SoundPreferences['components']) => {
		if (preferences.globalSoundEnabled && preferences.components[component].enabled) {
			playNotificationSound(preferences.components[component].soundType);
		}
	};

	const soundTypeOptions: Array<{ value: SoundType; label: string }> = [
		{ value: 'notification', label: 'Notification' },
		{ value: 'success', label: 'Success' },
		{ value: 'error', label: 'Error' },
		{ value: 'warning', label: 'Warning' },
		{ value: 'info', label: 'Info' },
		{ value: 'follow', label: 'Follow' },
		{ value: 'like', label: 'Like' },
		{ value: 'join_request', label: 'Join Request' },
		{ value: 'group_activity', label: 'Group Activity' },
		{ value: 'comment', label: 'Comment' },
		{ value: 'welcome', label: 'Welcome' },
		{ value: 'panel_open', label: 'Panel Open' },
		{ value: 'new_notification', label: 'New Notification' },
	];

	const componentLabels: Record<keyof SoundPreferences['components'], string> = {
		notifications: 'Notifications',
		toasts: 'Toasts & Banners',
		panelOpen: 'Panel Open',
		navigation: 'Navigation',
		offlineBanner: 'Offline Banner',
		disposition: 'Disposition',
	};

	return (
		<div className="w-full h-full">
			{/* Header Section - Only show if not in usersettings page */}
			{!pathname?.includes('/usersettings') && (
				<div className="mb-6">
					<PageHeading text="Sound Settings" />
					<SubPageHeading text="Control sound notifications for different components. You can enable or disable sounds globally or for specific components." />
				</div>
			)}

			{/* Global Sound Toggle */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-3">
						{preferences.globalSoundEnabled ? (
							<SpeakerLoudIcon className="w-5 h-5" style={{ color: 'var(--text-primary)' }} />
						) : (
							<SpeakerOffIcon className="w-5 h-5" style={{ color: 'var(--text-tertiary)' }} />
						)}
						<div>
							<h3
								className="font-inter text-base font-semibold dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Global Sound
							</h3>
							<p
								className="font-inter text-[10px] md:text-[12px] dark:text-gray-400 mt-1"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Enable or disable all sounds across the application
							</p>
						</div>
					</div>
					<label className="relative inline-flex items-center cursor-pointer">
						<input
							type="checkbox"
							checked={preferences.globalSoundEnabled}
							onChange={(e) => handleGlobalToggle(e.target.checked)}
							className="sr-only peer"
						/>
						<div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
					</label>
				</div>
			</div>

			{/* Component Sound Settings */}
			<div
				className="dark:bg-gray-800 border dark:border-gray-700 p-6"
				style={{
					backgroundColor: 'var(--accent-white)',
					borderColor: 'var(--light-gray)'
				}}
			>
				<h3
					className="font-inter text-base font-semibold dark:text-gray-100 mb-4"
					style={{ color: 'var(--text-primary)' }}
				>
					Component Sound Settings
				</h3>
				<div className="space-y-4">
					{(Object.keys(preferences.components) as Array<keyof SoundPreferences['components']>).map((component) => (
						<div
							key={component}
							className="p-4 border dark:border-gray-700 rounded-lg"
							style={{
								backgroundColor: 'var(--bg-primary)',
								borderColor: 'var(--light-gray)'
							}}
						>
							<div className="flex items-start justify-between gap-4">
								<div className="flex-1">
									<div className="flex items-center justify-between mb-3">
										<h4
											className="font-inter text-[10px] md:text-[12px] font-medium dark:text-gray-100"
											style={{ color: 'var(--text-primary)' }}
										>
											{componentLabels[component]}
										</h4>
										<label className="relative inline-flex items-center cursor-pointer">
											<input
												type="checkbox"
												checked={preferences.components[component].enabled}
												onChange={(e) => handleComponentToggle(component, e.target.checked)}
												disabled={!preferences.globalSoundEnabled}
												className="sr-only peer"
											/>
											<div className={`w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 ${!preferences.globalSoundEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}></div>
										</label>
									</div>
									<div className="flex items-center gap-3">
										<div className="flex-1">
											<Dropdown
												label="Sound Type"
												value={preferences.components[component].soundType}
												onChange={(value) => {
													const stringValue = Array.isArray(value) ? value[0] : value;
													handleSoundTypeChange(component, stringValue);
												}}
												options={soundTypeOptions}
												disabled={!preferences.globalSoundEnabled || !preferences.components[component].enabled}
											/>
										</div>
										<Button
											variant="outline"
											size="md"
											onClick={() => handleTestSound(component)}
											disabled={!preferences.globalSoundEnabled || !preferences.components[component].enabled}
											className="mt-6"
										>
											Test
										</Button>
									</div>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Save Button */}
			{hasChanges && (
				<div className="mt-6 flex justify-end">
					<Button
						variant="primary"
						size="md"
						onClick={handleSave}
					>
						Save Changes
					</Button>
				</div>
			)}
		</div>
	);
};

export default SoundSettings;

