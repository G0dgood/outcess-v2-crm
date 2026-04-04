'use client';

import React from 'react';
import IntegrationCard from './IntegrationCard';
import { Integration } from '@/store/services/integrationsApi';
import EmptyState from '@/components/ui/EmptyState';

interface IntegrationsGridProps {
	isFetching: boolean;
	integrations?: Integration[];
	canEdit: boolean;
	isUpdating: boolean;
	onConnect: (integration: Integration) => void;
	onDisconnect: (integration: Integration) => void;
}

const IntegrationsGrid: React.FC<IntegrationsGridProps> = ({
	isFetching,
	integrations,
	canEdit,
	isUpdating,
	onConnect,
	onDisconnect
}) => {
	if (isFetching) {
		return (
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{[1, 2, 3, 4, 5, 6].map((i) => (
					<div
						key={i}
						className="h-48 animate-pulse bg-gray-100 dark:bg-gray-800 rounded-lg p-6 flex flex-col gap-4"
					>
						<div className="flex gap-3">
							<div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
							<div className="flex flex-col gap-2">
								<div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
								<div className="w-16 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
							</div>
						</div>
						<div className="w-full h-12 bg-gray-200 dark:bg-gray-700 rounded" />
						<div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded mt-auto" />
					</div>
				))}
			</div>
		);
	}

	if (!integrations || integrations.length === 0) {
		return (
			<EmptyState
				iconName="Setting_line_light"
				title="No Integrations Found"
				description="Connect Peoplely with your favorite tools and services to streamline your workflow. No integrations have been set up for this campaign yet."
			/>
		);
	}

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{integrations.map((integration) => (
				<IntegrationCard
					key={integration._id}
					integration={integration}
					canEdit={canEdit}
					isUpdating={isUpdating}
					onConnect={onConnect}
					onDisconnect={onDisconnect}
				/>
			))}
		</div>
	);
};

export default IntegrationsGrid;
