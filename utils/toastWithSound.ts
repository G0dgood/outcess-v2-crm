/**
 * Toast with Sound Effects
 * Wraps Sonner toast functions to automatically play sounds
 */

import { toast } from 'sonner';
import { playNotificationSound } from './soundEffects';
import type { SoundPreferences } from './soundPreferences';

/**
 * Show success toast with sound
 */
export const toastSuccess = (message: string, options?: Parameters<typeof toast.success>[1]) => {
	playNotificationSound('success', 'toasts');
	return toast.success(message, options);
};

/**
 * Show error toast with sound
 */
export const toastError = (message: string, options?: Parameters<typeof toast.error>[1]) => {
	playNotificationSound('error', 'toasts');
	return toast.error(message, options);
};

/**
 * Show warning toast with sound
 */
export const toastWarning = (message: string, options?: Parameters<typeof toast.warning>[1]) => {
	playNotificationSound('warning', 'toasts');
	return toast.warning(message, options);
};

/**
 * Show info toast with sound
 */
export const toastInfo = (message: string, options?: Parameters<typeof toast.info>[1]) => {
	playNotificationSound('info', 'toasts');
	return toast.info(message, options);
};

/**
 * Show loading toast (no sound, as it's temporary)
 */
export const toastLoading = (message: string, options?: Parameters<typeof toast.loading>[1]) => {
	return toast.loading(message, options);
};

/**
 * Show promise toast with sound based on result
 */
export const toastPromise = <T,>(
	promise: Promise<T>,
	messages: {
		loading: string;
		success: string | ((data: T) => string);
		error: string | ((error: any) => string);
	},
	options?: Parameters<typeof toast.promise>[2]
) => {
	return toast.promise(promise, messages, {
		...options,
		onSuccess: () => {
			playNotificationSound('success', 'toasts');
			options?.onSuccess?.();
		},
		onError: (error) => {
			playNotificationSound('error', 'toasts');
			options?.onError?.(error);
		},
	});
};

// Re-export other toast functions
export { toast };

