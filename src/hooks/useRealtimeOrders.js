import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import firebaseListenerManager from '../utils/firebaseListenerManager';

/**
 * Hook for real-time order data synchronization
 * Provides real-time updates to order data without manual refreshes
 */
export const useRealtimeOrders = (options = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const unsubscribeRef = useRef(null);
  const componentId = useRef(`useRealtimeOrders-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  const {
    userId = null,
    statusFilter = null,
    limitCount = null,
    orderByField = 'createdAt',
    orderDirection = 'desc'
  } = options;

  /**
   * Setup real-time listener for orders
   */
  const setupOrdersListener = useCallback(() => {
    const targetUserId = userId || user?.uid;
    
    if (!targetUserId) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clean up any existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe using the centralized manager
    const listenerParams = {
      userId: targetUserId,
      statusFilter,
      limitCount,
      orderByField,
      orderDirection
    };
    
    unsubscribeRef.current = firebaseListenerManager.subscribe(
      componentId.current,
      'orders',
      listenerParams,
      (ordersData) => {
        setOrders(ordersData);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Real-time orders listener error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, [user?.uid, userId, statusFilter, limitCount, orderByField, orderDirection]);

  /**
   * Manually refresh orders data
   */
  const refreshOrders = useCallback(() => {
    setupOrdersListener();
  }, [setupOrdersListener]);

  /**
   * Get orders by status
   */
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  /**
   * Get order by ID
   */
  const getOrderById = useCallback((orderId) => {
    return orders.find(order => order.id === orderId);
  }, [orders]);

  /**
   * Get recent orders (last 5)
   */
  const getRecentOrders = useCallback((count = 5) => {
    return orders.slice(0, count);
  }, [orders]);

  /**
   * Get order statistics
   */
  const getOrderStats = useCallback(() => {
    const stats = {
      total: orders.length,
      processing: 0,
      shipped: 0,
      delivered: 0,
      cancelled: 0,
      totalRevenue: 0
    };

    orders.forEach(order => {
      // Count by status
      if (stats[order.status] !== undefined) {
        stats[order.status]++;
      }
      
      // Calculate total revenue (only from delivered orders)
      if (order.status === 'delivered' && order.total) {
        stats.totalRevenue += order.total;
      }
    });

    return stats;
  }, [orders]);

  // Setup listener when dependencies change
  useEffect(() => {
    setupOrdersListener();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      firebaseListenerManager.unsubscribeAll(componentId.current);
    };
  }, [setupOrdersListener]);

  return {
    orders,
    loading,
    error,
    refreshOrders,
    getOrdersByStatus,
    getOrderById,
    getRecentOrders,
    getOrderStats
  };
};

/**
 * Hook for real-time order tracking
 * Specifically for tracking a single order's status changes
 */
export const useRealtimeOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const unsubscribeRef = useRef(null);
  const componentId = useRef(`useRealtimeOrderTracking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  /**
   * Setup real-time listener for specific order
   */
  const setupOrderListener = useCallback(() => {
    if (!orderId) {
      setOrder(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Clean up any existing listener
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
    }

    // Subscribe using the centralized manager
    unsubscribeRef.current = firebaseListenerManager.subscribe(
      componentId.current,
      'singleOrder',
      { orderId },
      (orderData) => {
        if (orderData) {
          setOrder(orderData);
        } else {
          setOrder(null);
          setError('Order not found');
        }
        setLoading(false);
      },
      (err) => {
        console.error('Real-time order tracking error:', err);
        setError(err.message);
        setLoading(false);
      }
    );
  }, [orderId]);

  /**
   * Get order status with timestamp
   */
  const getOrderStatus = useCallback(() => {
    if (!order) return null;
    
    return {
      status: order.status,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      shippedAt: order.shippedAt,
      deliveredAt: order.deliveredAt,
      cancelledAt: order.cancelledAt,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier
    };
  }, [order]);

  /**
   * Check if order is in transit
   */
  const isInTransit = useCallback(() => {
    if (!order) return false;
    return order.status === 'shipped';
  }, [order]);

  /**
   * Check if order is delivered
   */
  const isDelivered = useCallback(() => {
    if (!order) return false;
    return order.status === 'delivered';
  }, [order]);

  /**
   * Check if order is cancelled
   */
  const isCancelled = useCallback(() => {
    if (!order) return false;
    return order.status === 'cancelled';
  }, [order]);

  // Setup listener when orderId changes
  useEffect(() => {
    setupOrderListener();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
      firebaseListenerManager.unsubscribeAll(componentId.current);
    };
  }, [setupOrderListener]);

  return {
    order,
    loading,
    error,
    refreshOrder: setupOrderListener,
    getOrderStatus,
    isInTransit,
    isDelivered,
    isCancelled
  };
};

/**
 * Hook for real-time admin orders monitoring
 * Provides real-time updates for all orders (admin view)
 */
export const useRealtimeAdminOrders = (options = {}) => {
  const { statusFilter, limitCount, dateRange } = options;
  
  // Use the main hook with admin-specific options
  return useRealtimeOrders({
    userId: null, // Get all orders for admin
    statusFilter,
    limitCount,
    orderByField: 'createdAt',
    orderDirection: 'desc'
  });
};