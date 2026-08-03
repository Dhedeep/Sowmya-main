/**
 * Utility functions for pre-order calculations and validations
 */

/**
 * Calculate shipping estimates for mixed carts (regular + pre-order items)
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} Shipping information and estimates
 */
export const calculateShippingEstimates = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      hasRegularItems: false,
      hasPreOrderItems: false,
      shippingInfo: '',
      regularItemsShipping: 'Not available',
      preOrderItemsShipping: 'Not available'
    };
  }

  const regularItems = cartItems.filter(item => !item.isPreOrder);
  const preOrderItems = cartItems.filter(item => item.isPreOrder);

  const hasRegularItems = regularItems.length > 0;
  const hasPreOrderItems = preOrderItems.length > 0;

  let shippingInfo = '';
  let regularItemsShipping = 'Not available';
  let preOrderItemsShipping = 'Not available';

  // Calculate shipping for regular items
  if (hasRegularItems) {
    regularItemsShipping = '2-3 business days';
  }

  // Calculate shipping for pre-order items
  if (hasPreOrderItems) {
    // Find the latest expected shipping date among all pre-order items
    const latestShippingDate = preOrderItems.reduce((latest, item) => {
      if (!item.expectedShippingDate) return latest;
      const itemDate = new Date(item.expectedShippingDate);
      return (!latest || itemDate > latest) ? itemDate : latest;
    }, null);

    if (latestShippingDate) {
      preOrderItemsShipping = `On or after ${latestShippingDate.toLocaleDateString()}`;
    } else {
      preOrderItemsShipping = 'Will be notified when available';
    }
  }

  // Determine overall shipping information
  if (hasRegularItems && hasPreOrderItems) {
    shippingInfo = `Regular items will ship within ${regularItemsShipping}. Pre-order items will ship ${preOrderItemsShipping}. Items may be shipped separately.`;
  } else if (hasRegularItems) {
    shippingInfo = `Items will ship within ${regularItemsShipping}.`;
  } else if (hasPreOrderItems) {
    shippingInfo = `Pre-order items will ship ${preOrderItemsShipping}.`;
  }

  return {
    hasRegularItems,
    hasPreOrderItems,
    shippingInfo,
    regularItemsShipping,
    preOrderItemsShipping,
    isMixedCart: hasRegularItems && hasPreOrderItems
  };
};

/**
 * Validate pre-order items in cart
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} Validation result
 */
export const validatePreOrderItems = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return { valid: true, errors: [] };
  }

  const preOrderItems = cartItems.filter(item => item.isPreOrder);
  const errors = [];

  // Check if pre-order items have expected shipping dates
  for (const item of preOrderItems) {
    if (!item.expectedShippingDate) {
      errors.push({
        itemId: item.id,
        itemName: item.name,
        message: 'Pre-order item is missing expected shipping date'
      });
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    preOrderItemsCount: preOrderItems.length,
    hasPreOrderItems: preOrderItems.length > 0
  };
};

/**
 * Format pre-order information for display
 * @param {Object} item - Cart item with pre-order information
 * @returns {Object} Formatted pre-order information
 */
export const formatPreOrderInfo = (item) => {
  if (!item || !item.isPreOrder) {
    return {
      isPreOrder: false,
      label: '',
      shippingInfo: '',
      message: ''
    };
  }

  let shippingInfo = '';
  if (item.expectedShippingDate) {
    shippingInfo = `Expected shipping: ${new Date(item.expectedShippingDate).toLocaleDateString()}`;
  }

  return {
    isPreOrder: true,
    label: 'Pre-order',
    shippingInfo,
    message: item.preOrderMessage || ''
  };
};

/**
 * Calculate subtotal for regular and pre-order items separately
 * @param {Array} cartItems - Array of cart items
 * @returns {Object} Subtotal breakdown
 */
export const calculateSubtotals = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return {
      regularSubtotal: 0,
      preOrderSubtotal: 0,
      totalSubtotal: 0
    };
  }

  const regularItems = cartItems.filter(item => !item.isPreOrder);
  const preOrderItems = cartItems.filter(item => item.isPreOrder);

  const regularSubtotal = regularItems.reduce((total, item) => {
    const price = parseFloat(item.discountedPrice || item.price) || 0;
    return total + (price * (item.quantity || 1));
  }, 0);

  const preOrderSubtotal = preOrderItems.reduce((total, item) => {
    const price = parseFloat(item.discountedPrice || item.price) || 0;
    return total + (price * (item.quantity || 1));
  }, 0);

  return {
    regularSubtotal,
    preOrderSubtotal,
    totalSubtotal: regularSubtotal + preOrderSubtotal
  };
};

/**
 * Get the earliest expected shipping date from pre-order items
 * @param {Array} cartItems - Array of cart items
 * @returns {Date|null} Earliest expected shipping date
 */
export const getEarliestShippingDate = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return null;
  }

  const preOrderItems = cartItems.filter(item => 
    item.isPreOrder && item.expectedShippingDate
  );

  if (preOrderItems.length === 0) {
    return null;
  }

  return preOrderItems.reduce((earliest, item) => {
    const itemDate = new Date(item.expectedShippingDate);
    return (!earliest || itemDate < earliest) ? itemDate : earliest;
  }, null);
};

/**
 * Check if cart has mixed item types (regular + pre-order)
 * @param {Array} cartItems - Array of cart items
 * @returns {boolean} True if cart has mixed item types
 */
export const hasMixedCartItems = (cartItems) => {
  if (!cartItems || cartItems.length === 0) {
    return false;
  }

  const hasRegularItems = cartItems.some(item => !item.isPreOrder);
  const hasPreOrderItems = cartItems.some(item => item.isPreOrder);

  return hasRegularItems && hasPreOrderItems;
};