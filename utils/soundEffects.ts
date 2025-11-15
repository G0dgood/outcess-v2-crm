/**
 * Sound Effects Utility
 * Provides functions to play various sound effects throughout the application
 */

import { getIsNavigating } from './navigationState';
import { shouldPlaySound, getComponentSoundType, loadSoundPreferences, type SoundPreferences } from './soundPreferences';

export type SoundType = 
	| 'notification'
	| 'success'
	| 'error'
	| 'warning'
	| 'info'
	| 'follow'
	| 'like'
	| 'join_request'
	| 'group_activity'
	| 'comment'
	| 'welcome'
	| 'panel_open'
	| 'new_notification';

interface SoundConfig {
	frequency: number;
	duration: number;
	type?: 'sine' | 'square' | 'triangle' | 'sawtooth';
	volume?: number;
	delay?: number;
}

/**
 * Play a sound using Web Audio API
 */
export const playSound = (
	frequency: number,
	duration: number,
	type: 'sine' | 'square' | 'triangle' | 'sawtooth' = 'sine',
	volume: number = 0.3
): void => {
	if (typeof window === 'undefined') return;
	
	// Check global sound preferences
	const preferences = loadSoundPreferences();
	if (!preferences.globalSoundEnabled) {
		return;
	}
	
	// Don't play sounds during navigation
	if (getIsNavigating()) {
		return;
	}

	try {
		const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.frequency.value = frequency;
		oscillator.type = type;

		gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
		gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);

		oscillator.start(audioContext.currentTime);
		oscillator.stop(audioContext.currentTime + duration);
	} catch (error) {
		console.error('Error playing sound:', error);
	}
};

/**
 * Play a sequence of sounds
 */
export const playSoundSequence = (sounds: SoundConfig[]): void => {
	sounds.forEach((sound, index) => {
		const delay = sound.delay || (index * 100);
		setTimeout(() => {
			playSound(
				sound.frequency,
				sound.duration,
				sound.type || 'sine',
				sound.volume || 0.3
			);
		}, delay);
	});
};

/**
 * Play notification sound based on type
 * @param type - The sound type to play
 * @param component - Optional component name to check component-specific settings
 */
export const playNotificationSound = (type: SoundType, component?: keyof SoundPreferences['components']): void => {
	// Check if sound should play for this component
	if (component && !shouldPlaySound(component)) {
		return;
	}
	
	// If component is specified, use its configured sound type
	if (component) {
		type = getComponentSoundType(component);
	}
	switch (type) {
		case 'notification':
		case 'new_notification':
			// Pleasant notification sound
			playSound(523.25, 0.15, 'sine', 0.25); // C5
			break;

		case 'success':
			// Success chime (ascending)
			playSoundSequence([
				{ frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.25 }, // C5
				{ frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.25, delay: 100 }, // E5
				{ frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.25, delay: 200 }, // G5
			]);
			break;

		case 'error':
			// Error sound (descending)
			playSoundSequence([
				{ frequency: 440, duration: 0.15, type: 'square', volume: 0.3 }, // A4
				{ frequency: 392, duration: 0.15, type: 'square', volume: 0.3, delay: 150 }, // G4
			]);
			break;

		case 'warning':
			// Warning sound
			playSoundSequence([
				{ frequency: 440, duration: 0.15, type: 'triangle', volume: 0.3 }, // A4
				{ frequency: 440, duration: 0.15, type: 'triangle', volume: 0.3, delay: 200 }, // A4
			]);
			break;

		case 'info':
			// Info sound (gentle)
			playSound(493.88, 0.15, 'sine', 0.2); // B4
			break;

		case 'follow':
			// Pleasant ascending tone
			playSoundSequence([
				{ frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.25 }, // C5
				{ frequency: 659.25, duration: 0.15, type: 'sine', volume: 0.25, delay: 100 }, // E5
			]);
			break;

		case 'like':
			// Short pleasant beep
			playSound(659.25, 0.12, 'sine', 0.2); // E5
			break;

		case 'join_request':
			// Attention-getting tone
			playSoundSequence([
				{ frequency: 440, duration: 0.15, type: 'triangle', volume: 0.3 }, // A4
				{ frequency: 554.37, duration: 0.15, type: 'triangle', volume: 0.3, delay: 150 }, // C#5
			]);
			break;

		case 'group_activity':
			// Gentle chime
			playSoundSequence([
				{ frequency: 392, duration: 0.1, type: 'sine', volume: 0.2 }, // G4
				{ frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.2, delay: 100 }, // C5
			]);
			break;

		case 'comment':
			// Soft notification sound
			playSound(493.88, 0.15, 'sine', 0.25); // B4
			break;

		case 'welcome':
			// Welcoming melody
			playSoundSequence([
				{ frequency: 523.25, duration: 0.1, type: 'sine', volume: 0.25 }, // C5
				{ frequency: 659.25, duration: 0.1, type: 'sine', volume: 0.25, delay: 100 }, // E5
				{ frequency: 783.99, duration: 0.2, type: 'sine', volume: 0.25, delay: 200 }, // G5
			]);
			break;

		case 'panel_open':
			// Subtle opening sound
			playSound(440, 0.1, 'sine', 0.15); // A4
			break;

		default:
			// Default notification sound
			playSound(440, 0.15, 'sine', 0.25); // A4
	}
};

