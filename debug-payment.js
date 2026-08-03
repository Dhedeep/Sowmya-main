// Debug script to test payment flow
// Run this in the browser console when on the checkout page

// Import the services (these will be available in the browser console)
// import { createOrder, updateOrderStatus } from './src/firebase/services/orderService.js';
// import { initiatePayment } from './src/firebase/services/paymentService.js';

// Test data for payment
const testOrderData = {
  items: [
    {
      id: 'test-product-1',
      name: 'Test Product',
      price: 100,
      quantity: 2
    }
  ],
  subtotal: 200,
  shipping: 40,
  tax: 20,
  total: 260,
  customerName: 'Test User',
  customerEmail: 'test@example.com',
  customerPhone: '9876543210',
  userId: 'test-user-id'
};

// Function to test order creation
async function testOrderCreation() {
  console.log('=== Testing Order Creation ===');
  try {
    const { createOrder } = window.firebaseServices.orderService;
    const order = await createOrder({
      ...testOrderData,
      status: 'pending',
      paymentStatus: 'pending'
    });
    console.log('Order created successfully:', order);
    return order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
}

// Function to test order status update
async function testOrderStatusUpdate(orderId) {
  console.log('=== Testing Order Status Update ===');
  try {
    const { updateOrderStatus } = window.firebaseServices.orderService;
    const updatedOrder = await updateOrderStatus(orderId, 'processing', {
      paymentStatus: 'paid',
      paymentId: 'test_payment_id',
      orderId: 'test_order_id',
      signature: 'test_signature',
      paidAt: new Date()
    });
    console.log('Order updated successfully:', updatedOrder);
    return updatedOrder;
  } catch (error) {
    console.error('Error updating order:', error);
    return null;
  }
}

// Function to test the full payment flow
async function testFullPaymentFlow() {
  console.log('=== Testing Full Payment Flow ===');
  try {
    // Test order creation
    const order = await testOrderCreation();
    if (!order) {
      console.error('Failed to create order');
      return;
    }
    
    // Test order status update
    const updatedOrder = await testOrderStatusUpdate(order.id);
    if (!updatedOrder) {
      console.error('Failed to update order');
      return;
    }
    
    console.log('Full payment flow test completed successfully');
  } catch (error) {
    console.error('Error in full payment flow test:', error);
  }
}

// Export functions for use in browser console
window.testPayment = {
  testOrderCreation,
  testOrderStatusUpdate,
  testFullPaymentFlow,
  testOrderData
};

console.log('Payment debug functions loaded. Use window.testPayment to access them.');
console.log('Available functions:');
console.log('- window.testPayment.testOrderCreation()');
console.log('- window.testPayment.testOrderStatusUpdate(orderId)');
console.log('- window.testPayment.testFullPaymentFlow()');