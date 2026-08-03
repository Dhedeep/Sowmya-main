import React from 'react';
import { X, RefreshCw } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, payment, onRefundClick }) => {
  if (!isOpen || !payment) return null;

  const getStatusClass = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
      status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
        status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
          status === 'refunded' ? 'bg-brand-secondary/10 text-brand-secondary' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const handleRefundClick = () => {
    onRefundClick(payment);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Payment Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Payment Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                  <span className="dark:text-white">{payment.paymentId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                  <span className="dark:text-white">{payment.orderId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="dark:text-white">
                    {payment.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid At:</span>
                  <span className="dark:text-white">
                    {payment.paidAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Payment Method:</span>
                  <span className="dark:text-white">{payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="dark:text-white font-semibold">₹{payment.amount?.toFixed(2) || '0.00'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(payment.status)}`}>
                    {payment.status}
                  </span>
                </div>
                {payment.refundId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Refund ID:</span>
                    <span className="dark:text-white">{payment.refundId}</span>
                  </div>
                )}
                {payment.refundAmount && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Refund Amount:</span>
                    <span className="dark:text-white">₹{payment.refundAmount?.toFixed(2) || '0.00'}</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Customer Information</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="dark:text-white">{payment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="dark:text-white">{payment.customerEmail}</span>
                </div>
              </div>
            </div>
          </div>

          {payment.items && payment.items.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Order Items</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="text-left py-2 px-4 dark:text-gray-300">Product</th>
                      <th className="text-left py-2 px-4 dark:text-gray-300">Size</th>
                      <th className="text-left py-2 px-4 dark:text-gray-300">Color</th>
                      <th className="text-left py-2 px-4 dark:text-gray-300">Quantity</th>
                      <th className="text-left py-2 px-4 dark:text-gray-300">Price</th>
                      <th className="text-left py-2 px-4 dark:text-gray-300">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payment.items.map((item, index) => (
                      <tr key={index} className="border-b dark:border-gray-600">
                        <td className="py-2 px-4 dark:text-white">{item.name}</td>
                        <td className="py-2 px-4 dark:text-white">{item.size || item.selectedSize || 'N/A'}</td>
                        <td className="py-2 px-4 dark:text-white">{item.color || item.selectedColor || 'N/A'}</td>
                        <td className="py-2 px-4 dark:text-white">{item.quantity}</td>
                        <td className="py-2 px-4 dark:text-white">₹{item.price?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-4 dark:text-white">₹{(item.price * item.quantity)?.toFixed(2) || '0.00'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            {payment.status === 'paid' && (
              <button
                onClick={handleRefundClick}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Process Refund
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;