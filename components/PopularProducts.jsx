import React, { useContext, useState } from 'react';
import ProductCard from './ProductCard';
import { ThemeContext } from '../App';
import { ArrowRight } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import { useCart } from '../src/hooks/useCart';
import { useWishlist } from '../src/hooks/useWishlist';

const PopularProducts = ({ products, viewProduct, navigateTo }) => {
  const { theme } = useContext(ThemeContext);
  const { user } = useAdmin();
  const { addToCart: addToCartHook, updateQuantity: updateQuantityHook, removeFromCart: removeFromCartHook, getItemQuantity, cartItems } = useCart();
  const {
    wishlistItems,
    toggleWishlist,
    isItemInWishlist,
    syncGuestWishlistToUser
  } = useWishlist();
  const [toast, setToast] = useState(null);

  const handleAddToCart = async (product) => {
    try {
      // Check if product is in stock before adding to cart
      const stock = product.stock || 0;
      const isPreOrderProduct = product.isPreOrder || product.preOrder || 
        /pre.?order/i.test(product.categoryName || '') || 
        /pre.?order/i.test(product.subcategoryName || '');
      if (stock <= 0 && !isPreOrderProduct) {
        alert('This product is out of stock');
        return;
      }

      // For home page products, remove the prefix before adding to cart
      const productToAdd = product.id.startsWith('home-')
        ? { ...product, id: product.id.replace('home-', '') }
        : product;

      // Check if product requires size or color selection
      const hasSizeOptions = productToAdd.sizes && productToAdd.sizes.length > 0;
      const hasColorOptions = productToAdd.colors && productToAdd.colors.length > 0;

      // Auto-select first size and color if available
      if (hasSizeOptions) {
        productToAdd.selectedSize = productToAdd.sizes[0];
      }
      if (hasColorOptions) {
        productToAdd.selectedColor = productToAdd.colors[0];
      }

      // Use the unified cart hook
      await addToCartHook(productToAdd);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Error adding to cart');
    }
  };

  const handleUpdateQuantity = async (productId, change) => {
    try {
      // For home page products, remove prefix before checking cart
      const cartProductId = productId.startsWith('home-')
        ? productId.replace('home-', '')
        : productId;

      const existingItem = cartItems.find(item => item.id === cartProductId);
      if (!existingItem) return;

      const newQuantity = Math.max(1, existingItem.quantity + change);

      // Use the unified cart hook
      await updateQuantityHook(cartProductId, newQuantity, existingItem.selectedSize, existingItem.selectedColor);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      // For home page products, remove prefix before updating cart
      const cartProductId = productId.startsWith('home-')
        ? productId.replace('home-', '')
        : productId;

      const existingItem = cartItems.find(item => item.id === cartProductId);
      if (!existingItem) return;

      // Use the unified cart hook
      await removeFromCartHook(cartProductId, existingItem.selectedSize, existingItem.selectedColor);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getCartQuantity = (productId) => {
    // For home page products, remove prefix before checking cart
    const cartProductId = productId.startsWith('home-')
      ? productId.replace('home-', '')
      : productId;

    // Use the unified cart hook
    return getItemQuantity(cartProductId);
  };

  const handleWishlistToggle = async (product) => {
    try {
      if (!user) {
        // Show login toast for guest users
        setToast({
          message: 'Please login to add items to your wishlist',
          type: 'info',
          duration: 3000
        });
        return;
      }

      // For logged-in users, toggle wishlist
      const result = await toggleWishlist(product);

      if (result.added) {
        setToast({
          message: 'Item added to wishlist',
          type: 'success',
          duration: 2000
        });
      } else if (result.removed) {
        setToast({
          message: 'Item removed from wishlist',
          type: 'info',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      setToast({
        message: 'Error updating wishlist',
        type: 'error',
        duration: 3000
      });
    }
  };

  // Sync guest wishlist when user logs in
  React.useEffect(() => {
    if (user) {
      const syncWishlist = async () => {
        try {
          const result = await syncGuestWishlistToUser();
          if (result.syncedItems > 0) {
            setToast({
              message: result.message,
              type: 'success',
              duration: 3000
            });
          }
        } catch (error) {
          console.error('Error syncing wishlist:', error);
        }
      };

      syncWishlist();
    }
  }, [user, syncGuestWishlistToUser]);

  /* Scroll Indicator Logic */
  const scrollRef = React.useRef(null);
  const [activeScrollIndex, setActiveScrollIndex] = useState(0);

  const handleScroll = () => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      // Approximate index calculation based on card width (80% of view)
      // We use container.clientWidth * 0.8 as the item stride
      const itemWidth = container.clientWidth * 0.8;
      const index = Math.round(container.scrollLeft / itemWidth);
      setActiveScrollIndex(Math.min(index, products.length - 1));
    }
  };

  return (
    <div className={`py-12 ${theme === 'dark' ? 'bg-black' : 'bg-white'}`}>
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-12">
          <div className="flex items-center justify-start mb-4">

            <h2 className="text-3xl md:text-4xl font-bold text-brand-primary">Popular Products</h2>
          </div>
          <div className="w-20 h-1 bg-brand-secondary"></div>
        </div>

        {/* Products Grid */}
        <div className="relative group/scroll">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-12 mobile-snap-container hide-scrollbar px-1"
          >
            {products.map((product) => (
              <div key={product.id} className="p-1 mobile-snap-item">
                <ProductCard
                  product={product}
                  viewProduct={viewProduct}
                  toggleWishlist={handleWishlistToggle}
                  isInWishlist={isItemInWishlist(product.id.replace('home-', ''))}
                  addToCart={handleAddToCart}
                  updateQuantity={handleUpdateQuantity}
                  removeFromCart={handleRemoveFromCart}
                  cartQuantity={getCartQuantity(product.id)}
                />
              </div>
            ))}
          </div>

          {/* Mobile Scroll Indicator Dots */}
          <div className="flex justify-center gap-1.5 md:hidden -mt-8 mb-12">
            {[...Array(Math.min(products.length, 5))].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${i === activeScrollIndex % 5 ? 'bg-brand-primary scale-125' : 'bg-gray-300'}`}
              ></div>
            ))}
          </div>
        </div>

        {/* Shop Now Button */}
        <div className="text-center">
          <button
            onClick={() => navigateTo('shop')}
            className={`${theme === 'dark' ? 'bg-brand-primary text-white hover:bg-brand-secondary' : 'bg-brand-primary text-white hover:bg-brand-secondary'} font-bold py-3 px-12 rounded-full transition-all duration-300 flex items-center justify-center mx-auto group transform hover:scale-105 border-2`}
            style={{
              borderRadius: '50px',
              borderColor: theme === 'dark' ? '#640d5F' : '#640d5F',
              boxShadow: theme === 'dark'
                ? '0 4px 15px rgba(100, 13, 95, 0.3), 0 0 20px rgba(100, 13, 95, 0.1)'
                : '0 4px 15px rgba(100, 13, 95, 0.3), 0 0 20px rgba(100, 13, 95, 0.1)'
            }}
          >
            <span>Shop now</span>
            <ArrowRight className="ml-2 transition-transform duration-300 group-hover:translate-x-1" size={20} />
          </button>
        </div>
      </div>

      {/* Add Font Awesome for icons */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
          <div
            className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg transition-all duration-300 ${toast.type === 'success'
              ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800'
              : toast.type === 'error'
                ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                : 'bg-brand-primary/10 border-brand-primary/30 dark:bg-brand-primary/20 dark:border-brand-primary/50'
              }`}
          >
            <div className={`w-5 h-5 ${toast.type === 'success'
              ? 'text-green-500'
              : toast.type === 'error'
                ? 'text-red-500'
                : 'text-brand-primary'
              }`}>
              {toast.type === 'success' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'error' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              {toast.type === 'info' && (
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              {toast.message}
            </p>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PopularProducts;