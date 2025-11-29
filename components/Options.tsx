import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { SVGLoader } from './SVGLoader';
const timeZoneOptions = [
	{ value: 'UTC-12', label: 'UTC-12 (Baker Island)' },
	{ value: 'UTC-11', label: 'UTC-11 (American Samoa)' },
	{ value: 'UTC-10', label: 'UTC-10 (Hawaii)' },
	{ value: 'UTC-9', label: 'UTC-9 (Alaska)' },
	{ value: 'UTC-8', label: 'UTC-8 (Pacific Time)' },
	{ value: 'UTC-7', label: 'UTC-7 (Mountain Time)' },
	{ value: 'UTC-6', label: 'UTC-6 (Central Time)' },
	{ value: 'UTC-5', label: 'UTC-5 (Eastern Time)' },
	{ value: 'UTC-4', label: 'UTC-4 (Atlantic Time)' },
	{ value: 'UTC-3', label: 'UTC-3 (Brazil)' },
	{ value: 'UTC-2', label: 'UTC-2 (Mid-Atlantic)' },
	{ value: 'UTC-1', label: 'UTC-1 (Azores)' },
	{ value: 'UTC+0', label: 'UTC+0 (Greenwich)' },
	{ value: 'UTC+1', label: 'UTC+1 (Central European)' },
	{ value: 'UTC+2', label: 'UTC+2 (Eastern European)' },
	{ value: 'UTC+3', label: 'UTC+3 (Moscow)' },
	{ value: 'UTC+4', label: 'UTC+4 (Gulf)' },
	{ value: 'UTC+5', label: 'UTC+5 (Pakistan)' },
	{ value: 'UTC+6', label: 'UTC+6 (Bangladesh)' },
	{ value: 'UTC+7', label: 'UTC+7 (Indochina)' },
	{ value: 'UTC+8', label: 'UTC+8 (China)' },
	{ value: 'UTC+9', label: 'UTC+9 (Japan)' },
	{ value: 'UTC+10', label: 'UTC+10 (Australia)' },
	{ value: 'UTC+11', label: 'UTC+11 (Solomon Islands)' },
	{ value: 'UTC+12', label: 'UTC+12 (New Zealand)' },
];

const industryOptions = [
	{ value: 'technology', label: 'Technology' },
	{ value: 'healthcare', label: 'Healthcare' },
	{ value: 'finance', label: 'Finance' },
	{ value: 'education', label: 'Education' },
	{ value: 'retail', label: 'Retail' },
	{ value: 'manufacturing', label: 'Manufacturing' },
	{ value: 'consulting', label: 'Consulting' },
	{ value: 'real-estate', label: 'Real Estate' },
	{ value: 'legal', label: 'Legal' },
	{ value: 'marketing', label: 'Marketing' },
	{ value: 'nonprofit', label: 'Non-profit' },
	{ value: 'other', label: 'Other' },
];

const businessSizeOptions = [
	{ value: '1-10', label: '1-10 employees' },
	{ value: '11-50', label: '11-50 employees' },
	{ value: '51-200', label: '51-200 employees' },
	{ value: '201-500', label: '201-500 employees' },
	{ value: '501-1000', label: '501-1000 employees' },
	{ value: '1000+', label: '1000+ employees' },
];

const plusJakartaStyle = { fontFamily: 'var(--font-plus-jakarta)' };

// NoRecordFound
const NoRecordFound = ({ colSpan }: { colSpan: number }) => {
	return (
		<tr>
			<td colSpan={colSpan} className="h-[300px] p-0 m-auto border-b-0">
				<div className="center-content flex flex-col justify-center items-center h-full">
					<ExclamationTriangleIcon className="w-16 h-16" color={'var(--text-primary)'} />
					<p
						id="mt-3 !underline-none"
						style={{ color: 'var(--text-primary)' }}>
						No record found
					</p>
				</div>
			</td>
		</tr>
	);
};

// SVGLoader Fetch
const SVGLoaderFetch = ({ colSpan, text }: { colSpan: number; text: string }) => (
	<tr>
		<td colSpan={colSpan} className="h-[300px] p-0 m-auto">
			<div className="center-content flex flex-col justify-center items-center h-full">
				<SVGLoader width={"40px"} height={"40px"} color={"var(--text-primary)"} />
				<p className="mt-3">{text}</p>
			</div>ź
		</td>
	</tr>
);

export { timeZoneOptions, industryOptions, businessSizeOptions, plusJakartaStyle, NoRecordFound, SVGLoaderFetch };