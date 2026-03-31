import React from 'react';
import Button from '@/components/ui/Button';
import { Link2Icon, Cross2Icon } from '@radix-ui/react-icons';
import { Integration } from '@/store/services/integrationsApi';

interface IntegrationCardProps {
  integration: Integration;
  canEdit: boolean;
  isUpdating: boolean;
  onConnect: (integration: Integration) => void;
  onDisconnect: (integration: Integration) => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  canEdit,
  isUpdating,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div
      className="p-6 dark:bg-gray-800 border dark:border-gray-700 flex flex-col rounded-[var(--radius)]"
      style={{
        backgroundColor: 'var(--accent-white)',
        borderColor: 'var(--light-gray)',
      }}
    >
      {/* Integration Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-lg dark:bg-gray-700"
            style={{ backgroundColor: 'var(--bg-primary)' }}
          >
            <Link2Icon
              className="w-6 h-6 dark:text-gray-300"
              style={{ color: 'var(--text-primary)' }}
            />
          </div>
          <div>
            <h3
              className="font-inter font-semibold text-base dark:text-gray-100 mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              {integration.name}
            </h3>
            {integration.status === 'connected' && (
              <div className="flex items-center gap-1">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: '#22C55E' }}
                />
                <span
                  className="text-[8px] md:text-[10px] dark:text-gray-400"
                  style={{ color: 'var(--text-tertiary)' }}
                >
                  Connected
                </span>
              </div>
            )}
          </div>
        </div>
        {integration.status === 'connected' && canEdit && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDisconnect(integration)}
            className="p-1 transition-colors h-auto"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = '#DC2626';
            }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
            title="Disconnect"
          >
            <Cross2Icon className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Integration Description */}
      <p
        className="text-[10px] md:text-[12px] dark:text-gray-400 mb-4 flex-1"
        style={{ color: 'var(--text-tertiary)' }}
      >
        {integration.description}
      </p>

      {/* Connect/Disconnect Button */}
      {integration.status === 'disconnected' ? (
        canEdit && (
          <Button
            variant="primary"
            size="md"
            onClick={() => onConnect(integration)}
            className="w-full"
            disabled={isUpdating}
          >
            Connect
          </Button>
        )
      ) : (
        canEdit && (
          <Button
            variant="outline"
            size="md"
            onClick={() => onDisconnect(integration)}
            className="w-full"
            disabled={isUpdating}
          >
            Disconnect
          </Button>
        )
      )}
    </div>
  );
};

export default IntegrationCard;
