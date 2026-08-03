import React, { useState, useMemo, useEffect } from 'react';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import { ChevronDown, ShoppingCart } from 'lucide-react';
import { getAllProducts, getProductsWithStock, getProductsByCategoryOrSubcategory } from '../src/firebase/services/productService';
import { useProductContext } from '../src/contexts/ProductContext';
import { useCart } from '../src/hooks/useCart';
import { useWishlist } from '../src/hooks/useWishlist';
import { useAdmin } from '../src/contexts/AdminContext';
import { useCategoryContext } from '../src/contexts/CategoryContext';
import { useLocation } from 'react-router-dom';

const ShopPage = ({ viewProduct, navigateTo }) => {
  const { user } = useAdmin();
  const location = useLocation();
  const { getProductsByOptions, loading, refresh, invalidateProductCache } = useProductContext();
  const { categoriesWithSubcategories, loading: loadingCategories } = useCategoryContext();
  const { cartItems, addToCart, updateQuantity, removeFromCart, getItemQuantity } = useCart();
  const {
    wishlistItems,
    toggleWishlist,
    isItemInWishlist,
    syncGuestWishlistToUser
  } = useWishlist();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
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

      // Check if product requires size or color selection
      const hasSizeOptions = product.sizes && product.sizes.length > 0;
      const hasColorOptions = product.colors && product.colors.length > 0;

      // Auto-select first size and color if available
      const productToAdd = { ...product };
      if (hasSizeOptions) {
        productToAdd.selectedSize = product.sizes[0];
      }
      if (hasColorOptions) {
        productToAdd.selectedColor = product.colors[0];
      }

      // Use the unified cart hook
      await addToCart(productToAdd);
    } catch (error) {
      console.error('Error adding to cart:', error);
      alert(error.message || 'Error adding to cart');
    }
  };

  const handleUpdateQuantity = async (productId, change) => {
    try {
      const existingItem = cartItems.find(item => item.id === productId);
      if (!existingItem) return;

      const newQuantity = Math.max(1, existingItem.quantity + change);

      // Use the unified cart hook
      await updateQuantity(productId, newQuantity, existingItem.selectedSize, existingItem.selectedColor);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId) => {
    try {
      const existingItem = cartItems.find(item => item.id === productId);
      if (!existingItem) return;

      // Use the unified cart hook
      await removeFromCart(productId, existingItem.selectedSize, existingItem.selectedColor);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const getCartQuantity = (productId) => {
    return getItemQuantity(productId);
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
  useEffect(() => {
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

  useEffect(() => {
    const cachedProducts = getProductsByOptions({ includeStock: true });
    setProducts(cachedProducts);
  }, [getProductsByOptions]);

  useEffect(() => {
    setCategories(categoriesWithSubcategories);
  }, [categoriesWithSubcategories]);

  // Get category from URL parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const decodedCategory = categoryParam ? decodeURIComponent(categoryParam).replace(/-/g, ' ') : null;

    setFilters(prev => {
      let categoryToSet = 'all';

      if (decodedCategory) {
        // Try to find matching ID
        const findCategoryInData = (categories, name) => {
          for (const category of categories) {
            if (category.name.toLowerCase() === name.toLowerCase()) return category.id;
            if (category.subcategories) {
              const subcatMatch = category.subcategories.find(
                sub => sub.name.toLowerCase() === name.toLowerCase()
              );
              if (subcatMatch) return subcatMatch.id;
            }
          }
          return null;
        };

        const matchingId = findCategoryInData(categories, decodedCategory);
        categoryToSet = matchingId || decodedCategory;
      }

      if (prev.category === categoryToSet) return prev;
      return { ...prev, category: categoryToSet };
    });
  }, [location.search, categories]);

  const [filters, setFilters] = useState({
    category: 'all',
    price: 'all',
    minPrice: 500,
    maxPrice: 10000,
    stockStatus: 'all',
  });

  const [expandedCategories, setExpandedCategories] = useState({});

  const [expandedAccordionPanels, setExpandedAccordionPanels] = useState({
    'panelsCategories': true,
    'panelsPrice': false,
    'panelsStock': false
  });

  // Initialize expanded categories state when categories are loaded
  useEffect(() => {
    if (categories.length > 0) {
      const initialExpanded = {};
      categories.forEach(cat => {
        initialExpanded[cat.name] = true; // Expand first category by default
      });
      setExpandedCategories(initialExpanded);
    }
  }, [categories]);

  const toggleCategoryExpansion = (category) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const toggleAccordionPanel = (panelId) => {
    setExpandedAccordionPanels(prev => ({
      ...prev,
      [panelId]: !prev[panelId]
    }));
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
  };

  const handlePricePresetChange = (value) => {
    setFilters(prev => ({ ...prev, price: value }));
  };

  const handleStockStatusChange = (value) => {
    setFilters(prev => ({
      ...prev,
      stockStatus: prev.stockStatus === value ? 'all' : value
    }));
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // New arrivals logic: if subcategory is 'new-arrivals', it ONLY shows in the new arrivals section
      const isNewArrival = product.subcategory === 'new-arrivals' || product.subcategoryName === 'New Arrivals';

      const isNewArrivalFilter = filters.category === 'new-arrivals' || filters.category === 'new arrivals';

      if (isNewArrivalFilter) {
        return isNewArrival;
      }

      // Show all products by default in their respective categories and 'All' view

      // regular filtering logic...
      const getCategoryMatchInfo = (filterValue) => {
        if (filterValue === 'all') return { id: 'all', name: 'all' };
        if (filterValue === 'new-arrivals' || filterValue === 'new arrivals') return { id: 'new-arrivals', name: 'New Arrivals' };

        for (const category of categories) {
          if (category.id === filterValue || category.name === filterValue) {
            return { id: category.id, name: category.name };
          }
          if (category.subcategories) {
            const subcat = category.subcategories.find(sub => sub.id === filterValue || sub.name === filterValue);
            if (subcat) return { id: subcat.id, name: subcat.name };
          }
        }
        return { id: filterValue, name: filterValue };
      };

      const catMatchInfo = getCategoryMatchInfo(filters.category);

      const categoryMatch = filters.category === 'all' ||
        product.category === catMatchInfo.id ||
        product.category === catMatchInfo.name ||
        product.subcategory === catMatchInfo.id ||
        product.subcategory === catMatchInfo.name;

      // Fix price filtering logic
      let priceMatch = false;
      if (filters.price === 'all') {
        const min = filters.minPrice || 0;
        const max = filters.maxPrice || 1000000;
        priceMatch = product.price >= min && product.price <= max;
      } else {
        if (filters.price === 'under1000') priceMatch = product.price < 1000;
        else if (filters.price === '1000to1500') priceMatch = product.price >= 1000 && product.price <= 1500;
        else if (filters.price === 'over1500') priceMatch = product.price > 1500;
      }

      const stockMatch = filters.stockStatus === 'all' ||
        (filters.stockStatus === 'in_stock' && product.stock > 0) ||
        (filters.stockStatus === 'out_stock' && (product.stock <= 0 || !product.stock)) ||
        (filters.stockStatus === 'pre' && (product.preOrder || product.isPreOrder));

      return categoryMatch && priceMatch && stockMatch;
    });
  }, [products, filters, categories]);

  const prices = [
    { value: 'all', label: 'All Prices' },
    { value: 'under1000', label: 'Under ₹1000' },
    { value: '1000to1500', label: '₹1000 - ₹1500' },
    { value: 'over1500', label: 'Over ₹1500' },
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <style>{`
          .accordion-collapse {
            transition: all 0.3s ease-in-out;
            overflow: hidden;
          }
          .accordion-collapse.show {
            display: block !important;
            opacity: 1;
            max-height: 2000px;
          }
          .accordion-collapse.hidden {
            display: none !important;
            opacity: 0;
            max-height: 0;
          }
          .accordion-button {
            transition: background-color 0.2s ease;
          }
          .accordion-button:hover {
            background-color: rgba(0, 0, 0, 0.05);
          }
          .dark .accordion-button:hover {
            background-color: rgba(255, 255, 255, 0.05);
          }
          .form-check-input:checked {
            background-color: #640d5F;
            border-color: #640d5F;
          }
          .form-check-input:focus {
            border-color: #640d5F;
            box-shadow: 0 0 0 0.2rem rgba(100, 13, 95, 0.25);
          }
        `}</style>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar */}
        <div className="col-12 col-lg-3 shop-sidebar shop-sidebar-desktop lg:w-1/4">
          <div className="accordion" id="accordionPanelsCategory">
            {/* Product Categories */}
            <div className="accordion-item mb-4">
              <h2 className="accordion-header">
                <button
                  className="accordion-button w-full text-left p-4 bg-gray-100 rounded-t-lg font-semibold flex justify-between items-center"
                  type="button"
                  onClick={() => toggleAccordionPanel('panelsCategories')}
                  aria-expanded={expandedAccordionPanels['panelsCategories']}
                  aria-controls="panelsCategories"
                >
                  <span>Product Categories</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedAccordionPanels['panelsCategories'] ? 'rotate-180' : ''}`}
                  />
                </button>
              </h2>
              <div id="panelsCategories" className={`accordion-collapse ${expandedAccordionPanels['panelsCategories'] ? 'show' : 'hidden'}`}>
                <div className="accordion-body p-4 bg-white border border-gray-200 rounded-b-lg">
                  <form className="has-validation-callback">
                    <div className="category-list">
                      {/* "All" option */}
                      <div className="form-check mb-2">
                        <input
                          name="category"
                          id="cate-all"
                          className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mr-2"
                          type="radio"
                          value="all"
                          onChange={() => handleFilterChange('category', 'all')}
                          checked={filters.category === 'all'}
                        />
                        <label className="form-check-label cursor-pointer text-gray-800" htmlFor="cate-all">
                          All Categories
                        </label>
                      </div>

                      {/* Dynamic Categories from Firebase */}
                      {loadingCategories ? (
                        <div className="text-center py-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary mx-auto"></div>
                          <p className="text-sm text-gray-500 mt-2">Loading categories...</p>
                        </div>
                      ) : (
                        categories.map((category) => (
                          <div key={category.id}>
                            {/* Main Category */}
                            <div className="form-check mb-2" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                <input
                                  name="category"
                                  id={`cate-${category.id}`}
                                  className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mr-2"
                                  type="radio"
                                  value={category.id}
                                  onChange={() => handleFilterChange('category', category.id)}
                                  checked={filters.category === category.id}
                                />
                                <label
                                  className="form-check-label cursor-pointer text-gray-800"
                                  htmlFor={`cate-${category.id}`}
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleCategoryExpansion(category.name);
                                  }}
                                >
                                  {category.name}
                                </label>
                                {category.subcategories && category.subcategories.length > 0 && (
                                  <button
                                    type="button"
                                    className="toggle-nested ml-2 p-1 hover:bg-gray-200 rounded"
                                    onClick={() => toggleCategoryExpansion(category.name)}
                                  >
                                    <ChevronDown
                                      className={`w-4 h-4 transition-transform ${expandedCategories[category.name] ? 'rotate-180' : ''}`}
                                    />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Subcategories */}
                            {category.subcategories && expandedCategories[category.name] && (
                              <div className="ml-4 border-l-2 border-gray-200 pl-4">
                                {category.subcategories.map((subcategory) => (
                                  <div key={subcategory.id} className="form-check mb-2">
                                    <input
                                      name="category"
                                      id={`cate-${subcategory.id}`}
                                      className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mr-2"
                                      type="radio"
                                      value={subcategory.id}
                                      onChange={() => handleFilterChange('category', subcategory.id)}
                                      checked={filters.category === subcategory.id}
                                    />
                                    <label className="form-check-label cursor-pointer text-gray-800" htmlFor={`cate-${subcategory.id}`}>
                                      {subcategory.name}
                                    </label>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </form>
                </div>
              </div>
            </div>


            {/* Price Filter */}
            <div className="accordion-item mb-4">
              <h2 className="accordion-header">
                <button
                  className="accordion-button w-full text-left p-4 bg-gray-100 rounded-t-lg font-semibold flex justify-between items-center"
                  type="button"
                  onClick={() => toggleAccordionPanel('panelsPrice')}
                  aria-expanded={expandedAccordionPanels['panelsPrice']}
                  aria-controls="panelsPrice"
                >
                  <span>Price</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedAccordionPanels['panelsPrice'] ? 'rotate-180' : ''}`}
                  />
                </button>
              </h2>
              <div id="panelsPrice" className={`accordion-collapse ${expandedAccordionPanels['panelsPrice'] ? 'show' : 'hidden'}`}>
                <div className="accordion-body p-4 bg-white border border-gray-200 rounded-b-lg">
                  <div className="filter level-filter level-req">
                    {/* Price Presets */}
                    <div className="mb-4">
                      {prices.map((priceOption) => (
                        <div key={priceOption.value} className="form-check mb-2">
                          <input
                            name="price"
                            id={`price-${priceOption.value}`}
                            className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary mr-2"
                            type="radio"
                            value={priceOption.value}
                            onChange={() => handlePricePresetChange(priceOption.value)}
                            checked={filters.price === priceOption.value}
                          />
                          <label className="form-check-label cursor-pointer text-gray-800" htmlFor={`price-${priceOption.value}`}>
                            {priceOption.label}
                          </label>
                        </div>
                      ))}
                    </div>

                    {/* Custom Price Range */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-800">Min: ₹{filters.minPrice || 500}</span>
                        <span className="text-sm text-gray-800">Max: ₹{filters.maxPrice || 10000}</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="range"
                          min="500"
                          max="10000"
                          step="100"
                          value={filters.minPrice || 500}
                          onChange={(e) => setFilters(prev => ({ ...prev, minPrice: parseInt(e.target.value), price: 'all' }))}
                          className="flex-1"
                        />
                        <input
                          type="range"
                          min="500"
                          max="10000"
                          step="100"
                          value={filters.maxPrice || 10000}
                          onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: parseInt(e.target.value), price: 'all' }))}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stock Status Filter */}
            <div className="accordion-item mb-4">
              <h2 className="accordion-header">
                <button
                  className="accordion-button w-full text-left p-4 bg-gray-100 rounded-t-lg font-semibold flex justify-between items-center"
                  type="button"
                  onClick={() => toggleAccordionPanel('panelsStock')}
                  aria-expanded={expandedAccordionPanels['panelsStock']}
                  aria-controls="panelsStock"
                >
                  <span>Stock Status</span>
                  <ChevronDown
                    className={`w-5 h-5 transition-transform ${expandedAccordionPanels['panelsStock'] ? 'rotate-180' : ''}`}
                  />
                </button>
              </h2>
              <div id="panelsStock" className={`accordion-collapse ${expandedAccordionPanels['panelsStock'] ? 'show' : 'hidden'}`}>
                <div className="accordion-body p-4 bg-white border border-gray-200 rounded-b-lg">
                  <form className="has-validation-callback">
                    <div className="form-check mb-2 flex items-center">
                      <input name="chkstockstatus[]" id="inStock" className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer" type="checkbox" value="in_stock" onChange={() => handleStockStatusChange('in_stock')} checked={filters.stockStatus === 'in_stock'} />
                      <label className="form-check-label cursor-pointer text-gray-800 ml-2 text-sm font-semibold tracking-wider" htmlFor="inStock">IN STOCK</label>
                    </div>
                    <div className="form-check mb-2 flex items-center">
                      <input name="chkstockstatus[]" id="outStock" className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer" type="checkbox" value="out_stock" onChange={() => handleStockStatusChange('out_stock')} checked={filters.stockStatus === 'out_stock'} />
                      <label className="form-check-label cursor-pointer text-gray-800 ml-2 text-sm font-semibold tracking-wider" htmlFor="outStock">OUT OF STOCK</label>
                    </div>
                    <div className="form-check mb-2 flex items-center">
                      <input name="chkstockstatus[]" id="preOrder" className="w-4 h-4 text-brand-primary border-gray-300 rounded focus:ring-brand-primary cursor-pointer" type="checkbox" value="pre" onChange={() => handleStockStatusChange('pre')} checked={filters.stockStatus === 'pre'} />
                      <label className="form-check-label cursor-pointer text-gray-800 ml-2 text-sm font-semibold tracking-wider" htmlFor="preOrder">PRE ORDER</label>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="lg:w-3/4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-extrabold">
              {filters.category === 'all' ? 'All Products' :
                (() => {
                  const findCategoryName = (id) => {
                    if (id === 'new-arrivals' || id === 'new arrivals') return 'New Arrivals';
                    for (const category of categories) {
                      if (category.id === id) return category.name;
                      if (category.subcategories) {
                        const subcat = category.subcategories.find(sub => sub.id === id);
                        if (subcat) return subcat.name;
                      }
                    }
                    return 'Category';
                  };
                  return findCategoryName(filters.category);
                })()
              }
            </h1>
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-6">
            <button
              className="w-full bg-gray-100 p-3 rounded-lg text-left font-semibold flex justify-between items-center"
              onClick={() => document.getElementById('mobileFilters').classList.toggle('hidden')}
            >
              <span>Filters</span>
              <ChevronDown className="transition-transform" />
            </button>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                viewProduct={viewProduct}
                toggleWishlist={handleWishlistToggle}
                isInWishlist={isItemInWishlist(product.id)}
                addToCart={handleAddToCart}
                updateQuantity={handleUpdateQuantity}
                removeFromCart={handleRemoveFromCart}
                cartQuantity={getCartQuantity(product.id)}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center col-span-full py-16">
              <p className="text-xl text-gray-600">No products match your filters.</p>
            </div>
          )}
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
      </div>
    </div>
  );
};

export default ShopPage;