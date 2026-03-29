'use client';

import React, { useState, useEffect } from 'react';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import { GearIcon } from '@radix-ui/react-icons';
import SubPageHeading from '@/components/ui/SubPageHeading';
import PageHeading from '@/components/ui/PageHeading';

const GeneralSettings: React.FC = () => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [tooltipLength, setTooltipLength] = useState<number>(10);
	const [notificationSound, setNotificationSound] = useState<string>('https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3');

	const soundOptions = [
		{ name: 'Note (iPhone Default)', url: 'https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3' },
		{ name: 'Tri-tone (iPhone)', url: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3' },
		{ name: 'Aurora (iOS)', url: 'https://assets.mixkit.co/active_storage/sfx/2357/2357-preview.mp3' },
		{ name: 'Bamboo (iOS)', url: 'https://assets.mixkit.co/active_storage/sfx/2359/2359-preview.mp3' },
		{ name: 'Glass (iOS)', url: 'https://assets.mixkit.co/active_storage/sfx/2361/2361-preview.mp3' },
	];

	useEffect(() => {
		const savedLength = localStorage.getItem('report_tooltip_length');
		if (savedLength) {
			setTooltipLength(parseInt(savedLength, 10));
		}

		const savedSound = localStorage.getItem('notification_sound_url');
		if (savedSound) {
			setNotificationSound(savedSound);
		}
	}, []);

	const handleTooltipLengthChange = (value: string) => {
		const length = parseInt(value, 10);
		if (!isNaN(length) && length > 0) {
			setTooltipLength(length);
			localStorage.setItem('report_tooltip_length', length.toString());
			toast.success('Tooltip length saved');
		}
	};

	const handleSoundChange = (url: string) => {
		setNotificationSound(url);
		localStorage.setItem('notification_sound_url', url);
		toast.success('Notification sound preference saved');
	};

	const playTestSound = () => {
		const audio = new Audio(notificationSound);
		audio.play().catch(err => toast.error('Sound playback failed. Please check browser permissions.'));
	};

	return (
		<div className="space-y-6">
			<div>
				<PageHeading text="General Settings" />
				<SubPageHeading text="Manage general configuration for your application." />
			</div>

			<div className="space-y-6">
				{/* Tooltip Length Setting */}
				<div
					className="flex items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 rounded-full" style={{ backgroundColor: primaryColor + '20' }}>
							<GearIcon className="w-5 h-5" style={{ color: primaryColor }} />
						</div>
						<div>
							<h3
								className="text-base font-medium dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Table Text Abbreviation Length
							</h3>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Set the number of characters to show before abbreviating text in tables.
							</p>
						</div>
					</div>
					<div className="w-24">
						<Input
							label=""
							type="number"
							value={tooltipLength.toString()}
							onChange={handleTooltipLengthChange}
							className="text-center"
						/>
					</div>
				</div>

				{/* Notification Sound Setting */}
				<div
					className="flex flex-col md:flex-row md:items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700 gap-4"
					style={{
						backgroundColor: 'var(--accent-white)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 rounded-full" style={{ backgroundColor: primaryColor + '20' }}>
							<GearIcon className="w-5 h-5" style={{ color: primaryColor }} />
						</div>
						<div>
							<h3
								className="text-base font-medium dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Notification Sound
							</h3>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Select the alert sound for new messages.
							</p>
						</div>
					</div>
					<div className="flex items-center gap-3">
						<select
							value={notificationSound}
							onChange={(e) => handleSoundChange(e.target.value)}
							className="bg-transparent border dark:border-gray-600 dark:text-white px-3 py-2 text-sm focus:outline-none focus:ring-1"
							style={{ borderColor: 'var(--light-gray)', color: 'var(--text-secondary)' }}
						>
							{soundOptions.map(opt => (
								<option key={opt.url} value={opt.url}>{opt.name}</option>
							))}
						</select>
						<button
							onClick={playTestSound}
							className="px-4 py-2 text-sm font-medium transition-colors"
							style={{ backgroundColor: primaryColor + '10', color: primaryColor }}
						>
							Play Test Sound
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneralSettings;
