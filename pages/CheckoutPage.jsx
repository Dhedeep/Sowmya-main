import React, { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Minus, Trash2, MapPin, CreditCard, Tag, Check, Edit, X } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import PaymentModal from '../components/PaymentModal';
import { useCart } from '../src/hooks/useCart';
import { clearUserCart } from '../src/firebase/services/cartService';
import { getUserAddresses, saveAddressAsDefault } from '../src/firebase/services/addressService';
import { saveGuestCheckoutData, getGuestCheckoutData, clearGuestCheckoutData } from '../src/firebase/services/guestCartService';
import { getProductById } from '../src/firebase/services/productService';
import { validateCoupon, calculateCouponDiscount, applyCouponAfterOrder } from '../src/firebase/services/couponService';
import { calculateShippingEstimates, validatePreOrderItems, formatPreOrderInfo, calculateSubtotals } from '../src/utils/preOrderUtils';
import { useSettings } from '../src/contexts/SettingsContext';

const CheckoutPage = ({ navigateTo }) => {
  const { user, userData } = useAdmin();
  const { cartItems, updateQuantity, removeFromCart, getCartTotal, getCartItemCount, loading: cartLoading } = useCart();
  const { settings, getTotals, loading: settingsLoading } = useSettings();

  // Debug logging for checkout page
  useEffect(() => {
    console.log('CheckoutPage: Cart items state:', {
      user: user?.email,
      cartItems,
      cartItemsLength: cartItems.length,
      isAuthenticated: !!user,
      cartLoading
    });
  }, [cartItems, user, cartLoading]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India'
  });
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [orderNotes, setOrderNotes] = useState('');
  const [guestDataRestored, setGuestDataRestored] = useState(false);

  useEffect(() => {
    // Fetch saved addresses when user is available
    const fetchAddresses = async () => {
      if (user) {
        try {
          const addresses = await getUserAddresses(user.uid);
          setSavedAddresses(addresses);

          // If there's a default address, select it
          const defaultAddress = addresses.find(addr => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress.id);
            setUseNewAddress(false);
            // Map address fields to match checkout format
            setShippingAddress({
              fullName: defaultAddress.name || userData.displayName || '',
              phone: defaultAddress.phone || userData.phone || '',
              address: defaultAddress.address || '',
              city: defaultAddress.city || '',
              state: defaultAddress.state || '',
              pincode: defaultAddress.postcode || '',
              country: defaultAddress.country || 'India'
            });
          } else if (addresses.length > 0) {
            // If no default, select the first address
            setSelectedAddressId(addresses[0].id);
            setUseNewAddress(false);
            setShippingAddress({
              fullName: addresses[0].name || userData.displayName || '',
              phone: addresses[0].phone || userData.phone || '',
              address: addresses[0].address || '',
              city: addresses[0].city || '',
              state: addresses[0].state || '',
              pincode: addresses[0].postcode || '',
              country: addresses[0].country || 'India'
            });
          } else {
            // No saved addresses, use new address form
            setUseNewAddress(true);
            if (userData) {
              setShippingAddress(prev => ({
                ...prev,
                fullName: userData.displayName || '',
                phone: userData.phone || ''
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching addresses:', error);
          setUseNewAddress(true);
        }
      } else {
        // No user, use new address form
        setUseNewAddress(true);
      }
    };

    fetchAddresses();
  }, [user, userData]);

  // Restore guest checkout data after login (runs once)
  useEffect(() => {
    if (!user || guestDataRestored) return;

    const guestData = getGuestCheckoutData();
    if (!guestData) {
      setGuestDataRestored(true);
      return;
    }

    // Restore shipping address if present and no saved address was selected
    if (guestData.shippingAddress && useNewAddress) {
      setShippingAddress(prev => ({
        ...prev,
        ...guestData.shippingAddress
      }));
    }

    // Restore order notes
    if (guestData.orderNotes) {
      setOrderNotes(guestData.orderNotes);
    }

    // Restore promo code (user still needs to click Apply)
    if (guestData.promoCode) {
      setPromoCode(guestData.promoCode);
    }

    // Clear guest data after restoration
    clearGuestCheckoutData();
    setGuestDataRestored(true);
  }, [user, guestDataRestored, useNewAddress]);

  // Use utility functions to calculate shipping and subtotals
  const shippingData = calculateShippingEstimates(cartItems);
  const subtotals = calculateSubtotals(cartItems);
  const preOrderValidation = validatePreOrderItems(cartItems);

  // Separate regular and pre-order items
  const regularItems = cartItems.filter(item => !item.isPreOrder);
  const preOrderItems = cartItems.filter(item => item.isPreOrder);

  // Calculate shipping based on cart composition
  // Calculate shipping based on cart composition
  const subtotal = subtotals.totalSubtotal;

  // Get dynamic totals from settings
  const userLocation = shippingAddress.state?.toLowerCase().includes('telangana') ? 'local' : 'outside';
  const calculatedTotals = getTotals(subtotal, userLocation);

  const shipping = calculatedTotals?.shipping ?? (subtotal > 1000 ? 0 : 100);
  const tax = calculatedTotals?.tax ?? (subtotal * 0.18);
  const total = subtotal + shipping + tax - discount;

  const shippingInfo = shippingData.shippingInfo;
  const hasPreOrderItems = shippingData.hasPreOrderItems;
  const hasRegularItems = shippingData.hasRegularItems;

  const handleQuantityChange = async (itemId, change, selectedSize, selectedColor) => {
    try {
      const existingItem = cartItems.find(item =>
        item.id === itemId &&
        item.selectedSize === selectedSize &&
        item.selectedColor === selectedColor
      );
      if (!existingItem) return;

      const newQuantity = Math.max(1, existingItem.quantity + change);

      // Use the unified cart hook
      await updateQuantity(itemId, newQuantity, selectedSize, selectedColor);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const removeItem = async (itemId, selectedSize, selectedColor) => {
    try {
      // Use the unified cart hook
      await removeFromCart(itemId, selectedSize, selectedColor);
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const [addressErrors, setAddressErrors] = useState({});

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'fullName':
        if (!/^[A-Za-z\s]+$/.test(value) && value !== '') {
          error = 'Name should only contain alphabets';
        }
        break;
      case 'phone':
        if (value.length > 0 && value.length !== 10) {
          error = 'Phone number must be exactly 10 digits';
        }
        break;
      case 'city':
      case 'state':
      case 'country':
        if (!/^[A-Za-z\s]+$/.test(value) && value !== '') {
          error = `${field.charAt(0).toUpperCase() + field.slice(1)} should only contain alphabets`;
        }
        break;
      case 'pincode':
        if (value.length > 0 && value.length !== 6) {
          error = 'PIN code must be exactly 6 digits';
        }
        break;
      default:
        break;
    }
    return error;
  };

  const handleAddressChange = (field, value) => {
    let filteredValue = value;

    // Strict input filtering based on user requirements
    switch (field) {
      case 'fullName':
      case 'city':
      case 'state':
      case 'country':
        // Only allow alphabets and spaces
        filteredValue = value.replace(/[^A-Za-z\s]/g, '');
        break;
      case 'phone':
        // Only allow numbers, max 10 digits
        filteredValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'pincode':
        // Only allow numbers, max 6 digits
        filteredValue = value.replace(/\D/g, '').slice(0, 6);
        break;
      case 'address':
        // Address allows everything, no filtering needed
        break;
      default:
        break;
    }

    setShippingAddress(prev => ({
      ...prev,
      [field]: filteredValue
    }));

    // Update errors
    const error = validateField(field, filteredValue);
    setAddressErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleAddressSelection = (addressId) => {
    setSelectedAddressId(addressId);
    setUseNewAddress(false);
    const selectedAddress = savedAddresses.find(addr => addr.id === addressId);
    if (selectedAddress) {
      setShippingAddress({
        fullName: selectedAddress.name || userData.displayName || '',
        phone: selectedAddress.phone || userData.phone || '',
        address: selectedAddress.address || '',
        city: selectedAddress.city || '',
        state: selectedAddress.state || '',
        pincode: selectedAddress.postcode || '',
        country: selectedAddress.country || 'India'
      });
    }
  };

  const handleUseNewAddress = () => {
    setUseNewAddress(true);
    setSelectedAddressId('');
    // Reset form with user data if available
    setShippingAddress({
      fullName: userData?.displayName || '',
      phone: userData?.phone || '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    });
  };

  const applyPromoCode = async () => {
    if (!promoCode.trim()) {
      setCouponError('Please enter a coupon code');
      return;
    }

    try {
      setCouponError('');
      const userEmail = user?.email || userData?.email;
      const discountCalculation = await calculateCouponDiscount(promoCode, userEmail, subtotal);

      if (!discountCalculation.valid) {
        setCouponError(discountCalculation.message);
        return;
      }

      setDiscount(discountCalculation.discountAmount);
      setAppliedCoupon(discountCalculation.coupon);
      setCouponError('');
    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('Failed to apply coupon. Please try again.');
    }
  };

  const removeCoupon = () => {
    setPromoCode('');
    setDiscount(0);
    setAppliedCoupon(null);
    setCouponError('');
  };

  const handlePaymentSuccess = async (response) => {
    try {
      // Update coupon usage count after successful payment
      if (appliedCoupon) {
        await applyCouponAfterOrder(appliedCoupon.id);
      }

      // Clear cart after successful payment
      if (user) {
        // For logged-in users, clear cart in Firebase
        await clearUserCart(user.uid);

        // Auto-save shipping address as default for next order (non-blocking)
        saveAddressAsDefault(user.uid, shippingAddress).catch(err =>
          console.error('Non-blocking: Error auto-saving address as default:', err)
        );
      }

      // Clear any leftover guest checkout data
      clearGuestCheckoutData();

      // Navigate to order success page
      navigateTo('orders');

      // Show success message
      if (response.method === 'COD') {
        alert(response.message);
      } else {
        alert('Payment successful! Your order has been placed.');
      }
    } catch (error) {
      console.error('Error processing payment success:', error);
      // Still navigate even if coupon update or cart clear fails
      navigateTo('orders');
    }
  };

  const handlePaymentError = (error) => {
    alert(error);
  };

  const proceedToPayment = () => {
    if (!user) {
      // Save checkout data so it persists through the login flow
      saveGuestCheckoutData({
        shippingAddress,
        orderNotes,
        promoCode
      });
      alert('Please login to continue with checkout');
      navigateTo('login');
      return;
    }

    // Validate shipping address
    const requiredFields = ['fullName', 'phone', 'address', 'city', 'state', 'pincode'];
    const missingFields = requiredFields.filter(field => !shippingAddress[field]);

    if (missingFields.length > 0) {
      alert('Please fill in all required shipping address fields');
      return;
    }

    // Check for validation errors
    const activeErrors = Object.values(addressErrors).filter(error => error !== '');
    if (activeErrors.length > 0) {
      alert('Please fix the errors in the shipping address form:\n' + activeErrors.join('\n'));
      return;
    }

    // Final checks for specific field lengths (strict rules)
    if (shippingAddress.phone.length !== 10) {
      alert('Phone number must be exactly 10 digits');
      return;
    }
    if (shippingAddress.pincode.length !== 6) {
      alert('PIN code must be exactly 6 digits');
      return;
    }

    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Validate that all items have size and color selected
    const itemsWithoutSizeOrColor = cartItems.filter(item => {
      // Check if item has size options but no size selected
      const hasSizeOptions = item.sizes && item.sizes.length > 0;
      const missingSize = hasSizeOptions && !item.selectedSize;

      // Check if item has color options but no color selected
      const hasColorOptions = item.colors && item.colors.length > 0;
      const missingColor = hasColorOptions && !item.selectedColor;

      return missingSize || missingColor;
    });

    if (itemsWithoutSizeOrColor.length > 0) {
      const itemNames = itemsWithoutSizeOrColor.map(item => item.name).join(', ');
      alert(`Please select size and/or color for the following items: ${itemNames}`);
      return;
    }

    // Prepare order data
    const orderData = {
      items: cartItems.map(item => ({
        ...item,
        price: parseFloat(item.price) || 0
      })),
      subtotal,
      shipping,
      tax,
      discount,
      total,
      shippingAddress,
      promoCode: promoCode || null,
      orderNotes,
      createdAt: new Date()
    };

    setIsPaymentModalOpen(true);
  };

  // Show loading state while cart is being fetched
  if (cartLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading your cart...</p>
        </div>
      </div>
    );
  }

  // Show empty cart message only after loading is complete
  if (!cartLoading && cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 dark:text-white">Your Cart is Empty</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">Add some items to your cart to proceed with checkout</p>
          <button
            onClick={() => navigateTo('shop')}
            className="px-6 py-3 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigateTo('shop')}
        className="flex items-center gap-2 text-brand-primary hover:opacity-80 mb-6"
      >
        <ArrowLeft size={20} />
        Back to Shopping
      </button>

      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Cart Items and Shipping */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cart Items */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Items</h2>

            {/* Regular Items */}
            {regularItems.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 text-gray-700 dark:text-gray-300">Regular Items</h3>
                <div className="space-y-4">
                  {regularItems.map((item) => (
                    <div key={`${item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`} className="flex items-center gap-4 pb-4 border-b dark:border-gray-700 last:border-0">
                      <img
                        src={item.image || item.images?.[0]}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-medium dark:text-white">{item.name}</h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.selectedSize && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                              Color:
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: item.selectedColor.toLowerCase().replace(' ', '') }}
                                title={item.selectedColor}
                              ></span>
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-600 dark:text-gray-400">
                            ₹{(parseFloat(item.discountedPrice || item.price) || 0).toFixed(2)}
                          </p>
                          {item.discountedPrice && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 line-through">
                              ₹{(parseFloat(item.price) || 0).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1, item.selectedSize, item.selectedColor)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1, item.selectedSize, item.selectedColor)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold dark:text-white">
                          ₹{((parseFloat(item.discountedPrice || item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pre-order Items */}
            {preOrderItems.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3 text-purple-700 dark:text-purple-300">Pre-order Items</h3>
                <div className="space-y-4">
                  {preOrderItems.map((item) => (
                    <div key={`${item.id}-${item.selectedSize || 'default'}-${item.selectedColor || 'default'}`} className="flex items-center gap-4 pb-4 border-b dark:border-gray-700 last:border-0">
                      <img
                        src={item.image || item.images?.[0]}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-grow">
                        <h3 className="font-medium dark:text-white flex items-center gap-2">
                          {item.name}
                          <span className="text-xs bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-100 px-2 py-1 rounded-full">
                            Pre-order
                          </span>
                        </h3>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {item.selectedSize && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                              Size: {item.selectedSize}
                            </span>
                          )}
                          {item.selectedColor && (
                            <span className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded flex items-center gap-1">
                              Color:
                              <span
                                className="w-3 h-3 rounded-full border border-gray-300 dark:border-gray-600"
                                style={{ backgroundColor: item.selectedColor.toLowerCase().replace(' ', '') }}
                                title={item.selectedColor}
                              ></span>
                              {item.selectedColor}
                            </span>
                          )}
                        </div>
                        {(() => {
                          const preOrderInfo = formatPreOrderInfo(item);
                          return (
                            <>
                              {preOrderInfo.shippingInfo && (
                                <div className="text-sm text-purple-600 dark:text-purple-400 mt-1">
                                  {preOrderInfo.shippingInfo}
                                </div>
                              )}
                              {preOrderInfo.message && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 italic">
                                  {preOrderInfo.message}
                                </div>
                              )}
                            </>
                          );
                        })()}
                        <div className="flex items-center gap-2 mt-1">
                          <p className="text-gray-600 dark:text-gray-400">
                            ₹{(parseFloat(item.discountedPrice || item.price) || 0).toFixed(2)}
                          </p>
                          {item.discountedPrice && (
                            <p className="text-sm text-gray-500 dark:text-gray-500 line-through">
                              ₹{(parseFloat(item.price) || 0).toFixed(2)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, -1, item.selectedSize, item.selectedColor)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, 1, item.selectedSize, item.selectedColor)}
                          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold dark:text-white">
                          ₹{((parseFloat(item.discountedPrice || item.price) || 0) * (item.quantity || 1)).toFixed(2)}
                        </p>
                        <button
                          onClick={() => removeItem(item.id, item.selectedSize, item.selectedColor)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shipping Information for Pre-order / Mixed Carts */}
            {shippingInfo && hasPreOrderItems && (
              <div className="mt-4 p-3 bg-brand-primary/10 dark:bg-brand-primary/20 border border-brand-primary/30 dark:border-brand-primary/50 rounded-md">
                <p className="text-sm text-brand-primary dark:text-brand-secondary">
                  {shippingInfo}
                </p>
              </div>
            )}
          </div>

          {/* Shipping Address */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white flex items-center gap-2">
              <MapPin size={20} />
              Shipping Address
            </h2>

            {/* Saved Addresses */}
            {user && savedAddresses.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-3 dark:text-white">Select a saved address</h3>
                <div className="space-y-3">
                  {savedAddresses.map((address) => (
                    <div
                      key={address.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${selectedAddressId === address.id && !useNewAddress
                        ? 'border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                      onClick={() => handleAddressSelection(address.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-grow">
                          <div className="flex items-center gap-2 mb-2">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${selectedAddressId === address.id && !useNewAddress
                              ? 'border-brand-primary bg-brand-primary'
                              : 'border-gray-300 dark:border-gray-600'
                              }`}>
                              {selectedAddressId === address.id && !useNewAddress && (
                                <Check size={12} className="text-white" />
                              )}
                            </div>
                            <span className="font-medium dark:text-white">{address.name}</span>
                            {address.isDefault && (
                              <span className="text-xs bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 px-2 py-1 rounded-full">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                            <p>{address.address}</p>
                            {address.apartment && <p>{address.apartment}</p>}
                            <p>{address.city}, {address.state} {address.postcode}</p>
                            <p>{address.country}</p>
                            <p>{address.phone}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleUseNewAddress}
                  className={`mt-4 w-full py-3 px-4 rounded-md border-2 border-dashed transition-colors ${useNewAddress
                    ? 'border-brand-primary bg-brand-primary/10 dark:bg-brand-primary/20 text-brand-primary dark:text-brand-secondary'
                    : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500'
                    }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Plus size={18} />
                    <span>Use a new address</span>
                  </div>
                </button>
              </div>
            )}

            {/* New Address Form */}
            {(!user || savedAddresses.length === 0 || useNewAddress) && (
              <div>
                {user && savedAddresses.length > 0 && (
                  <h3 className="text-lg font-medium mb-3 dark:text-white">Enter a new address</h3>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-2 dark:text-gray-300">Full Name *</label>
                    <input
                      id="fullName"
                      type="text"
                      value={shippingAddress.fullName}
                      onChange={(e) => handleAddressChange('fullName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${addressErrors.fullName ? 'border-red-500 focus:ring-brand-primary' : 'focus:ring-brand-primary'}`}
                      required
                    />
                    {addressErrors.fullName && <p className="text-red-500 text-xs mt-1">{addressErrors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-2 dark:text-gray-300">Phone *</label>
                    <input
                      id="phone"
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) => handleAddressChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${addressErrors.phone ? 'border-red-500 focus:ring-brand-primary' : 'focus:ring-brand-primary'}`}
                      required
                      placeholder="10-digit number"
                    />
                    {addressErrors.phone && <p className="text-red-500 text-xs mt-1">{addressErrors.phone}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium mb-2 dark:text-gray-300">Address *</label>
                    <textarea
                      id="address"
                      value={shippingAddress.address}
                      onChange={(e) => handleAddressChange('address', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2 dark:text-gray-300">City *</label>
                    <input
                      id="city"
                      type="text"
                      value={shippingAddress.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${addressErrors.city ? 'border-red-500 focus:ring-brand-primary' : 'focus:ring-brand-primary'}`}
                      required
                    />
                    {addressErrors.city && <p className="text-red-500 text-xs mt-1">{addressErrors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm font-medium mb-2 dark:text-gray-300">State *</label>
                    <input
                      id="state"
                      type="text"
                      value={shippingAddress.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${addressErrors.state ? 'border-red-500 focus:ring-brand-primary' : 'focus:ring-brand-primary'}`}
                      required
                    />
                    {addressErrors.state && <p className="text-red-500 text-xs mt-1">{addressErrors.state}</p>}
                  </div>
                  <div>
                    <label htmlFor="pincode" className="block text-sm font-medium mb-2 dark:text-gray-300">PIN Code *</label>
                    <input
                      id="pincode"
                      type="text"
                      value={shippingAddress.pincode}
                      onChange={(e) => handleAddressChange('pincode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${addressErrors.pincode ? 'border-red-500 focus:ring-brand-primary' : 'focus:ring-brand-primary'}`}
                      required
                      placeholder="6-digit number"
                    />
                    {addressErrors.pincode && <p className="text-red-500 text-xs mt-1">{addressErrors.pincode}</p>}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium mb-2 dark:text-gray-300">Country</label>
                    <input
                      id="country"
                      type="text"
                      value={shippingAddress.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${addressErrors.country ? 'border-red-500 focus:ring-brand-primary' : 'focus:ring-brand-primary'}`}
                    />
                    {addressErrors.country && <p className="text-red-500 text-xs mt-1">{addressErrors.country}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Order Notes */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Notes (Optional)</h2>
            <textarea
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
              rows={3}
              placeholder="Any special instructions for your order..."
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>
        </div>

        {/* Right Column - Order Summary */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Summary</h2>

            {/* Promo Code */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2 dark:text-gray-300">Coupon Code</label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Enter coupon code"
                    className="flex-1 px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    disabled={!!appliedCoupon}
                  />
                  {!appliedCoupon ? (
                    <button
                      onClick={applyPromoCode}
                      className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-1"
                    >
                      <Tag size={16} />
                      Apply
                    </button>
                  ) : (
                    <button
                      onClick={removeCoupon}
                      className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300 rounded-md hover:bg-red-200 dark:hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                      <X size={16} />
                      Remove
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md p-3 mt-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                          Coupon Applied: {appliedCoupon.code}
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          {appliedCoupon.description || `${appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.discountValue}% off` : `₹${appliedCoupon.discountValue} off`}`}
                        </p>
                      </div>
                      <Check className="text-green-600 dark:text-green-400" size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pre-order Information */}
            {hasPreOrderItems && (
              <div className="mb-4 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-md">
                <h4 className="font-medium text-purple-800 dark:text-purple-200 mb-2">Pre-order Information</h4>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1">
                  <li>• Pre-order items will be shipped on their expected dates</li>
                  <li>• You will be notified when pre-order items are ready to ship</li>
                  <li>• Payment is processed at the time of order</li>
                  {hasRegularItems && <li>• Regular items will be shipped separately</li>}
                </ul>
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-2 border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                <span className="dark:text-white">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Shipping:</span>
                <span className="dark:text-white">
                  {shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">
                  {settings?.taxType || 'Tax'}{tax > 0 ? ` (${settings?.taxPercentage ?? 18}%)` : ''}:
                </span>
                <span className="dark:text-white">₹{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-600 dark:text-green-400">
                  <span>Discount:</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="border-t dark:border-gray-700 pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span className="dark:text-white">Total:</span>
                  <span className="dark:text-white">₹{total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={proceedToPayment}
              className="w-full mt-6 px-6 py-3 bg-brand-primary text-white font-medium rounded-md hover:opacity-90 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-primary/20"
            >
              <CreditCard size={20} />
              Proceed to Payment
            </button>

            {/* Security Note */}
            <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
              <p>Secure checkout powered by Razorpay</p>
              <p>Your payment information is encrypted and secure</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        orderData={{
          items: cartItems,
          subtotal,
          shipping,
          tax,
          discount,
          total,
          shippingAddress,
          promoCode,
          orderNotes
        }}
        onPaymentSuccess={handlePaymentSuccess}
        onPaymentError={handlePaymentError}
      />
    </div>
  );
};

export default CheckoutPage;