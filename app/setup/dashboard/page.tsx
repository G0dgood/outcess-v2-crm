'use client';

import React from 'react';
import Input from '@/components/ui/Input';
import IndividualRadio from '@/components/ui/IndividualRadio';
import CallDisposition from '@/components/CallDisposition';
import KPIMetric from '@/components/KPIMetric';
import { useSetup } from '@/contexts/SetupContext';

type DashboardVisibility = 'all' | 'admin' | 'admin-supervisor' | 'custom';

interface VisibilityOption {
	value: DashboardVisibility;
	label: string;
}

export default function DashboardPage(): React.JSX.Element {
	const { setupData, updateDashboardSettings } = useSetup();
	const { dashboardSettings } = setupData;

	const visibilityOptions: VisibilityOption[] = [
		{ value: 'all', label: 'All' },
		{ value: 'admin', label: 'Admin' },
		{ value: 'admin-supervisor', label: 'Admin & Supervisor' },
		{ value: 'custom', label: 'Custom' }
	];

	return (
		<div className="w-full h-full">
			<div className="mb-8">
				<h1 className="font-lato not-italic font-semibold text-[24px] leading-[150%] text-[#3A4050]">Dashboard</h1>
				<p className="font-lato not-italic font-normal text-[16px] leading-[150%] text-[#6D7280]">Set up your dashboard widgets and reports</p>
			</div>

			{/* Dashboard Configuration */}
			<div className="bg-white border border-gray-200 p-6 mb-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
					<div>
						<Input
							label="Dashboard Name"
							placeholder="Enter dashboard name"
							value={dashboardSettings.dashboardName}
							onChange={(value) => updateDashboardSettings({ dashboardName: value })}
						/>
					</div>
					{/* <div>
						<label className="font-inter text-sm font-medium text-[#050711] mb-2 block">Who can see this dashboard</label>
						<div className="space-y-2">
							{visibilityOptions.map((option) => (
								<IndividualRadio
									key={option.value}
									name="visibility"
									value={option.value}
									checked={dashboardSettings.dashboardVisibility === option.value}
									onChange={(value) => updateDashboardSettings({ dashboardVisibility: value as DashboardVisibility })}
									label={option.label}
								/>
							))}
						</div>
					</div> */}
				</div>
			</div>

			{/* Navigation Tabs */}
			<div className="mb-6">
				<div className="flex border-b border-gray-200">
					<button
						onClick={() => updateDashboardSettings({ activeTab: 'kpi' })}
						className={`px-4 py-2 font-inter text-sm font-medium transition-colors ${dashboardSettings.activeTab === 'kpi'
							? 'text-[#050711] border-b-2 border-[#050711]'
							: 'text-gray-600 hover:text-gray-900'
							}`}
					>
						KPI Metric
					</button>
					<button
						onClick={() => updateDashboardSettings({ activeTab: 'disposition' })}
						className={`px-4 py-2 font-inter text-sm font-medium transition-colors ${dashboardSettings.activeTab === 'disposition'
							? 'text-[#050711] border-b-2 border-[#050711]'
							: 'text-gray-600 hover:text-gray-900'
							}`}
					>
						Call Disposition
					</button>
				</div>
			</div>

			{dashboardSettings.activeTab === 'kpi' && (
				<KPIMetric
					widgets={dashboardSettings.widgets}
					onWidgetsChange={(widgets) => updateDashboardSettings({ widgets })}
					callOutcomes={dashboardSettings.callOutcomes}
					onCallOutcomesChange={(callOutcomes) => updateDashboardSettings({ callOutcomes })}
				/>
			)}

			{dashboardSettings.activeTab === 'disposition' && (
				<CallDisposition
					dispositions={dashboardSettings.dispositions}
					onDispositionsChange={(dispositions) => updateDashboardSettings({ dispositions })}
				/>
			)}

		</div>
	);
}