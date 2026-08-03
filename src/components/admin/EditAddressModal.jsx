import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const EditAddressModal = ({ isOpen, onClose, address, onSaveAddress }) => {
  const [editedAddress, setEditedAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  React.useEffect(() => {
    if (address && isOpen) {
      setEditedAddress({
        name: address.name || '',
        address: address.address || '',
        city: address.city || '',
        state: address.state || '',
        pincode: address.pincode || '',
        phone: address.phone || ''
      });
    }
  }, [address, isOpen]);

  const [errors, setErrors] = useState({});

  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'name':
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

  const handleChange = (field, value) => {
    let filteredValue = value;

    // Strict input filtering
    switch (field) {
      case 'name':
      case 'city':
      case 'state':
        filteredValue = value.replace(/[^A-Za-z\s]/g, '');
        break;
      case 'phone':
        filteredValue = value.replace(/\D/g, '').slice(0, 10);
        break;
      case 'pincode':
        filteredValue = value.replace(/\D/g, '').slice(0, 6);
        break;
      default:
        break;
    }

    setEditedAddress(prev => ({
      ...prev,
      [field]: filteredValue
    }));

    const error = validateField(field, filteredValue);
    setErrors(prev => ({
      ...prev,
      [field]: error
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Final validation check
    const activeErrors = Object.values(errors).filter(err => err !== '');
    if (activeErrors.length > 0) {
      alert('Please fix errors:\n' + activeErrors.join('\n'));
      return;
    }

    if (editedAddress.phone.length !== 10) {
      alert('Phone must be 10 digits');
      return;
    }
    if (editedAddress.pincode.length !== 6) {
      alert('PIN must be 6 digits');
      return;
    }

    onSaveAddress(editedAddress);
    handleClose();
  };

  const handleClose = () => {
    setEditedAddress({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">Edit Shipping Address</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={editedAddress.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-primary'}`}
                  placeholder="John Doe"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 dark:text-white">Address *</label>
                <input
                  type="text"
                  required
                  value={editedAddress.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">City *</label>
                <input
                  type="text"
                  required
                  value={editedAddress.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${errors.city ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-primary'}`}
                  placeholder="Mumbai"
                />
                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">State *</label>
                <input
                  type="text"
                  required
                  value={editedAddress.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${errors.state ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-primary'}`}
                  placeholder="Maharashtra"
                />
                {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">PIN Code *</label>
                <input
                  type="text"
                  required
                  value={editedAddress.pincode}
                  onChange={(e) => handleChange('pincode', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${errors.pincode ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-primary'}`}
                  placeholder="400001"
                />
                {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1 dark:text-white">Phone *</label>
                <input
                  type="tel"
                  required
                  value={editedAddress.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 ${errors.phone ? 'border-red-500 focus:ring-red-500' : 'focus:ring-brand-primary'}`}
                  placeholder="9876543210"
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
            </div>

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
                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
              >
                <Save size={16} />
                Save Address
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditAddressModal;