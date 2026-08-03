import React, { useState } from 'react';
import { useAdmin } from '../src/contexts/AdminContext';
import { createProduct, updateProduct, deleteProduct } from '../src/firebase/services/productService';
import { updateOrderStatus, getOrderById } from '../src/firebase/services/orderService';
import { updateUserRole, deleteUser, getUserStatistics } from '../src/firebase/services/userService';
import { updatePaymentStatus, processRefund, getPaymentById } from '../src/firebase/services/adminPaymentService';
import { createCoupon, updateCoupon, deleteCoupon, toggleCouponStatus } from '../src/firebase/services/couponService';
import { createCategory, updateCategory, deleteCategory, toggleCategoryStatus } from '../src/firebase/services/categoryService';

// Import custom hooks
import { useAdminData } from '../src/hooks/admin/useAdminData';
import { useCategoryContext } from '../src/contexts/CategoryContext';
import { useFilters } from '../src/hooks/admin/useFilters';
import { useShiprocket } from '../src/hooks/admin/useShiprocket';

// Import components
import DashboardStatsCards from '../src/components/admin/DashboardStatsCards';
import TabNavigation from '../src/components/admin/TabNavigation';
import DashboardOverview from '../src/components/admin/DashboardOverview';
import ProductsManagement from '../src/components/admin/ProductsManagement';
import ProductModal from '../src/components/admin/ProductModal';
import OrdersManagement from '../src/components/admin/OrdersManagement';
import PaymentsManagement from '../src/components/admin/PaymentsManagement';
import UsersManagement from '../src/components/admin/UsersManagement';
import CouponsManagement from '../src/components/admin/CouponsManagement';
import CategoriesManagement from '../src/components/admin/CategoriesManagement';
import ShippingManagement from '../src/components/admin/ShippingManagement';
import AdminSettings from '../src/components/admin/AdminSettings';
import ShippingFeesManagement from '../src/components/admin/ShippingFeesManagement';
import TaxManagement from '../src/components/admin/TaxManagement';

const AdminDashboardPage = () => {
  const { isAdmin, isLoading } = useAdmin();
  const [activeTab, setActiveTab] = useState('dashboard');

  // Use custom hooks
  const adminData = useAdminData(activeTab);
  const filters = useFilters();
  const shiprocketData = useShiprocket();
  const { refreshAllCategories } = useCategoryContext();

  // Local state for modals and editing
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductSubmitting, setIsProductSubmitting] = useState(false);
  const [isCouponSubmitting, setIsCouponSubmitting] = useState(false);
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState(null);
  const [deletingCouponId, setDeletingCouponId] = useState(null);
  const [deletingCategoryId, setDeletingCategoryId] = useState(null);
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [updatingCouponId, setUpdatingCouponId] = useState(null);
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null);
  const [updatingCategoryId, setUpdatingCategoryId] = useState(null);

  // Product handlers
  const handleProductSubmit = async (formData, imageFiles, productId) => {
    // Prevent multiple submissions
    if (isProductSubmitting) {
      return;
    }

    setIsProductSubmitting(true);
    try {
      console.log('Submitting product form:', { productId, editingProduct });

      if (editingProduct) {
        console.log('Updating existing product...');
        await updateProduct(productId, formData, imageFiles);
        alert('Product updated successfully!');
      } else {
        console.log('Creating new product...');
        await createProduct(formData, imageFiles);
        alert('Product created successfully!');
      }

      setEditingProduct(null);
      setIsProductModalOpen(false);
      console.log('Refreshing products only...');
      await adminData.refreshProductsOnly();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product: ' + error.message);
    } finally {
      setIsProductSubmitting(false);
    }
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(false);
  };

  const handleDeleteProduct = async (productId) => {
    if (!productId) {
      console.error('Product ID is required for deletion');
      alert('Error: Product ID is missing');
      return;
    }

    if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      setDeletingProductId(productId);
      try {
        console.log('Starting product deletion for ID:', productId);
        await deleteProduct(String(productId));
        console.log('Product deleted successfully, refreshing products...');
        await adminData.refreshProductsOnly();
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product: ' + error.message);
      } finally {
        setDeletingProductId(null);
      }
    }
  };

  // Coupon handlers
  const handleCouponSubmit = async (formData, couponId) => {
    setIsCouponSubmitting(true);
    try {
      if (couponId) {
        await updateCoupon(couponId, formData);
        alert('Coupon updated successfully!');
      } else {
        await createCoupon(formData);
        alert('Coupon created successfully!');
      }

      setEditingCoupon(null);
      adminData.refreshCouponsOnly();
    } catch (error) {
      console.error('Error saving coupon:', error);
      alert('Error saving coupon: ' + error.message);
    } finally {
      setIsCouponSubmitting(false);
    }
  };

  const handleEditCoupon = (coupon) => {
    setEditingCoupon(coupon);
  };

  const handleDeleteCoupon = async (couponId) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      setDeletingCouponId(couponId);
      try {
        await deleteCoupon(couponId);
        adminData.refreshCouponsOnly();
      } catch (error) {
        console.error('Error deleting coupon:', error);
      } finally {
        setDeletingCouponId(null);
      }
    }
  };

  const handleToggleCouponStatus = async (couponId) => {
    setUpdatingCouponId(couponId);
    try {
      await toggleCouponStatus(couponId);
      adminData.refreshCouponsOnly();
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    } finally {
      setUpdatingCouponId(null);
    }
  };

  // Category handlers
  const handleCategorySubmit = async (formData, categoryId) => {
    setIsCategorySubmitting(true);
    try {
      if (categoryId) {
        await updateCategory(categoryId, formData);
        alert('Category updated successfully!');
      } else {
        await createCategory(formData);
        alert('Category created successfully!');
      }

      setEditingCategory(null);
      refreshAllCategories();
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error('Error saving category:', error);
      alert('Error saving category: ' + error.message);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

 const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsCategoryModalOpen(true);
  };
  const handleOpenCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(true);
};

