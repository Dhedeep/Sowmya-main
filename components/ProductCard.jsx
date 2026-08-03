import React, { useContext, useState, useEffect } from 'react';
import { Product } from '../types';
import { ThemeContext } from '../App';
import { Heart, ShoppingCart, Plus, Minus, AlertCircle, Eye, Info } from 'lucide-react';
import {
  isProductAvailableForPreOrder,
  getPreOrderPricing,
  validatePreOrderStock
} from '../src/firebase/services/productService';
import './ProductCard.css';

const ProductCard = ({
  product,
  viewProduct,
  toggleWishlist,
  isInWishlist,
  addToCart,
  updateQuantity,
  removeFromCart,
  cartQuantity = 0,
  showLoginToast,
  preOrderProduct // New function for pre-order handling
}) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);
  const [preOrderInfo, setPreOrderInfo] = useState(null);
  const [showPreOrderTooltip, setShowPreOrderTooltip] = useState(false);

  // Check if product is in stock
  const stock = product.stock || 0;
  const isInStock = stock > 0;

  // Check if product is on sale
  const isOnSale = product.originalPrice && product.originalPrice > product.price;

  // Check if product is a pre-order
  const isPreOrder = product.isPreOrder || false;

  // Detect pre-order products by flag OR category name
  const isPreOrderProduct = product.isPreOrder || product.preOrder || 
    /pre.?order/i.test(product.categoryName || '') || 
    /pre.?order/i.test(product.subcategoryName || '');

  // Get pre-order pricing info
  const [preOrderPricing, setPreOrderPricing] = useState(null);

  // Check if pre-order is available
  const [isPreOrderAvailable, setIsPreOrderAvailable] = useState(false);

  // Fetch pre-order information when component mounts or product changes
  useEffect(() => {
    const fetchPreOrderInfo = async () => {
      if (isPreOrder) {
        try {
          // Check if pre-order is available
          const available = await isProductAvailableForPreOrder(product.id);
          setIsPreOrderAvailable(available);

          // Get pre-order pricing
          const pricing = await getPreOrderPricing(product.id);
          setPreOrderPricing(pricing);

          // Validate pre-order stock
          const validation = await validatePreOrderStock(product.id);
          setPreOrderInfo(validation);
        } catch (error) {
          console.error('Error fetching pre-order info:', error);
        }
      }
    };

    fetchPreOrderInfo();
  }, [product, isPreOrder]);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (isInStock || isPreOrderProduct) {
      addToCart(product);
    }
  };

  const handlePreOrder = (e) => {
    e.stopPropagation();
    if (isPreOrder && isPreOrderAvailable && preOrderProduct) {
      preOrderProduct(product);
    }
  };

  const handleQuantityChange = (e, change) => {
    e.stopPropagation();
    if (change > 0) {
      if (isPreOrder && isPreOrderAvailable) {
        if (preOrderProduct) {
          preOrderProduct(product);
        }
      } else if (isInStock) {
        addToCart(product);
      }
    } else {
      removeFromCart(product.id);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    if (toggleWishlist) {
      toggleWishlist(product);
    }
  };

  return (
    <div
      className={`product-item relative ${theme === 'dark' ? 'dark' : ''} transition-all duration-300 hover:shadow-xl touch-manipulation`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Badges */}
      <div className="product-item__badges">
        {isOnSale && (
          <span className="onsale">Sale!</span>
        )}
        {isPreOrder && (
          <span className="preorder">Pre-Order</span>
        )}
      </div>

      {/* Product Thumbnail */}
      <div className="product-item__thumbnail">
        {/* Overlay Effect */}
        <div className="product-item__thumbnail_overlay"></div>

        {/* Product Link */}
        <div
          onClick={() => viewProduct(product)}
          className="product-item-link absolute inset-0 cursor-pointer z-10"
        ></div>

        {/* Top Actions - Wishlist and Quick View */}
        <div className="product-item__description--top-actions">
          <button
            onClick={handleWishlistClick}
            className={`p-2 ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'} backdrop-blur-md transition-all duration-300 hover:scale-110`}
            title={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={18} className={`${isInWishlist ? 'text-red-500 fill-current' : ''}`} />
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); viewProduct(product); }}
            className={`p-2 ${theme === 'dark' ? 'bg-gray-800/80' : 'bg-white/80'} ${theme === 'dark' ? 'text-white' : 'text-gray-800'} backdrop-blur-md transition-all duration-300 hover:scale-110`}
          >
            <Eye size={18} />
          </button>
        </div>

        {/* Desktop Bottom Actions - Add to Cart (hover overlay, hidden on mobile) */}
        <div className="product-item__description--actions hidden md:block">
          {cartQuantity > 0 ? (
            <div className={`flex items-center overflow-hidden rounded-xl ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} font-semibold border border-black/5`}>
              <button
                onClick={(e) => handleQuantityChange(e, -1)}
                className={`px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Minus size={16} />
              </button>
              <span className="flex-1 text-center font-bold px-2">{cartQuantity}</span>
              <button
                onClick={(e) => handleQuantityChange(e, 1)}
                className={`px-4 py-3 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
              >
                <Plus size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={isPreOrder ? handlePreOrder : handleAddToCart}
              disabled={!isInStock && !isPreOrderProduct}
              className={`w-full py-3 px-4 font-bold text-center flex items-center justify-center gap-2 transition-all duration-300 rounded-xl shadow-lg ${(isInStock || isPreOrderProduct)
                ? isPreOrderProduct
                  ? 'bg-purple-600/90 text-white hover:bg-purple-700 active:scale-95'
                  : 'bg-[#d91656] text-white hover:bg-[#c0144d] active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
            >
              <ShoppingCart size={18} />
              <span className="text-sm uppercase tracking-wider">
                {isPreOrderProduct
                  ? 'Pre-Order'
                  : (isInStock ? 'Add to cart' : 'Sold Out')
                }
              </span>
            </button>
          )}
        </div>

        {/* Product Image */}
        <div className="product-item__thumbnail-placeholder">
          <div onClick={() => viewProduct(product)} className="cursor-pointer relative overflow-hidden">
            <img
              src={product.images[0]}
              alt={product.name}
              className={`w-full h-[400px] md:h-[450px] object-cover transition-all duration-700 ${isHovered && product.images.length > 1 ? 'opacity-0 scale-110' : 'opacity-100'}`}
            />
            {product.images.length > 1 && (
              <img
                src={product.images[1]}
                alt={`${product.name} alternate`}
                className={`absolute inset-0 w-full h-[400px] md:h-full object-cover transition-all duration-700 ${isHovered ? 'opacity-100 scale-105' : 'opacity-0'}`}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Actions - Add to Cart (static, below image, visible only on mobile) */}
      <div className="block md:hidden px-3 pb-1 pt-2">
        {cartQuantity > 0 ? (
          <div className={`flex items-center overflow-hidden rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} font-semibold border border-black/5`}>
            <button
              onClick={(e) => handleQuantityChange(e, -1)}
              className={`px-3 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Minus size={14} />
            </button>
            <span className="flex-1 text-center font-bold px-1 text-sm">{cartQuantity}</span>
            <button
              onClick={(e) => handleQuantityChange(e, 1)}
              className={`px-3 py-2 ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-colors`}
            >
              <Plus size={14} />
            </button>
          </div>
        ) : (
          <button
            onClick={isPreOrder ? handlePreOrder : handleAddToCart}
            disabled={!isInStock && !isPreOrderProduct}
            className={`w-full py-2 px-3 font-bold text-center flex items-center justify-center gap-1.5 transition-all duration-300 rounded-lg ${(isInStock || isPreOrderProduct)
              ? isPreOrderProduct
                ? 'bg-purple-600/90 text-white active:scale-95'
                : 'bg-[#d91656] text-white active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
          >
            <ShoppingCart size={14} />
            <span className="text-xs uppercase tracking-wider">
              {isPreOrderProduct
                ? 'Pre-Order'
                : (isInStock ? 'Add to cart' : 'Sold Out')
              }
            </span>
          </button>
        )}
      </div>

      {/* Product Description */}
      <div className="product-item__description">
        <div className="product-item__description--info">
          <div className="info-left">
            <h3
              onClick={() => viewProduct(product)}
              className={`title cursor-pointer transition-colors duration-200 ${theme === 'dark' ? 'text-white hover:text-[#d91656]' : 'text-gray-900 hover:text-[#d91656]'}`}
            >
              {product.name}
            </h3>
          </div>
          <div className="info-right">
            <div className="price flex items-center space-x-2">
              {isPreOrder && preOrderPricing && preOrderPricing.isPreOrder && preOrderPricing.price !== product.price ? (
                <>
                  <del className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                    <span>₹{product.price}</span>
                  </del>
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                    ₹{preOrderPricing.price}
                  </span>
                </>
              ) : (
                <>
                  {isOnSale && (
                    <del className={`text-sm ${theme === 'dark' ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span>₹{product.originalPrice}</span>
                    </del>
                  )}
                  <span className={`text-xl font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    ₹{isPreOrder && preOrderPricing ? preOrderPricing.price : product.price}
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            <div className="mt-1">
              {isPreOrderProduct ? (
                <p className={`text-[10px] uppercase font-bold tracking-widest ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>
                  Pre-Order Available
                </p>
              ) : (
                <p className={`text-[10px] uppercase font-bold tracking-widest ${isInStock ? (stock > 5 ? 'text-green-500' : 'text-orange-500') : 'text-red-500'}`}>
                  {isInStock ? (stock > 5 ? 'In Stock' : `Hurry! Only ${stock} left`) : 'Out of Stock'}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;