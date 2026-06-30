import React from 'react';
import { GearIcon } from '@radix-ui/react-icons';
import packageInfo from '../../package.json';

interface AppVersionInfoProps {
	primaryColor?: string;
}

export const AppVersionInfo: React.FC<AppVersionInfoProps> = ({ primaryColor = '#050711' }) => {
	return (
		<div
			className="flex items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700 rounded-[var(--radius)]"
			style={{
				backgroundColor: 'var(--bg-primary)',
				borderColor: 'var(--light-gray)'
			}}
		>
			<div className="flex items-center space-x-3">
				<div className="p-2" style={{ backgroundColor: primaryColor + '20' }}>
					<GearIcon className="w-5 h-5" style={{ color: primaryColor }} />
				</div>
				<div>
					<h3
						className="text-base font-medium dark:text-gray-100"
						style={{ color: 'var(--text-primary)' }}
					>
						App Version
					</h3>
					<p
						className="text-[10px] md:text-[12px] dark:text-gray-400"
						style={{ color: 'var(--text-tertiary)' }}
					>
						Current build version of the application
					</p>
				</div>
			</div>
			<span className="text-[12px] font-semibold dark:text-gray-200" style={{ color: 'var(--text-primary)' }}>
				v{packageInfo.version}
			</span>
		</div>
	);
};

export default AppVersionInfo;
