import { DispositionFieldEntry } from './offlineDispositions';

export interface DispositionPrefillInput {
	customerName?: string;
	agent?: string;
	date?: string;
	timestamp?: number | string;
	syncedAt?: string;
	createdAt?: string;
	dispositionData?: DispositionFieldEntry[];
	fillDisposition?: DispositionFieldEntry[];
	comment?: string;
	comments?: string;
}

export const getPrefillDataFromDisposition = (item: DispositionPrefillInput) => {
	const customerName = item.customerName || 'Customer';
	const title = `Ticket from Disposition - ${customerName}`;

	let description = `Created from Disposition:\n`;
	if (item.customerName) {
		description += `Customer: ${item.customerName}\n`;
	}
	if (item.agent) {
		description += `Agent: ${item.agent}\n`;
	}

	const dateVal = item.date || 
		(item.timestamp ? new Date(item.timestamp).toLocaleDateString() : '') ||
		(item.syncedAt ? new Date(item.syncedAt).toLocaleDateString() : '') ||
		(item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '');
	if (dateVal) {
		description += `Date: ${dateVal}\n`;
	}

	const fields = item.dispositionData || item.fillDisposition || [];
	if (fields.length > 0) {
		description += `\nDisposition Details:\n`;
		fields.forEach((field) => {
			if (!field.fieldName) return;
			const val = field.fieldType === 'checkbox'
				? (field.fieldValue ? 'Yes' : 'No')
				: String(field.fieldValue !== undefined && field.fieldValue !== null ? field.fieldValue : '-');
			description += `- ${field.fieldName}: ${val}\n`;
		});
	}

	const commentVal = item.comment || item.comments;
	if (commentVal) {
		description += `\nComments:\n${commentVal}\n`;
	}

	// Try to determine priority
	let priority: 'Low' | 'Medium' | 'High' = 'Low';
	for (const f of fields) {
		if (f.fieldName && (f.fieldName.toLowerCase() === 'priority' || f.fieldName.toLowerCase() === 'severity')) {
			const val = String(f.fieldValue || '').toLowerCase();
			if (val.includes('high') || val.includes('urgent')) {
				priority = 'High';
			} else if (val.includes('medium') || val.includes('med')) {
				priority = 'Medium';
			} else if (val.includes('low')) {
				priority = 'Low';
			}
		}
	}

	return {
		title,
		description,
		priority,
	};
};
