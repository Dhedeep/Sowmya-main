import React, { useState } from 'react';
import { X, CreditCard, Smartphone, Monitor, DollarSign } from 'lucide-react';
import { initiatePayment, getPaymentMethods } from '../src/firebase/services/paymentService';
import { useAdmin } from '../src/contexts/AdminContext';
import { updateProductStock } from '../src/firebase/services/productService';

const PaymentModal = ({ isOpen, onClose, orderData, onPaymentSuccess, onPaymentError }) => {
  const { user, userData } = useAdmin();
  const [selectedMethod, setSelectedMethod] = useState('razorpay');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const paymentMethods = getPaymentMethods();
  console.log('Payment methods:', paymentMethods);
  console.log('Selected method:', selectedMethod);

  if (!isOpen || !orderData) return null;

  const handlePayment = async () => {
    if (!user) {
      setError('Please login to continue with payment');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      if (selectedMethod === 'razorpay') {
        // Prepare order data for Razorpay
        const paymentOrderData = {
          ...orderData,
          userId: user.uid,
          customerName: userData?.displayName || user.email,
          customerEmail: user.email,
          customerPhone: userData?.phone || ''
        };

        await initiatePayment(
          paymentOrderData,
          (response) => {
            setIsProcessing(false);
            if (onPaymentSuccess) {
              onPaymentSuccess(response);
            }
            onClose();
          },
          (errorMessage) => {
            setIsProcessing(false);
            setError(errorMessage);
            if (onPaymentError) {
              onPaymentError(errorMessage);
            }
          }
        );
      }
    } catch (error) {
      setIsProcessing(false);
      setError('Payment failed. Please try again.');
      console.error('Payment error:', error);
    }
  };

  const getPaymentIcon = (methodId) => {
    console.log('Getting icon for method:', methodId);
    switch (methodId) {
      case 'razorpay':
        return <CreditCard size={20} />;
      default:
        console.log('Unknown payment method:', methodId);
        return <CreditCard size={20} />;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl w-full max-w-md relative" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
          <X size={24} />
        </button>

        <div className="p-6">
          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
            Complete Payment
          </h2>

          {/* Order Summary */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Order Summary</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Items ({orderData.items?.length || 0}):</span>
                <span className="text-gray-900 dark:text-white">₹{orderData.subtotal?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                <span className="text-gray-900 dark:text-white">₹{orderData.shipping?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Tax:</span>
                <span className="text-gray-900 dark:text-white">₹{orderData.tax?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="border-t dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900 dark:text-white">Total:</span>
                  <span className="text-gray-900 dark:text-white">₹{orderData.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Methods */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Select Payment Method</h3>
            <div className="space-y-3">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${selectedMethod === method.id
                    ? 'border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20'
                    : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedMethod === method.id}
                    onChange={(e) => {
                      console.log('Payment method changed to:', e.target.value);
                      setSelectedMethod(e.target.value);
                    }}
                    className="mr-3"
                  />
                  <div className="flex items-center flex-grow">
                    {getPaymentIcon(method.id)}
                    <div className="ml-3">
                      <div className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        {console.log('Rendering method:', method)}
                        {method.name || 'Payment Method'}
                        {method.popular && (
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                            Popular
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {method.description || 'Select this payment method'}
                      </div>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md dark:bg-red-800 dark:border-red-600 dark:text-red-100">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={isProcessing}
              className="flex-1 px-4 py-3 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </>
              ) : (
                <>
                  Pay Now
                  ₹{orderData.total?.toFixed(2) || '0.00'}
                </>
              )}
            </button>
          </div>

          {/* Security Note */}
          <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Smartphone size={12} />
              <Monitor size={12} />
              <CreditCard size={12} />
            </div>
            <p>Secure payment powered by Razorpay</p>
            <p>Your payment information is encrypted and secure</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;