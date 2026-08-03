import React from 'react';

const DashboardOverview = ({ orders, products, payments, coupons }) => {
  const getStatusClass = (status, type) => {
    const statusClasses = {
      order: {
        delivered: 'bg-green-100 text-green-800',
        processing: 'bg-yellow-100 text-yellow-800',
        shipped: 'bg-brand-secondary/10 text-brand-secondary',
        cancelled: 'bg-red-100 text-red-800'
      },
      payment: {
        paid: 'bg-green-100 text-green-800',
        pending: 'bg-yellow-100 text-yellow-800',
        failed: 'bg-red-100 text-red-800',
        refunded: 'bg-brand-secondary/10 text-brand-secondary'
      },
      coupon: {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-red-100 text-red-800'
      }
    };

    return statusClasses[type]?.[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Orders</h2>
        <div className="space-y-3">
          {orders.slice(0, 5).map((order, index) => (
            <div key={`order-${order.id || 'no-id'}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-800">{order.id}</p>
                <p className="text-sm text-gray-600">₹{order.total?.toFixed(2) || '0.00'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.status, 'order')}`}>
                {order.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Products</h2>
        <div className="space-y-3">
          {products.slice(0, 5).map((product, index) => (
            <div key={`product-${product.id || 'no-id'}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-800">{product.name}</p>
                <p className="text-sm text-gray-600">₹{product.price}</p>
              </div>
              <span className="text-sm text-gray-500">{product.category}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Payments</h2>
        <div className="space-y-3">
          {payments.slice(0, 5).map((payment, index) => (
            <div key={`payment-${payment.id || 'no-id'}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-800">{payment.orderId}</p>
                <p className="text-sm text-gray-600">₹{payment.amount?.toFixed(2) || '0.00'}</p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(payment.status, 'payment')}`}>
                {payment.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Recent Coupons</h2>
        <div className="space-y-3">
          {coupons.slice(0, 5).map((coupon, index) => (
            <div key={`coupon-${coupon.id || 'no-id'}-${index}`} className="flex justify-between items-center p-3 bg-gray-50 rounded">
              <div>
                <p className="font-medium text-gray-800">{coupon.code}</p>
                <p className="text-sm text-gray-600">
                  {coupon.discountType === 'percentage' ? `${coupon.discountValue}%` : `₹${coupon.discountValue}`}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(coupon.isActive ? 'active' : 'inactive', 'coupon')}`}>
                {coupon.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;