import { doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../config';
import { getProductById, getProductsByIds, validatePreOrderStock, checkCustomerPreOrderLimit } from './productService';

const CART_COLLECTION = 'carts';
const WISHLIST_COLLECTION = 'wishlists';

// Get user's cart
export const getUserCart = async (userId) => {
  try {
    if (!userId) {
      return [];
    }
    
    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartDoc = await getDoc(cartRef);
    
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      const items = Array.isArray(data.items) ? data.items : [];
      
      // Ensure all items have required fields with proper types
      return items.map(item => ({
        id: item.id,
        name: item.name || 'Unknown Product',
        price: parseFloat(item.price) || 0,
        discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice) : null,
        image:
  item.image ||
  (
    Array.isArray(item.colors) &&
    Array.isArray(item.images)
      ? item.images[
          item.colors.findIndex(
            color =>
              String(color).trim().toLowerCase() ===
              String(item.selectedColor || '').trim().toLowerCase()
          )
        ]
      : null
  ) ||
  item.images?.[0],
        quantity: parseInt(item.quantity) || 1,
        selectedSize: item.selectedSize || null,
        selectedColor: item.selectedColor || null,
        stock: parseInt(item.stock) || 0,
        sizes: Array.isArray(item.sizes) ? item.sizes : [],
        colors: Array.isArray(item.colors) ? item.colors : [],
        // Include pre-order related fields
        isPreOrder: item.isPreOrder || false,
        expectedShippingDate: item.expectedShippingDate || null,
        preOrderMessage: item.preOrderMessage || ''
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching user cart:', error);
    return [];
  }
};

// Save user's cart
export const saveUserCart = async (userId, items) => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    await setDoc(cartRef, {
      userId,
      items,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user cart:', error);
    throw error;
  }
};

// Add item to cart
export const addToUserCart = async (userId, item) => {
  try {
    if (!userId || !item || !item.id) {
      throw new Error('User ID and valid item are required');
    }

    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartDoc = await getDoc(cartRef);
    
    let items = [];
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      items = Array.isArray(data.items) ? data.items : [];
    }
    
    // Check if item already exists in cart (considering size and color variants)
    const existingItemIndex = items.findIndex(cartItem =>
      cartItem.id === item.id &&
      (cartItem.selectedSize || '') === (item.selectedSize || '') &&
      (cartItem.selectedColor || '') === (item.selectedColor || '')
    );
    
    // Get product details to check if it's a pre-order
    const product = await getProductById(item.id);
    const isPreOrder = product?.isPreOrder || product?.preOrder || 
      /pre.?order/i.test(product?.categoryName || '') || 
      /pre.?order/i.test(product?.subcategoryName || '') ||
      /pre.?order/i.test(product?.category || '');
    
    // Prepare items for validation with proper price formatting
    let itemsToValidate = [{
      ...item,
      price: parseFloat(item.price) || 0,
      quantity: item.quantity || 1,
      isPreOrder
    }];
    
    if (existingItemIndex !== -1) {
      // If item exists, validate with the new total quantity
      const newQuantity = items[existingItemIndex].quantity + (item.quantity || 1);
      itemsToValidate[0].quantity = newQuantity;
    }
    
    // Validate stock using batch validation
    const { valid, outOfStockItems } = await validateCartStock(itemsToValidate);
    
    if (!valid) {
      const stockError = outOfStockItems[0];
      if (existingItemIndex !== -1) {
        throw new Error(`${stockError.reason} You already have ${items[existingItemIndex].quantity} in your cart.`);
      } else {
        throw new Error(stockError.reason);
      }
    }
    
    // Additional validation for pre-order items (Bypassed based on client request: no need for products in order to pay)
    /*
    if (isPreOrder) {
      // Validate pre-order stock
      const preOrderValidation = await validatePreOrderStock(item.id, itemsToValidate[0].quantity);
      if (!preOrderValidation.valid) {
        throw new Error(preOrderValidation.message);
      }
      
      // Check pre-order limit per customer
      const limitValidation = await checkCustomerPreOrderLimit(item.id, userId, itemsToValidate[0].quantity);
      if (!limitValidation.valid) {
        throw new Error(limitValidation.message);
      }
    }
    */
    
    // Update cart items with consistent data structure
    // Find the image that belongs to the selected color
const selectedColorIndex = Array.isArray(item.colors)
  ? item.colors.findIndex(
      color =>
        String(color).trim().toLowerCase() ===
        String(item.selectedColor || '').trim().toLowerCase()
    )
  : -1;

const selectedColorImage =
  selectedColorIndex >= 0 && Array.isArray(item.images)
    ? item.images[selectedColorIndex]
    : null;

// Use the selected color image first, then existing image, then first image as fallback
const cartImage =
  selectedColorImage ||
  item.image ||
  item.images?.[0];

const normalizedItem = {
  id: item.id,
  name: item.name,
  price: parseFloat(item.price) || 0,
  discountedPrice: item.discountedPrice ? parseFloat(item.discountedPrice) : null,
  image: cartImage,
  quantity: item.quantity || 1,
  selectedSize: item.selectedSize || null,
  selectedColor: item.selectedColor || null,
  stock: item.stock || 0,
  sizes: item.sizes || [],
  colors: item.colors || [],
      // Add pre-order related fields
      isPreOrder,
      expectedShippingDate: product?.expectedShippingDate || null,
      preOrderMessage: product?.preOrderMessage || ''
    };
    
    if (existingItemIndex !== -1) {
      // Update quantity if item exists
      items[existingItemIndex] = {
        ...items[existingItemIndex],
        quantity: itemsToValidate[0].quantity
      };
    } else {
      // Add new item
      items.push(normalizedItem);
    }
    
    // Update or create cart document
    if (cartDoc.exists()) {
      await updateDoc(cartRef, {
        items,
        updatedAt: new Date()
      });
    } else {
      await setDoc(cartRef, {
        userId,
        items,
        updatedAt: new Date()
      });
    }
    
    return items;
  } catch (error) {
    console.error('Error adding item to cart:', error);
    throw error;
  }
};

// Update cart item quantity
export const updateCartItemQuantity = async (userId, itemId, quantity, selectedSize, selectedColor) => {
  try {
    if (!userId || !itemId) {
      throw new Error('User ID and Item ID are required');
    }

    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartDoc = await getDoc(cartRef);
    
    let items = [];
    if (cartDoc.exists()) {
      const data = cartDoc.data();
      items = Array.isArray(data.items) ? data.items : [];
    }
    
    const itemIndex = items.findIndex(item =>
      item.id === itemId &&
      (item.selectedSize || '') === (selectedSize || '') &&
      (item.selectedColor || '') === (selectedColor || '')
    );
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }
    
    const cartItem = items[itemIndex];
    const isPreOrder = cartItem.isPreOrder || false;
    
    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      items.splice(itemIndex, 1);
    } else {
      // Get product details for validation
      const product = await getProductById(itemId);
      
      // For pre-order items, bypass validations based on client request
      if (isPreOrder) {
        // Bypassing pre-order stock and limit checks
      } else {
        // For regular items, validate regular stock
        const itemsToValidate = [{
          id: itemId,
          quantity,
          selectedSize,
          selectedColor,
          isPreOrder: false
        }];
        
        const { valid, outOfStockItems } = await validateCartStock(itemsToValidate);
        
        if (!valid) {
          const stockError = outOfStockItems[0];
          throw new Error(stockError.reason);
        }
      }
      
      // Update quantity and ensure price is properly formatted
      items[itemIndex] = {
        ...items[itemIndex],
        quantity: quantity,
        price: parseFloat(items[itemIndex].price) || 0,
        discountedPrice: items[itemIndex].discountedPrice ? parseFloat(items[itemIndex].discountedPrice) : null
      };
    }
    
    // Update or create cart document
    if (cartDoc.exists()) {
      await updateDoc(cartRef, {
        items,
        updatedAt: new Date()
      });
    } else {
      await setDoc(cartRef, {
        userId,
        items,
        updatedAt: new Date()
      });
    }
    
    return items;
  } catch (error) {
    console.error('Error updating cart item quantity:', error);
    throw error;
  }
};

