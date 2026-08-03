import React, { useState } from 'react';
import { Product } from '../types';
import { Heart, ChevronLeft, ChevronRight, Check, ShoppingCart, AlertCircle, MessageSquare } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import { addToUserCart } from '../src/firebase/services/cartService';
import ProductRatingEnhanced from '../src/components/ProductRatingEnhanced';
import ReviewModal from '../src/components/ReviewModal';
import { getUserReviewForProduct } from '../src/firebase/services/reviewService';

const ProductDetailPageDebug = ({ product, toggleWishlist, wishlist, cart, updateCart }) => {
  const { user } = useAdmin();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0] || null);
  const defaultColor = product.colors.find(c => c.toLowerCase().includes('black')) || product.colors[0] || null;
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [userReview, setUserReview] = useState(null);
  const [debugMode, setDebugMode] = useState(true); // Enable debug mode by default

  const isInWishlist = wishlist.some(p => p.id === product.id);

  // Check if product is in stock
  const stock = product.stock || 0;
  const isInStock = stock > 0;

  // Load user review when component mounts or user changes
  React.useEffect(() => {
    if (user && product.id) {
      getUserReviewForProduct(user.uid, product.id).then(review => {
        setUserReview(review);
      }).catch(error => {
        console.error('Error loading user review:', error);
      });
    }
  }, [user, product.id]);

  // Handle opening review modal
  const handleOpenReviewModal = () => {
    setReviewModalOpen(true);
  };

  // Handle review submission
  const handleReviewSubmitted = (review) => {
    setUserReview(review);
  };

  const addToCart = async () => {
    try {
      if (!isInStock) {
        alert('This product is out of stock');
        return;
      }

      const productWithSelections = {
        ...product,
        selectedSize,
        selectedColor,
        quantity: 1
      };

      if (user) {
        // For logged-in users, update cart in Firebase
        const updatedCart = await addToUserCart(user.uid, productWithSelections);
        updateCart(updatedCart);
      } else {
        // For guest users, update local cart
        const existingItem = cart.find(item =>
          item.id === product.id &&
          item.selectedSize === selectedSize &&
          item.selectedColor === selectedColor
        );

        let newCart;
        if (existingItem) {
          newCart = cart.map(item =>
            item.id === product.id &&
              item.selectedSize === selectedSize &&
              item.selectedColor === selectedColor
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newCart = [...cart, productWithSelections];
        }

        updateCart(newCart);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Error adding to cart');
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex + 1) % product.images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => (prevIndex - 1 + product.images.length) % product.images.length);
  };

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Debug Mode Toggle */}
      <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={debugMode}
            onChange={(e) => setDebugMode(e.target.checked)}
            className="rounded"
          />
          <span className="font-medium text-blue-800 dark:text-blue-300">Enable Debug Mode</span>
        </label>
        <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
          This will show detailed information about reviews and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="relative">
          <div className="aspect-square w-full overflow-hidden rounded-lg">
            <img src={product.images[currentImageIndex]} alt={`${product.name} image ${currentImageIndex + 1}`} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <>
              <button onClick={prevImage} className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/70 dark:bg-gray-900/70 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900">
                <ChevronLeft className="text-gray-800 dark:text-white" />
              </button>
              <button onClick={nextImage} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/70 dark:bg-gray-900/70 rounded-full shadow-md hover:bg-white dark:hover:bg-gray-900">
                <ChevronRight className="text-gray-800 dark:text-white" />
              </button>
            </>
          )}
          <div className="flex justify-center mt-4 space-x-2">
            {product.images.map((img, index) => (
              <button key={index} onClick={() => setCurrentImageIndex(index)} className={`w-16 h-16 rounded-md overflow-hidden border-2 ${index === currentImageIndex ? 'border-brand-primary dark:border-brand-primary' : 'border-transparent'}`}>
                <img src={img} alt={`thumbnail ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="dark:text-white">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white">{product.name}</h1>
          <div className="flex items-baseline space-x-3 mt-4">
            <p className="text-3xl font-bold text-gray-900 dark:text-white">₹{product.price}</p>
            <p className="text-xl text-gray-500 line-through">₹{product.originalPrice}</p>
          </div>
          <p className="text-sm text-green-600 dark:text-green-400 mt-2">Inclusive of all taxes</p>

          {/* Debug Product Info */}
          {debugMode && (
            <div className="mt-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
              <h4 className="font-medium text-sm text-yellow-800 dark:text-yellow-300 mb-2">Product Debug Info:</h4>
              <div className="text-xs space-y-1 text-yellow-700 dark:text-yellow-400">
                <div>Product ID: {product.id}</div>
                <div>Average Rating: {product.averageRating}</div>
                <div>Review Count: {product.reviewCount}</div>
              </div>
            </div>
          )}

          {/* Product Rating */}
          <div className="mt-4">
            <ProductRatingEnhanced
              productId={product.id}
              averageRating={product.averageRating}
              reviewCount={product.reviewCount}
              showReviews={true}
              debug={debugMode}
            />
          </div>

          {/* Stock Status */}
          <div className="mt-3">
            {isInStock ? (
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
          <div className="mt-8">
            <h3 className="font-semibold text-lg mb-3">Select Size</h3>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`py-2 px-5 border rounded-md transition-colors ${selectedSize === size ? 'bg-brand-primary text-white' : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selector */}
          <div className="mt-6">
            <h3 className="font-semibold text-lg mb-3">Select Color</h3>
            <div className="flex flex-wrap gap-3">
              {product.colors.map(color => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor === color ? 'border-brand-primary scale-110' : 'border-gray-300 dark:border-gray-600'}`}
                  style={{ backgroundColor: color.toLowerCase().replace(' ', '') }}
                  title={color}
                >
                  {selectedColor === color && <Check size={16} className={color.toLowerCase() === 'white' ? 'text-black' : 'text-white'} />}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={addToCart}
              disabled={!isInStock}
              className={`w-full font-bold py-4 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 ${isInStock
                ? 'bg-brand-primary text-white hover:bg-brand-secondary'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed dark:bg-gray-700 dark:text-gray-400'
                }`}
            >
              <ShoppingCart size={20} />
              <span>{isInStock ? 'Add to Cart' : 'Out of Stock'}</span>
            </button>
            <button onClick={() => toggleWishlist(product)} className="w-full border-2 border-brand-primary text-brand-primary font-bold py-4 px-4 rounded-md flex items-center justify-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Heart size={20} className={isInWishlist ? 'text-red-500 fill-current' : ''} />
              <span>{isInWishlist ? 'Added to Wishlist' : 'Add to Wishlist'}</span>
            </button>
          </div>

          {/* Review Button */}
          {user && (
            <div className="mt-4">
              <button
                onClick={handleOpenReviewModal}
                className="w-full font-bold py-3 px-4 rounded-md transition-colors flex items-center justify-center space-x-2 bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                <MessageSquare size={18} />
                <span>{userReview ? 'Edit Your Review' : 'Write a Review'}</span>
              </button>
            </div>
          )}

          {/* Description & Details */}
          <div className="mt-10 space-y-4">
            <div>
              <h4 className="font-bold text-lg mb-2 border-b pb-2 dark:border-gray-700">Description</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{product.description}</p>
            </div>
            <div>
              <h4 className="font-bold text-lg mb-3 border-b pb-2 dark:border-gray-700">Product Specifications</h4>
              <ul className="space-y-3 mt-4">
                {product.fabricDetails && product.fabricDetails
                  .split(/,\s*|\s+(?=[A-Z][^:]+:)/)
                  .map(s => s.trim())
                  .filter(Boolean)
                  .map((detail, index) => {
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
                  })}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        product={product}
        user={user}
        existingReview={userReview}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
};

export default ProductDetailPageDebug;