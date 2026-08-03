const GUEST_WISHLIST_KEY = 'guestWishlist';

/**
 * Get guest wishlist from localStorage
 */
export const getGuestWishlist = () => {
  try {
    const wishlist = localStorage.getItem(GUEST_WISHLIST_KEY);
    return wishlist ? JSON.parse(wishlist) : [];
  } catch (error) {
    console.error('Error getting guest wishlist:', error);
    return [];
  }
};

/**
 * Save guest wishlist to localStorage
 */
export const saveGuestWishlist = (wishlist) => {
  try {
    localStorage.setItem(GUEST_WISHLIST_KEY, JSON.stringify(wishlist));
    return true;
  } catch (error) {
    console.error('Error saving guest wishlist:', error);
    return false;
  }
};

/**
 * Add item to guest wishlist
 */
export const addToGuestWishlist = (item) => {
  try {
    const wishlist = getGuestWishlist();
    const exists = wishlist.some(wishlistItem => wishlistItem.id === item.id);
    
    if (!exists) {
      wishlist.push(item);
      saveGuestWishlist(wishlist);
      return { added: true, item };
    }
    
    return { exists: true, item };
  } catch (error) {
    console.error('Error adding to guest wishlist:', error);
    throw error;
  }
};

/**
 * Remove item from guest wishlist
 */
export const removeFromGuestWishlist = (itemId) => {
  try {
    const wishlist = getGuestWishlist();
    const updatedWishlist = wishlist.filter(item => item.id !== itemId);
    saveGuestWishlist(updatedWishlist);
    return { removed: true, itemId };
  } catch (error) {
    console.error('Error removing from guest wishlist:', error);
    throw error;
  }
};

/**
 * Toggle item in guest wishlist
 */
export const toggleGuestWishlist = (item) => {
  try {
    const wishlist = getGuestWishlist();
    const exists = wishlist.some(wishlistItem => wishlistItem.id === item.id);
    
    if (exists) {
      return removeFromGuestWishlist(item.id);
    } else {
      return addToGuestWishlist(item);
    }
  } catch (error) {
    console.error('Error toggling guest wishlist item:', error);
    throw error;
  }
};

/**
 * Check if item is in guest wishlist
 */
export const isItemInGuestWishlist = (itemId) => {
  try {
    const wishlist = getGuestWishlist();
    return wishlist.some(item => item.id === itemId);
  } catch (error) {
    console.error('Error checking guest wishlist:', error);
    return false;
  }
};

/**
 * Clear guest wishlist
 */
export const clearGuestWishlist = () => {
  try {
    localStorage.removeItem(GUEST_WISHLIST_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing guest wishlist:', error);
    return false;
  }
};

/**
 * Get guest wishlist item count
 */
export const getGuestWishlistCount = () => {
  try {
    const wishlist = getGuestWishlist();
    return wishlist.length;
  } catch (error) {
    console.error('Error getting guest wishlist count:', error);
    return 0;
  }
};