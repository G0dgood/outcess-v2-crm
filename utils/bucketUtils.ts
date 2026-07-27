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
	userId: string | undefined,
	bucket: BucketWithMembers
): boolean => {
	if (!userId || !bucket.assignedMembers?.length) return false;
	const userStr = String(userId).trim().toLowerCase();
	return bucket.assignedMembers.some((m) => {
		const mId = resolveMemberId(m.memberId).trim().toLowerCase();
		const mEmail = (m.email || (typeof m.memberId === 'object' ? m.memberId?.email : '') || '').trim().toLowerCase();
		return mId === userStr || (mEmail !== '' && mEmail === userStr);
	});
};

export const getUserAssignedBuckets = (
	userId: string | undefined,
	buckets: BucketWithMembers[]
): BucketWithMembers[] => {
	if (!userId) return [];
	return buckets.filter((bucket) => isUserAssignedToBucket(userId, bucket));
};

export const ALL_MY_BUCKETS = '__all__';
