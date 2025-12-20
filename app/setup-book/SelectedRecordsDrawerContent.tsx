'use client';

import React from 'react';
import { FileTextIcon } from '@radix-ui/react-icons';
import Icon from '@/components/ui/Icon';

type FieldDef = { id: string; name: string };
type RecordType = { id: string } & Record<string, string | number | boolean | null>;

interface SelectedRecordsDrawerContentProps {
  selectedRecords: Set<string>;
  fieldDefinitions: FieldDef[];
  records: RecordType[];
  onEdit: (record: RecordType) => void;
  onDelete: (record: RecordType) => void;
  onClose: () => void;
}

const SelectedRecordsDrawerContent: React.FC<SelectedRecordsDrawerContentProps> = ({
  selectedRecords,
  fieldDefinitions,
  records,
  onEdit,
  onDelete,
  onClose,
}) => {
  return (
    <>
      <div
        className="flex justify-between items-center border-b dark:border-gray-700 px-6 py-5 border-l border-gray-700"
        style={{ borderColor: 'var(--light-gray)' }}
      >
        <div className="flex items-center gap-3">
          <FileTextIcon className="w-5 h-5 dark:text-gray-300" style={{ color: 'var(--text-primary)' }} />
          <h2 className="font-inter text-lg font-semibold dark:text-gray-100" style={{ color: 'var(--text-primary)' }}>
            Selected Records ({selectedRecords.size})
          </h2>
        </div>
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

      <div className="overflow-y-auto h-[calc(100vh-80px)] p-6  border-l border-gray-700"
        style={{ borderColor: 'var(--light-gray)' }}
      >
        {selectedRecords.size === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileTextIcon className="w-12 h-12 mb-4 dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }} />
            <p className="text-sm dark:text-gray-400" style={{ color: 'var(--text-tertiary)' }}>
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
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium dark:text-gray-300" style={{ color: 'var(--text-secondary)' }}>
                        ID: {record.id}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {fieldDefinitions.map((field) => (
                      <div key={field.id} className="flex items-start justify-between text-xs">
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

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => {
                        onEdit(record);
                        onClose();
                      }}
                      className="flex-1 text-xs py-2 px-3 border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600"
                      style={{ borderColor: 'var(--light-gray)', color: 'var(--text-secondary)', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        onDelete(record);
                        onClose();
                      }}
                      className="flex-1 text-xs py-2 px-3  border dark:border-gray-600 transition-colors dark:text-gray-300 dark:hover:bg-gray-600"
                      style={{ borderColor: 'var(--light-gray)', color: '#DC2626', backgroundColor: 'transparent' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      Delete
                    </button>
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
