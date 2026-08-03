import React from 'react';
import {
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  UserCheck,
  Tag,
  Folder
} from 'lucide-react';

const DashboardStatsCards = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-6 mb-8">
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Products</p>
            <p className="text-2xl font-bold">{stats.totalProducts}</p>
          </div>
          <Package className="text-brand-primary" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Orders</p>
            <p className="text-2xl font-bold">{stats.totalOrders}</p>
          </div>
          <ShoppingCart className="text-green-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Revenue</p>
            <p className="text-2xl font-bold">₹{stats.totalRevenue.toFixed(2)}</p>
          </div>
          <TrendingUp className="text-purple-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Pending Orders</p>
            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
          </div>
          <Users className="text-orange-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Users</p>
            <p className="text-2xl font-bold">{stats.totalUsers}</p>
          </div>
          <UserCheck className="text-purple-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Total Coupons</p>
            <p className="text-2xl font-bold">{stats.totalCoupons}</p>
          </div>
          <Tag className="text-pink-500" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500 text-sm">Categories</p>
            <p className="text-2xl font-bold">{stats.totalCategories}</p>
            <p className="text-xs text-gray-400">{stats.activeCategories} active</p>
          </div>
          <Folder className="text-brand-secondary" size={24} />
        </div>
      </div>
    </div>
  );
};

export default DashboardStatsCards;