// Remove item from cart
export const removeFromUserCart = async (userId, itemId, selectedSize, selectedColor) => {
  try {
    if (!userId || !itemId) {
      throw new Error('User ID and Item ID are required');
    }

    const cartRef = doc(db, CART_COLLECTION, userId);
    const cartDoc = await getDoc(cartRef);
    
    if (!cartDoc.exists()) {
      // If cart doesn't exist, return empty array
      return [];
    }
    
    const data = cartDoc.data();
    const items = Array.isArray(data.items) ? data.items : [];
    const updatedItems = items.filter(item =>
      !(item.id === itemId &&
        (item.selectedSize || '') === (selectedSize || '') &&
        (item.selectedColor || '') === (selectedColor || ''))
    );
    
    await updateDoc(cartRef, {
      items: updatedItems,
      updatedAt: new Date()
    });
    
    return updatedItems;
  } catch (error) {
    console.error('Error removing item from cart:', error);
    throw error;
  }
};

// Clear user's cart
export const clearUserCart = async (userId) => {
  try {
    const cartRef = doc(db, CART_COLLECTION, userId);
    await updateDoc(cartRef, {
      items: [],
      updatedAt: new Date()
    });
    return true;
  } catch (error) {
    console.error('Error clearing user cart:', error);
    throw error;
  }
};

