import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Tag, Percent, DollarSign, ToggleLeft, ToggleRight } from 'lucide-react';
import CouponModal from './CouponModal';

const CouponsManagement = ({
  coupons,
  searchTerm,
  couponFilterStatus,
  setSearchTerm,
  setCouponFilterStatus,
  onEditCoupon,
  onDeleteCoupon,
  onToggleCouponStatus,
  updatingCouponId,
  deletingCouponId,
  onAddCoupon,
  isSubmitting,
  editingCoupon
}) => {
  const filteredCoupons = coupons.filter(coupon => {
    const matchesSearch = searchTerm === '' ||
      coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coupon.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = couponFilterStatus === 'all' ||
      (couponFilterStatus === 'active' && coupon.isActive) ||
      (couponFilterStatus === 'inactive' && !coupon.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleAddCoupon = () => {
    onEditCoupon({});
  };

  const handleCloseModal = () => {
    onEditCoupon(null);
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
                  placeholder="Search coupons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
              <select
                value={couponFilterStatus}
                onChange={(e) => setCouponFilterStatus(e.target.value)}
                className="px-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <button
              onClick={handleAddCoupon}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Plus size={20} />
              Add Coupon
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 dark:text-gray-300">Code</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Description</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Discount</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Min Amount</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Usage</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Expiry</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoupons.map((coupon, index) => (
                <tr key={`coupon-${coupon.id || 'no-id'}-${index}`} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <Tag size={16} className="text-gray-400" />
                      <span className="font-mono font-medium dark:text-white">{coupon.code}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 dark:text-white">{coupon.description || '-'}</td>
                  <td className="py-3 px-4">
                    <span className="dark:text-white font-medium">
                      {coupon.discountType === 'percentage' ? (
                        <span className="flex items-center gap-1">
                          <Percent size={14} />
                          {coupon.discountValue}%
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          ₹{coupon.discountValue}
                        </span>
                      )}
                    </span>
                  </td>
                  <td className="py-3 px-4 dark:text-white">
                    {coupon.minimumAmount ? `₹${coupon.minimumAmount}` : '-'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm dark:text-white">
                      <span>{coupon.usedCount || 0}</span>
                      {coupon.usageLimit && (
                        <span className="text-gray-500">/{coupon.usageLimit}</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    {coupon.expiryDate ? (
                      <span className="text-sm dark:text-white">
                        {new Date(coupon.expiryDate.toDate ? coupon.expiryDate.toDate() : coupon.expiryDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-500">No expiry</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    {updatingCouponId === coupon.id ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                      </div>
                    ) : (
                      <button
                        onClick={() => onToggleCouponStatus(coupon.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${coupon.isActive
                          ? 'bg-green-100 text-green-700 dark:bg-green-800 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-800 dark:text-red-300'
                          }`}
                      >
                        {coupon.isActive ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditCoupon(coupon)}
                        className="p-1 text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteCoupon(coupon.id)}
                        disabled={deletingCouponId === coupon.id}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingCouponId === coupon.id ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CouponModal
        isOpen={editingCoupon !== null}
        onClose={handleCloseModal}
        onSubmit={onAddCoupon}
        editingCoupon={editingCoupon}
        isSubmitting={isSubmitting}
      />
    </>
  );
};

export default CouponsManagement;