import React from 'react';
import { ArrowLeftIcon } from '@radix-ui/react-icons';

export interface StatusOption {
    value: string;
    label: string;
    color?: string;
}

interface StatusSubmenuProps {
    isOpen: boolean;
    onBack: () => void;
    statusOptions: StatusOption[];
    onSelect: (option: StatusOption) => void;
}

export const StatusSubmenu: React.FC<StatusSubmenuProps> = ({
    isOpen,
    onBack,
    statusOptions,
    onSelect,
}) => {
    if (!isOpen) return null;

    return (
        <div
            className="absolute right-0 top-full mt-2 w-48 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden min-w-[250px] "
            style={{
                backgroundColor: 'var(--accent-white)',
                borderColor: 'var(--light-gray)'
            }}
        >
            {/* Back Button Header */}
            <div
                className="px-4 py-2 border-b dark:border-gray-700"
                style={{ borderColor: 'var(--light-gray)' }}
            >
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 transition-colors cursor-pointer"
                    style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--text-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--text-secondary)';
                    }}
                >
                    <ArrowLeftIcon className="w-4 h-4" />
                    <span className="text-[10px] md:text-[12px] font-medium">Back</span>
                </button>
            </div>
            <div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
                {statusOptions?.map((option) => (
                    <button
                        key={option.value}
                        onClick={() => onSelect(option)}
                        className="w-full px-4 py-2 text-left cursor-pointer font-lato font-medium text-[12px] md:text-[14px] leading-[150%] transition-colors flex items-center gap-2 whitespace-nowrap"
                        style={{
                            color: 'var(--text-primary)',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        {option.color && (
                            <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: option.color }}
                            />
                        )}
                        {option.label.length > 25 ? `${option.label.substring(0, 25)}...` : option.label}
                    </button>
                ))}
            </div>
        </div>
    );
};
