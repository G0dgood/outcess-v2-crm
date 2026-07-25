export interface BucketWithMembers {
	id: string;
	name: string;
	color?: string;
	assignedMembers?: Array<{
		memberId: string | { _id?: string; id?: string; email?: string; userId?: string };
		memberName?: string;
		email?: string;
	}>;
	[key: string]: unknown;
}

export const resolveMemberId = (
	memberId: string | { _id?: string; id?: string; email?: string; userId?: string } | null | undefined
): string => {
	if (!memberId) return '';
	if (typeof memberId === 'object') {
		return String(memberId._id || memberId.id || memberId.userId || memberId.email || '');
	}
	return String(memberId);
};

export const isUserAssignedToBucket = (
	userOrId: string | { _id?: string; id?: string; email?: string; userId?: string } | undefined,
	bucket: BucketWithMembers
): boolean => {
	if (!userOrId || !bucket.assignedMembers?.length) return false;

	let userStr = '';
	let userEmail = '';
	let customUserId = '';

	if (typeof userOrId === 'object' && userOrId !== null) {
		userStr = String(userOrId._id || userOrId.id || '').trim().toLowerCase();
		userEmail = String(userOrId.email || '').trim().toLowerCase();
		customUserId = String(userOrId.userId || '').trim().toLowerCase();
	} else {
		userStr = String(userOrId).trim().toLowerCase();
	}

	return bucket.assignedMembers.some((m) => {
		const mId = resolveMemberId(m.memberId).trim().toLowerCase();
		const mEmail = (m.email || (typeof m.memberId === 'object' ? m.memberId?.email : '') || '').trim().toLowerCase();

		// Match by database hex ID
		if (userStr && mId === userStr) return true;

		// Match by email
		if (userEmail && mEmail === userEmail) return true;
		if (userEmail && mId === userEmail) return true;

		// Match by custom user ID
		if (customUserId && mId === customUserId) return true;
		if (customUserId && mEmail === customUserId) return true;

		// Fallback match
		if (mEmail !== '' && mEmail === userStr) return true;

		return false;
	});
};

export const getUserAssignedBuckets = (
	userOrId: string | { _id?: string; id?: string; email?: string; userId?: string } | undefined,
	buckets: BucketWithMembers[]
): BucketWithMembers[] => {
	if (!userOrId) return [];
	return buckets.filter((bucket) => isUserAssignedToBucket(userOrId, bucket));
};

export const ALL_MY_BUCKETS = '__all__';
