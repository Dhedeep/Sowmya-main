import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Trash2, Eye } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import { useCart } from '../src/hooks/useCart';
import { getUserWishlist, removeFromUserWishlist } from '../src/firebase/services/cartService';

const WishlistPage = ({ navigateTo, toggleWishlist, wishlist, viewProduct }) => {
  const { user } = useAdmin();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (user) {
        try {
          const userWishlist = await getUserWishlist(user.uid);
          setWishlistItems(userWishlist);
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          setLoading(false);
        }
      } else {
        // For guest users, use the wishlist from props
        setWishlistItems(wishlist);
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user, wishlist]);

  const handleRemoveFromWishlist = async (item) => {
    try {
      if (user) {
        await removeFromUserWishlist(user.uid, item.id);
        setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
      } else {
        // For guest users, update local state
        toggleWishlist(item);
        setWishlistItems(prev => prev.filter(wishlistItem => wishlistItem.id !== item.id));
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      // Use the unified cart hook
      await addToCart(product);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Error adding to cart');
    }
  };


  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-brand-primary hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2 dark:text-white">My Wishlist</h1>
        <p className="text-gray-600 dark:text-gray-400">
          {wishlistItems.length === 0
            ? 'Your wishlist is empty. Start adding items you love!'
            : `You have ${wishlistItems.length} item${wishlistItems.length !== 1 ? 's' : ''} in your wishlist`
          }
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <Heart size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Browse our products and add items you love to your wishlist
          </p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 mx-auto"
          >
            <ShoppingCart size={18} />
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlistItems.map((item) => (
            <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden group">
              <div className="relative">
                <img
                  src={item.images[0]}
                  alt={item.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => viewProduct(item)}
                />
                <button
                  onClick={() => handleRemoveFromWishlist(item)}
                  className="absolute top-2 right-2 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} className="text-red-500" />
                </button>
              </div>

              <div className="p-4">
                <h3
                  className="font-semibold text-gray-900 dark:text-white mb-2 cursor-pointer hover:text-brand-primary"
                  onClick={() => viewProduct(item)}
                >
                  {item.name}
                </h3>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">₹{item.price}</span>
                  {item.originalPrice && (
                    <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                      ₹{item.originalPrice}
                    </span>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => viewProduct(item)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm dark:text-gray-300"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    onClick={() => handleAddToCart(item)}
                    className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors text-sm"
                  >
                    <ShoppingCart size={16} />
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;