import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdmin } from '../../contexts/AdminContext';
import { getAllProducts } from '../../firebase/services/productService';
import { getAllOrders } from '../../firebase/services/orderService';
import { getAllUsers, getUserStatistics } from '../../firebase/services/userService';
import { getAllPayments, getPaymentStatistics } from '../../firebase/services/adminPaymentService';
import { getAllCoupons, getCouponStatistics } from '../../firebase/services/couponService';
import { getAllCategories, getCategoryStatistics } from '../../firebase/services/categoryService';
import { useFirebaseCache } from '../useFirebaseCache';
import firebaseListenerManager from '../../utils/firebaseListenerManager';

export const useAdminData = (activeTab = 'dashboard') => {
  const { isAdmin, isLoading } = useAdmin();
  const { getCachedData, setCachedData, invalidateCache } = useFirebaseCache();
  
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    totalUsers: 0,
    totalAdmins: 0,
    totalCoupons: 0,
    activeCoupons: 0,
    totalCategories: 0,
    activeCategories: 0
  });
  
  // Track which data has been loaded
  const [loadedData, setLoadedData] = useState({
    products: false,
    orders: false,
    users: false,
    payments: false,
    coupons: false,
    categories: false,
    stats: false
  });
  
  // Generate unique component ID for this hook instance
  const componentId = useRef(`useAdminData-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
  
  // Real-time listener for orders (critical data that needs real-time updates)
  const setupOrdersListener = useCallback(() => {
    const unsubscribe = firebaseListenerManager.subscribe(
      componentId.current,
      'orders',
      {}, // No params for admin - get all orders
      (ordersData) => {
        setOrders(ordersData);
        setCachedData('admin-orders', ordersData);
        
        // Update stats when orders change
        setStats(prev => ({
          ...prev,
          totalOrders: ordersData.length,
          pendingOrders: ordersData.filter(order =>
            order.status === 'processing' || order.status === 'shipped'
          ).length
        }));
      },
      (error) => {
        console.error('Real-time orders listener error:', error);
      }
    );
    
    return unsubscribe;
  }, [setCachedData]);
  
  // Real-time listener for products (for stock management)
  const setupProductsListener = useCallback(() => {
    const unsubscribe = firebaseListenerManager.subscribe(
      componentId.current,
      'products',
      {}, // No params for admin - get all products
      (productsData) => {
        setProducts(productsData);
        setCachedData('admin-products', productsData);
        
        // Update stats when products change
        setStats(prev => ({
          ...prev,
          totalProducts: productsData.length
        }));
      },
      (error) => {
        console.error('Real-time products listener error:', error);
      }
    );
    
    return unsubscribe;
  }, [setCachedData]);
  
  // Cleanup all listeners
  const cleanupListeners = useCallback(() => {
    firebaseListenerManager.unsubscribeAll(componentId.current);
  }, []);

  // Individual fetch functions with caching
  const fetchProducts = async () => {
    const cacheKey = 'admin-products';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setProducts(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching products from Firebase...');
      const productsData = await getAllProducts();
      setProducts(productsData);
      setCachedData(cacheKey, productsData);
      return productsData;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  };

  const fetchOrders = async () => {
    const cacheKey = 'admin-orders';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setOrders(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching orders from Firebase...');
      const ordersData = await getAllOrders();
      setOrders(ordersData);
      setCachedData(cacheKey, ordersData);
      return ordersData;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  };

  const fetchUsers = async () => {
    const cacheKey = 'admin-users';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setUsers(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching users from Firebase...');
      const usersData = await getAllUsers();
      setUsers(usersData);
      setCachedData(cacheKey, usersData);
      return usersData;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  };

  const fetchPayments = async () => {
    const cacheKey = 'admin-payments';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setPayments(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching payments from Firebase...');
      const paymentsData = await getAllPayments();
      setPayments(paymentsData);
      setCachedData(cacheKey, paymentsData);
      return paymentsData;
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  };

  const fetchCoupons = async () => {
    const cacheKey = 'admin-coupons';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setCoupons(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching coupons from Firebase...');
      const couponsData = await getAllCoupons();
      setCoupons(couponsData);
      setCachedData(cacheKey, couponsData);
      return couponsData;
    } catch (error) {
      console.error('Error fetching coupons:', error);
      return [];
    }
  };

  const fetchCategories = async () => {
    const cacheKey = 'admin-categories';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setCategories(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching categories from Firebase...');
      const categoriesData = await getAllCategories();
      setCategories(categoriesData);
      setCachedData(cacheKey, categoriesData);
      return categoriesData;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const fetchStatistics = async () => {
    const cacheKey = 'admin-statistics';
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      setStats(cachedData);
      return cachedData;
    }
    
    try {
      console.log('Fetching statistics from Firebase...');
      const [userStats, paymentStats, couponStats, categoryStats] = await Promise.all([
        getUserStatistics(),
        getPaymentStatistics(),
        getCouponStatistics(),
        getCategoryStatistics()
      ]);
      
      const statsData = {
        totalProducts: products.length,
        totalOrders: orders.length,
        totalRevenue: paymentStats.totalRevenue || 0,
        pendingOrders: orders.filter(order =>
          order.status === 'processing' || order.status === 'shipped'
        ).length,
        totalUsers: userStats.total || 0,
        totalAdmins: userStats.admins || 0,
        totalCoupons: couponStats.total || 0,
        activeCoupons: couponStats.active || 0,
        totalCategories: categoryStats.total || 0,
        activeCategories: categoryStats.active || 0
      };
      
      setStats(statsData);
      setCachedData(cacheKey, statsData);
      return statsData;
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return stats;
    }
  };

  // Optimized data loading based on active tab
  const loadTabData = useCallback(async (tab, forceRefresh = false) => {
    if (!isAdmin) return;
    
    console.log(`Loading data for tab: ${tab}, forceRefresh: ${forceRefresh}`);
    
    try {
      switch (tab) {
        case 'dashboard':
          // Load essential data for dashboard
          if (forceRefresh || !loadedData.orders) {
            await fetchOrders();
            setLoadedData(prev => ({ ...prev, orders: true }));
          }
          if (forceRefresh || !loadedData.products) {
            await fetchProducts();
            setLoadedData(prev => ({ ...prev, products: true }));
          }
          if (forceRefresh || !loadedData.stats) {
            await fetchStatistics();
            setLoadedData(prev => ({ ...prev, stats: true }));
          }
          break;
          
        case 'products':
          if (forceRefresh || !loadedData.products) {
            await fetchProducts();
            setLoadedData(prev => ({ ...prev, products: true }));
          }
          if (forceRefresh || !loadedData.categories) {
            await fetchCategories();
            setLoadedData(prev => ({ ...prev, categories: true }));
          }
          break;
          
        case 'orders':
          if (forceRefresh || !loadedData.orders) {
            await fetchOrders();
            setLoadedData(prev => ({ ...prev, orders: true }));
          }
          if (forceRefresh || !loadedData.payments) {
            await fetchPayments();
            setLoadedData(prev => ({ ...prev, payments: true }));
          }
          break;
          
        case 'payments':
          if (forceRefresh || !loadedData.payments) {
            await fetchPayments();
            setLoadedData(prev => ({ ...prev, payments: true }));
          }
          break;
          
        case 'users':
          if (forceRefresh || !loadedData.users) {
            await fetchUsers();
            setLoadedData(prev => ({ ...prev, users: true }));
          }
          break;
          
        case 'coupons':
          if (forceRefresh || !loadedData.coupons) {
            await fetchCoupons();
            setLoadedData(prev => ({ ...prev, coupons: true }));
          }
          break;
          
        case 'categories':
          if (forceRefresh || !loadedData.categories) {
            await fetchCategories();
            setLoadedData(prev => ({ ...prev, categories: true }));
          }
          break;
          
        case 'shipping':
          if (forceRefresh || !loadedData.orders) {
            await fetchOrders();
            setLoadedData(prev => ({ ...prev, orders: true }));
          }
          break;
          
        default:
          break;
      }
      
      console.log(`Data loaded for tab: ${tab}`);
    } catch (error) {
      console.error(`Error loading data for tab ${tab}:`, error);
    }
  }, [isAdmin, loadedData, fetchProducts, fetchOrders, fetchUsers, fetchPayments, fetchCoupons, fetchCategories, fetchStatistics]);
  
  // Legacy fetchData function for backward compatibility
  const fetchData = async (options = {}) => {
    const {
      refreshProducts = false,
      refreshOrders = false,
      refreshUsers = false,
      refreshPayments = false,
      refreshCoupons = false,
      refreshCategories = false,
      refreshStatistics = false
    } = options;

    if (!isAdmin) return;

    try {
      console.log('Fetching admin data with options:', options);
      
      // Only fetch what's explicitly requested
      if (refreshProducts) await fetchProducts();
      if (refreshOrders) await fetchOrders();
      if (refreshUsers) await fetchUsers();
      if (refreshPayments) await fetchPayments();
      if (refreshCoupons) await fetchCoupons();
      if (refreshCategories) await fetchCategories();
      if (refreshStatistics) await fetchStatistics();
      
      console.log('Admin data fetched successfully');
    } catch (error) {
      console.error('Error fetching admin data:', error);
    }
  };

  // Optimized selective refresh functions
  const refreshProductsOnly = async () => {
    invalidateCache('admin-products');
    await fetchProducts();
    // Update stats without full refresh
    setStats(prev => ({
      ...prev,
      totalProducts: products.length
    }));
  };

  const refreshOrdersOnly = async () => {
    invalidateCache('admin-orders');
    await fetchOrders();
    // Update related stats without full refresh
    setStats(prev => ({
      ...prev,
      totalOrders: orders.length,
      pendingOrders: orders.filter(order =>
        order.status === 'processing' || order.status === 'shipped'
      ).length
    }));
  };

  const refreshUsersOnly = async () => {
    invalidateCache('admin-users');
    await fetchUsers();
  };

  const refreshPaymentsOnly = async () => {
    invalidateCache('admin-payments');
    await fetchPayments();
  };

  const refreshCouponsOnly = async () => {
    invalidateCache('admin-coupons');
    await fetchCoupons();
  };

  const refreshCategoriesOnly = async () => {
    invalidateCache('admin-categories');
    await fetchCategories();
  };

  // Setup real-time listeners for critical data
  useEffect(() => {
    if (isAdmin) {
      // Always listen to orders and products for real-time updates
      const ordersUnsubscribe = setupOrdersListener();
      const productsUnsubscribe = setupProductsListener();
      
      return () => {
        // Cleanup is handled by the centralized manager
        // but we keep the individual unsubscribes for immediate cleanup
        if (ordersUnsubscribe) ordersUnsubscribe();
        if (productsUnsubscribe) productsUnsubscribe();
      };
    }
  }, [isAdmin, setupOrdersListener, setupProductsListener]);
  
  // Cleanup all listeners when component unmounts
  useEffect(() => {
    return () => {
      cleanupListeners();
    };
  }, [cleanupListeners]);

  // Load data based on active tab
  useEffect(() => {
    if (isAdmin && activeTab) {
      loadTabData(activeTab);
    }
  }, [isAdmin, activeTab, loadTabData]);

  // Initial data load for dashboard
  useEffect(() => {
    if (isAdmin && activeTab === 'dashboard') {
      loadTabData('dashboard');
    }
  }, [isAdmin]);

  return {
    isAdmin,
    isLoading,
    products,
    orders,
    users,
    payments,
    coupons,
    categories,
    stats,
    loadedData,
    fetchData,
    loadTabData,
    refreshProductsOnly,
    refreshOrdersOnly,
    refreshUsersOnly,
    refreshPaymentsOnly,
    refreshCouponsOnly,
    refreshCategoriesOnly
  };
};