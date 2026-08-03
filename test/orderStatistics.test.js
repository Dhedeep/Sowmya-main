/**
 * Test file for Order Statistics Optimization
 * 
 * This file contains tests to verify that the order statistics
 * optimization is working correctly.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  getOrderStatistics, 
  calculateOrderStatistics, 
  updateOrderStatistics 
} from '../src/firebase/services/orderService.js';

// Mock Firebase Firestore
const mockGetDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockGetDocs = jest.fn();

jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: mockGetDoc,
  setDoc: mockSetDoc,
  getDocs: mockGetDocs,
  query: jest.fn(),
  orderBy: jest.fn(),
  where: jest.fn(),
  limit: jest.fn(),
}));

describe('Order Statistics Optimization', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrderStatistics', () => {
    it('should return cached statistics when available', async () => {
      // Mock cached statistics
      const mockStats = {
        total: 100,
        processing: 20,
        shipped: 30,
        delivered: 40,
        cancelled: 10,
        totalRevenue: 5000,
        lastUpdated: new Date()
      };

      mockGetDoc.mockResolvedValueOnce({
        exists: true,
        data: () => mockStats
      });

      const result = await getOrderStatistics();

      expect(result).toEqual(mockStats);
      expect(mockGetDoc).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).not.toHaveBeenCalled();
    });

    it('should calculate statistics when cache is empty', async () => {
      // Mock empty cache
      mockGetDoc.mockResolvedValueOnce({
        exists: false
      });

      // Mock order data
      const mockOrders = [
        { status: 'processing', total: 100 },
        { status: 'delivered', total: 200 },
        { status: 'delivered', total: 300 },
        { status: 'cancelled', total: 50 }
      ];

      mockGetDocs.mockResolvedValueOnce({
        forEach: (callback) => {
          mockOrders.forEach((order, index) => {
            callback({ data: () => order });
          });
        }
      });

      // Mock setDoc for updating cache
      mockSetDoc.mockResolvedValueOnce();

      const result = await getOrderStatistics();

      expect(result).toEqual({
        total: 4,
        processing: 1,
        shipped: 0,
        delivered: 2,
        cancelled: 1,
        totalRevenue: 500, // Sum of delivered orders (200 + 300)
        lastUpdated: expect.any(Date)
      });

      expect(mockGetDoc).toHaveBeenCalledTimes(1);
      expect(mockGetDocs).toHaveBeenCalledTimes(1);
      expect(mockSetDoc).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      // Mock error when getting cached stats
      mockGetDoc.mockRejectedValueOnce(new Error('Firestore error'));

      // Mock order data as fallback
      const mockOrders = [
        { status: 'delivered', total: 100 }
      ];

      mockGetDocs.mockResolvedValueOnce({
        forEach: (callback) => {
          mockOrders.forEach(order => {
            callback({ data: () => order });
          });
        }
      });

      mockSetDoc.mockResolvedValueOnce();

      const result = await getOrderStatistics();

      expect(result).toEqual({
        total: 1,
        processing: 0,
        shipped: 0,
        delivered: 1,
        cancelled: 0,
        totalRevenue: 100,
        lastUpdated: expect.any(Date)
      });
    });
  });

  describe('calculateOrderStatistics', () => {
    it('should correctly calculate statistics from orders', async () => {
      const mockOrders = [
        { status: 'processing', total: 100 },
        { status: 'shipped', total: 200 },
        { status: 'delivered', total: 300 },
        { status: 'delivered', total: 400 },
        { status: 'cancelled', total: 50 }
      ];

      mockGetDocs.mockResolvedValueOnce({
        forEach: (callback) => {
          mockOrders.forEach(order => {
            callback({ data: () => order });
          });
        }
      });

      mockSetDoc.mockResolvedValueOnce();

      const result = await calculateOrderStatistics();

      expect(result).toEqual({
        total: 5,
        processing: 1,
        shipped: 1,
        delivered: 2,
        cancelled: 1,
        totalRevenue: 700, // Sum of delivered orders (300 + 400)
        lastUpdated: expect.any(Date)
      });

      expect(mockSetDoc).toHaveBeenCalledWith(
        expect.any(Object), // doc reference
        expect.objectContaining({
          total: 5,
          processing: 1,
          shipped: 1,
          delivered: 2,
          cancelled: 1,
          totalRevenue: 700,
          lastUpdated: expect.any(Date)
        })
      );
    });

    it('should handle empty orders collection', async () => {
      mockGetDocs.mockResolvedValueOnce({
        forEach: () => {} // No orders
      });

      mockSetDoc.mockResolvedValueOnce();

      const result = await calculateOrderStatistics();

      expect(result).toEqual({
        total: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
        totalRevenue: 0,
        lastUpdated: expect.any(Date)
      });
    });
  });

  describe('updateOrderStatistics', () => {
    it('should call calculateOrderStatistics and return the result', async () => {
      const mockStats = {
        total: 10,
        processing: 2,
        shipped: 3,
        delivered: 4,
        cancelled: 1,
        totalRevenue: 1000,
        lastUpdated: new Date()
      };

      // Mock the calculateOrderStatistics function
      const originalCalculate = calculateOrderStatistics;
      const mockCalculate = jest.fn().mockResolvedValue(mockStats);
      
      // Temporarily replace the function
      global.calculateOrderStatistics = mockCalculate;

      const result = await updateOrderStatistics();

      expect(result).toEqual(mockStats);
      expect(mockCalculate).toHaveBeenCalledTimes(1);

      // Restore original function
      global.calculateOrderStatistics = originalCalculate;
    });
  });
});

/**
 * Performance Test
 * 
 * This test demonstrates the performance improvement of the optimized
 * getOrderStatistics function compared to the original implementation.
 */
describe('Performance Comparison', () => {
  it('should demonstrate performance improvement', async () => {
    // Mock cached statistics (fast path)
    const mockStats = {
      total: 1000,
      processing: 200,
      shipped: 300,
      delivered: 400,
      cancelled: 100,
      totalRevenue: 50000,
      lastUpdated: new Date()
    };

    mockGetDoc.mockResolvedValueOnce({
      exists: true,
      data: () => mockStats
    });

    const startTime = performance.now();
    await getOrderStatistics();
    const endTime = performance.now();
    const optimizedTime = endTime - startTime;

    // Reset mocks for original implementation simulation
    jest.clearAllMocks();

    // Mock large number of orders (slow path)
    const mockOrders = Array(1000).fill().map((_, index) => ({
      status: index % 4 === 0 ? 'processing' : 
              index % 4 === 1 ? 'shipped' : 
              index % 4 === 2 ? 'delivered' : 'cancelled',
      total: Math.floor(Math.random() * 1000)
    }));

    mockGetDocs.mockResolvedValueOnce({
      forEach: (callback) => {
        mockOrders.forEach(order => {
          callback({ data: () => order });
        });
      }
    });

    mockSetDoc.mockResolvedValueOnce();

    const originalStartTime = performance.now();
    await calculateOrderStatistics(); // Simulate original implementation
    const originalEndTime = performance.now();
    const originalTime = originalEndTime - originalStartTime;

    console.log(`Optimized time: ${optimizedTime.toFixed(2)}ms`);
    console.log(`Original time: ${originalTime.toFixed(2)}ms`);
    console.log(`Performance improvement: ${(originalTime / optimizedTime).toFixed(2)}x faster`);

    // The optimized version should be significantly faster
    expect(optimizedTime).toBeLessThan(originalTime);
  });
});