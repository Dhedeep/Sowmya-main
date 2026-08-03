import React, { useState } from 'react';
import { Search, Eye } from 'lucide-react';
import OrderModal from './OrderModal';

const OrdersManagement = ({
  orders,
  searchTerm,
  filterStatus,
  setSearchTerm,
  setFilterStatus,
  onOrderStatusUpdate,
  onViewOrder,
  updatingOrderId
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status) => {
    return status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
      status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
        status === 'shipped' ? 'bg-brand-secondary/10 text-brand-secondary dark:bg-brand-secondary/20 dark:text-brand-secondary' :
          'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
  };

  const handleViewOrder = async (orderId) => {
    const orderDetails = await onViewOrder(orderId);
    setSelectedOrder(orderDetails);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-700 dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Status</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 dark:text-gray-300">Order ID</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Date</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Customer</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Email</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Total</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, index) => (
                <tr key={`order-${order.id || 'no-id'}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4 dark:text-white">{order.id}</td>
                  <td className="py-3 px-4 dark:text-white">
                    {order.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                  </td>
                  <td className="py-3 px-4 dark:text-white">{order.customerName || order.shippingAddress?.fullName || order.shippingAddress?.name || 'N/A'}</td>
                  <td className="py-3 px-4 dark:text-white">{order.customerEmail || order.userId || 'N/A'}</td>
                  <td className="py-3 px-4 dark:text-white">₹{order.total?.toFixed(2) || '0.00'}</td>
                  <td className="py-3 px-4">
                    {updatingOrderId === order.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                      </div>
                    ) : (
                      <select
                        value={order.status}
                        onChange={(e) => onOrderStatusUpdate(order.id, e.target.value)}
                        className={`px-2 py-1 rounded text-xs ${getStatusClass(order.status)}`}
                      >
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleViewOrder(order.id)}
                      className="p-1 text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded"
                    >
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <OrderModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        order={selectedOrder}
      />
    </>
  );
};

export default OrdersManagement;