// Get user's wishlist
export const getUserWishlist = async (userId) => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    const wishlistDoc = await getDoc(wishlistRef);
    
    if (wishlistDoc.exists()) {
      return wishlistDoc.data().items || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching user wishlist:', error);
    throw error;
  }
};

// Save user's wishlist
export const saveUserWishlist = async (userId, items) => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    await setDoc(wishlistRef, {
      userId,
      items,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('Error saving user wishlist:', error);
    throw error;
  }
};

// Add item to wishlist
export const addToUserWishlist = async (userId, item) => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    const wishlistDoc = await getDoc(wishlistRef);
    
    if (wishlistDoc.exists()) {
      // Update existing document
      await updateDoc(wishlistRef, {
        items: arrayUnion(item),
        updatedAt: new Date()
      });
    } else {
      // Create new document
      await setDoc(wishlistRef, {
        userId,
        items: [item],
        updatedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error adding item to wishlist:', error);
    throw error;
  }
};

// Remove item from wishlist
export const removeFromUserWishlist = async (userId, itemId) => {
  try {
    const wishlistRef = doc(db, WISHLIST_COLLECTION, userId);
    const wishlistDoc = await getDoc(wishlistRef);
    
    if (!wishlistDoc.exists()) {
      throw new Error('Wishlist not found');
    }
    
    const items = wishlistDoc.data().items || [];
    const itemToRemove = items.find(item => item.id === itemId);
    
    if (itemToRemove) {
      await updateDoc(wishlistRef, {
        items: arrayRemove(itemToRemove),
        updatedAt: new Date()
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error removing item from wishlist:', error);
    throw error;
  }
};

// Toggle item in wishlist
export const toggleUserWishlist = async (userId, item) => {
  try {
    const wishlist = await getUserWishlist(userId);
    const exists = wishlist.some(wishlistItem => wishlistItem.id === item.id);
    
    if (exists) {
      await removeFromUserWishlist(userId, item.id);
      return { removed: true, item };
    } else {
      await addToUserWishlist(userId, item);
      return { added: true, item };
    }
  } catch (error) {
    console.error('Error toggling wishlist item:', error);
    throw error;
  }
};
// Batch validate stock for multiple cart items
export const validateCartStock = async (items) => {
  try {
    if (!items || items.length === 0) {
      return { valid: true, outOfStockItems: [] };
    }

    // Extract unique product IDs
    const productIds = [...new Set(items.map(item => item.id))];
    
    // Fetch all products in a single batch
    const products = await getProductsByIds(productIds);
    
    // Create a map of product ID to product data
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
    
    // Validate stock for each item
    const outOfStockItems = [];
    
    for (const item of items) {
      const product = productMap[item.id];
      
      if (!product) {
        outOfStockItems.push({
          ...item,
          reason: 'Product not found'
        });
        continue;
      }
      
      // Skip stock validation for pre-order items
      if (item.isPreOrder || product.isPreOrder || product.preOrder ||
          /pre.?order/i.test(product.categoryName || '') || 
          /pre.?order/i.test(product.subcategoryName || '') ||
          /pre.?order/i.test(product.category || '')) {
        continue;
      }
      
      const currentStock = product.stock || 0;
      const requestedQuantity = item.quantity || 1;
      
      if (currentStock < requestedQuantity) {
        outOfStockItems.push({
          ...item,
          currentStock,
          requestedQuantity,
          reason: `Insufficient stock. Only ${currentStock} items available.`
        });
      }
    }
    
    return {
      valid: outOfStockItems.length === 0,
      outOfStockItems
    };
  } catch (error) {
    console.error('Error validating cart stock:', error);
    throw error;
  }
};

// Batch validate stock for multiple cart items with detailed results
export const validateCartStockDetailed = async (items) => {
  try {
    if (!items || items.length === 0) {
      return {
        valid: true,
        outOfStockItems: [],
        lowStockItems: [],
        stockMap: {}
      };
    }

    // Extract unique product IDs
    const productIds = [...new Set(items.map(item => item.id))];
    
    // Fetch all products in a single batch
    const products = await getProductsByIds(productIds);
    
    // Create a map of product ID to product data
    const productMap = products.reduce((acc, product) => {
      acc[product.id] = product;
      return acc;
    }, {});
    
    // Validate stock for each item
    const outOfStockItems = [];
    const lowStockItems = [];
    const stockMap = {};
    
    for (const item of items) {
      const product = productMap[item.id];
      
      if (!product) {
        outOfStockItems.push({
          ...item,
          reason: 'Product not found'
        });
        stockMap[item.id] = { available: false, stock: 0 };
        continue;
      }
      
      // Skip stock validation for pre-order items
      if (item.isPreOrder || product.isPreOrder || product.preOrder ||
          /pre.?order/i.test(product.categoryName || '') || 
          /pre.?order/i.test(product.subcategoryName || '') ||
          /pre.?order/i.test(product.category || '')) {
        stockMap[item.id] = {
          available: true,
          stock: product.preOrderStock || 0,
          canFulfill: true, // Always true for pre-orders now
          isPreOrder: true
        };
        continue;
      }
      
      const currentStock = product.stock || 0;
      const requestedQuantity = item.quantity || 1;
      
      stockMap[item.id] = {
        available: currentStock > 0,
        stock: currentStock,
        canFulfill: currentStock >= requestedQuantity,
        isPreOrder: false
      };
      
      if (currentStock < requestedQuantity) {
        outOfStockItems.push({
          ...item,
          currentStock,
          requestedQuantity,
          reason: `Insufficient stock. Only ${currentStock} items available.`
        });
      } else if (currentStock < requestedQuantity * 2) {
        // Flag items with low stock (less than 2x the requested quantity)
        lowStockItems.push({
          ...item,
          currentStock,
          requestedQuantity,
          reason: `Low stock warning. Only ${currentStock} items left.`
        });
      }
    }
    
    return {
      valid: outOfStockItems.length === 0,
      outOfStockItems,
      lowStockItems,
      stockMap
    };
  } catch (error) {
    console.error('Error validating cart stock in detail:', error);
    throw error;
  }
};