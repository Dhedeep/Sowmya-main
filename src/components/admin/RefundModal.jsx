import React, { useState } from 'react';
import { X, RefreshCw } from 'lucide-react';

const RefundModal = ({ isOpen, onClose, payment, onProcessRefund }) => {
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');

  React.useEffect(() => {
    if (payment && isOpen) {
      setRefundAmount(payment.amount.toString());
      setRefundReason('');
    }
  }, [payment, isOpen]);

  const handleSubmit = () => {
    if (!refundAmount || parseFloat(refundAmount) <= 0) {
      alert('Please enter a valid refund amount');
      return;
    }

    if (parseFloat(refundAmount) > payment.amount) {
      alert('Refund amount cannot exceed payment amount');
      return;
    }

    onProcessRefund(parseFloat(refundAmount), refundReason);
  };

  const handleClose = () => {
    setRefundAmount('');
    setRefundReason('');
    onClose();
  };

  if (!isOpen || !payment) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold dark:text-white">Process Refund</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Order ID: <span className="font-medium dark:text-white">{payment.orderId}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Original Amount: <span className="font-medium dark:text-white">₹{payment.amount?.toFixed(2) || '0.00'}</span>
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Refund Amount (₹)</label>
              <input
                type="number"
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                max={payment.amount}
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter refund amount"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Refund Reason</label>
              <textarea
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                placeholder="Enter reason for refund"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Process Refund
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RefundModal;