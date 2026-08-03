/**
 * Cloud Functions for Order Statistics
 * 
 * These functions automatically update the order statistics collection
 * when orders are created, updated, or deleted.
 */

const { functions } = require('firebase-functions');
const { firestore } = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (!firestore.apps.length) {
  firestore.initializeApp();
}

const db = getFirestore();

/**
 * Calculate order statistics from all orders
 */
const calculateOrderStatistics = async () => {
  try {
    const ordersSnapshot = await db.collection('orders').get();
    
    const stats = {
      total: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
      lastUpdated: new Date()
    };
    
    ordersSnapshot.forEach((doc) => {
      const order = doc.data();
      stats.total++;
      
      // Count by status
      if (stats[order.status] !== undefined) {
        stats[order.status]++;
      }
      
      // Calculate total revenue (only from delivered orders)
      if (order.status === 'delivered' && order.total) {
        stats.totalRevenue += order.total;
      }
    });
    
    // Update the statistics collection
    await db.collection('statistics').doc('orders').set(stats);
    
    console.log('Order statistics updated successfully:', stats);
    return stats;
  } catch (error) {
    console.error('Error calculating order statistics:', error);
    throw error;
  }
};

/**
 * Trigger: Update statistics when an order is created
 */
exports.onOrderCreated = functions.firestore
  .document('orders/{orderId}')
  .onCreate(async (snap, context) => {
    console.log('Order created, updating statistics:', context.params.orderId);
    
    try {
      await calculateOrderStatistics();
      console.log('Statistics updated after order creation');
    } catch (error) {
      console.error('Error updating statistics after order creation:', error);
    }
  });

/**
 * Trigger: Update statistics when an order is updated
 */
exports.onOrderUpdated = functions.firestore
  .document('orders/{orderId}')
  .onUpdate(async (change, context) => {
    console.log('Order updated, updating statistics:', context.params.orderId);
    
    const beforeData = change.before.data();
    const afterData = change.after.data();
    
    // Only update statistics if status changed (to avoid unnecessary recalculations)
    if (beforeData.status !== afterData.status) {
      try {
        await calculateOrderStatistics();
        console.log('Statistics updated after order status change');
      } catch (error) {
        console.error('Error updating statistics after order update:', error);
      }
    }
  });

/**
 * Trigger: Update statistics when an order is deleted
 */
exports.onOrderDeleted = functions.firestore
  .document('orders/{orderId}')
  .onDelete(async (snap, context) => {
    console.log('Order deleted, updating statistics:', context.params.orderId);
    
    try {
      await calculateOrderStatistics();
      console.log('Statistics updated after order deletion');
    } catch (error) {
      console.error('Error updating statistics after order deletion:', error);
    }
  });

/**
 * Scheduled function: Update statistics daily at midnight
 * This ensures statistics stay in sync even if triggers are missed
 */
exports.updateOrderStatisticsDaily = functions.pubsub
  .schedule('0 0 * * *') // Daily at midnight UTC
  .timeZone('UTC')
  .onRun(async (context) => {
    console.log('Running daily order statistics update');
    
    try {
      await calculateOrderStatistics();
      console.log('Daily order statistics update completed');
      return null;
    } catch (error) {
      console.error('Error in daily order statistics update:', error);
      return null;
    }
  });

/**
 * HTTP function: Manually trigger statistics update
 * Useful for admin dashboard manual refresh
 */
exports.manualUpdateOrderStatistics = functions.https.onRequest(async (req, res) => {
  try {
    console.log('Manual order statistics update triggered');
    
    const stats = await calculateOrderStatistics();
    
    res.status(200).json({
      success: true,
      message: 'Order statistics updated successfully',
      data: stats
    });
  } catch (error) {
    console.error('Error in manual order statistics update:', error);
    
    res.status(500).json({
      success: false,
      message: 'Failed to update order statistics',
      error: error.message
    });
  }
});

// Export the calculate function for use in other parts of the application
module.exports = {
  calculateOrderStatistics
};