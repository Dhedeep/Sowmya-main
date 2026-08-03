import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  getUserWishlist, 
  addToUserWishlist, 
  removeFromUserWishlist, 
  toggleUserWishlist 
} from '../firebase/services/cartService';
import { 
  getGuestWishlist, 
  addToGuestWishlist, 
  removeFromGuestWishlist, 
  toggleGuestWishlist,
  saveGuestWishlist,
  clearGuestWishlist
} from '../firebase/services/guestWishlistService';

export const useWishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // Load wishlist based on authentication state
  useEffect(() => {
    const loadWishlist = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user) {
          // Logged-in user: load from Firebase
          const userWishlist = await getUserWishlist(user.uid);
          setWishlistItems(userWishlist);
        } else {
          // Guest user: load from localStorage
          const guestWishlist = getGuestWishlist();
          setWishlistItems(guestWishlist);
        }
      } catch (err) {
        console.error('Error loading wishlist:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadWishlist();
  }, [user]);

  // Add item to wishlist
  const addToWishlist = useCallback(async (item) => {
    try {
      if (user) {
        // Logged-in user: add to Firebase
        await addToUserWishlist(user.uid, item);
        setWishlistItems(prev => {
          const exists = prev.some(wishlistItem => wishlistItem.id === item.id);
          if (!exists) {
            return [...prev, item];
          }
          return prev;
        });
      } else {
        // Guest user: add to localStorage
        const result = addToGuestWishlist(item);
        if (result.added) {
          setWishlistItems(prev => [...prev, item]);
        }
      }
      return { success: true, added: true };
    } catch (err) {
      console.error('Error adding to wishlist:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Remove item from wishlist
  const removeFromWishlist = useCallback(async (itemId) => {
    try {
      if (user) {
        // Logged-in user: remove from Firebase
        await removeFromUserWishlist(user.uid, itemId);
      } else {
        // Guest user: remove from localStorage
        removeFromGuestWishlist(itemId);
      }
      setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      return { success: true, removed: true };
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Toggle item in wishlist
  const toggleWishlist = useCallback(async (item) => {
    try {
      if (user) {
        // Logged-in user: toggle in Firebase
        const result = await toggleUserWishlist(user.uid, item);
        
        if (result.added) {
          setWishlistItems(prev => {
            const exists = prev.some(wishlistItem => wishlistItem.id === item.id);
            if (!exists) {
              return [...prev, item];
            }
            return prev;
          });
        } else if (result.removed) {
          setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
        }
        
        return result;
      } else {
        // Guest user: toggle in localStorage
        const result = toggleGuestWishlist(item);
        
        if (result.added) {
          setWishlistItems(prev => [...prev, item]);
        } else if (result.removed) {
          setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
        }
        
        return result;
      }
    } catch (err) {
      console.error('Error toggling wishlist item:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Check if item is in wishlist
  const isItemInWishlist = useCallback((itemId) => {
    return wishlistItems.some(item => item.id === itemId);
  }, [wishlistItems]);

  // Get wishlist item count
  const getWishlistItemCount = useCallback(() => {
    return wishlistItems.length;
  }, [wishlistItems]);

  // Clear wishlist
  const clearWishlist = useCallback(async () => {
    try {
      if (user) {
        // Logged-in user: clear in Firebase
        await saveUserWishlist(user.uid, []);
      } else {
        // Guest user: clear in localStorage
        clearGuestWishlist();
      }
      setWishlistItems([]);
      return { success: true };
    } catch (err) {
      console.error('Error clearing wishlist:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  // Sync guest wishlist to user wishlist after login
  const syncGuestWishlistToUser = useCallback(async () => {
    if (!user) return { success: false, error: 'User not logged in' };
    
    try {
      const guestWishlist = getGuestWishlist();
      
      if (guestWishlist.length > 0) {
        // Add all guest wishlist items to user wishlist
        for (const item of guestWishlist) {
          await addToUserWishlist(user.uid, item);
        }
        
        // Clear guest wishlist after successful sync
        clearGuestWishlist();
        
        // Reload user wishlist
        const userWishlist = await getUserWishlist(user.uid);
        setWishlistItems(userWishlist);
        
        return { 
          success: true, 
          syncedItems: guestWishlist.length,
          message: `Synced ${guestWishlist.length} items from guest wishlist`
        };
      }
      
      return { success: true, syncedItems: 0 };
    } catch (err) {
      console.error('Error syncing guest wishlist:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [user]);

  return {
    wishlistItems,
    loading,
    error,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isItemInWishlist,
    getWishlistItemCount,
    clearWishlist,
    syncGuestWishlistToUser
  };
};