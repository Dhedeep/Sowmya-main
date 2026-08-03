import React, { useState, useEffect, createContext } from 'react';
import { Routes, Route, useNavigate, useLocation, useParams } from 'react-router-dom';
import { scrollToTop, useScrollToTop } from './src/utils/scrollUtils';
import { Product, Page } from './types';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import AboutPage from './pages/AboutPage';
import DashboardPage from './pages/DashboardPage';
import OrdersPage from './pages/OrdersPage';
import AddressesPage from './pages/AddressesPage';
import AccountDetailsPage from './pages/AccountDetailsPage';
import DownloadsPage from './pages/DownloadsPage';
import CheckoutPage from './pages/CheckoutPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import WishlistSidebar from './components/WishlistSidebar';
import WishlistPage from './pages/WishlistPage';
import ReturnsPolicyPage from './pages/ReturnsPolicyPage';
import TermsConditionsPage from './pages/TermsConditionsPage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import ShippingPolicyPage from './pages/ShippingPolicyPage';
import ContactPage from './pages/ContactPage';
import LoginModal from './components/LoginModal';
import LogoutSuccessModal from './components/LogoutSuccessModal';
import { AdminProvider, useAdmin } from './src/contexts/AdminContext';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProductProvider } from './src/contexts/ProductContext';
import { CategoryProvider } from './src/contexts/CategoryContext';
import { SettingsProvider } from './src/contexts/SettingsContext';
import { useCart } from './src/hooks/useCart';
import { useRealtimeWishlist } from './src/hooks/useRealtimeCart';
import { useWishlist } from './src/hooks/useWishlist';
import { initializeFirebaseData } from './src/firebase/initData';
import { saveUserCart, saveUserWishlist } from './src/firebase/services/cartService';
import { getProductById } from './src/firebase/services/productService';
import WhatsAppWidget from './components/WhatsAppWidget';

export const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => { },
});

