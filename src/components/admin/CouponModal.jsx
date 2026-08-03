import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const initialCouponState = {
  code: '',
  description: '',
  discountType: 'percentage',
  discountValue: '',
  minimumAmount: '',
  maxDiscount: '',
  usageLimit: '',
  expiryDate: '',
  emailSpecific: false,
  email: ''
};

const CouponModal = ({ isOpen, onClose, onSubmit, editingCoupon, isSubmitting }) => {
  const [couponFormData, setCouponFormData] = useState(initialCouponState);

  React.useEffect(() => {
    if (editingCoupon && editingCoupon.id) {
      // Editing existing coupon
      setCouponFormData({
        code: editingCoupon.code,
        description: editingCoupon.description || '',
        discountType: editingCoupon.discountType || 'percentage',
        discountValue: editingCoupon.discountValue?.toString() || '',
        minimumAmount: editingCoupon.minimumAmount?.toString() || '',
        maxDiscount: editingCoupon.maxDiscount?.toString() || '',
        usageLimit: editingCoupon.usageLimit?.toString() || '',
        expiryDate: editingCoupon.expiryDate ? new Date(editingCoupon.expiryDate.toDate ? editingCoupon.expiryDate.toDate() : editingCoupon.expiryDate).toISOString().split('T')[0] : '',
        emailSpecific: editingCoupon.emailSpecific || false,
        email: editingCoupon.email || ''
      });
    } else {
      // Adding new coupon
      setCouponFormData(initialCouponState);
    }
  }, [editingCoupon, isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const formDataToSubmit = {
      ...couponFormData,
      discountValue: parseFloat(couponFormData.discountValue),
      minimumAmount: couponFormData.minimumAmount ? parseFloat(couponFormData.minimumAmount) : null,
      maxDiscount: couponFormData.maxDiscount ? parseFloat(couponFormData.maxDiscount) : null,
      usageLimit: couponFormData.usageLimit ? parseInt(couponFormData.usageLimit) : null,
      expiryDate: couponFormData.expiryDate ? new Date(couponFormData.expiryDate) : null
    };

    onSubmit(formDataToSubmit, editingCoupon?.id);
  };

  const handleClose = () => {
    setCouponFormData(initialCouponState);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">
              {editingCoupon && editingCoupon.id ? 'Edit Coupon' : 'Add New Coupon'}
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Coupon Code</label>
                <input
                  type="text"
                  required
                  value={couponFormData.code}
                  onChange={(e) => setCouponFormData({ ...couponFormData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="SAVE10"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Description</label>
                <input
                  type="text"
                  value={couponFormData.description}
                  onChange={(e) => setCouponFormData({ ...couponFormData, description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="10% off on all products"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Discount Type</label>
                <select
                  value={couponFormData.discountType}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discountType: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">
                  Discount Value ({couponFormData.discountType === 'percentage' ? '%' : '₹'})
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step={couponFormData.discountType === 'percentage' ? '0.01' : '1'}
                  value={couponFormData.discountValue}
                  onChange={(e) => setCouponFormData({ ...couponFormData, discountValue: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder={couponFormData.discountType === 'percentage' ? '10' : '100'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Minimum Order Amount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={couponFormData.minimumAmount}
                  onChange={(e) => setCouponFormData({ ...couponFormData, minimumAmount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Maximum Discount (₹)</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={couponFormData.maxDiscount}
                  onChange={(e) => setCouponFormData({ ...couponFormData, maxDiscount: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Usage Limit</label>
                <input
                  type="number"
                  min="1"
                  value={couponFormData.usageLimit}
                  onChange={(e) => setCouponFormData({ ...couponFormData, usageLimit: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Expiry Date</label>
                <input
                  type="date"
                  value={couponFormData.expiryDate}
                  onChange={(e) => setCouponFormData({ ...couponFormData, expiryDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="flex items-center gap-2 dark:text-white">
                <input
                  type="checkbox"
                  checked={couponFormData.emailSpecific}
                  onChange={(e) => setCouponFormData({ ...couponFormData, emailSpecific: e.target.checked })}
                  className="rounded border-gray-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-sm font-medium">Email Specific Coupon</span>
              </label>
            </div>

            {couponFormData.emailSpecific && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2 dark:text-white">Email Address</label>
                <input
                  type="email"
                  required={couponFormData.emailSpecific}
                  value={couponFormData.email}
                  onChange={(e) => setCouponFormData({ ...couponFormData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="user@example.com"
                />
              </div>
            )}

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {editingCoupon && editingCoupon.id ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingCoupon && editingCoupon.id ? 'Update Coupon' : 'Create Coupon'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CouponModal;