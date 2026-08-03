/**
 * Centralized Firebase Listener Manager
 * Consolidates real-time listeners to prevent duplicate subscriptions
 * and reduce WebSocket connections
 */

import { collection, doc, query, orderBy, where, onSnapshot, limit } from 'firebase/firestore';
import { db } from '../firebase/config';

class FirebaseListenerManager {
  constructor() {
    this.listeners = new Map();
    this.subscribers = new Map(); // Track which components are subscribed to which listeners
    this.componentSubscriptions = new Map(); // Track subscriptions per component
  }

  /**
   * Generate a unique key for a listener based on type and parameters
   * @param {string} type - The type of listener (orders, products, cart, etc.)
   * @param {Object} params - Parameters that define the listener
   * @returns {string} - Unique key for the listener
   */
  generateListenerKey(type, params = {}) {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        if (params[key] !== undefined && params[key] !== null) {
          result[key] = params[key];
        }
        return result;
      }, {});
    
    return `${type}-${JSON.stringify(sortedParams)}`;
  }

  /**
   * Get an existing listener
   * @param {string} type - The type of listener
   * @param {Object} params - Parameters that define the listener
   * @returns {Object|null} - The listener object or null if not found
   */
  getListener(type, params = {}) {
    const key = this.generateListenerKey(type, params);
    return this.listeners.get(key) || null;
  }

  /**
   * Subscribe to a listener
   * @param {string} componentId - Unique identifier for the component
   * @param {string} type - The type of listener
   * @param {Object} params - Parameters that define the listener
   * @param {Function} callback - Callback function for data updates
   * @param {Function} errorCallback - Callback function for errors
   * @returns {Function} - Unsubscribe function
   */
  subscribe(componentId, type, params = {}, callback, errorCallback = null) {
    const key = this.generateListenerKey(type, params);
    
    // Track component subscription
    if (!this.componentSubscriptions.has(componentId)) {
      this.componentSubscriptions.set(componentId, new Set());
    }
    this.componentSubscriptions.get(componentId).add(key);
    
    // Create listener if it doesn't exist
    if (!this.listeners.has(key)) {
      this.createListener(type, params, key);
    }
    
    // Add callback to subscribers
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key).add({ callback, errorCallback });
    
    // Return unsubscribe function for this specific subscription
    return () => {
      this.unsubscribe(componentId, type, params, callback);
    };
  }

  /**
   * Create a new listener based on type and parameters
   * @param {string} type - The type of listener
   * @param {Object} params - Parameters that define the listener
   * @param {string} key - The unique key for the listener
   */
  createListener(type, params, key) {
    let unsubscribe;
    
    try {
      switch (type) {
        case 'orders':
          unsubscribe = this.createOrdersListener(params);
          break;
        case 'products':
          unsubscribe = this.createProductsListener(params);
          break;
        case 'cart':
          unsubscribe = this.createCartListener(params);
          break;
        case 'wishlist':
          unsubscribe = this.createWishlistListener(params);
          break;
        case 'singleOrder':
          unsubscribe = this.createSingleOrderListener(params);
          break;
        default:
          console.warn(`Unknown listener type: ${type}`);
          return;
      }
      
      // Store the listener
      this.listeners.set(key, {
        unsubscribe,
        type,
        params,
        createdAt: Date.now()
      });
      
      console.log(`Created new ${type} listener with key: ${key}`);
    } catch (error) {
      console.error(`Error creating ${type} listener:`, error);
    }
  }

  /**
   * Create orders collection listener
   * @param {Object} params - Parameters for the orders query
   * @returns {Function} - Unsubscribe function
   */
  createOrdersListener(params) {
    const { userId, statusFilter, limitCount, orderByField = 'createdAt', orderDirection = 'desc' } = params;
    
    let ordersQuery = collection(db, 'orders');
    const queryConstraints = [];

    // Add user filter if specified
    if (userId) {
      queryConstraints.push(where('userId', '==', userId));
    }

    // Add status filter if specified
    if (statusFilter) {
      queryConstraints.push(where('status', '==', statusFilter));
    }

    // Add ordering
    queryConstraints.push(orderBy(orderByField, orderDirection));

    // Add limit if specified
    if (limitCount) {
      queryConstraints.push(limit(limitCount));
    }

    ordersQuery = query(ordersQuery, ...queryConstraints);
    
    return onSnapshot(
      ordersQuery,
      (snapshot) => {
        const ordersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Notify all subscribers
        this.notifySubscribers(this.generateListenerKey('orders', params), ordersData, null);
      },
      (error) => {
        console.error('Orders listener error:', error);
        // Notify all subscribers of error
        this.notifySubscribers(this.generateListenerKey('orders', params), null, error);
      }
    );
  }

  /**
   * Create products collection listener
   * @param {Object} params - Parameters for the products query
   * @returns {Function} - Unsubscribe function
   */
  createProductsListener(params) {
    const { orderByField = 'createdAt', orderDirection = 'desc' } = params;
    
    const productsQuery = query(
      collection(db, 'products'),
      orderBy(orderByField, orderDirection)
    );
    
    return onSnapshot(
      productsQuery,
      (snapshot) => {
        const productsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Notify all subscribers
        this.notifySubscribers(this.generateListenerKey('products', params), productsData, null);
      },
      (error) => {
        console.error('Products listener error:', error);
        // Notify all subscribers of error
        this.notifySubscribers(this.generateListenerKey('products', params), null, error);
      }
    );
  }

  /**
   * Create cart document listener
   * @param {Object} params - Parameters for the cart query
   * @returns {Function} - Unsubscribe function
   */
  createCartListener(params) {
    const { userId } = params;
    
    if (!userId) {
      console.error('User ID is required for cart listener');
      return () => {};
    }
    
    const cartRef = doc(db, 'carts', userId);
    
    return onSnapshot(
      cartRef,
      (snapshot) => {
        let cartData = [];
        if (snapshot.exists()) {
          const data = snapshot.data();
          cartData = Array.isArray(data.items) ? data.items : [];
          console.log('FirebaseListenerManager: Cart document exists with data:', cartData);
        } else {
          console.log('FirebaseListenerManager: Cart document does not exist, returning empty array');
        }
        
        // Ensure all cart items have required fields with proper normalization
        cartData = cartData.map(item => ({
          id: item.id,
          name: item.name || 'Unknown Product',
          price: parseFloat(item.price) || 0,
          discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice) : null,
          image: item.image || item.images?.[0],
          quantity: parseInt(item.quantity) || 1,
          selectedSize: item.selectedSize || null,
          selectedColor: item.selectedColor || null,
          stock: parseInt(item.stock) || 0,
          sizes: Array.isArray(item.sizes) ? item.sizes : [],
          colors: Array.isArray(item.colors) ? item.colors : []
        }));
        
        // Notify all subscribers
        this.notifySubscribers(this.generateListenerKey('cart', params), cartData, null);
      },
      (error) => {
        console.error('Cart listener error:', error);
        // Notify all subscribers of error with empty array as fallback
        this.notifySubscribers(this.generateListenerKey('cart', params), [], error);
      }
    );
  }

  /**
   * Create wishlist document listener
   * @param {Object} params - Parameters for the wishlist query
   * @returns {Function} - Unsubscribe function
   */
  createWishlistListener(params) {
    const { userId } = params;
    
    if (!userId) {
      console.error('User ID is required for wishlist listener');
      return () => {};
    }
    
    const wishlistRef = doc(db, 'wishlists', userId);
    
    return onSnapshot(
      wishlistRef,
      (snapshot) => {
        let wishlistData;
        if (snapshot.exists()) {
          wishlistData = snapshot.data().items || [];
        } else {
          wishlistData = [];
        }
        
        // Notify all subscribers
        this.notifySubscribers(this.generateListenerKey('wishlist', params), wishlistData, null);
      },
      (error) => {
        console.error('Wishlist listener error:', error);
        // Notify all subscribers of error
        this.notifySubscribers(this.generateListenerKey('wishlist', params), null, error);
      }
    );
  }

  /**
   * Create single order document listener
   * @param {Object} params - Parameters for the order query
   * @returns {Function} - Unsubscribe function
   */
  createSingleOrderListener(params) {
    const { orderId } = params;
    
    if (!orderId) {
      console.error('Order ID is required for single order listener');
      return () => {};
    }
    
    const orderRef = doc(db, 'orders', orderId);
    
    return onSnapshot(
      orderRef,
      (snapshot) => {
        let orderData;
        if (snapshot.exists()) {
          orderData = {
            id: snapshot.id,
            ...snapshot.data()
          };
        } else {
          orderData = null;
        }
        
        // Notify all subscribers
        this.notifySubscribers(this.generateListenerKey('singleOrder', params), orderData, null);
      },
      (error) => {
        console.error('Single order listener error:', error);
        // Notify all subscribers of error
        this.notifySubscribers(this.generateListenerKey('singleOrder', params), null, error);
      }
    );
  }

  /**
   * Notify all subscribers of a listener with new data
   * @param {string} key - The listener key
   * @param {any} data - The data to send to subscribers
   * @param {Error} error - Any error that occurred
   */
  notifySubscribers(key, data, error) {
    const subscribers = this.subscribers.get(key);
    if (!subscribers) return;
    
    subscribers.forEach(({ callback, errorCallback }) => {
      try {
        if (error) {
          if (errorCallback) errorCallback(error);
        } else {
          callback(data);
        }
      } catch (err) {
        console.error('Error in subscriber callback:', err);
      }
    });
  }

  /**
   * Unsubscribe a specific component from a listener
   * @param {string} componentId - Unique identifier for the component
   * @param {string} type - The type of listener
   * @param {Object} params - Parameters that define the listener
   * @param {Function} callback - The callback function to remove
   */
  unsubscribe(componentId, type, params, callback) {
    const key = this.generateListenerKey(type, params);
    
    // Remove from component subscriptions
    if (this.componentSubscriptions.has(componentId)) {
      this.componentSubscriptions.get(componentId).delete(key);
      
      // Clean up component if no more subscriptions
      if (this.componentSubscriptions.get(componentId).size === 0) {
        this.componentSubscriptions.delete(componentId);
      }
    }
    
    // Remove specific callback from subscribers
    if (this.subscribers.has(key)) {
      const subscribers = this.subscribers.get(key);
      for (const subscriber of subscribers) {
        if (subscriber.callback === callback) {
          subscribers.delete(subscriber);
          break;
        }
      }
      
      // Clean up listener if no more subscribers
      if (subscribers.size === 0) {
        this.cleanupListener(key);
      }
    }
  }

  /**
   * Unsubscribe all listeners for a specific component
   * @param {string} componentId - Unique identifier for the component
   */
  unsubscribeAll(componentId) {
    const subscriptions = this.componentSubscriptions.get(componentId);
    if (!subscriptions) return;
    
    // Create a copy to avoid modifying while iterating
    const subscriptionsArray = Array.from(subscriptions);
    
    subscriptionsArray.forEach(key => {
      // Remove all callbacks for this component
      if (this.subscribers.has(key)) {
        const subscribers = this.subscribers.get(key);
        const subscribersArray = Array.from(subscribers);
        
        subscribersArray.forEach(subscriber => {
          subscribers.delete(subscriber);
        });
        
        // Clean up listener if no more subscribers
        if (subscribers.size === 0) {
          this.cleanupListener(key);
        }
      }
    });
    
    // Remove component from tracking
    this.componentSubscriptions.delete(componentId);
  }

  /**
   * Clean up a listener when it has no more subscribers
   * @param {string} key - The listener key
   */
  cleanupListener(key) {
    const listener = this.listeners.get(key);
    if (listener) {
      try {
        listener.unsubscribe();
        console.log(`Cleaned up ${listener.type} listener with key: ${key}`);
      } catch (error) {
        console.error(`Error cleaning up listener ${key}:`, error);
      }
      
      this.listeners.delete(key);
    }
    
    // Remove subscribers
    this.subscribers.delete(key);
  }

  /**
   * Get statistics about current listeners
   * @returns {Object} - Statistics about listeners and subscriptions
   */
  getStats() {
    const listenerStats = {};
    let totalSubscriptions = 0;
    
    for (const [key, listener] of this.listeners.entries()) {
      const subscriberCount = this.subscribers.get(key)?.size || 0;
      totalSubscriptions += subscriberCount;
      
      if (!listenerStats[listener.type]) {
        listenerStats[listener.type] = {
          count: 0,
          subscriptions: 0
        };
      }
      
      listenerStats[listener.type].count++;
      listenerStats[listener.type].subscriptions += subscriberCount;
    }
    
    return {
      totalListeners: this.listeners.size,
      totalSubscriptions,
      totalComponents: this.componentSubscriptions.size,
      listenerStats
    };
  }

  /**
   * Clean up all listeners (for app shutdown)
   */
  cleanup() {
    console.log('Cleaning up all Firebase listeners...');
    
    // Unsubscribe all listeners
    for (const [key, listener] of this.listeners.entries()) {
      try {
        listener.unsubscribe();
      } catch (error) {
        console.error(`Error cleaning up listener ${key}:`, error);
      }
    }
    
    // Clear all tracking
    this.listeners.clear();
    this.subscribers.clear();
    this.componentSubscriptions.clear();
    
    console.log('All Firebase listeners cleaned up');
  }
}

// Create singleton instance
const firebaseListenerManager = new FirebaseListenerManager();

export default firebaseListenerManager;