const AppContent = () => {
  const { user } = useAdmin();
  const navigate = useNavigate();
  const location = useLocation();

  // Use unified cart hook and real-time wishlist hook
  const { cartItems, loading: cartLoading, getCartTotal, getCartItemCount } = useCart();
  const { wishlistItems, loading: wishlistLoading, getWishlistItemCount } = useRealtimeWishlist();
  const { toggleWishlist: toggleWishlistHook, syncGuestWishlistToUser } = useWishlist();

  // Automatically scroll to top on route change
  useScrollToTop();
  const [theme] = useState('light');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark');
  }, []);

  // Theme persistence disabled - forcing light mode
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('theme');
    }
  }, []);

  // Initialize Firebase data on app start
  useEffect(() => {
    const initializeData = async () => {
      try {
        const { checkDataInitialized } = await import('./src/firebase/initData');
        const isInitialized = await checkDataInitialized();

        if (!isInitialized) {
          console.log('Firebase data not initialized, initializing now...');
          await initializeFirebaseData();
        } else {
          console.log('Firebase data already initialized');
        }
      } catch (error) {
        console.error('Failed to initialize Firebase data:', error);
      }
    };

    initializeData();
  }, []);

  // Cart and wishlist are now handled by real-time hooks
  // No need for localStorage effects or manual Firebase loading

  // Auto-redirect admin users to admin dashboard only on initial login or when accessing home
  useEffect(() => {
    const hasRedirected = sessionStorage.getItem('adminRedirected');
    if (user && user.email === 'admin@sowmyaselections.com' && !hasRedirected) {
      // Only redirect if user is on home page or login page
      if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
        console.log('Admin user detected on home/login page, redirecting to admin dashboard');
        navigate('/admin');
        sessionStorage.setItem('adminRedirected', 'true');
      } else {
        // If admin is accessing other pages, set the flag but don't redirect
        sessionStorage.setItem('adminRedirected', 'true');
      }
    }
  }, [user, navigate, location.pathname]);

  // Prevent regular users from accessing admin dashboard
  useEffect(() => {
    if (location.pathname === '/admin' && user && user.email !== 'admin@sowmyaselections.com') {
      console.log('Regular user trying to access admin dashboard, redirecting to user dashboard');
      navigate('/dashboard');
    }

    // Clear admin redirect flag when user logs out
    if (!user) {
      sessionStorage.removeItem('adminRedirected');
    }
  }, [location.pathname, user, navigate]);

  const toggleTheme = () => {
    // Theme toggle disabled to force light mode
    console.log('Theme toggle is disabled');
  };

  const navigateTo = (page) => {
    const routeMap = {
      'home': '/',
      'shop': '/shop',
      'about': '/about',
      'contact': '/contact',
      'product': '/product',
      'checkout': '/checkout',
      'dashboard': '/dashboard',
      'admin': '/admin',
      'orders': '/orders',
      'downloads': '/downloads',
      'addresses': '/addresses',
      'account-details': '/account-details',
      'wishlist': '/wishlist',
      'returns-policy': '/returns-policy',
      'terms-conditions': '/terms-conditions',
      'privacy-policy': '/privacy-policy',
      'shipping-policy': '/shipping-policy',
      'login': '/login',
      'register': '/register'
    };

    const path = routeMap[page] || '/';
    navigate(path);
    scrollToTop();
  };

  const viewProduct = (product) => {
    // Navigate to specific product page using its ID
    if (product && product.id) {
      // Convert ID to string to ensure proper URL formatting
      const productId = String(product.id);
      navigate(`/product/${productId}`);
      // Scroll to top after navigation
      scrollToTop();
    } else {
      // Fallback to old behavior if no ID is available
      setSelectedProduct(product);
      navigate('/product');
      // Scroll to top after navigation
      scrollToTop();
    }
  };

  const updateCart = (newCart) => {
    // Cart is now managed by the unified cart hook
    // This function is kept for compatibility but will be replaced by hook functions
    console.log('updateCart called - cart is now managed by the unified cart hook');
  };

  const toggleWishlist = async (product) => {
    // Use the wishlist hook for proper functionality
    try {
      await toggleWishlistHook(product);
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const resetCartAndWishlist = () => {
    // Cart and wishlist are now managed by real-time hooks
    // This function is kept for compatibility but will be replaced by hook functions
    console.log('resetCartAndWishlist called - cart and wishlist are now managed by real-time hooks');
    // Clear localStorage for guest users
    localStorage.removeItem('guestCart');
    localStorage.removeItem('guestWishlist');
  };

  const handleLogout = async () => {
    try {
      const { signOutUser } = await import('./src/firebase/services/authService');
      await signOutUser();
      resetCartAndWishlist();
      setIsLogoutModalOpen(true);
      // Redirect to home page after logout
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const renderLoginPage = () => (
    <div className="container mx-auto px-4 py-16 text-center dark:text-white">
      <h1 className="text-3xl font-bold mb-4">Login Required</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-6">Please login to access this feature.</p>
      <button
        onClick={() => setIsLoginModalOpen(true)}
        className="px-6 py-3 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors"
      >
        Login
      </button>
    </div>
  );

  // Wrapper component to handle dynamic product loading
  const ProductDetailPageWrapper = ({ toggleWishlist, wishlist, cart, updateCart }) => {
    const { productId } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      const fetchProduct = async () => {
        try {
          setLoading(true);
          const productData = await getProductById(productId);

          if (productData) {
            setProduct(productData);
          } else {
            // Fallback to local products if not found in Firebase
            setError('Product not found');
          }
        } catch (error) {
          console.error('Error fetching product:', error);
          setError('Failed to load product');
        } finally {
          setLoading(false);
        }
      };

      if (productId) {
        fetchProduct();
      }
    }, [productId]);

    if (loading) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
          </div>
        </div>
      );
    }

    if (error || !product) {
      return (
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 dark:text-white">Product Not Found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'The product you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/shop')}
              className="px-6 py-3 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors"
            >
              Back to Shop
            </button>
          </div>
        </div>
      );
    }

    return <ProductDetailPage product={product} toggleWishlist={toggleWishlist} wishlist={wishlist} />;
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-black'} min-h-screen flex flex-col`}>
        <Header
          navigateTo={navigateTo}
          openLoginModal={() => setIsLoginModalOpen(true)}
          openWishlist={() => setIsWishlistOpen(true)}
          wishlistCount={getWishlistItemCount()}
          cartCount={getCartItemCount()}
          user={user}
          onLogout={handleLogout}
        />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<HomePage navigateTo={navigateTo} viewProduct={viewProduct} toggleWishlist={toggleWishlist} wishlist={wishlistItems} cart={cartItems} updateCart={updateCart} />} />
            <Route path="/shop" element={<ShopPage viewProduct={viewProduct} navigateTo={navigateTo} />} />
            <Route path="/product/:productId" element={<ProductDetailPageWrapper />} />
            <Route path="/checkout" element={<CheckoutPage navigateTo={navigateTo} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/login" element={renderLoginPage()} />
            <Route path="/register" element={renderLoginPage()} />
            <Route path="/dashboard" element={<DashboardPage navigateTo={navigateTo} />} />
            <Route path="/admin" element={<AdminDashboardPage navigateTo={navigateTo} />} />
            <Route path="/orders" element={<OrdersPage navigateTo={navigateTo} />} />
            <Route path="/downloads" element={<DownloadsPage navigateTo={navigateTo} />} />
            <Route path="/addresses" element={<AddressesPage navigateTo={navigateTo} />} />
            <Route path="/account-details" element={<AccountDetailsPage navigateTo={navigateTo} />} />
            <Route path="/wishlist" element={<WishlistPage navigateTo={navigateTo} toggleWishlist={toggleWishlist} wishlist={wishlistItems} viewProduct={viewProduct} />} />
            <Route path="/returns-policy" element={<ReturnsPolicyPage />} />
            <Route path="/terms-conditions" element={<TermsConditionsPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/shipping-policy" element={<ShippingPolicyPage />} />
          </Routes>
        </main>
        <Footer />
        <WishlistSidebar
          isOpen={isWishlistOpen}
          onClose={() => setIsWishlistOpen(false)}
          wishlistItems={wishlistItems}
          toggleWishlist={toggleWishlist}
          viewProduct={(p) => {
            viewProduct(p);
            setIsWishlistOpen(false);
          }}
        />
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          navigateTo={navigateTo}
        />
        <LogoutSuccessModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
        />
        <WhatsAppWidget />
      </div>
    </ThemeContext.Provider>
  );
};

const App = () => {
  return (
    <AdminProvider>
      <AuthProvider>
        <ProductProvider>
          <CategoryProvider>
            <SettingsProvider>
              <AppContent />
            </SettingsProvider>
          </CategoryProvider>
        </ProductProvider>
      </AuthProvider>
    </AdminProvider>
  );
};

export default App;