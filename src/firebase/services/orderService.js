import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  where,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from '../config';
import { invalidateProductCache } from './productQueryService';

const ORDERS_COLLECTION = 'orders';
const PRODUCTS_COLLECTION = 'products';

// Create new order
//
// IMPORTANT: This must only ever be called AFTER a payment has been confirmed
// successful (see paymentService.initiatePayment's Razorpay `handler` callback).
// It performs stock validation, order creation, and stock deduction inside a
// single Firebase transaction, so:
//   - Two customers can never both buy the last unit of a product (no race condition).
//   - If any item no longer has enough stock, NOTHING is written — no order is
//     created and no stock is touched — and an error is thrown describing exactly
//     which item(s) are short.
//   - Stock can never go negative.
export const createOrder = async (orderData) => {
  try {
    console.log('createOrder called with:', orderData);

    if (!orderData) {
      throw new Error('Order data is required');
    }

    const items = orderData.items || [];
    if (items.length === 0) {
      throw new Error('Order must contain at least one item');
    }

    const ordersRef = collection(db, ORDERS_COLLECTION);
    const newOrderRef = doc(ordersRef); // Pre-generate the order's document ID

    const createdOrder = await runTransaction(db, async (transaction) => {
      // Aggregate requested quantity by product id first. The same product can
      // appear as two separate cart line items (e.g. two different size/color
      // selections), but stock is tracked per-product, not per-variant — so each
      // product document must only be read once and written once per transaction.
      const quantityByProductId = new Map();
      items.forEach((item) => {
        const id = String(item.id);
        quantityByProductId.set(id, (quantityByProductId.get(id) || 0) + (item.quantity || 1));
      });
      const uniqueProductIds = [...quantityByProductId.keys()];

      // Firestore transactions require ALL reads before ANY writes, so first
      // read every product this order touches.
      const productRefs = uniqueProductIds.map((id) => doc(db, PRODUCTS_COLLECTION, id));
      const productDocs = await Promise.all(productRefs.map((ref) => transaction.get(ref)));

      const insufficientItems = [];
      const planByProductId = new Map();

      uniqueProductIds.forEach((id, index) => {
        const productDoc = productDocs[index];
        const requestedQuantity = quantityByProductId.get(id);
        const displayName = items.find((item) => String(item.id) === id)?.name || id;

        if (!productDoc.exists()) {
          insufficientItems.push(`${displayName}: product no longer exists`);
          return;
        }

        const product = productDoc.data();
        const isPreOrder = !!product.isPreOrder;
        const availableStock = isPreOrder ? (product.preOrderStock || 0) : (product.stock || 0);

        if (availableStock < requestedQuantity) {
          insufficientItems.push(
            `${product.name || displayName}: only ${availableStock} left (requested ${requestedQuantity})`
          );
        }

        planByProductId.set(id, {
          ref: productRefs[index],
          product,
          isPreOrder,
          requestedQuantity,
          availableStock
        });
      });

      // Validate stock one final time. If anything is short, abort the whole
      // transaction (no order, no stock change) and throw a clear error.
      if (insufficientItems.length > 0) {
        throw new Error(`Not enough stock available. ${insufficientItems.join('; ')}`);
      }

      // Attach pre-order info (sourced from the product doc, not the cart item)
      const processedItems = items.map((item) => {
        const plan = planByProductId.get(String(item.id));
        return {
          ...item,
          isPreOrder: plan.isPreOrder,
          expectedShippingDate: plan.product.expectedShippingDate || null,
          preOrderMessage: plan.product.preOrderMessage || ''
        };
      });

      const newOrder = {
        ...orderData,
        items: processedItems,
        createdAt: new Date(),
        updatedAt: new Date(),
        status: orderData.status || 'processing',
        hasPreOrderItems: processedItems.some((item) => item.isPreOrder)
      };

      // Create the order
      transaction.set(newOrderRef, newOrder);

      // Deduct stock for every distinct product exactly once, atomically with
      // the order creation above.
      planByProductId.forEach((plan) => {
        const newStock = plan.availableStock - plan.requestedQuantity;
        transaction.update(plan.ref, {
          ...(plan.isPreOrder ? { preOrderStock: newStock } : { stock: newStock }),
          updatedAt: new Date()
        });
      });

      return { id: newOrderRef.id, ...newOrder };
    });

    // Best-effort cache invalidation (outside the transaction; never blocks the order)
    try {
      items.forEach((item) => invalidateProductCache('product', item.id));
      invalidateProductCache('stock');
    } catch (cacheError) {
      console.error('Error invalidating product cache after order creation:', cacheError);
    }

    // Update order statistics asynchronously
    try {
      updateOrderStatistics().catch(error => {
        console.error('Error updating order statistics:', error);
        // Don't fail the order creation if statistics update fails
      });
    } catch (statsError) {
      console.error('Error triggering order statistics update:', statsError);
    }

    console.log('Order created with ID:', createdOrder.id, '- stock deducted for all items');

    return createdOrder;
  } catch (error) {
    console.error('Error in createOrder:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      orderData
    });
    throw error;
  }
};