const handleCloseCategoryModal = () => {
    setEditingCategory(null);
    setIsCategoryModalOpen(false);
};

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? If it has subcategories, you need to delete them first.')) {
      setDeletingCategoryId(categoryId);
      try {
        await deleteCategory(categoryId);
        refreshAllCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
        alert('Error deleting category: ' + error.message);
      } finally {
        setDeletingCategoryId(null);
      }
    }
  };

  const handleToggleCategoryStatus = async (categoryId) => {
    setUpdatingCategoryId(categoryId);
    try {
      await toggleCategoryStatus(categoryId);
      refreshAllCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  // Order handlers
  const handleOrderStatusUpdate = async (orderId, newStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      adminData.refreshOrdersOnly();
    } catch (error) {
      console.error('Error updating order status:', error);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleViewOrder = async (orderId) => {
    try {
      const orderDetails = await getOrderById(orderId);
      return orderDetails;
    } catch (error) {
      console.error('Error fetching order details:', error);
      return null;
    }
  };

  // User handlers
  const handleUserRoleUpdate = async (userId, isAdminRole) => {
    setUpdatingUserId(userId);
    try {
      await updateUserRole(userId, isAdminRole);
      adminData.refreshUsersOnly();
    } catch (error) {
      console.error('Error updating user role:', error);
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteUser(userId);
        adminData.refreshUsersOnly();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const { updateUserStatus } = await import('../src/firebase/services/userService');
      await updateUserStatus(userId, !currentStatus);
      adminData.refreshUsersOnly();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  // Payment handlers
  const handleViewPayment = async (paymentId) => {
    try {
      const paymentDetails = await getPaymentById(paymentId);
      return paymentDetails;
    } catch (error) {
      console.error('Error fetching payment details:', error);
      return null;
    }
  };

  const handlePaymentStatusUpdate = async (paymentId, newStatus) => {
    setUpdatingPaymentId(paymentId);
    try {
      await updatePaymentStatus(paymentId, newStatus);
      adminData.refreshPaymentsOnly();
    } catch (error) {
      console.error('Error updating payment status:', error);
    } finally {
      setUpdatingPaymentId(null);
    }
  };

  const handleProcessRefund = async (paymentId, refundAmount, refundReason) => {
    try {
      await processRefund(paymentId, refundAmount, refundReason);
      adminData.refreshPaymentsOnly();
      alert('Refund processed successfully');
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error processing refund: ' + error.message);
    }
  };

  // Shiprocket handlers
  const handleShiprocketAuth = async (email, password) => {
    const result = await shiprocketData.handleShiprocketAuth(email, password);
    if (result.success) {
      alert('Successfully authenticated with Shiprocket!');
    } else {
      alert('Authentication failed: ' + result.error);
    }
  };

  const handleShipmentCreated = (shipmentData) => {
    // Update the order status in our database to 'shipped'
    if (shipmentData.orderResponse) {
      // Find the order ID from the shipment data
      const orderId = shipmentData.orderResponse.order_id?.replace('ECOM_', '').split('_')[0];
      if (orderId) {
        updateOrderStatus(orderId, 'shipped');
        adminData.refreshOrdersOnly();
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access this page.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-4 px-6 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition-all shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

      {/* Stats Cards */}
      <DashboardStatsCards stats={adminData.stats} />

      {/* Tabs */}
      <TabNavigation activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Tab Content */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          orders={adminData.orders}
          products={adminData.products}
          payments={adminData.payments}
          coupons={adminData.coupons}
        />
      )}

      {activeTab === 'products' && (
        <>
          <ProductsManagement
            products={adminData.products}
            searchTerm={filters.searchTerm}
            setSearchTerm={filters.setSearchTerm}
            onEditProduct={handleEditProduct}
            onDeleteProduct={handleDeleteProduct}
            deletingProductId={deletingProductId}
            onAddProduct={handleAddProduct}
            isSubmitting={isProductSubmitting}
            editingProduct={editingProduct}
          />
          <ProductModal
            isOpen={isProductModalOpen}
            onClose={handleCloseProductModal}
            onSubmit={handleProductSubmit}
            editingProduct={editingProduct}
            isSubmitting={isProductSubmitting}
          />
        </>
      )}

     {activeTab === 'categories' && (
  <CategoriesManagement
    categories={adminData.categories}
    searchTerm={filters.searchTerm}
    setSearchTerm={filters.setSearchTerm}
    onEditCategory={handleEditCategory}
    onDeleteCategory={handleDeleteCategory}
    onToggleCategoryStatus={handleToggleCategoryStatus}
    deletingCategoryId={deletingCategoryId}
    updatingCategoryId={updatingCategoryId}

    onAddCategory={handleCategorySubmit}
    isSubmitting={isCategorySubmitting}
    editingCategory={editingCategory}

    isCategoryModalOpen={isCategoryModalOpen}
    onOpenCategoryModal={handleOpenCategoryModal}
    onCloseCategoryModal={handleCloseCategoryModal}
    handleCategorySubmit={handleCategorySubmit}
  />
)}
      {activeTab === 'orders' && (
        <OrdersManagement
          orders={adminData.orders}
          searchTerm={filters.searchTerm}
          filterStatus={filters.filterStatus}
          setSearchTerm={filters.setSearchTerm}
          setFilterStatus={filters.setFilterStatus}
          onOrderStatusUpdate={handleOrderStatusUpdate}
          onViewOrder={handleViewOrder}
          updatingOrderId={updatingOrderId}
        />
      )}

      {activeTab === 'payments' && (
        <PaymentsManagement
          payments={adminData.payments}
          searchTerm={filters.searchTerm}
          paymentFilterStatus={filters.paymentFilterStatus}
          setSearchTerm={filters.setSearchTerm}
          setPaymentFilterStatus={filters.setPaymentFilterStatus}
          onViewPayment={handleViewPayment}
          onPaymentStatusUpdate={handlePaymentStatusUpdate}
          onProcessRefund={handleProcessRefund}
          updatingPaymentId={updatingPaymentId}
        />
      )}

      {activeTab === 'users' && (
        <UsersManagement
          users={adminData.users}
          searchTerm={filters.searchTerm}
          setSearchTerm={filters.setSearchTerm}
          onUserRoleUpdate={handleUserRoleUpdate}
          onDeleteUser={handleDeleteUser}
          onToggleUserStatus={handleToggleUserStatus}
          updatingUserId={updatingUserId}
        />
      )}

      {activeTab === 'coupons' && (
        <CouponsManagement
          coupons={adminData.coupons}
          searchTerm={filters.searchTerm}
          couponFilterStatus={filters.couponFilterStatus}
          setSearchTerm={filters.setSearchTerm}
          setCouponFilterStatus={filters.setCouponFilterStatus}
          onEditCoupon={handleEditCoupon}
          onDeleteCoupon={handleDeleteCoupon}
          onToggleCouponStatus={handleToggleCouponStatus}
          updatingCouponId={updatingCouponId}
          deletingCouponId={deletingCouponId}
          onAddCoupon={handleCouponSubmit}
          isSubmitting={isCouponSubmitting}
          editingCoupon={editingCoupon}
        />
      )}

      {activeTab === 'shipping' && (
        <ShippingManagement
          shiprocketData={shiprocketData}
          orders={adminData.orders}
          onShiprocketAuth={handleShiprocketAuth}
          onShiprocketLogout={shiprocketData.handleShiprocketLogout}
          onFetchShiprocketOrders={shiprocketData.fetchShiprocketOrders}
          onCreateShipment={shiprocketData.handleCreateShipment}
          onAddPickupLocation={shiprocketData.addPickupLocation}
          onShipmentCreated={handleShipmentCreated}
        />
      )}

      {activeTab === 'shipping-fees' && (
        <ShippingFeesManagement />
      )}

      {activeTab === 'tax' && (
        <TaxManagement />
      )}

      {activeTab === 'settings' && (
        <AdminSettings />
      )}
    </div>
  );
};

export default AdminDashboardPage;