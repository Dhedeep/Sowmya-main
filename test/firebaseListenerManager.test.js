/**
 * Test file for Firebase Listener Manager
 * Tests the consolidated real-time listener implementation
 */

import firebaseListenerManager from '../src/utils/firebaseListenerManager';

// Mock Firebase functions
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
  onSnapshot: jest.fn()
}));

describe('Firebase Listener Manager', () => {
  beforeEach(() => {
    // Clear all listeners before each test
    firebaseListenerManager.cleanup();
  });

  afterEach(() => {
    // Clean up after each test
    firebaseListenerManager.cleanup();
  });

  describe('Listener Key Generation', () => {
    test('should generate consistent keys for same parameters', () => {
      const key1 = firebaseListenerManager.generateListenerKey('orders', { userId: 'user1' });
      const key2 = firebaseListenerManager.generateListenerKey('orders', { userId: 'user1' });
      expect(key1).toBe(key2);
    });

    test('should generate different keys for different parameters', () => {
      const key1 = firebaseListenerManager.generateListenerKey('orders', { userId: 'user1' });
      const key2 = firebaseListenerManager.generateListenerKey('orders', { userId: 'user2' });
      expect(key1).not.toBe(key2);
    });

    test('should generate different keys for different types', () => {
      const key1 = firebaseListenerManager.generateListenerKey('orders', { userId: 'user1' });
      const key2 = firebaseListenerManager.generateListenerKey('cart', { userId: 'user1' });
      expect(key1).not.toBe(key2);
    });
  });

  describe('Subscription Management', () => {
    test('should allow multiple subscribers to same listener', () => {
      const componentId1 = 'component1';
      const componentId2 = 'component2';
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      const unsubscribe1 = firebaseListenerManager.subscribe(
        componentId1,
        'orders',
        { userId: 'user1' },
        callback1
      );

      const unsubscribe2 = firebaseListenerManager.subscribe(
        componentId2,
        'orders',
        { userId: 'user1' },
        callback2
      );

      expect(unsubscribe1).toBeDefined();
      expect(unsubscribe2).toBeDefined();

      const stats = firebaseListenerManager.getStats();
      expect(stats.totalListeners).toBe(1); // Only one listener created
      expect(stats.totalSubscriptions).toBe(2); // But two subscriptions
    });

    test('should cleanup listener when no subscribers remain', () => {
      const componentId = 'component1';
      const callback = jest.fn();

      const unsubscribe = firebaseListenerManager.subscribe(
        componentId,
        'orders',
        { userId: 'user1' },
        callback
      );

      expect(firebaseListenerManager.getStats().totalListeners).toBe(1);

      // Unsubscribe the only subscriber
      unsubscribe();

      expect(firebaseListenerManager.getStats().totalListeners).toBe(0);
    });

    test('should unsubscribe all listeners for a component', () => {
      const componentId = 'component1';
      const callback1 = jest.fn();
      const callback2 = jest.fn();

      firebaseListenerManager.subscribe(componentId, 'orders', { userId: 'user1' }, callback1);
      firebaseListenerManager.subscribe(componentId, 'cart', { userId: 'user1' }, callback2);

      expect(firebaseListenerManager.getStats().totalListeners).toBe(2);

      firebaseListenerManager.unsubscribeAll(componentId);

      expect(firebaseListenerManager.getStats().totalListeners).toBe(0);
    });
  });

  describe('Statistics', () => {
    test('should provide accurate statistics', () => {
      const componentId1 = 'component1';
      const componentId2 = 'component2';

      firebaseListenerManager.subscribe(componentId1, 'orders', { userId: 'user1' }, jest.fn());
      firebaseListenerManager.subscribe(componentId2, 'orders', { userId: 'user1' }, jest.fn());
      firebaseListenerManager.subscribe(componentId1, 'cart', { userId: 'user1' }, jest.fn());

      const stats = firebaseListenerManager.getStats();
      expect(stats.totalListeners).toBe(2); // orders and cart
      expect(stats.totalSubscriptions).toBe(3); // 2 for orders, 1 for cart
      expect(stats.totalComponents).toBe(2); // component1 and component2
      expect(stats.listenerStats.orders.count).toBe(1);
      expect(stats.listenerStats.orders.subscriptions).toBe(2);
      expect(stats.listenerStats.cart.count).toBe(1);
      expect(stats.listenerStats.cart.subscriptions).toBe(1);
    });
  });

  describe('Cleanup', () => {
    test('should cleanup all listeners', () => {
      firebaseListenerManager.subscribe('component1', 'orders', { userId: 'user1' }, jest.fn());
      firebaseListenerManager.subscribe('component2', 'cart', { userId: 'user1' }, jest.fn());

      expect(firebaseListenerManager.getStats().totalListeners).toBe(2);

      firebaseListenerManager.cleanup();

      expect(firebaseListenerManager.getStats().totalListeners).toBe(0);
      expect(firebaseListenerManager.getStats().totalSubscriptions).toBe(0);
      expect(firebaseListenerManager.getStats().totalComponents).toBe(0);
    });
  });
});

/**
 * Integration test for consolidated listeners
 * Tests that the hooks properly use the centralized manager
 */
describe('Consolidated Listeners Integration', () => {
  test('should prevent duplicate order listeners', () => {
    // This test would require importing the actual hooks
    // and simulating multiple components using the same listener
    // For now, we'll test the manager directly
    
    const callback1 = jest.fn();
    const callback2 = jest.fn();

    // Simulate two components requesting the same orders listener
    const unsubscribe1 = firebaseListenerManager.subscribe(
      'admin-component',
      'orders',
      {},
      callback1
    );

    const unsubscribe2 = firebaseListenerManager.subscribe(
      'orders-component',
      'orders',
      {},
      callback2
    );

    const stats = firebaseListenerManager.getStats();
    
    // Should only have one listener despite two subscriptions
    expect(stats.totalListeners).toBe(1);
    expect(stats.totalSubscriptions).toBe(2);

    // Cleanup
    unsubscribe1();
    unsubscribe2();
  });

  test('should handle different parameter combinations', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const callback3 = jest.fn();

    // Different parameter combinations should create different listeners
    firebaseListenerManager.subscribe('component1', 'orders', { userId: 'user1' }, callback1);
    firebaseListenerManager.subscribe('component2', 'orders', { userId: 'user2' }, callback2);
    firebaseListenerManager.subscribe('component3', 'orders', { statusFilter: 'pending' }, callback3);

    const stats = firebaseListenerManager.getStats();
    
    // Should have three different listeners
    expect(stats.totalListeners).toBe(3);
    expect(stats.totalSubscriptions).toBe(3);
  });
});