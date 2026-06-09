import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Textarea } from './Textarea';

interface StatusOption {
    value: string;
    label: string;
    color?: string;
}

interface StatusConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    pendingStatus: StatusOption | null;
    statusReason: string;
    onStatusReasonChange: (value: string) => void;
    onConfirm: () => void;
    isUpdating: boolean;
}

export const StatusConfirmationModal: React.FC<StatusConfirmationModalProps> = ({
    isOpen,
    onClose,
    pendingStatus,
    statusReason,
    onStatusReasonChange,
    onConfirm,
    isUpdating,
}) => {
    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Change Status"
            size="sm"
        >
            <div className="p-6">
                <p className="mb-4 text-gray-600 dark:text-gray-300" style={{ color: 'var(--text-secondary)' }}>
                    Are you sure you want to change your status to{' '}
                    <span className="font-semibold inline-flex items-center gap-1.5 align-middle text-gray-900 dark:text-gray-100">
                        {pendingStatus?.color && (
                            <span
                                className="w-2.5 h-2.5 rounded-full inline-block"
                                style={{ backgroundColor: pendingStatus.color }}
                            />
                        )}
                        {pendingStatus?.label}
                    </span>
                    ?
                </p>

                <div className="mb-6">
                    <Textarea
                        label="Reason (Optional)"
                        value={statusReason}
                        onChange={onStatusReasonChange}
                        placeholder="Enter reason for status change..."
                        rows={3}
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={onClose}
                    >
                        No
                    </Button>
                    <Button
                        variant="primary"
                        onClick={onConfirm}
                        loading={isUpdating}
                    >
                        Yes
                    </Button>
                </div>
            </div>
        </Modal>
    );
};
