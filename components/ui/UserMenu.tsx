import React from 'react';
import Image from 'next/image';
import { useRouter } from '@bprogress/next/app';
import Icon from './Icon';

interface UserMenuProps {
    isOpen: boolean;
    userAvatar?: string;
    userName: string;
    userEmail: string;
    onStatusClick: () => void;
    onClose: () => void;
    onLogoutClick?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
    isOpen,
    userAvatar,
    userName,
    userEmail,
    onStatusClick,
    onClose,
    onLogoutClick
}) => {
    const router = useRouter();

    if (!isOpen) return null;

    return (
        <div
            className="absolute right-0 top-full mt-2 w-80 dark:bg-gray-800 border dark:border-gray-700 shadow-lg z-50 overflow-hidden"
            style={{
                backgroundColor: 'var(--accent-white)',
                borderColor: 'var(--light-gray)'
            }}
        >
            {/* User Info Section */}
            <div
                className="p-4 border-b dark:border-gray-700"
                style={{
                    borderColor: 'var(--light-gray)'
                }}
            >
                <div className="flex items-center gap-3">
                    {userAvatar ? (
                        <Image
                            src={userAvatar}
                            alt={userName}
                            width={48}
                            height={48}
                            className="rounded-full border-2 border-gray-200 dark:border-gray-600"
                        />
                    ) : (
                        <div className="w-12 h-12 bg-[#F2F4F7] dark:bg-gray-700 border border-[#E5E7EB] dark:border-gray-600 rounded-full flex items-center justify-center">
                            <span
                                className="font-semibold text-[12px] md:text-[14px] dark:text-gray-300"
                                style={{ color: 'var(--text-primary)' }}
                            >
                                {userName.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="flex-1">
                        <h3
                            className="font-semibold text-base dark:text-gray-100"
                            style={{ color: 'var(--text-primary)' }}
                        >
                            {userName}
                        </h3>
                        <p
                            className="text-[10px] md:text-[12px] dark:text-gray-400"
                            style={{ color: 'var(--text-tertiary)' }}
                        >
                            {userEmail}
                        </p>
                    </div>
                </div>
            </div>

            {/* Menu Items */}
            <div style={{ backgroundColor: 'var(--accent-white)' }} className="dark:bg-gray-800">
                {/* Status */}
                <div className="relative">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onStatusClick();
                        }}
                        className="w-full px-4 py-2 text-left flex items-center justify-between transition-colors"
                        style={{
                            color: 'var(--text-secondary)',
                            backgroundColor: 'transparent'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                    >
                        <span>Status</span>
                        <Icon name="Expand_right_light" size="md" />
                    </button>
                </div>

                {/* Settings */}
                <button
                    onClick={() => {
                        router.push('/usersettings');
                        onClose();
                    }}
                    className="w-full px-4 py-2 text-left cursor-pointer transition-colors"
                    style={{
                        color: 'var(--text-secondary)',
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'var(--bg-primary)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    Settings
                </button>

                {/* Separator */}
                <div
                    className="border-t my-2 dark:border-gray-700"
                    style={{ borderColor: 'var(--light-gray)' }}
                ></div>

                {/* Logout */}
                <button
                    onClick={() => {
                        onLogoutClick?.();
                        onClose();
                    }}
                    className="w-full px-4 py-2 text-left flex items-center gap-2 cursor-pointer transition-colors"
                    style={{
                        color: 'var(--status-error)',
                        backgroundColor: 'transparent'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                >
                    <Icon name="Sign_out_squre_light" size="lg" color="red" className="dark:invert-0! dark:opacity-100!" />
                    Log out
                </button>
            </div>
        </div>
    );
};
