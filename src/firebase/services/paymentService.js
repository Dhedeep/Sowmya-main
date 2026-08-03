import { auth } from '../config';
import { createOrder } from './orderService';

// Cloud Functions base URL
const FUNCTIONS_BASE_URL = 'https://us-central1-sowmya-selections.cloudfunctions.net';

// Initialize Razorpay with your key ID
// In production, this should come from environment variables
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

// Validate key exists
if (!RAZORPAY_KEY_ID) {
  console.error('Razorpay Key ID is missing! Please check your .env file.');
}

/**
 * Load Razorpay script dynamically
 * @returns {Promise} Promise that resolves when Razorpay is loaded
 */
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if Razorpay is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Create a Razorpay order and initiate payment
 * @param {Object} orderData - Order data including items, amount, user info
 * @param {Function} onSuccess - Callback function on successful payment
 * @param {Function} onError - Callback function on payment failure
 * @returns {Promise} Razorpay order
 */
export const initiatePayment = async (orderData, onSuccess, onError) => {
  try {
    console.log('Initiating payment with orderData:', orderData);

    // Validate that userId is present
    if (!orderData.userId) {
      throw new Error('User ID is required to create an order');
    }

    if (!orderData.items || orderData.items.length === 0) {
      throw new Error('Cannot initiate payment for an empty order');
    }

    // IMPORTANT: No Firebase order is created here, and no stock is touched here.
    // The order is only created — and stock only deducted — inside the `handler`
    // callback below, after Razorpay has confirmed the payment succeeded.
    // If the customer closes the Razorpay window or the payment fails, this
    // function does nothing further: no order, no stock change (see `modal.ondismiss`).

    // Map selectedSize/selectedColor to size/color for each item.
    // This is prepared now but only written to Firestore on confirmed success.
    const orderWithUser = {
      ...orderData,
      items: orderData.items.map(item => {
        const mappedItem = { ...item };
        if (item.selectedSize !== undefined) {
          mappedItem.size = item.selectedSize;
        }
        if (item.selectedColor !== undefined) {
          mappedItem.color = item.selectedColor;
        }
        return mappedItem;
      })
    };

    // Load Razorpay script
    console.log('Loading Razorpay script...');
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error('Failed to load payment gateway');
    }
    console.log('Razorpay script loaded successfully');

    // Create Razorpay Order on the backend (Production Ready).
    // No Firebase order exists yet, so we use a standalone receipt string.
    console.log('Creating Razorpay order via Cloud Function...');
    const idToken = await auth.currentUser.getIdToken();
    const receipt = `chk_${orderData.userId}_${Date.now()}`;
    const orderResponse = await fetch(`${FUNCTIONS_BASE_URL}/createRazorpayOrder`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`
      },
      body: JSON.stringify({
        data: {
          amount: orderData.total,
          currency: 'INR',
          receipt
        }
      })
    });

    const orderResult = await orderResponse.json();

    if (!orderResponse.ok || !orderResult.result?.success) {
      throw new Error(orderResult.error?.message || 'Failed to create Razorpay order');
    }

    const razorpayOrder = orderResult.result.order;
    console.log('Razorpay order created:', razorpayOrder);

    // Initialize Razorpay options
    const options = {
      key: RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'Sowmya Selections',
      description: 'Purchase from Sowmya Selections',
      order_id: razorpayOrder.id,
      method: {
        cod: false
      },
      prefill: {
        name: orderData.customerName || '',
        email: orderData.customerEmail || '',
        contact: orderData.customerPhone || ''
      },
      notes: {
        userId: orderData.userId
      },
      theme: {
        color: '#000000'
      },
      handler: async (response) => {
        try {
          console.log('Payment completed, verifying signature...', response);

          // 1. Verify the payment signature on the backend BEFORE touching Firestore.
          const verifyToken = await auth.currentUser.getIdToken();
          const verificationResponse = await fetch(`${FUNCTIONS_BASE_URL}/verifyRazorpayPayment`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${verifyToken}`
            },
            body: JSON.stringify({
              data: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            })
          });

          const verifyResult = await verificationResponse.json();

          if (!verificationResponse.ok || !verifyResult.result?.success) {
            throw new Error(verifyResult.error?.message || 'Payment verification failed');
          }

          console.log('Payment verified successfully. Creating order and reducing stock...');

          // 2. Only now — after confirmed payment — create the order and reduce
          //    stock. createOrder() does a final stock check and the stock
          //    deduction atomically in a single Firestore transaction. If stock
          //    ran out while the customer was paying, it throws and nothing is
          //    written (see the catch block below).
          console.log("Creating order with:", orderWithUser);
          const firebaseOrder = await createOrder({
            ...orderWithUser,
            status: 'processing',
            paymentStatus: 'paid',
            paymentId: response.razorpay_payment_id,
            razorpayOrderId: response.razorpay_order_id,
            paidAt: new Date()
          });

          console.log('Order created and stock reduced:', firebaseOrder.id);

          if (onSuccess) {
            onSuccess({
              ...response,
              firebaseOrderId: firebaseOrder.id,
              orderData: firebaseOrder
            });
          }
     } catch (error) {
    console.error("CREATE ORDER FAILED");
    console.error(error);
    console.error("Message:", error.message);
    console.error("Stack:", error.stack);
    console.error("Code:", error.code);
    console.error("Payment Response:", response);

    if (onError) {
        const insufficientStock = error.message?.startsWith("Not enough stock");
        onError(
            insufficientStock
                ? `Payment was successful, but ${error.message} Please contact support for a refund.`
                : `Payment successful but failed to create order: ${error.message || "Unknown error"}. Please contact support.`
        );
    }
}
      },
      modal: {
        // Customer closed the Razorpay window without completing payment.
        // No order was ever created and no stock was ever touched, so there is
        // nothing to undo — we simply notify the caller.
        ondismiss: () => {
          console.log('Payment modal dismissed — no order created, no stock changed');
          if (onError) {
            onError('Payment cancelled');
          }
        },
        escape: true,
        handleback: true,
        confirm_close: true,
        animation: 'fade'
      }
    };

    // Create and open Razorpay instance using window.Razorpay
    console.log('Creating Razorpay instance with key:', RAZORPAY_KEY_ID);
    console.log('Razorpay options:', options);
    const razorpay = new window.Razorpay(options);
    console.log('Razorpay instance created, opening...');
    razorpay.open();
    console.log('Razorpay modal opened');

    return {
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: 'INR'
    };
  } catch (error) {
    console.error('Error initiating payment:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    if (onError) {
      onError(`Failed to initiate payment: ${error.message || 'Unknown error'}`);
    }
    throw error;
  }
};

