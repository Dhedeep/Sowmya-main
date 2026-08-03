import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastNotification = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  position = 'bottom-right'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    // Auto-dismiss after duration
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      if (onClose) onClose();
    }, 300); // Match the transition duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} className="text-green-500" />;
      case 'error':
        return <AlertCircle size={20} className="text-red-500" />;
      case 'warning':
        return <AlertCircle size={20} className="text-yellow-500" />;
      default:
        return <Info size={20} className="text-brand-primary" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      default:
        return 'bg-brand-primary/10 border-brand-primary/30 dark:bg-brand-primary/20 dark:border-brand-primary/50';
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-left':
        return 'top-4 left-4';
      case 'bottom-left':
        return 'bottom-4 left-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 transform -translate-x-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getAnimationClasses = () => {
    if (!isVisible) return 'opacity-0 translate-y-2';
    if (isLeaving) return 'opacity-0 translate-y-2';
    return 'opacity-100 translate-y-0';
  };

  return (
    <div
      className={`fixed z-50 ${getPositionClasses()} min-w-[300px] max-w-md transition-all duration-300 ease-in-out ${getAnimationClasses()}`}
    >
      <div
        className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getBackgroundColor()}`}
      >
        {getIcon()}
        <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
          {message}
        </p>
        <button
          onClick={handleClose}
          className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={16} className="text-gray-500 dark:text-gray-400" />
        </button>
      </div>
    </div>
  );
};

export default ToastNotification;