// Get all orders (for admin)
export const getAllOrders = async () => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(ordersRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    throw error;
  }
};

// Get orders by user ID
export const getOrdersByUserId = async (userId) => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef, 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    throw error;
  }
};

// Get order by ID
export const getOrderById = async (orderId) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    const orderDoc = await getDoc(orderRef);
    
    if (orderDoc.exists()) {
      return { id: orderDoc.id, ...orderDoc.data() };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    throw error;
  }
};

// Update order status
export const updateOrderStatus = async (orderId, status, additionalData = {}) => {
  try {
    console.log('updateOrderStatus called with:', { orderId, status, additionalData });
    
    if (!orderId) {
      throw new Error('Order ID is required');
    }
    
    // First, get the current order to ensure we preserve the userId
    console.log('Fetching current order to preserve userId...');
    const currentOrder = await getOrderById(orderId);
    console.log('Current order:', currentOrder);
    
    if (!currentOrder.userId) {
      throw new Error('Order does not have a userId - this should not happen');
    }
    
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    console.log('Order reference created:', orderRef.path);
    
    const updateData = {
      status,
      updatedAt: new Date(),
      userId: currentOrder.userId, // Ensure userId is preserved
      ...additionalData
    };
    
    console.log('Update data prepared:', updateData);
    
    // Add timestamp for specific status changes
    if (status === 'shipped' && !additionalData.shippedAt) {
      updateData.shippedAt = new Date();
    } else if (status === 'delivered' && !additionalData.deliveredAt) {
      updateData.deliveredAt = new Date();
    }
    
    console.log('Attempting to update document...');
    await updateDoc(orderRef, updateData);
    console.log('Document updated successfully');
    
    // Update order statistics asynchronously
    try {
      updateOrderStatistics().catch(error => {
        console.error('Error updating order statistics:', error);
        // Don't fail the order status update if statistics update fails
      });
    } catch (statsError) {
      console.error('Error triggering order statistics update:', statsError);
    }
    
    // Return updated order
    console.log('Fetching updated order...');
    const updatedOrder = await getOrderById(orderId);
    console.log('Updated order retrieved:', updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error('Error in updateOrderStatus:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack,
      orderId,
      status
    });
    throw error;
  }
};

// Update order tracking information
export const updateOrderTracking = async (orderId, trackingNumber, carrier = '') => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    
    await updateDoc(orderRef, {
      trackingNumber,
      carrier,
      status: 'shipped',
      shippedAt: new Date(),
      updatedAt: new Date()
    });
    
    return await getOrderById(orderId);
  } catch (error) {
    throw error;
  }
};

