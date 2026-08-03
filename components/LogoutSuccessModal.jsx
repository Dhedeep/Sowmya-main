import React from 'react';
import { CheckCircle } from 'lucide-react';

const LogoutSuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 transform transition-all">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Logged Out Successfully
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            You have been successfully logged out. Your cart and wishlist have been cleared.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutSuccessModal;