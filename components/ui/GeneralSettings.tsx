'use client';

import React, { useState, useEffect } from 'react';
import { useLineOfBusiness } from '@/contexts/LineOfBusinessContext';
import { toast } from 'sonner';
import Input from '@/components/ui/Input';
import { GearIcon } from '@radix-ui/react-icons';
import SubPageHeading from '@/components/ui/SubPageHeading';
import PageHeading from '@/components/ui/PageHeading';

const GeneralSettings: React.FC = () => {
	const { lineOfBusinessData } = useLineOfBusiness();
	const primaryColor = lineOfBusinessData?.primaryColor || '#050711';
	const [tooltipLength, setTooltipLength] = useState<number>(10);

	useEffect(() => {
		const savedLength = localStorage.getItem('report_tooltip_length');
		if (savedLength) {
			setTooltipLength(parseInt(savedLength, 10));
		}
	}, []);

	const handleTooltipLengthChange = (value: string) => {
		const length = parseInt(value, 10);
		if (!isNaN(length) && length > 0) {
			setTooltipLength(length);
			localStorage.setItem('report_tooltip_length', length.toString());
			toast.success('Tooltip length saved');
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<PageHeading text="General Settings" />
				<SubPageHeading text="Manage general configuration for your application." />
			</div>

			<div className="space-y-6">
				{/* Tooltip Length Setting */}
				<div
					className="flex items-center justify-between p-4 dark:bg-gray-800 border dark:border-gray-700"
					style={{
						backgroundColor: 'var(--bg-primary)',
						borderColor: 'var(--light-gray)'
					}}
				>
					<div className="flex items-center space-x-3">
						<div className="p-2 rounded-full" style={{ backgroundColor: primaryColor + '20' }}>
							<GearIcon className="w-5 h-5" style={{ color: primaryColor }} />
						</div>
						<div>
							<h3
								className="text-base font-medium dark:text-gray-100"
								style={{ color: 'var(--text-primary)' }}
							>
								Table Text Abbreviation Length
							</h3>
							<p
								className="text-[10px] md:text-[12px] dark:text-gray-400"
								style={{ color: 'var(--text-tertiary)' }}
							>
								Set the number of characters to show before abbreviating text in tables.
							</p>
						</div>
					</div>
					<div className="w-24">
						<Input
							label=""
							type="number"
							value={tooltipLength.toString()}
							onChange={handleTooltipLengthChange}
							className="text-center"
						/>
					</div>
				</div>
			</div>
		</div>
	);
};

export default GeneralSettings;