/**
 * Verify payment signature (should be done on backend in production)
 * @param {Object} paymentData - Payment response data
 * @returns {boolean} Whether payment is valid
 */
export const verifyPayment = (paymentData) => {
  // In production, this verification should be done on your backend
  // This is a simplified version for demo purposes
  return paymentData &&
    paymentData.razorpay_payment_id &&
    paymentData.razorpay_order_id &&
    paymentData.razorpay_signature;
};

/**
 * Process refund (should be done on backend in production)
 * @param {string} paymentId - Razorpay payment ID
 * @param {number} amount - Refund amount in paise
 * @returns {Promise} Refund result
 */
export const processRefund = async (paymentId, amount) => {
  try {
    // In production, this should be done on your backend
    // For demo purposes, we'll just return a mock response
    console.log(`Refund initiated for payment ${paymentId}, amount: ${amount}`);

    return {
      success: true,
      refundId: `refund_${Date.now()}`,
      message: 'Refund processed successfully'
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Get payment methods available
 * @returns {Array} List of available payment methods
 */
export const getPaymentMethods = () => {
  const methods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      description: 'Pay via UPI, Credit Card, Debit Card, Net Banking',
      icon: '💳',
      popular: true
    }
  ];

  console.log('Payment methods defined:', methods);
  return methods;
};

export default {
  initiatePayment,
  verifyPayment,
  processRefund,
  getPaymentMethods
};