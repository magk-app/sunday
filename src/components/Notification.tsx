import React from 'react';

export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'loading';

interface NotificationProps {
  message: string;
  type: NotificationType;
  onClose: () => void;
}

const notificationStyles = {
  success: 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-300 dark:border-green-700',
  error: 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-300 dark:border-red-700',
  warning: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-300 dark:border-yellow-700',
  info: 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-700',
  loading: 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600',
};

const notificationIcons = {
  success: '✅',
  error: '❌',
  warning: '⚠️',
  info: 'ℹ️',
  loading: '⏳',
};

export default function Notification({ message, type, onClose }: NotificationProps) {
  return (
    <div className={`fixed top-20 right-4 p-4 rounded-lg shadow-lg z-50 transition-all border backdrop-blur-sm ${notificationStyles[type]} animate-fade-in`}>
      <div className="flex justify-between items-start">
        <div className="flex items-start gap-2">
          <span className="text-lg" role="img" aria-label={type}>
            {notificationIcons[type]}
          </span>
          <span className="flex-1">{message}</span>
        </div>
        <button 
          onClick={onClose} 
          className="text-lg font-bold hover:opacity-70 transition-opacity ml-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
          aria-label="Close notification"
        >
          ×
        </button>
      </div>
      {type === 'loading' && (
        <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
          <div className="bg-blue-600 h-1 rounded-full animate-pulse" style={{ width: '100%' }}></div>
        </div>
      )}
    </div>
  );
} 