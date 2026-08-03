/**
 * Guest Cart Service
 * Handles cart operations for non-authenticated users using localStorage
 */

const GUEST_CART_KEY = 'guestCart';

/**
 * Get guest cart from localStorage
 * @returns {Array} - Array of cart items
 */
export const getGuestCart = () => {
  try {
    const cartData = localStorage.getItem(GUEST_CART_KEY);
    if (!cartData) return [];

    const cart = JSON.parse(cartData);
    if (!Array.isArray(cart)) return [];

    // Ensure all items have required fields with proper types
    return cart.map(item => ({
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
  } catch (error) {
    console.error('Error getting guest cart:', error);
    // Clear corrupted data
    localStorage.removeItem(GUEST_CART_KEY);
    return [];
  }
};

/**
 * Save guest cart to localStorage
 * @param {Array} items - Array of cart items
 * @returns {boolean} - Success status
 */
export const saveGuestCart = (items) => {
  try {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
    return true;
  } catch (error) {
    console.error('Error saving guest cart:', error);
    return false;
  }
};

/**
 * Add item to guest cart
 * @param {Object} item - Item to add
 * @returns {Array} - Updated cart items
 */
export const addToGuestCart = (item) => {
  try {
    if (!item || !item.id) {
      throw new Error('Valid item with ID is required');
    }

    const cart = getGuestCart();

    // Check if product is in stock (bypass for pre-orders)
    const stock = parseInt(item.stock) || 0;
    const isPreOrderProduct = item.isPreOrder || item.preOrder || 
      /pre.?order/i.test(item.categoryName || '') || 
      /pre.?order/i.test(item.subcategoryName || '') ||
      /pre.?order/i.test(item.category || '');

    if (stock <= 0 && !isPreOrderProduct) {
      throw new Error('This product is out of stock');
    }

    // Check if item already exists in cart (considering size and color variants)
    const existingItemIndex = cart.findIndex(cartItem =>
      cartItem.id === item.id &&
      (cartItem.selectedSize || '') === (item.selectedSize || '') &&
      (cartItem.selectedColor || '') === (item.selectedColor || '')
    );

    // Normalize item data
    const normalizedItem = {
      id: item.id,
      name: item.name || 'Unknown Product',
      price: parseFloat(item.price) || 0,
      discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice) : null,
      image: item.image || item.images?.[0],
      quantity: parseInt(item.quantity) || 1,
      selectedSize: item.selectedSize || null,
      selectedColor: item.selectedColor || null,
      stock: stock,
      isPreOrder: isPreOrderProduct, // Ensure this flag is carried over
      sizes: Array.isArray(item.sizes) ? item.sizes : [],
      colors: Array.isArray(item.colors) ? item.colors : []
    };

    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      const newQuantity = cart[existingItemIndex].quantity + normalizedItem.quantity;

      // Check if adding one more would exceed stock (bypass for pre-orders)
      if (newQuantity > stock && !isPreOrderProduct) {
        throw new Error(`Only ${stock} items available in stock`);
      }

      cart[existingItemIndex] = {
        ...cart[existingItemIndex],
        quantity: newQuantity
      };
    } else {
      // Add new item
      cart.push(normalizedItem);
    }

    saveGuestCart(cart);
    return cart;
  } catch (error) {
    console.error('Error adding item to guest cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity in guest cart
 * @param {string} itemId - ID of the item
 * @param {number} quantity - New quantity
 * @param {string} selectedSize - Selected size (optional)
 * @param {string} selectedColor - Selected color (optional)
 * @returns {Array} - Updated cart items
 */
export const updateGuestCartItemQuantity = (itemId, quantity, selectedSize, selectedColor) => {
  try {
    if (!itemId) {
      throw new Error('Item ID is required');
    }

    const cart = getGuestCart();
    const itemIndex = cart.findIndex(item =>
      item.id === itemId &&
      (item.selectedSize || '') === (selectedSize || '') &&
      (item.selectedColor || '') === (selectedColor || '')
    );

    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    const newQuantity = parseInt(quantity) || 0;

    if (newQuantity <= 0) {
      // Remove item if quantity is 0 or less
      cart.splice(itemIndex, 1);
    } else {
      // Check stock before updating
      const stock = parseInt(cart[itemIndex].stock) || 0;
      if (newQuantity > stock) {
        throw new Error(`Only ${stock} items available in stock`);
      }

      // Update quantity
      cart[itemIndex] = {
        ...cart[itemIndex],
        quantity: newQuantity
      };
    }

    saveGuestCart(cart);
    return cart;
  } catch (error) {
    console.error('Error updating guest cart item quantity:', error);
    throw error;
  }
};

/**
 * Remove item from guest cart
 * @param {string} itemId - ID of the item to remove
 * @param {string} selectedSize - Selected size (optional)
 * @param {string} selectedColor - Selected color (optional)
 * @returns {Array} - Updated cart items
 */
export const removeFromGuestCart = (itemId, selectedSize, selectedColor) => {
  try {
    const cart = getGuestCart();
    const updatedItems = cart.filter(item =>
      !(item.id === itemId &&
        (item.selectedSize || '') === (selectedSize || '') &&
        (item.selectedColor || '') === (selectedColor || ''))
    );

    saveGuestCart(updatedItems);
    return updatedItems;
  } catch (error) {
    console.error('Error removing item from guest cart:', error);
    throw error;
  }
};

/**
 * Clear guest cart
 * @returns {boolean} - Success status
 */
export const clearGuestCart = () => {
  try {
    localStorage.removeItem(GUEST_CART_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing guest cart:', error);
    return false;
  }
};

/**
 * Migrate guest cart to user cart after login
 * @param {string} userId - User ID
 * @param {Function} addToUserCart - Function to add items to user cart in Firebase
 * @returns {Promise<boolean>} - Success status
 */
export const migrateGuestCartToUserCart = async (userId, addToUserCart) => {
  try {
    const guestCart = getGuestCart();

    if (guestCart.length === 0) {
      return true; // Nothing to migrate
    }

    // Add each item from guest cart to user cart
    for (const item of guestCart) {
      try {
        await addToUserCart(userId, item);
      } catch (error) {
        console.error('Error migrating item to user cart:', error);
        // Continue with other items even if one fails
      }
    }

    // Clear guest cart after successful migration
    clearGuestCart();
    return true;
  } catch (error) {
    console.error('Error migrating guest cart to user cart:', error);
    return false;
  }
};

/**
 * Get cart item count for guest cart
 * @returns {number} - Total number of items in cart
 */
export const getGuestCartItemCount = () => {
  try {
    const cart = getGuestCart();
    return cart.reduce((count, item) => count + (item.quantity || 1), 0);
  } catch (error) {
    console.error('Error getting guest cart item count:', error);
    return 0;
  }
};

/**
 * Get cart total for guest cart
 * @returns {number} - Total price of items in cart
 */
export const getGuestCartTotal = () => {
  try {
    const cart = getGuestCart();
    return cart.reduce((total, item) => {
      const price = item.discountedPrice || item.price || 0;
      return total + (price * (item.quantity || 1));
    }, 0);
  } catch (error) {
    console.error('Error getting guest cart total:', error);
    return 0;
  }
};

/**
 * Check if product is in guest cart
 * @param {string} productId - Product ID
 * @param {string} selectedSize - Selected size (optional)
 * @param {string} selectedColor - Selected color (optional)
 * @returns {boolean} - Whether product is in cart
 */
export const isProductInGuestCart = (productId, selectedSize, selectedColor) => {
  try {
    const cart = getGuestCart();
    return cart.some(item =>
      item.id === productId &&
      (item.selectedSize || '') === (selectedSize || '') &&
      (item.selectedColor || '') === (selectedColor || '')
    );
  } catch (error) {
    console.error('Error checking if product is in guest cart:', error);
    return false;
  }
};

/**
 * Get cart item quantity for guest cart
 * @param {string} productId - Product ID
 * @param {string} selectedSize - Selected size (optional)
 * @param {string} selectedColor - Selected color (optional)
 * @returns {number} - Quantity of item in cart
 */
export const getGuestCartItemQuantity = (productId, selectedSize, selectedColor) => {
  try {
    const cart = getGuestCart();
    const item = cart.find(item =>
      item.id === productId &&
      (item.selectedSize || '') === (selectedSize || '') &&
      (item.selectedColor || '') === (selectedColor || '')
    );
    return item?.quantity || 0;
  } catch (error) {
    console.error('Error getting guest cart item quantity:', error);
    return 0;
  }
};

// ============================================================
// Guest Checkout Data Persistence
// Stores checkout form data (address, notes, coupon) in localStorage
// so it survives the login redirect flow
// ============================================================

const GUEST_CHECKOUT_DATA_KEY = 'guest_checkout_data';

/**
 * Save guest checkout data to localStorage
 * Called when guest user enters checkout info before logging in
 * @param {Object} data - Checkout form data
 * @returns {boolean} - Success status
 */
export const saveGuestCheckoutData = (data) => {
  try {
    if (!data || typeof data !== 'object') return false;

    // Only store serializable, non-empty fields
    const safeData = {};
    if (data.shippingAddress && typeof data.shippingAddress === 'object') {
      safeData.shippingAddress = { ...data.shippingAddress };
    }
    if (data.orderNotes && typeof data.orderNotes === 'string') {
      safeData.orderNotes = data.orderNotes;
    }
    if (data.promoCode && typeof data.promoCode === 'string') {
      safeData.promoCode = data.promoCode;
    }
    safeData.savedAt = Date.now();

    localStorage.setItem(GUEST_CHECKOUT_DATA_KEY, JSON.stringify(safeData));
    return true;
  } catch (error) {
    console.error('Error saving guest checkout data:', error);
    return false;
  }
};

/**
 * Get guest checkout data from localStorage
 * Called after login to restore checkout form state
 * @returns {Object|null} - Checkout data or null
 */
export const getGuestCheckoutData = () => {
  try {
    const raw = localStorage.getItem(GUEST_CHECKOUT_DATA_KEY);
    if (!raw) return null;

    const data = JSON.parse(raw);
    if (!data || typeof data !== 'object') return null;

    // Discard data older than 24 hours to prevent stale restoration
    if (data.savedAt && Date.now() - data.savedAt > 24 * 60 * 60 * 1000) {
      clearGuestCheckoutData();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error reading guest checkout data:', error);
    clearGuestCheckoutData();
    return null;
  }
};

/**
 * Clear guest checkout data from localStorage
 * Called after successful restoration or order placement
 * @returns {boolean} - Success status
 */
export const clearGuestCheckoutData = () => {
  try {
    localStorage.removeItem(GUEST_CHECKOUT_DATA_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing guest checkout data:', error);
    return false;
  }
};