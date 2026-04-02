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
import Toggle from './Toggle';
import { useCampaign } from '@/contexts/CampaignContext';

const SoundSettings: React.FC = () => {
	const pathname = usePathname();
	const { campaignData } = useCampaign();
	const primaryColor = campaignData?.primaryColor || '#6C8B7D';
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

		// Play the sound immediately so the user can hear it
		if (preferences.globalSoundEnabled && preferences.components[component].enabled) {
			playNotificationSound(soundType as SoundType);
		}
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
			<div className="bg-surface dark:bg-gray-800 border dark:border-gray-700 p-6 mb-6 border-light transition-colors">
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<div className={`p-3 rounded-full ${preferences.globalSoundEnabled ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-50 dark:bg-gray-900/20'}`}>
							{preferences.globalSoundEnabled ? (
								<SpeakerLoudIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
							) : (
								<SpeakerOffIcon className="w-6 h-6 text-gray-400" />
							)}
						</div>
						<div>
							<h3 className="text-primary font-inter text-base font-semibold dark:text-gray-100">
								Global Sound
							</h3>
							<p className="text-tertiary font-inter text-[10px] md:text-[12px] dark:text-gray-400 mt-0.5">
								Enable or disable all sounds across the application
							</p>
						</div>
					</div>
					<Toggle
						checked={preferences.globalSoundEnabled}
						onChange={(checked) => handleGlobalToggle(checked)}
						color={primaryColor}
					/>
				</div>
			</div>

			{/* Component Sound Settings */}
			<div className="bg-surface dark:bg-gray-800 border border-light dark:border-gray-700 p-6   transition-colors">
				<h3 className="text-primary font-inter text-base font-semibold dark:text-gray-100 mb-6">
					Component Notifications
				</h3>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{(Object.keys(preferences.components) as Array<keyof SoundPreferences['components']>).map((component) => (
						<div
							key={component}
							className={`p-5 border border-light dark:border-gray-700  transition-all duration-200 ${preferences.globalSoundEnabled && preferences.components[component].enabled
								? 'bg-white dark:bg-gray-800/50  border-blue-100 dark:border-blue-900/30'
								: 'bg-gray-50/50 dark:bg-gray-900/30 opacity-75'
								}`}
						>
							<div className="space-y-4">
								<div className="flex items-center justify-between">
									<h4 className="text-primary font-inter text-sm font-semibold dark:text-gray-100">
										{componentLabels[component]}
									</h4>
									<Toggle
										checked={preferences.components[component].enabled}
										onChange={(checked) => handleComponentToggle(component, checked)}
										disabled={!preferences.globalSoundEnabled}
										size="sm"
										color={primaryColor}
									/>
								</div>

								<div className="flex items-end gap-3">
									<div className="flex-1">
										<Dropdown
											label="Alert Sound"
											value={preferences.components[component].soundType}
											onChange={(value) => {
												const stringValue = Array.isArray(value) ? value[0] : value;
												handleSoundTypeChange(component, stringValue);
											}}
											options={soundTypeOptions}
											disabled={!preferences.globalSoundEnabled || !preferences.components[component].enabled}
											className="mb-0"
										/>
									</div>
									<Button
										variant="outline"
										size="sm"
										onClick={() => handleTestSound(component)}
										disabled={!preferences.globalSoundEnabled || !preferences.components[component].enabled}
										className="h-[43px] mb-[-1px] min-w-[60px]"
										icon={<SpeakerLoudIcon className="w-3.5 h-3.5" />}
									>
										Test
									</Button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Save Button */}
			<div className="mt-8 flex justify-end">
				<Button
					variant="primary"
					size="md"
					onClick={handleSave}
					disabled={!hasChanges}
					className={`min-w-[140px] shadow-lg transition-transform ${hasChanges ? 'scale-100 opacity-100' : 'scale-95 opacity-50 pointer-events-none'}`}
				>
					Save Preferences
				</Button>
			</div>
		</div>
	);
};

export default SoundSettings;
