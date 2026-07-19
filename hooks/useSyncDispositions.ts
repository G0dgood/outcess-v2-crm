'use client';

import { useCallback, useEffect, useState } from 'react';
import { useCreateDispositionMutation } from '@/store/services/dispositionApi';
import { useUserInfo } from '@/contexts/UserInfoContext';
import {
	syncPendingDispositions,
	getPendingDispositionsCount,
	saveSyncedDisposition,
	OFFLINE_DISPOSITIONS_EVENT,
	type OfflineDisposition,
} from '@/utils/offlineDispositions';

/**
 * Shared hook for syncing offline (pending) dispositions to the server.
 *
 * Persists each pending disposition through the REST create-disposition endpoint
 * (the same path used for online saves) rather than an unhandled socket event, so
 * pending dispositions actually reach the database when the network returns.
 *
 * Returns a `syncNow` callback (used by the manual "Sync" button and the auto-sync
 * effect), an `isSyncing` flag, and a live `pendingCount`.
 */
export const useSyncDispositions = () => {
	const [createDisposition] = useCreateDispositionMutation();
	const { user } = useUserInfo();
	const [isSyncing, setIsSyncing] = useState(false);
	const [pendingCount, setPendingCount] = useState(0);

	const currentAgentId = user?.id || user?._id || '';
	const currentAgentName = user?.name || '';

	// Keep the pending count in sync with the offline store.
	useEffect(() => {
		const update = () => setPendingCount(getPendingDispositionsCount());
		update();
		window.addEventListener(OFFLINE_DISPOSITIONS_EVENT, update);
		return () => window.removeEventListener(OFFLINE_DISPOSITIONS_EVENT, update);
	}, []);

	// Persists a single pending disposition through the same REST path as an online save.
	const persist = useCallback(async (disposition: OfflineDisposition) => {
		const agentId = disposition.agentId || currentAgentId;
		await createDisposition({
			fillDisposition: disposition.dispositionData,
			customerId: disposition.customerId,
			agentId,
			campaignId: disposition.campaignId,
			timestamp: disposition.createdAt, // preserve original capture time
		}).unwrap();

		// Mirror the online save path so it also shows in local synced history.
		saveSyncedDisposition(
			disposition.dispositionData,
			disposition.customerId,
			disposition.customerName,
			currentAgentName,
			agentId,
			disposition.campaignId
		);
	}, [createDisposition, currentAgentId, currentAgentName]);

	// Sync all pending dispositions.
	const syncNow = useCallback(async () => {
		if (getPendingDispositionsCount() === 0) return { success: 0, failed: 0 };

		setIsSyncing(true);
		try {
			const result = await syncPendingDispositions(persist);
			setPendingCount(getPendingDispositionsCount());
			return result;
		} finally {
			setIsSyncing(false);
		}
	}, [persist]);

	// Sync a single pending disposition by id (per-row button).
	const syncOne = useCallback(async (id: string) => {
		setIsSyncing(true);
		try {
			const result = await syncPendingDispositions(persist, id);
			setPendingCount(getPendingDispositionsCount());
			return result;
		} finally {
			setIsSyncing(false);
		}
	}, [persist]);

	return { syncNow, syncOne, isSyncing, pendingCount };
};

export default useSyncDispositions;
