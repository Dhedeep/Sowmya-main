import React, { useState, useEffect } from 'react';
import { User, ShoppingBag, MapPin, Heart, LogOut, Settings, Eye, XCircle, Package, Truck, CheckCircle, Clock } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import { getOrdersByUserId } from '../src/firebase/services/orderService';
import { getUserWishlist } from '../src/firebase/services/cartService';
import { getUserAddresses } from '../src/firebase/services/addressService';

const DashboardPage = ({ navigateTo }) => {
  const { user, userData } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState({
    totalOrders: 0,
    wishlistItems: 0,
    savedAddresses: 0
  });

  useEffect(() => {
    const fetchUserStats = async () => {
      if (user) {
        try {
          const ordersData = await getOrdersByUserId(user.uid);
          // Format the orders data to ensure proper date formatting
          const formattedOrders = ordersData.map(order => ({
            ...order,
            date: order.createdAt?.toDate?.()?.toLocaleDateString('en-CA') ||
              new Date(order.createdAt?.seconds * 1000).toLocaleDateString('en-CA') ||
              order.date || 'N/A'
          }));
          setOrders(formattedOrders);

          // Fetch wishlist items
          const wishlistData = await getUserWishlist(user.uid);

          // Fetch addresses
          const addressesData = await getUserAddresses(user.uid);

          setStats({
            totalOrders: ordersData.length,
            wishlistItems: wishlistData.length,
            savedAddresses: addressesData.length
          });
        } catch (error) {
          console.error('Error fetching user stats:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchUserStats();
  }, [user]);

  // Get recent orders from the fetched orders
  const recentOrders = orders.slice(0, 3).map(order => ({
    id: order.id,
    date: order.date, // Using the already formatted date
    status: order.status,
    total: order.total || 0,
    items: order.items?.length || 0,
    fullOrder: order // Store the full order object for the modal
  }));

  const getStatusIcon = (status) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'processing':
        return <Clock size={16} className="text-yellow-500" />;
      case 'shipped':
        return <Truck size={16} className="text-brand-secondary" />;
      case 'cancelled':
        return <XCircle size={16} className="text-red-500" />;
      default:
        return <Package size={16} className="text-gray-500" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
      case 'shipped':
        return 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };

  const OrderDetailsModal = ({ order, onClose }) => {
    if (!order) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold dark:text-white">Order Details</h2>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-semibold dark:text-white">{order.id}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                <span className="dark:text-white">{order.date}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 dark:text-gray-400">Status:</span>
                <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusBadgeClass(order.status)}`}>
                  {getStatusIcon(order.status)}
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
              {order.trackingNumber && (
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Tracking Number:</span>
                  <span className="dark:text-white">{order.trackingNumber}</span>
                </div>
              )}
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3 dark:text-white">Items</h3>
              <div className="space-y-3">
                {order.items && order.items.map(item => (
                  <div key={item.id} className="flex items-center gap-4 pb-3 border-b dark:border-gray-700">
                    <img
                      src={item.images && item.images[0] ? item.images[0] : item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-grow">
                      <h4 className="font-medium dark:text-white">{item.name}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold dark:text-white">₹{(item.price * item.quantity).toFixed(2)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">₹{item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {order.shippingAddress && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Shipping Address</h3>
                <p className="dark:text-white">
                  {typeof order.shippingAddress === 'object'
                    ? `${order.shippingAddress.fullName}, ${order.shippingAddress.address}, ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}, ${order.shippingAddress.country}`
                    : order.shippingAddress
                  }
                </p>
              </div>
            )}

            {order.paymentMethod && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 dark:text-white">Payment Method</h3>
                <p className="dark:text-white">{order.paymentMethod}</p>
              </div>
            )}

            <div className="border-t dark:border-gray-700 pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold dark:text-white">Total:</span>
                <span className="text-lg font-bold dark:text-white">₹{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const menuItems = [
    { icon: <User size={20} />, label: 'Account Details', page: 'account-details' },
    { icon: <ShoppingBag size={20} />, label: 'Orders', page: 'orders' },
    { icon: <MapPin size={20} />, label: 'Addresses', page: 'addresses' },
    { icon: <Heart size={20} />, label: 'Wishlist', page: 'wishlist' },

    { icon: <LogOut size={20} />, label: 'Logout', page: 'logout' }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-4 dark:text-white">Please Login</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need to be logged in to view your dashboard.</p>
          <button
            onClick={() => navigateTo('login')}
            className="px-6 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="md:w-1/4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 dark:border-gray-700">
            <div className="flex flex-col items-center mb-6">
              <img
                src={user.photoURL || `https://picsum.photos/seed/${user.uid}/100/100.jpg`}
                alt={userData?.displayName || user.email}
                className="w-20 h-20 rounded-full mb-3"
              />
              <h2 className="text-xl font-semibold dark:text-white">{userData?.displayName || user.email}</h2>
              <p className="text-gray-600 dark:text-gray-400 text-sm">{user.email}</p>
              <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">Member since {userData?.memberSince || 'N/A'}</p>
            </div>

            <nav className="space-y-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => navigateTo(item.page)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors dark:text-white"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Main Content */}
        <div className="md:w-3/4">
          <h1 className="text-3xl font-bold mb-6 dark:text-white">My Dashboard</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.totalOrders}</p>
                </div>
                <ShoppingBag className="text-brand-primary" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Wishlist Items</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.wishlistItems}</p>
                </div>
                <Heart className="text-red-500" size={24} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Saved Addresses</p>
                  <p className="text-2xl font-bold dark:text-white">{stats.savedAddresses}</p>
                </div>
                <MapPin className="text-green-500" size={24} />
              </div>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold dark:text-white">Recent Orders</h2>
              <button
                onClick={() => navigateTo('orders')}
                className="text-brand-primary dark:text-brand-secondary hover:underline text-sm"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b dark:border-gray-700">
                    <th className="text-left py-3 px-2 dark:text-gray-300">Order ID</th>
                    <th className="text-left py-3 px-2 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-2 dark:text-gray-300">Items</th>
                    <th className="text-left py-3 px-2 dark:text-gray-300">Total</th>
                    <th className="text-left py-3 px-2 dark:text-gray-300">Status</th>
                    <th className="text-left py-3 px-2 dark:text-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-2 dark:text-white">{order.id}</td>
                      <td className="py-3 px-2 dark:text-white">{order.date}</td>
                      <td className="py-3 px-2 dark:text-white">{order.items}</td>
                      <td className="py-3 px-2 dark:text-white">₹{order.total.toFixed(2)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 w-fit ${getStatusBadgeClass(order.status)}`}>
                          {getStatusIcon(order.status)}
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button
                          onClick={() => setSelectedOrder(order.fullOrder)}
                          className="flex items-center gap-1 text-brand-primary dark:text-brand-secondary hover:underline"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </div>
  );
};

export default DashboardPage;