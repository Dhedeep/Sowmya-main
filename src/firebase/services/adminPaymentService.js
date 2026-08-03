import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  where,
  limit
} from 'firebase/firestore';
import { db } from '../config';
import { getAllOrders } from './orderService';

const ORDERS_COLLECTION = 'orders';

/**
 * Get all payments from orders
 * @returns {Promise<Array>} Array of payment objects
 */
export const getAllPayments = async () => {
  try {
    const orders = await getAllOrders();
    
    // Filter orders that have payment information
    const payments = orders
      .filter(order => order.paymentStatus) // Only include orders with payment status
      .map(order => ({
        id: order.id,
        orderId: order.id,
        userId: order.userId,
        amount: order.total || 0,
        status: order.paymentStatus,
        paymentId: order.paymentId,
        method: order.paymentMethod || 'razorpay', // Default to razorpay if not specified
        createdAt: order.createdAt,
        paidAt: order.paidAt,
        updatedAt: order.updatedAt,
        orderStatus: order.status,
        customerName: order.customerName || order.shippingAddress?.name || 'N/A',
        customerEmail: order.customerEmail || 'N/A',
        refundId: order.refundId,
        refundAmount: order.refundAmount,
        refundedAt: order.refundedAt,
        refundReason: order.refundReason
      }))
      .sort((a, b) => b.createdAt - a.createdAt); // Sort by creation date (newest first)
    
    return payments;
  } catch (error) {
    console.error('Error fetching payments:', error);
    throw error;
  }
};

/**
 * Get payments by status
 * @param {string} status - Payment status to filter by
 * @returns {Promise<Array>} Array of payment objects
 */
export const getPaymentsByStatus = async (status) => {
  try {
    const allPayments = await getAllPayments();
    return allPayments.filter(payment => payment.status === status);
  } catch (error) {
    console.error('Error fetching payments by status:', error);
    throw error;
  }
};

/**
 * Get payment by ID
 * @param {string} paymentId - Payment ID (same as order ID)
 * @returns {Promise<Object>} Payment object
 */
export const getPaymentById = async (paymentId) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, paymentId);
    const orderDoc = await getDoc(orderRef);
    
    if (!orderDoc.exists()) {
      throw new Error('Payment not found');
    }
    
    const order = orderDoc.data();
    
    return {
      id: orderDoc.id,
      orderId: orderDoc.id,
      userId: order.userId,
      amount: order.total || 0,
      status: order.paymentStatus,
      paymentId: order.paymentId,
      method: order.paymentMethod || 'razorpay',
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      updatedAt: order.updatedAt,
      orderStatus: order.status,
      customerName: order.customerName || order.shippingAddress?.name || 'N/A',
      customerEmail: order.customerEmail || 'N/A',
      refundId: order.refundId,
      refundAmount: order.refundAmount,
      refundedAt: order.refundedAt,
      refundReason: order.refundReason,
      items: order.items || [],
      shippingAddress: order.shippingAddress,
      notes: order.notes
    };
  } catch (error) {
    console.error('Error fetching payment by ID:', error);
    throw error;
  }
};

/**
 * Get payment statistics
 * @returns {Promise<Object>} Payment statistics
 */
export const getPaymentStatistics = async () => {
  try {
    const payments = await getAllPayments();
    
    const stats = {
      total: payments.length,
      paid: payments.filter(p => p.status === 'paid').length,
      pending: payments.filter(p => p.status === 'pending').length,
      failed: payments.filter(p => p.status === 'failed').length,
      refunded: payments.filter(p => p.status === 'refunded').length,
      cancelled: payments.filter(p => p.status === 'cancelled').length,
      totalRevenue: 0,
      totalRefunded: 0
    };
    
    // Calculate total revenue and refunded amount
    payments.forEach(payment => {
      if (payment.status === 'paid') {
        stats.totalRevenue += payment.amount;
      }
      if (payment.status === 'refunded' && payment.refundAmount) {
        stats.totalRefunded += payment.refundAmount;
      }
    });
    
    return stats;
  } catch (error) {
    console.error('Error fetching payment statistics:', error);
    throw error;
  }
};

/**
 * Update payment status
 * @param {string} paymentId - Payment ID (same as order ID)
 * @param {string} status - New payment status
 * @param {Object} additionalData - Additional data to update
 * @returns {Promise<Object>} Updated payment
 */
export const updatePaymentStatus = async (paymentId, status, additionalData = {}) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, paymentId);
    
    const updateData = {
      paymentStatus: status,
      updatedAt: new Date(),
      ...additionalData
    };
    
    // Add timestamp for specific status changes
    if (status === 'paid' && !additionalData.paidAt) {
      updateData.paidAt = new Date();
    } else if (status === 'refunded' && !additionalData.refundedAt) {
      updateData.refundedAt = new Date();
    }
    
    await updateDoc(orderRef, updateData);
    
    return await getPaymentById(paymentId);
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
};

/**
 * Process refund for a payment
 * @param {string} paymentId - Payment ID (same as order ID)
 * @param {number} refundAmount - Amount to refund
 * @param {string} reason - Reason for refund
 * @returns {Promise<Object>} Updated payment
 */
export const processRefund = async (paymentId, refundAmount, reason = '') => {
  try {
    // In a real implementation, this would call the payment gateway's refund API
    // For now, we'll simulate the refund process
    
    const payment = await getPaymentById(paymentId);
    
    if (!payment) {
      throw new Error('Payment not found');
    }
    
    if (payment.status !== 'paid') {
      throw new Error('Only paid payments can be refunded');
    }
    
    if (refundAmount > payment.amount) {
      throw new Error('Refund amount cannot exceed payment amount');
    }
    
    // Generate a mock refund ID
    const refundId = `refund_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Update payment with refund information
    const updatedPayment = await updatePaymentStatus(paymentId, 'refunded', {
      refundId,
      refundAmount,
      refundedAt: new Date(),
      refundReason: reason
    });
    
    // Also update the order status to refunded if full refund
    if (refundAmount >= payment.amount) {
      const { updateOrderStatus } = await import('./orderService');
      await updateOrderStatus(paymentId, 'refunded', {
        refundId,
        refundAmount,
        refundedAt: new Date(),
        refundReason: reason
      });
    }
    
    return updatedPayment;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
};

/**
 * Get recent payments
 * @param {number} limitCount - Maximum number of payments to return
 * @returns {Promise<Array>} Array of recent payments
 */
export const getRecentPayments = async (limitCount = 10) => {
  try {
    const payments = await getAllPayments();
    return payments.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching recent payments:', error);
    throw error;
  }
};

/**
 * Search payments by order ID, customer name, or email
 * @param {string} searchTerm - Search term
 * @returns {Promise<Array>} Array of matching payments
 */
export const searchPayments = async (searchTerm) => {
  try {
    const payments = await getAllPayments();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return payments.filter(payment =>
      payment.orderId.toLowerCase().includes(lowerSearchTerm) ||
      payment.customerName.toLowerCase().includes(lowerSearchTerm) ||
      payment.customerEmail.toLowerCase().includes(lowerSearchTerm) ||
      (payment.paymentId && payment.paymentId.toLowerCase().includes(lowerSearchTerm))
    );
  } catch (error) {
    console.error('Error searching payments:', error);
    throw error;
  }
};

export default {
  getAllPayments,
  getPaymentsByStatus,
  getPaymentById,
  getPaymentStatistics,
  updatePaymentStatus,
  processRefund,
  getRecentPayments,
  searchPayments
};