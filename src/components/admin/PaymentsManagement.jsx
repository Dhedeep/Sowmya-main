import React, { useState } from 'react';
import { Search, Eye, CreditCard, RefreshCw } from 'lucide-react';
import PaymentModal from './PaymentModal';
import RefundModal from './RefundModal';

const PaymentsManagement = ({
  payments,
  searchTerm,
  paymentFilterStatus,
  setSearchTerm,
  setPaymentFilterStatus,
  onViewPayment,
  onPaymentStatusUpdate,
  onProcessRefund,
  updatingPaymentId
}) => {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = searchTerm === '' ||
      payment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.paymentId && payment.paymentId.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = paymentFilterStatus === 'all' || payment.status === paymentFilterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status) => {
    return status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
      status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
        status === 'failed' ? 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100' :
          status === 'refunded' ? 'bg-brand-secondary/10 text-brand-secondary' :
            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const handleViewPayment = async (paymentId) => {
    const paymentDetails = await onViewPayment(paymentId);
    setSelectedPayment(paymentDetails);
    setIsPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedPayment(null);
  };

  const handleRefundClick = (payment) => {
    setSelectedPayment(payment);
    setIsRefundModalOpen(true);
  };

  const handleCloseRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedPayment(null);
  };

  const handleProcessRefund = (refundAmount, refundReason) => {
    onProcessRefund(selectedPayment.id, refundAmount, refundReason);
    handleCloseRefundModal();
    handleClosePaymentModal();
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-700 dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <select
                value={paymentFilterStatus}
                onChange={(e) => setPaymentFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Status</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="refunded">Refunded</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 dark:text-gray-300">Payment ID</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Order ID</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Customer</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Amount</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Method</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map((payment, index) => (
                <tr key={`payment-${payment.id || 'no-id'}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 dark:text-white">
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} className="text-gray-400" />
                      <span className="text-xs">{payment.paymentId || 'N/A'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 dark:text-white">{payment.orderId}</td>
                  <td className="py-3 px-4 dark:text-white">
                    {payment.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="py-3 px-4">
                    <div>
                      <p className="dark:text-white font-medium">{payment.customerName}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{payment.customerEmail}</p>
                    </div>
                  </td>
                  <td className="py-3 px-4 dark:text-white font-semibold">₹{payment.amount?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded text-xs bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                      {payment.method}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {updatingPaymentId === payment.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                      </div>
                    ) : (
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(payment.status)}`}>
                        {payment.status}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewPayment(payment.id)}
                        className="p-1 text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded"
                      >
                        <Eye size={16} />
                      </button>
                      {payment.status === 'paid' && (
                        <button
                          onClick={() => handleRefundClick(payment)}
                          className="p-1 text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900 rounded"
                          title="Process Refund"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={handleClosePaymentModal}
        payment={selectedPayment}
        onRefundClick={handleRefundClick}
      />

      <RefundModal
        isOpen={isRefundModalOpen}
        onClose={handleCloseRefundModal}
        payment={selectedPayment}
        onProcessRefund={handleProcessRefund}
      />
    </>
  );
};

export default PaymentsManagement;