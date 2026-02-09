import React, { useEffect } from 'react';
import { Cross2Icon } from "@radix-ui/react-icons";

interface UploadAlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const UploadAlert: React.FC<UploadAlertProps> = ({ type, message, onClose }) => {
  const isSuccess = type === 'success';

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 10000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`px-4 py-2 relative flex justify-between items-center ${isSuccess
        ? "dark:bg-green-900/30 dark:text-green-400"
        : "dark:bg-red-900/30 dark:text-red-400"
        }`}
      style={{
        backgroundColor: isSuccess ? 'rgba(34, 197, 94, 0.1)' : 'rgba(220, 38, 38, 0.1)',
        color: isSuccess ? '#22C55E' : '#DC2626'
      }}
    >
      <p>
        <i className={`fas fa-${isSuccess ? 'check' : 'exclamation'}-circle mr-2`} />{" "}
        {message}
      </p>
      <button
        onClick={onClose}
        className={`text-[12px] md:text-[14px] ${isSuccess
          ? "dark:text-gray-400 dark:hover:text-red-400"
          : "dark:text-red-400 dark:hover:text-red-300"
          }`}
        style={{ color: isSuccess ? 'var(--text-tertiary)' : '#DC2626' }}
        onMouseEnter={(e) => {
          if (isSuccess) {
            e.currentTarget.style.color = '#DC2626';
          } else {
            e.currentTarget.style.color = '#991B1B';
          }
        }}
        onMouseLeave={(e) => {
          if (isSuccess) {
            e.currentTarget.style.color = 'var(--text-tertiary)';
          } else {
            e.currentTarget.style.color = '#DC2626';
          }
        }}
      >
        {isSuccess ? (
          <Cross2Icon
            className="w-5 h-5 dark:text-gray-400 dark:hover:text-gray-200"
            style={{ color: 'var(--text-tertiary)' }}
          />
        ) : (
          <i className="fas fa-times" />
        )}
      </button>
    </div>
  );
};

export default UploadAlert;
