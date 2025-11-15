/**
 * Offline Dispositions Utility
 * Manages disposition data when offline, storing in localStorage and syncing when online
 */

import { DispositionFormData } from '@/components/ui/FillDispositionModal';

export interface OfflineDisposition extends DispositionFormData {
	id: string;
	customerId?: string;
	customerName?: string;
	status: 'pending' | 'synced' | 'failed';
	createdAt: string;
	updatedAt: string;
	syncedAt?: string;
}

const STORAGE_KEY = 'offline_dispositions';

/**
 * Get all offline dispositions
 */
export const getOfflineDispositions = (): OfflineDisposition[] => {
	if (typeof window === 'undefined') return [];

	try {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			return Array.isArray(parsed) ? parsed : [];
		}
	} catch (error) {
		console.error('Error loading offline dispositions:', error);
	}
	return [];
};

/**
 * Save a disposition offline
 */
export const saveOfflineDisposition = (
	disposition: DispositionFormData,
	customerId?: string,
	customerName?: string
): OfflineDisposition => {
	const offlineDisposition: OfflineDisposition = {
		...disposition,
		id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		customerId,
		customerName,
		status: 'pending',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
	};

	const existing = getOfflineDispositions();
	existing.push(offlineDisposition);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));

	return offlineDisposition;
};

/**
 * Update disposition status
 */
export const updateDispositionStatus = (
	id: string,
	status: 'pending' | 'synced' | 'failed'
): void => {
	const dispositions = getOfflineDispositions();
	const index = dispositions.findIndex(d => d.id === id);
	
	if (index !== -1) {
		dispositions[index].status = status;
		dispositions[index].updatedAt = new Date().toISOString();
		if (status === 'synced') {
			dispositions[index].syncedAt = new Date().toISOString();
		}
		localStorage.setItem(STORAGE_KEY, JSON.stringify(dispositions));
	}
};

/**
 * Remove a disposition (after successful sync)
 */
export const removeOfflineDisposition = (id: string): void => {
	const dispositions = getOfflineDispositions();
	const filtered = dispositions.filter(d => d.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

/**
 * Get pending dispositions count
 */
export const getPendingDispositionsCount = (): number => {
	return getOfflineDispositions().filter(d => d.status === 'pending').length;
};

/**
 * Get all pending dispositions
 */
export const getPendingDispositions = (): OfflineDisposition[] => {
	return getOfflineDispositions().filter(d => d.status === 'pending');
};

/**
 * Clear all synced dispositions
 */
export const clearSyncedDispositions = (): void => {
	const dispositions = getOfflineDispositions();
	const pending = dispositions.filter(d => d.status !== 'synced');
	localStorage.setItem(STORAGE_KEY, JSON.stringify(pending));
};

/**
 * Sync pending dispositions when online
 * This should be called when connection is restored
 */
export const syncPendingDispositions = async (
	sendFn?: (message: any) => void
): Promise<{ success: number; failed: number }> => {
	const pending = getPendingDispositions();
	let success = 0;
	let failed = 0;

	for (const disposition of pending) {
		try {
			if (sendFn) {
				sendFn({
					type: 'disposition',
					payload: {
						...disposition,
						timestamp: new Date().toISOString(),
					},
				});
				updateDispositionStatus(disposition.id, 'synced');
				success++;
			} else {
				// If no send function, mark as failed
				updateDispositionStatus(disposition.id, 'failed');
				failed++;
			}
		} catch (error) {
			console.error('Error syncing disposition:', error);
			updateDispositionStatus(disposition.id, 'failed');
			failed++;
		}
	}

	return { success, failed };
};

/**
 * Save a synced disposition (after successful sync)
 * This stores dispositions that were successfully synced to the server
 */
const SYNCED_DISPOSITIONS_KEY = 'synced_dispositions';

export interface SyncedDisposition extends DispositionFormData {
	id: string;
	customerId?: string;
	customerName?: string;
	syncedAt: string;
	agent?: string;
	agentId?: string;
}

export const saveSyncedDisposition = (
	disposition: DispositionFormData,
	customerId?: string,
	customerName?: string,
	agent?: string,
	agentId?: string
): SyncedDisposition => {
	const syncedDisposition: SyncedDisposition = {
		...disposition,
		id: `synced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		customerId,
		customerName,
		agent: agent || 'Current User',
		agentId: agentId || 'user.001',
		syncedAt: new Date().toISOString(),
	};

	if (typeof window !== 'undefined') {
		try {
			const existing = localStorage.getItem(SYNCED_DISPOSITIONS_KEY);
			const synced: SyncedDisposition[] = existing ? JSON.parse(existing) : [];
			synced.push(syncedDisposition);
			// Keep only last 100 synced dispositions
			const trimmed = synced.slice(-100);
			localStorage.setItem(SYNCED_DISPOSITIONS_KEY, JSON.stringify(trimmed));
		} catch (error) {
			console.error('Error saving synced disposition:', error);
		}
	}

	return syncedDisposition;
};

/**
 * Get all synced dispositions for a customer
 */
export const getSyncedDispositions = (customerId?: string): SyncedDisposition[] => {
	if (typeof window === 'undefined') return [];

	try {
		const stored = localStorage.getItem(SYNCED_DISPOSITIONS_KEY);
		if (stored) {
			const parsed = JSON.parse(stored);
			const synced: SyncedDisposition[] = Array.isArray(parsed) ? parsed : [];
			return customerId ? synced.filter(d => d.customerId === customerId) : synced;
		}
	} catch (error) {
		console.error('Error loading synced dispositions:', error);
	}
	return [];
};

