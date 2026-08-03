import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Product } from '../types';
import { Heart, ChevronLeft, ChevronRight, Check, ShoppingCart, AlertCircle, Calendar, Truck, Info, IndianRupee, Minus, Plus } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import { useCart } from '../src/hooks/useCart';
import { useWishlist } from '../src/hooks/useWishlist';
import {
  isProductAvailableForPreOrder,
  isProductInStock,
  validatePreOrderStock,
  checkCustomerPreOrderLimit,
  getPreOrderPricing
} from '../src/firebase/services/productService';

const ProductDetailPage = ({ product }) => {
  const { user } = useAdmin();
  const { addToCart, isProductInCart, getItemQuantity, updateQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();
  const {
    toggleWishlist,
    isItemInWishlist,
    syncGuestWishlistToUser
  } = useWishlist();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || null);
  const defaultColor = product.colors.find(c => c.toLowerCase().includes('black')) || product.colors[0] || null;
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toast, setToast] = useState(null);
  const [isPreOrder, setIsPreOrder] = useState(false);
  const [preOrderPricing, setPreOrderPricing] = useState(null);
  const [preOrderTermsAccepted, setPreOrderTermsAccepted] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);

  const isInWishlist = isItemInWishlist(product.id);

  // Check if product is in stock
  const stock = product.stock || 0;
  const isInStock = stock > 0;

  // Detect pre-order products by flag OR category name
  const isPreOrderProduct = product.isPreOrder || product.preOrder || 
    /pre.?order/i.test(product.categoryName || '') || 
    /pre.?order/i.test(product.subcategoryName || '');

  // Pre-order state management
  useEffect(() => {
    const checkPreOrderStatus = async () => {
      try {
        const preOrderAvailable = await isProductAvailableForPreOrder(product.id);
        setIsPreOrder(preOrderAvailable);

        if (preOrderAvailable) {
          const pricing = await getPreOrderPricing(product.id);
          setPreOrderPricing(pricing);
        }
      } catch (error) {
        console.error('Error checking pre-order status:', error);
        setIsPreOrder(false);
      }
    };

    checkPreOrderStatus();
  }, [product.id]);

  const handleAddToCart = async () => {
    try {
      // Check if product is available (skip for pre-order products)
      if (!isPreOrderProduct) {
        const isAvailable = await isProductInStock(product.id);
        if (!isAvailable) {
          alert('This product is not available');
          return;
        }
      }

      // For pre-order items, do additional validation
      if (isPreOrder) {
        // Check if terms are accepted
        if (!preOrderTermsAccepted) {
          setToast({
            message: 'Please accept the pre-order terms and conditions',
            type: 'error',
            duration: 3000
          });
          return;
        }

        // Validate pre-order stock
        const stockValidation = await validatePreOrderStock(product.id, 1);
        if (!stockValidation.valid) {
          setToast({
            message: stockValidation.message,
            type: 'error',
            duration: 3000
          });
          return;
        }

        // Check pre-order limit if user is logged in
        if (user && product.preOrderLimit) {
          const limitCheck = await checkCustomerPreOrderLimit(product.id, user.uid, 1);
          if (!limitCheck.valid) {
            setToast({
              message: limitCheck.message,
              type: 'error',
              duration: 3000
            });
            return;
          }
        }

        // Show pre-order confirmation
        setShowPreOrderModal(true);
        return;
      }

      // For regular products, proceed normally
      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: 1
      };

      // Use the unified cart hook
      await addToCart(productWithSelections);
      setToast({
        message: 'Product added to cart',
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      setToast({
        message: error.message || 'Error adding to cart',
        type: 'error',
        duration: 3000
      });
    }
  };

  // Buy Now — add to cart and go straight to checkout
  const handleBuyNow = async () => {
    try {
      if (!isInStock && !isPreOrder && !isPreOrderProduct) return;

      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: 1
      };

      await addToCart(productWithSelections);
      navigate('/checkout');
    } catch (error) {
      console.error('Error with Buy Now:', error);
      setToast({
        message: error.message || 'Error processing Buy Now',
        type: 'error',
        duration: 3000
      });
    }
  };

  const handlePreOrderConfirm = async () => {
    try {
      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: 1,
        isPreOrder: true,
        preOrderPrice: preOrderPricing?.price || product.price,
        expectedShippingDate: product.expectedShippingDate
      };

      // Use the unified cart hook
      await addToCart(productWithSelections);
      setShowPreOrderModal(false);
      setToast({
        message: 'Pre-order added to cart',
        type: 'success',
        duration: 2000
      });
    } catch (error) {
      console.error('Error adding pre-order to cart:', error);
      setToast({
        message: error.message || 'Error adding pre-order to cart',
        type: 'error',
        duration: 3000
      });
    }
  };

  const currentQty = getItemQuantity(product.id, selectedSize, selectedColor);

  const handleIncrement = async () => {
    try {
      const isPreOrderActive = isPreOrder || isPreOrderProduct;
      
      if (!isPreOrderActive && currentQty >= stock) {
        setToast({
          message: `Only ${stock} items left in stock`,
          type: 'error',
          duration: 3000
        });
        return;
      }

      // Additional validation for pre-order (Bypassed based on client request)
      /*
      if (isPreOrderActive) {
        const stockValidation = await validatePreOrderStock(product.id, currentQty + 1);
        if (!stockValidation.valid) {
          setToast({ message: stockValidation.message, type: 'error', duration: 3000 });
          return;
        }
      }
      */


      await updateQuantity(product.id, currentQty + 1, selectedSize, selectedColor);
    } catch (error) {
      console.error('Error incrementing quantity:', error);
      setToast({ message: error.message || 'Error updating quantity', type: 'error', duration: 3000 });
    }
  };

  const handleDecrement = async () => {
    try {
      if (currentQty > 1) {
        await updateQuantity(product.id, currentQty - 1, selectedSize, selectedColor);
      } else {
        await removeFromCart(product.id, selectedSize, selectedColor);
        setToast({
          message: 'Item removed from cart',
          type: 'info',
          duration: 2000
        });
      }
    } catch (error) {
      console.error('Error decrementing quantity:', error);
      setToast({ message: error.message || 'Error updating quantity', type: 'error', duration: 3000 });
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  const handleWishlistToggle = async () => {
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-start">
        {/* Image Gallery - More Compact */}
        <div className="lg:col-span-5 relative lg:sticky lg:top-24">
          <div className="relative group overflow-hidden rounded-xl bg-gray-50 border border-gray-100 shadow-inner">
            <div className="h-[400px] md:h-[500px] w-full overflow-hidden">
              <img
                src={product.images[currentImageIndex]}
                alt={`${product.name} image ${currentImageIndex + 1}`}
                className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            {/* Wishlist Heart Icon - Top Corner */}
            <button
              onClick={handleWishlistToggle}
              className="absolute top-4 right-4 z-10 p-3 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg backdrop-blur-sm hover:scale-110 active:scale-95 transition-all group/heart"
              aria-label={isInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart
                size={22}
                className={`transition-colors ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-400 group-hover/heart:text-red-400'}`}
              />
            </button>
            {product.images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronLeft className="text-gray-900 dark:text-white" size={20} />
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/90 dark:bg-gray-900/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-all opacity-0 group-hover:opacity-100">
                  <ChevronRight className="text-gray-900 dark:text-white" size={20} />
                </button>
              </>
            )}
          </div>

          <div className="flex justify-center mt-6 gap-3 flex-wrap">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all shadow-sm ${index === currentImageIndex ? 'border-brand-primary ring-2 ring-brand-primary/20' : 'border-gray-200 hover:border-gray-300'}`}
              >
                <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="lg:col-span-7 dark:text-white">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl lg:text-3xl font-semibold text-gray-900 dark:text-white">{product.name}</h1>
            {isPreOrder && (
              <span className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-full text-xs font-semibold">
                Pre-Order
              </span>
            )}
          </div>

          {/* Pricing Section */}
          <div className="flex items-baseline space-x-3 mt-4">
            {isPreOrder && preOrderPricing ? (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{preOrderPricing.price}</p>
                {preOrderPricing.originalPrice > preOrderPricing.price && (
                  <>
                    <p className="text-lg text-gray-500 line-through">₹{preOrderPricing.originalPrice}</p>
                    <span className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 px-2 py-1 rounded text-xs font-semibold">
                      Save ₹{preOrderPricing.savings}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₹{product.price}</p>
                <p className="text-lg text-gray-500 line-through">₹{product.originalPrice}</p>
              </>
            )}
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-1">Inclusive of all taxes</p>

          {/* Pre-Order Information Section */}
          {isPreOrder && (
            <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2 text-purple-800 dark:text-purple-200">
                <Info size={20} />
                Pre-Order Information
              </h3>

              {/* Expected Shipping Date */}
              {product.expectedShippingDate && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <Truck size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Expected Shipping: {new Date(product.expectedShippingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
              )}

              {/* Pre-Order Period */}
              {(product.preOrderStartDate || product.preOrderEndDate) && (
                <div className="flex items-center gap-2 mb-2 text-sm">
                  <Calendar size={16} className="text-purple-600 dark:text-purple-400" />
                  <span className="text-gray-700 dark:text-gray-300">
                    Pre-Order Period: {product.preOrderStartDate ? new Date(product.preOrderStartDate).toLocaleDateString() : 'Starts soon'} -
                    {product.preOrderEndDate ? new Date(product.preOrderEndDate).toLocaleDateString() : 'Limited time'}
                  </span>
                </div>
              )}

              {/* Pre-Order Message */}
              {product.preOrderMessage && (
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2 italic">
                  {product.preOrderMessage}
                </p>
              )}

              {/* Pre-Order Stock and Limit */}
              <div className="mt-3 flex gap-4 text-sm">
                <span className="text-gray-700 dark:text-gray-300">
                  Available: {product.preOrderStock || 0} units
                </span>
                {product.preOrderLimit && (
                  <span className="text-gray-700 dark:text-gray-300">
                    Limit: {product.preOrderLimit} per customer
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="mt-3">
            {(isPreOrder || isPreOrderProduct) ? (
              <p className="text-lg font-medium text-purple-600 dark:text-purple-400 flex items-center gap-2">
                <Calendar size={20} />
                Available for Pre-Order
              </p>
            ) : isInStock ? (
              <p className="text-lg font-medium text-green-600 dark:text-green-400">
                {stock > 5 ? 'In Stock' : `Only ${stock} left in stock`}
              </p>
            ) : (
              <p className="text-lg font-medium text-red-600 dark:text-red-400 flex items-center gap-2">
                <AlertCircle size={20} />
                Out of Stock
              </p>
            )}
          </div>

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-8">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                Select Size
                {isPreOrder && (
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-normal">
                    (Pre-order available)
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 px-5 border rounded-md transition-colors ${selectedSize === size
                      ? isPreOrder
                        ? 'bg-purple-600 text-white'
                        : 'bg-brand-primary text-white'
                      : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                Select Color
                {isPreOrder && (
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-normal">
                    (Pre-order available)
                  </span>
                )}
              </h3>
              <div className="flex flex-wrap gap-3">
                {product.colors.map(color => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color
                      ? isPreOrder
                        ? 'border-purple-600 scale-110'
                        : 'border-brand-primary scale-110'
                      : 'border-gray-300 dark:border-gray-600'
                      }`}
                    style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                    title={color}
                  >
                    {selectedColor === color && <Check size={16} className={color.toLowerCase() === 'white' ? 'text-black' : 'text-white'} />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pre-Order Terms and Conditions */}
          {isPreOrder && (
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Info size={18} />
                Pre-Order Terms & Conditions
              </h4>
              <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-4">
                <p>• Payment will be processed immediately upon placing your pre-order</p>
                <p>• Expected shipping date is {product.expectedShippingDate ? new Date(product.expectedShippingDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }) : 'to be announced'}</p>
                <p>• You will receive shipping confirmation via email when your order ships</p>
                <p>• Pre-orders can be cancelled before the shipping date</p>
                <p>• Limited quantities available - pre-order is subject to stock availability</p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="preorder-terms"
                  checked={preOrderTermsAccepted}
                  onChange={(e) => setPreOrderTermsAccepted(e.target.checked)}
                  className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                />
                <label htmlFor="preorder-terms" className="text-sm text-gray-700 dark:text-gray-300">
                  I agree to the pre-order terms and conditions
                </label>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`mt-8 grid grid-cols-1 md:grid-cols-10 md:max-w-lg gap-3`}>
            {/* Buy Now / Pre-Order — Primary Action */}
              <button
                onClick={handleBuyNow}
                disabled={!isInStock && !isPreOrderProduct}
                className={`md:col-span-6 w-full font-bold py-4 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 ${(isInStock || isPreOrderProduct)
                  ? isPreOrderProduct
                    ? 'bg-purple-600/90 text-white hover:bg-purple-700 shadow-md'
                    : 'bg-brand-primary text-white hover:bg-brand-secondary shadow-md'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                  }`}
              >
                <IndianRupee size={20} />
                <span>{isPreOrderProduct ? 'Pre-Order' : 'Buy Now'}</span>
              </button>

            {/* Add to Cart / Quantity - Alternative Styling */}
            <div className="md:col-span-4">
              {currentQty > 0 ? (
                <div className={`w-full flex items-center justify-between ${isPreOrder ? 'bg-purple-600' : 'bg-brand-primary'} text-white font-bold rounded-md overflow-hidden shadow-lg`}>
                  <button
                    onClick={handleDecrement}
                    className="p-4 hover:bg-white/10 transition-colors flex items-center justify-center flex-1"
                  >
                    <Minus size={20} />
                  </button>
                  <div className="px-2 py-4 text-sm flex items-center justify-center font-bold min-w-[60px] whitespace-nowrap">
                    {currentQty} {currentQty === 1 ? 'item' : 'items'}
                  </div>
                  <button
                    onClick={handleIncrement}
                    className="p-4 hover:bg-white/10 transition-colors flex items-center justify-center flex-1"
                    disabled={currentQty >= (isPreOrder ? (product.preOrderStock || 999) : stock)}
                  >
                    <Plus size={20} />
                  </button>
                </div>
              ) : !isPreOrderProduct && (
                <button
                  onClick={handleAddToCart}
                  disabled={!isInStock}
                  className={`w-full font-bold py-4 px-4 rounded-md border-2 transition-all duration-300 flex items-center justify-center space-x-2 bg-white text-brand-primary border-brand-primary hover:bg-brand-primary hover:text-white hover:shadow-lg active:scale-95`}
                >
                  <ShoppingCart size={20} />
                  <span className="truncate text-sm md:text-base">
                    {isInStock ? 'Add to Cart' : 'Out of Stock'}
                  </span>
                </button>
              )}
            </div>
          </div>

          {/* Description & Details */}
          <div className="mt-10 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2 border-b pb-2 dark:border-gray-700">Description</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{product.description}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 border-b pb-2 dark:border-gray-700">Product Specifications</h4>
              <ul className="space-y-3 mt-4">
                {(() => {
                  if (!product.fabricDetails) return null;
                  const details = product.fabricDetails.includes(',')
                    ? product.fabricDetails.split(',').map(s => s.trim()).filter(Boolean)
                    : product.fabricDetails.split(/\s+(?=[A-Z][a-zA-Z\s]{1,20}:)/).map(s => s.trim()).filter(Boolean);

                  return details.map((detail, index) => {
                    const parts = detail.split(':');
                    if (parts.length < 2) return (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        <span>{detail.trim()}</span>
                      </li>
                    );

                    const label = parts[0].trim();
                    const value = parts.slice(1).join(':').trim();

                    return (
                      <li key={index} className="flex items-start gap-3 text-gray-600 dark:text-gray-300 text-sm">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-gray-400 shrink-0" />
                        <div>
                          <span className="font-bold text-gray-900 dark:text-white">{label}: </span>
                          <span>{value}</span>
                        </div>
                      </li>
                    );
                  });
                })()}
              </ul>
            </div>
          </div>
        </div>
      </div>

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

      {/* Pre-Order Confirmation Modal */}
      {showPreOrderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Confirm Pre-Order</h3>

            <div className="mb-4">
              <div className="flex items-center gap-3 mb-3">
                <img src={product.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded" />
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">{product.name}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedSize && `Size: ${selectedSize}`}
                    {selectedColor && ` • Color: ${selectedColor}`}
                  </p>
                </div>
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Price:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₹{preOrderPricing?.price || product.price}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Expected Shipping:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {product.expectedShippingDate ? new Date(product.expectedShippingDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'To be announced'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-brand-primary/10 dark:bg-brand-primary/20 p-3 rounded mb-4">
              <p className="text-sm text-brand-primary dark:text-brand-secondary">
                <strong>Note:</strong> By confirming this pre-order, you agree to be charged immediately and will receive the product when it becomes available.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPreOrderModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePreOrderConfirm}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors font-semibold"
              >
                Confirm Pre-Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;