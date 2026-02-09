'use client';

import React from 'react';
import { FileTextIcon, TrashIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';

type FieldDef = { id: string; name: string };
type RecordType = { id: string } & Record<string, string | number | boolean | null>;

interface SelectedRecordsDrawerContentProps {
  selectedRecords: Set<string>;
  fieldDefinitions: FieldDef[];
  records: RecordType[];
  onClose: () => void;
  onDeleteSelected?: () => void;
  canDelete?: boolean;
}

const SelectedRecordsDrawerContent: React.FC<SelectedRecordsDrawerContentProps> = ({
  selectedRecords,
  fieldDefinitions,
  records,
  onClose,
  onDeleteSelected,
  canDelete,
}) => {
  return (
    <>
      <div
        className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-5 border-l border-gray-700"
        style={{ borderColor: 'var(--light-gray)' }}
      >
        <div className="flex items-center gap-3">
          <FileTextIcon className="w-5 h-5 dark:text-gray-300" style={{ color: 'var(--text-primary)' }} />
          <h2 className="font-inter text-[12px] md:text-[14px] font-semibold dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
            Selected Records ({selectedRecords.size})
          </h2>
        </div>
        <div className="flex items-center gap-3">
          {canDelete && onDeleteSelected && selectedRecords.size > 0 && (
            <button
              onClick={onDeleteSelected}
              className="flex items-center gap-2 px-3 py-1.5 text-[8px] md:text-[10px] font-medium text-red-500 border border-red-500 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Selected"
            >
              <TrashIcon className="w-3.5 h-3.5" />
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className="dark:text-gray-400 dark:hover:text-gray-200 transition-colors cursor-pointer"
            style={{ color: 'var(--text-tertiary)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--text-secondary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <Icon name="Close_round_light" size="lg" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto h-[calc(100vh-80px)] p-6  border-l border-gray-700"
        style={{ borderColor: 'var(--light-gray)' }}
      >
        {selectedRecords.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileTextIcon className="w-12 h-12 mb-4 dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-[10px] md:text-[12px] dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }}>
              No records selected
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {records
              .filter(record => selectedRecords.has(record.id))
              .map((record) => (
                <div
                  key={record.id}
                  className="p-4 dark:bg-gray-700 border dark:border-gray-600 "
                  style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--light-gray)' }}
                >

                  <div className="space-y-2">
                    <div className="flex items-start justify-between text-[8px] md:text-[10px]">
                      <span className="font-medium dark:text-gray-400 mr-2" style={{ color: 'var(--text-tertiary)' }}>
                        Search ID:
                      </span>
                      <span
                        className="text-right flex-1 dark:text-gray-100"
                        style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}
                      >
                        {record['searchId'] ? String(record['searchId']) : '-'}
                      </span>
                    </div>
                    {fieldDefinitions.map((field) => (
                      <div key={field.id} className="flex items-start justify-between text-[8px] md:text-[10px]">
                        <span className="font-medium dark:text-gray-400 mr-2" style={{ color: 'var(--text-tertiary)' }}>
                          {field.name}:
                        </span>
                        <span
                          className="text-right flex-1 dark:text-gray-100"
                          style={{ color: 'var(--text-primary)', wordBreak: 'break-word' }}
                        >
                          {record[field.name] ? String(record[field.name]) : '-'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </>
  );
};

export default SelectedRecordsDrawerContent;
