export interface BucketWithMembers {
	id: string;
	name: string;
	color?: string;
	assignedMembers?: Array<{
		memberId: string | { _id?: string; id?: string };
		memberName?: string;
	}>;
	[key: string]: unknown;
}

export const resolveMemberId = (
	memberId: string | { _id?: string; id?: string } | null | undefined
): string => {
	if (!memberId) return '';
	if (typeof memberId === 'object') {
		return String(memberId._id || memberId.id || '');
	}
	return String(memberId);
};

export const isUserAssignedToBucket = (
	userId: string | undefined,
	bucket: BucketWithMembers
): boolean => {
	if (!userId || !bucket.assignedMembers?.length) return false;
	return bucket.assignedMembers.some(
		(m) => resolveMemberId(m.memberId) === String(userId)
	);
};

export const getUserAssignedBuckets = (
	userId: string | undefined,
	buckets: BucketWithMembers[]
): BucketWithMembers[] => {
	if (!userId) return [];
	return buckets.filter((bucket) => isUserAssignedToBucket(userId, bucket));
};

export const ALL_MY_BUCKETS = '__all__';
