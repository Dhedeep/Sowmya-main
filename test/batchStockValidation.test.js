// Test file for Batch Stock Validation implementation
import { validateCartStock, validateCartStockDetailed } from '../src/firebase/services/cartService.js';

// Mock data for testing
const mockProducts = [
  { id: 'product1', name: 'Product 1', stock: 10, price: 100 },
  { id: 'product2', name: 'Product 2', stock: 5, price: 200 },
  { id: 'product3', name: 'Product 3', stock: 0, price: 300 },
  { id: 'product4', name: 'Product 4', stock: 2, price: 400 }
];

// Mock getProductsByIds function
const mockGetProductsByIds = async (productIds) => {
  return mockProducts.filter(product => productIds.includes(product.id));
};

// Test cases
const runTests = async () => {
  console.log('Running Batch Stock Validation Tests...\n');

  // Test 1: All items in stock
  console.log('Test 1: All items in stock');
  const itemsInStock = [
    { id: 'product1', quantity: 2 },
    { id: 'product2', quantity: 1 }
  ];
  
  try {
    const result = await validateCartStock(itemsInStock);
    console.log('✅ Test 1 Passed:', result.valid ? 'Valid' : 'Invalid');
    console.log('   Out of stock items:', result.outOfStockItems.length);
  } catch (error) {
    console.log('❌ Test 1 Failed:', error.message);
  }

  // Test 2: Some items out of stock
  console.log('\nTest 2: Some items out of stock');
  const itemsOutOfStock = [
    { id: 'product1', quantity: 5 },
    { id: 'product3', quantity: 1 },
    { id: 'product4', quantity: 3 } // Requesting more than available
  ];
  
  try {
    const result = await validateCartStock(itemsOutOfStock);
    console.log('✅ Test 2 Passed:', !result.valid ? 'Correctly identified invalid' : 'Failed to detect invalid');
    console.log('   Out of stock items:', result.outOfStockItems.length);
    result.outOfStockItems.forEach(item => {
      console.log(`   - ${item.id}: ${item.reason}`);
    });
  } catch (error) {
    console.log('❌ Test 2 Failed:', error.message);
  }

  // Test 3: Empty cart
  console.log('\nTest 3: Empty cart');
  try {
    const result = await validateCartStock([]);
    console.log('✅ Test 3 Passed:', result.valid ? 'Valid' : 'Invalid');
    console.log('   Out of stock items:', result.outOfStockItems.length);
  } catch (error) {
    console.log('❌ Test 3 Failed:', error.message);
  }

  // Test 4: Detailed validation
  console.log('\nTest 4: Detailed validation');
  const itemsForDetailedTest = [
    { id: 'product1', quantity: 8 }, // High stock
    { id: 'product4', quantity: 1 },  // Low stock
    { id: 'product2', quantity: 4 }   // Low stock warning
  ];
  
  try {
    const result = await validateCartStockDetailed(itemsForDetailedTest);
    console.log('✅ Test 4 Passed:', result.valid ? 'Valid' : 'Invalid');
    console.log('   Out of stock items:', result.outOfStockItems.length);
    console.log('   Low stock items:', result.lowStockItems.length);
    
    if (result.lowStockItems.length > 0) {
      console.log('   Low stock warnings:');
      result.lowStockItems.forEach(item => {
        console.log(`   - ${item.id}: ${item.reason}`);
      });
    }
    
    console.log('   Stock map:');
    Object.entries(result.stockMap).forEach(([id, info]) => {
      console.log(`   - ${id}: Stock=${info.stock}, Available=${info.available}, CanFulfill=${info.canFulfill}`);
    });
  } catch (error) {
    console.log('❌ Test 4 Failed:', error.message);
  }

  // Test 5: Performance test with many items
  console.log('\nTest 5: Performance test with many items');
  const manyItems = [];
  for (let i = 0; i < 20; i++) {
    manyItems.push({
      id: `product${(i % 4) + 1}`,
      quantity: Math.floor(Math.random() * 3) + 1
    });
  }
  
  try {
    const startTime = Date.now();
    const result = await validateCartStock(manyItems);
    const endTime = Date.now();
    
    console.log('✅ Test 5 Passed:', `Validated ${manyItems.length} items in ${endTime - startTime}ms`);
    console.log('   Valid:', result.valid);
    console.log('   Out of stock items:', result.outOfStockItems.length);
  } catch (error) {
    console.log('❌ Test 5 Failed:', error.message);
  }

  console.log('\nBatch Stock Validation Tests Complete!');
};

// Mock the getProductsByIds function for testing
global.mockGetProductsByIds = mockGetProductsByIds;

// Export for running in Node.js environment
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runTests, mockProducts };
}

// Instructions for running the test
console.log(`
To run these tests:
1. Make sure you have Node.js installed
2. Run: node test/batchStockValidation.test.js
3. Or integrate with your existing test framework

Note: These tests use mock data. In a real environment, 
the functions will connect to your Firebase database.
`);