/**
 * Offline Dispositions Utility
 * Manages disposition data when offline, storing in localStorage and syncing when online
 */

export interface DispositionFieldEntry {
	fieldId: string;
	fieldName: string;
	fieldValue: string | number | boolean | undefined;
	fieldType: string;
}

export interface DispositionHistoryItem {
	id: string;
	date: string;
	time: string;
	agent: string;
	isOffline?: boolean;
	offlineStatus?: 'pending' | 'synced' | 'failed';
	agentId?: string;
	dispositionData?: DispositionFieldEntry[];
	timestamp?: number;
	[key: string]: any;
}

export interface OfflineDisposition {
	agent: string;
	agentId: string;
	id: string;
	customerId?: string;
	customerName?: string;
	campaignId?: string;
	status: 'pending' | 'synced' | 'failed';
	createdAt: string;
	updatedAt: string;
	syncedAt?: string;
	dispositionData: DispositionFieldEntry[];
	fillDisposition?: DispositionFieldEntry[];
}

const STORAGE_KEY = 'offline_dispositions';
export const OFFLINE_DISPOSITIONS_EVENT = 'offlineDispositionsUpdated';

const notifyUpdate = () => {
    if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent(OFFLINE_DISPOSITIONS_EVENT));
    }
};

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
	dispositionData: DispositionFieldEntry[],
	customerId?: string,
	customerName?: string,
	campaignId?: string
): OfflineDisposition => {
	const offlineDisposition: OfflineDisposition = {
		dispositionData,
		id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		customerId,
		customerName,
		campaignId,
		status: 'pending',
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		agent: '',
		agentId: ''
	};

	const existing = getOfflineDispositions();
	existing.push(offlineDisposition);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
	notifyUpdate();

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
		notifyUpdate();
	}
};

/**
 * Remove a disposition (after successful sync)
 */
export const removeOfflineDisposition = (id: string): void => {
	const dispositions = getOfflineDispositions();
	const filtered = dispositions.filter(d => d.id !== id);
	localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
	notifyUpdate();
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
	notifyUpdate();
};

/**
 * Persist a single pending disposition to the server.
 * Must actually write to the backend (e.g. the REST create-disposition endpoint)
 * and resolve only on success; reject/throw to keep the item pending for retry.
 */
export type PersistDispositionFn = (disposition: OfflineDisposition) => Promise<void>;

/**
 * Sync pending dispositions when online.
 * This should be called when connection is restored, or manually via a "Sync" button.
 *
 * Each pending disposition is persisted through `persistFn`. Only items that persist
 * successfully are removed from the offline queue; failures stay pending so they are
 * retried on the next sync instead of being silently marked as synced.
 */
// Module-level lock so concurrent callers (auto-sync on reconnect + a manual
// button press, or two mounted components) can never double-persist the same item.
let syncInProgress = false;

export const syncPendingDispositions = async (
    persistFn: PersistDispositionFn,
    onlyId?: string
): Promise<{ success: number; failed: number }> => {
	if (typeof persistFn !== 'function') {
		return { success: 0, failed: getPendingDispositions().length };
	}

	if (syncInProgress) {
		return { success: 0, failed: 0 };
	}
	syncInProgress = true;

	try {
		let pending = getPendingDispositions();
		if (onlyId) {
			pending = pending.filter((d) => d.id === onlyId);
		}

		let success = 0;
		let failed = 0;

		for (const disposition of pending) {
			try {
				await persistFn(disposition);
				// Persisted to the server — remove it from the offline queue so the
				// server copy (via API) becomes the single source of truth.
				removeOfflineDisposition(disposition.id);
				success++;
			} catch {
				// Keep it as 'pending' so the next sync (auto or manual) retries it.
				failed++;
			}
		}

		return { success, failed };
	} finally {
		syncInProgress = false;
	}
};

/**
 * Save a synced disposition (after successful sync)
 * This stores dispositions that were successfully synced to the server
 */
const SYNCED_DISPOSITIONS_KEY = 'synced_dispositions';

export interface SyncedDisposition {
	id: string;
	customerId?: string;
	customerName?: string;
	campaignId?: string;
	syncedAt: string;
	agent?: string;
	agentId?: string;
	dispositionData: DispositionFieldEntry[];
	fillDisposition?: DispositionFieldEntry[];
}

export const saveSyncedDisposition = (
	dispositionData: DispositionFieldEntry[],
	customerId?: string,
	customerName?: string,
	agent?: string,
	agentId?: string,
	campaignId?: string
): SyncedDisposition => {
	const syncedDisposition: SyncedDisposition = {
		dispositionData,
		id: `synced-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
		customerId,
		customerName,
		campaignId,
		agent: agent ,
		agentId: agentId,
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
