import React from 'react';
import { Clock } from 'lucide-react';

interface AccessDeniedProps {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({ 
    title = "Access Denied", 
    description = "You do not have permission to access the Support module.",
    icon
}) => {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-full mb-4">
                {icon || <Clock className="w-10 h-10 text-red-500" />}
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto px-4">
                {description}
            </p>
        </div>
    );
};

export default AccessDenied;
