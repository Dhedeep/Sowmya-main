import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { useRealtimeCart } from './useRealtimeCart';
import {
  getGuestCart,
  addToGuestCart,
  updateGuestCartItemQuantity,
  removeFromGuestCart,
  getGuestCartItemCount,
  getGuestCartTotal,
  isProductInGuestCart,
  getGuestCartItemQuantity,
  migrateGuestCartToUserCart,
  clearGuestCart
} from '../firebase/services/guestCartService';
import { addToUserCart, updateCartItemQuantity, removeFromUserCart } from '../firebase/services/cartService';
import { getProductById } from '../firebase/services/productService';

/**
 * Unified cart hook that works for both guest and authenticated users
 */
export const useCart = () => {
  const { user } = useAdmin();
  const [guestCart, setGuestCart] = useState([]);
  const [loading, setLoading] = useState(true);

  // Use real-time cart for authenticated users
  const {
    cartItems: userCart,
    loading: userCartLoading,
    error,
    refreshCart,
    getCartTotal: getUserCartTotal,
    getCartItemCount: getUserCartItemCount,
    isProductInCart: isProductInUserCart,
    getItemQuantity: getUserItemQuantity
  } = useRealtimeCart();

  // Load guest cart on component mount for non-authenticated users
  useEffect(() => {
    if (!user) {
      const cart = getGuestCart();
      setGuestCart(cart);
      setLoading(false);
    } else {
      // Set loading to true initially when user is authenticated
      setLoading(true);

      // Migrate guest cart to user cart when user logs in
      const migrateCart = async () => {
        try {
          const guestCart = getGuestCart();
          if (guestCart.length > 0) {
            console.log('Migrating guest cart to user cart:', guestCart);
            const migrationSuccess = await migrateGuestCartToUserCart(user.uid, addToUserCart);
            if (migrationSuccess) {
              console.log('Guest cart migration successful');
              // Wait a bit for migration to complete and then refresh
              setTimeout(() => {
                refreshCart();
              }, 1500);
            } else {
              console.error('Guest cart migration failed');
              // Still refresh to show user's existing cart
              refreshCart();
            }
          } else {
            // No guest cart to migrate, just ensure user cart is loaded
            console.log('No guest cart to migrate, checking user cart directly');
            refreshCart();
          }
        } catch (error) {
          console.error('Error migrating guest cart:', error);
          // Still try to refresh user cart even if migration fails
          refreshCart();
        }
      };

      // Add a small delay to ensure auth state is fully settled
      setTimeout(migrateCart, 500);
    }

    // Listen for cart updates from other instances in the same tab
    const handleCartUpdate = () => {
      console.log('useCart: Received cart update event, refreshing data...');
      if (!user) {
        const cart = getGuestCart();
        setGuestCart(cart);
      } else {
        refreshCart();
      }
    };

    window.addEventListener('cart-updated', handleCartUpdate);

    // Also listen for storage events (for sync across multiple tabs)
    const handleStorageChange = (e) => {
      if (e.key === 'guestCart') {
        console.log('useCart: guestCart changed in storage, updating state...');
        const cart = getGuestCart();
        setGuestCart(cart);
      }
    };
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [user, refreshCart]);

  // Update loading state based on userCartLoading
  useEffect(() => {
    if (user) {
      setLoading(userCartLoading);
    }
  }, [userCartLoading, user]);

  // Get current cart items based on authentication status
  const cartItems = user ? (Array.isArray(userCart) ? userCart : []) : (Array.isArray(guestCart) ? guestCart : []);

  // Debug logging for cart items
  useEffect(() => {
    console.log('useCart: Cart items updated:', {
      isAuthenticated: !!user,
      userEmail: user?.email,
      cartItems: cartItems,
      cartItemsLength: cartItems.length,
      userCart,
      userCartLength: userCart?.length || 0,
      guestCart,
      guestCartLength: guestCart?.length || 0
    });
  }, [cartItems, user, userCart, guestCart]);

  // Add item to cart
  const addToCart = useCallback(async (product) => {
    // Get product details to check if it's a pre-order
    try {
      const productDetails = await getProductById(product.id);
      const productWithPreOrderInfo = {
        ...product,
        isPreOrder: productDetails?.isPreOrder || false,
        expectedShippingDate: productDetails?.expectedShippingDate || null,
        preOrderMessage: productDetails?.preOrderMessage || ''
      };

      if (user) {
        // For authenticated users, add to Firebase cart
        try {
          const updatedCart = await addToUserCart(user.uid, productWithPreOrderInfo);
          window.dispatchEvent(new Event('cart-updated'));
          return updatedCart;
        } catch (error) {
          console.error('Error adding to user cart:', error);
          throw error;
        }
      } else {
        // For guest users, add to localStorage cart
        try {
          const updatedCart = addToGuestCart(productWithPreOrderInfo);
          setGuestCart(updatedCart);
          window.dispatchEvent(new Event('cart-updated'));
          return updatedCart;
        } catch (error) {
          console.error('Error adding to guest cart:', error);
          throw error;
        }
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      // Fallback to adding product without pre-order info
      if (user) {
        const updatedCart = await addToUserCart(user.uid, product);
        return updatedCart;
      } else {
        const updatedCart = addToGuestCart(product);
        setGuestCart(updatedCart);
        return updatedCart;
      }
    }
  }, [user]);

  // Update cart item quantity
  const updateQuantity = useCallback(async (productId, quantity, selectedSize, selectedColor) => {
    if (user) {
      // For authenticated users, update in Firebase
      try {
        const updatedCart = await updateCartItemQuantity(user.uid, productId, quantity, selectedSize, selectedColor);
        window.dispatchEvent(new Event('cart-updated'));
        return updatedCart;
      } catch (error) {
        console.error('Error updating user cart quantity:', error);
        throw error;
      }
    } else {
      // For guest users, update in localStorage
      try {
        const updatedCart = updateGuestCartItemQuantity(productId, quantity, selectedSize, selectedColor);
        setGuestCart(updatedCart);
        window.dispatchEvent(new Event('cart-updated'));
        return updatedCart;
      } catch (error) {
        console.error('Error updating guest cart quantity:', error);
        throw error;
      }
    }
  }, [user]);

  // Remove item from cart
  const removeFromCart = useCallback(async (productId, selectedSize, selectedColor) => {
    if (user) {
      // For authenticated users, remove from Firebase
      try {
        const updatedCart = await removeFromUserCart(user.uid, productId, selectedSize, selectedColor);
        window.dispatchEvent(new Event('cart-updated'));
        return updatedCart;
      } catch (error) {
        console.error('Error removing from user cart:', error);
        throw error;
      }
    } else {
      // For guest users, remove from localStorage
      try {
        const updatedCart = removeFromGuestCart(productId, selectedSize, selectedColor);
        setGuestCart(updatedCart);
        window.dispatchEvent(new Event('cart-updated'));
        return updatedCart;
      } catch (error) {
        console.error('Error removing from guest cart:', error);
        throw error;
      }
    }
  }, [user]);

  // Get cart total
  const getCartTotal = useCallback(() => {
    if (user) {
      return getUserCartTotal();
    } else {
      return getGuestCartTotal();
    }
  }, [user, getUserCartTotal, guestCart]);

  // Get cart item count
  const getCartItemCount = useCallback(() => {
    if (user) {
      return getUserCartItemCount();
    } else {
      return getGuestCartItemCount();
    }
  }, [user, getUserCartItemCount, guestCart]);

  // Check if product is in cart
  const isProductInCart = useCallback((productId, selectedSize, selectedColor) => {
    if (user) {
      return isProductInUserCart(productId, selectedSize, selectedColor);
    } else {
      return isProductInGuestCart(productId, selectedSize, selectedColor);
    }
  }, [user, isProductInUserCart, guestCart]);

  // Get cart item quantity
  const getItemQuantity = useCallback((productId, selectedSize, selectedColor) => {
    if (user) {
      return getUserItemQuantity(productId, selectedSize, selectedColor);
    } else {
      return getGuestCartItemQuantity(productId, selectedSize, selectedColor);
    }
  }, [user, getUserItemQuantity, guestCart]);

  // Refresh cart (only applicable for authenticated users)
  const refreshCartData = useCallback(() => {
    if (user) {
      refreshCart();
    } else {
      // For guest users, reload from localStorage
      const cart = getGuestCart();
      setGuestCart(cart);
    }
  }, [user, refreshCart]);

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    getCartItemCount,
    isProductInCart,
    getItemQuantity,
    refreshCart: refreshCartData
  };
};