import { DispositionCategory, NestedOption } from '@/types/dashboard';

export interface MultiDropdownHeaderValue {
	header: string;
	value: string;
}

/**
 * Resolves a filled disposition field value (e.g. "Successful > Language Barrier > Language Barrier")
 * into individual level headers using the exact field name and subLabels defined in the disposition schema.
 *
 * Example:
 * Field Name: "Successful / Not-Successful"
 * fieldValue: "Successful > Language Barrier > Language Barrier"
 * Output:
 * 1. { header: "Successful / Not-Successful", value: "Successful" }
 * 2. { header: "Feedback", value: "Language Barrier" }  (where "Feedback" is subLabel of option "Successful")
 * 3. { header: "Comment", value: "Language Barrier" }   (where "Comment" is subLabel of option "Language Barrier")
 */
export function resolveMultiDropdownLevels(
	fieldName: string,
	fieldValue: string | undefined | null,
	dispositionDef?: DispositionCategory
): MultiDropdownHeaderValue[] {
	if (!fieldValue || typeof fieldValue !== 'string') {
		return [{ header: fieldName, value: String(fieldValue || '-') }];
	}

	const parts = fieldValue.split(' > ').map(s => s.trim()).filter(Boolean);
	if (parts.length <= 1) {
		return [{ header: fieldName, value: fieldValue }];
	}

	const results: MultiDropdownHeaderValue[] = [];
	let currentOptions: NestedOption[] | undefined = dispositionDef?.nestedOptions;
	let currentHeader = fieldName;

	parts.forEach((part, index) => {
		const cleanPart = part.toLowerCase();
		const matchedOpt = currentOptions?.find(o => o.value?.trim().toLowerCase() === cleanPart);

		results.push({
			header: currentHeader,
			value: part
		});

		// Prepare header label and options for the next level
		currentHeader = matchedOpt?.subLabel || `${fieldName} (Level ${index + 2})`;
		currentOptions = matchedOpt?.subOptions;
	});

	return results;
}

/**
 * Utility to gather all configured disposition categories across direct dispositions and campaign buckets.
 */
export function getAllCampaignDispositions(dashboardSettings: any): DispositionCategory[] {
	if (!dashboardSettings) return [];
	const list: DispositionCategory[] = [...(dashboardSettings.dispositions || [])];
	if (dashboardSettings.buckets && Array.isArray(dashboardSettings.buckets)) {
		dashboardSettings.buckets.forEach((b: any) => {
			if (b && Array.isArray(b.dispositions)) {
				b.dispositions.forEach((disp: DispositionCategory) => {
					if (disp && disp.name && !list.some(d => d.name === disp.name)) {
						list.push(disp);
					}
				});
			}
		});
	}
	return list;
}