// Cancel order
export const cancelOrder = async (orderId, reason = '') => {
  try {
    // Use a transaction to ensure stock is restored atomically with order cancellation
    const updatedOrder = await runTransaction(db, async (transaction) => {
      const orderRef = doc(db, ORDERS_COLLECTION, orderId);
      const orderDoc = await transaction.get(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Order not found');
      }
      
      const order = orderDoc.data();
      
      // Only restore stock if the order is not already cancelled
      if (order.status !== 'cancelled') {
        // Restore stock for each item
        for (const item of order.items || []) {
          const productRef = doc(db, 'products', item.id);
          const productDoc = await transaction.get(productRef);
          
          if (productDoc.exists()) {
            const product = productDoc.data();
            
            if (item.isPreOrder) {
              // Restore pre-order stock for pre-order items
              const currentPreOrderStock = product.preOrderStock || 0;
              const newPreOrderStock = currentPreOrderStock + item.quantity;
              
              transaction.update(productRef, {
                preOrderStock: newPreOrderStock,
                updatedAt: new Date()
              });
            } else {
              // Restore regular stock for regular items
              const currentStock = product.stock || 0;
              const newStock = currentStock + item.quantity;
              
              transaction.update(productRef, {
                stock: newStock,
                updatedAt: new Date()
              });
            }
          }
        }
      }
      
      // Update the order status
      transaction.update(orderRef, {
        status: 'cancelled',
        cancellationReason: reason,
        cancelledAt: new Date(),
        updatedAt: new Date()
      });
      
      return { id: orderId, ...order, status: 'cancelled', cancellationReason: reason };
    });
    
    // Update order statistics asynchronously
    try {
      updateOrderStatistics().catch(error => {
        console.error('Error updating order statistics:', error);
        // Don't fail the order cancellation if statistics update fails
      });
    } catch (statsError) {
      console.error('Error triggering order statistics update:', statsError);
    }
    
    console.log('Order cancelled with ID:', orderId);
    console.log('Stock restored for all items');
    
    return updatedOrder;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// Get orders by status
export const getOrdersByStatus = async (status) => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef, 
      where('status', '==', status),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    throw error;
  }
};

// Get order statistics (for admin dashboard)
export const getOrderStatistics = async () => {
  try {
    // First try to get from the statistics collection
    const statsRef = doc(db, 'statistics', 'orders');
    const statsDoc = await getDoc(statsRef);
    
    if (statsDoc.exists()) {
      return statsDoc.data();
    }
    
    // Fallback to calculation if statistics document doesn't exist
    return await calculateOrderStatistics();
  } catch (error) {
    console.error('Error getting order statistics:', error);
    // Fallback to direct calculation if statistics read fails
    return await calculateOrderStatistics();
  }
};

// Calculate order statistics from all orders (fallback function)
export const calculateOrderStatistics = async () => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const querySnapshot = await getDocs(ordersRef);
    
    const stats = {
      total: 0,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0,
      lastUpdated: new Date()
    };
    
    querySnapshot.forEach((doc) => {
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
    
    // Update the statistics collection for future queries
    try {
      const statsRef = doc(db, 'statistics', 'orders');
      await setDoc(statsRef, stats);
    } catch (updateError) {
      console.error('Error updating statistics collection:', updateError);
      // Don't fail the function if statistics update fails
    }
    
    return stats;
  } catch (error) {
    throw error;
  }
};

// Update order statistics (to be called when orders change)
export const updateOrderStatistics = async () => {
  try {
    const stats = await calculateOrderStatistics();
    return stats;
  } catch (error) {
    console.error('Error updating order statistics:', error);
    throw error;
  }
};

// Get recent orders (for admin dashboard)
export const getRecentOrders = async (limitCount = 10) => {
  try {
    const ordersRef = collection(db, ORDERS_COLLECTION);
    const q = query(
      ordersRef, 
      orderBy('createdAt', 'desc'), 
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const orders = [];
    
    querySnapshot.forEach((doc) => {
      orders.push({ id: doc.id, ...doc.data() });
    });
    
    return orders;
  } catch (error) {
    throw error;
  }
};

// Delete order (admin only)
export const deleteOrder = async (orderId) => {
  try {
    const orderRef = doc(db, ORDERS_COLLECTION, orderId);
    await deleteDoc(orderRef);
    return true;
  } catch (error) {
    throw error;
  }
};