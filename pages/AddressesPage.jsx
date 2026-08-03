import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, MapPin, Check, X, Home, Briefcase, Star } from 'lucide-react';
import { useAdmin } from '../src/contexts/AdminContext';
import {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
} from '../src/firebase/services/addressService';

const AddressesPage = ({ navigateTo }) => {
  const { user } = useAdmin();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    address: '',
    apartment: '',
    city: '',
    state: '',
    postcode: '',
    country: 'United States',
    phone: '',
    email: '',
    type: 'home',
    isDefault: false
  });

  useEffect(() => {
    const fetchAddresses = async () => {
      if (user) {
        try {
          const userAddresses = await getUserAddresses(user.uid);
          setAddresses(userAddresses);
        } catch (error) {
          console.error('Error fetching addresses:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [user]);

  const resetForm = () => {
    setFormData({
      name: '',
      company: '',
      address: '',
      apartment: '',
      city: '',
      state: '',
      postcode: '',
      country: 'United States',
      phone: '',
      email: '',
      type: 'home',
      isDefault: false
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    try {
      if (editingAddress) {
        // Update existing address
        await updateUserAddress(user.uid, editingAddress.id, formData);
        setAddresses(prev => prev.map(addr =>
          addr.id === editingAddress.id
            ? { ...formData, id: editingAddress.id }
            : formData.isDefault && addr.id !== editingAddress.id
              ? { ...addr, isDefault: false } // Remove default from other addresses
              : addr
        ));
        setEditingAddress(null);
      } else {
        // Add new address
        const newAddress = await addUserAddress(user.uid, formData);

        // If new address is default, remove default from other addresses
        if (formData.isDefault) {
          setAddresses(prev => [
            ...prev.map(addr => ({ ...addr, isDefault: false })),
            newAddress
          ]);
        } else {
          setAddresses(prev => [...prev, newAddress]);
        }
      }

      resetForm();
      setIsAddingAddress(false);
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Failed to save address. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (address) => {
    setFormData(address);
    setEditingAddress(address);
    setIsAddingAddress(true);
  };

  const handleDelete = async (id) => {
    if (!user) return;

    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await deleteUserAddress(user.uid, id);
        setAddresses(prev => prev.filter(addr => addr.id !== id));
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (id) => {
    if (!user) return;

    try {
      await setDefaultAddress(user.uid, id);
      setAddresses(prev => prev.map(addr =>
        addr.id === id
          ? { ...addr, isDefault: true }
          : { ...addr, isDefault: false }
      ));
    } catch (error) {
      console.error('Error setting default address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const getAddressIcon = (type) => {
    switch (type) {
      case 'home':
        return <Home size={18} className="text-brand-primary" />;
      case 'work':
        return <Briefcase size={18} className="text-gray-500" />;
      case 'other':
        return <Star size={18} className="text-yellow-500" />;
      default:
        return <MapPin size={18} className="text-gray-500" />;
    }
  };

  const AddressForm = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold dark:text-white">
          {editingAddress ? 'Edit Address' : 'Add New Address'}
        </h2>
        <button
          onClick={() => {
            setIsAddingAddress(false);
            setEditingAddress(null);
            resetForm();
          }}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <X size={24} />
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1 dark:text-gray-300">Full Name *</label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-1 dark:text-gray-300">Company</label>
            <input
              id="company"
              type="text"
              name="company"
              value={formData.company}
              onChange={handleInputChange}
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="address" className="block text-sm font-medium mb-1 dark:text-gray-300">Address *</label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="apartment" className="block text-sm font-medium mb-1 dark:text-gray-300">Apartment, suite, etc.</label>
            <input
              id="apartment"
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleInputChange}
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium mb-1 dark:text-gray-300">City *</label>
            <input
              id="city"
              type="text"
              name="city"
              value={formData.city}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="state" className="block text-sm font-medium mb-1 dark:text-gray-300">State/Province *</label>
            <input
              id="state"
              type="text"
              name="state"
              value={formData.state}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="postcode" className="block text-sm font-medium mb-1 dark:text-gray-300">ZIP/Postal Code *</label>
            <input
              id="postcode"
              type="text"
              name="postcode"
              value={formData.postcode}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="country" className="block text-sm font-medium mb-1 dark:text-gray-300">Country *</label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="India">India</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1 dark:text-gray-300">Phone Number *</label>
            <input
              id="phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1 dark:text-gray-300">Email Address *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium mb-1 dark:text-gray-300">Address Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={submitting}
              className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
            >
              <option value="home">Home</option>
              <option value="work">Work</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="isDefault" className="flex items-center">
              <input
                id="isDefault"
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                disabled={submitting}
                className="mr-2"
              />
              <span className="text-sm dark:text-gray-300">Set as default address</span>
            </label>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Saving...' : (editingAddress ? 'Update Address' : 'Add Address')}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsAddingAddress(false);
              setEditingAddress(null);
              resetForm();
            }}
            disabled={submitting}
            className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );

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
          <p className="text-gray-600 dark:text-gray-400 mb-4">You need to be logged in to manage your addresses.</p>
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
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={() => navigateTo('dashboard')}
            className="flex items-center gap-2 text-brand-primary dark:text-brand-secondary hover:underline"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
        </div>
        <h1 className="text-3xl font-bold mb-2 dark:text-white">My Addresses</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your shipping and billing addresses</p>
      </div>

      {/* Add Address Button */}
      {!isAddingAddress && (
        <button
          onClick={() => setIsAddingAddress(true)}
          className="mb-6 px-6 py-3 bg-brand-primary text-white rounded-md hover:opacity-90 transition-colors flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Address
        </button>
      )}

      {/* Address Form */}
      {isAddingAddress && <AddressForm />}

      {/* Addresses List */}
      {addresses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div key={address.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
              {address.isDefault && (
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Check size={12} />
                  Default
                </div>
              )}

              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {getAddressIcon(address.type)}
                </div>
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg dark:text-white">{address.name}</h3>
                  {address.company && <p className="text-gray-600 dark:text-gray-400">{address.company}</p>}
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                <p>{address.address}</p>
                {address.apartment && <p>{address.apartment}</p>}
                <p>{address.city}, {address.state} {address.postcode}</p>
                <p>{address.country}</p>
                <p>{address.phone}</p>
                <p>{address.email}</p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(address)}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(address.id)}
                  className="flex items-center gap-1 px-3 py-2 text-sm border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="flex items-center gap-1 px-3 py-2 text-sm border border-brand-secondary/30 dark:border-brand-secondary/50 text-brand-secondary dark:text-brand-secondary rounded-md hover:bg-brand-secondary/5 dark:hover:bg-brand-secondary/10 transition-colors"
                  >
                    <Check size={16} />
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 text-center">
          <MapPin size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No addresses saved</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Add your first address to make checkout faster
          </p>
          <button
            onClick={() => setIsAddingAddress(true)}
            className="px-6 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2 mx-auto"
          >
            <Plus size={18} />
            Add Your First Address
          </button>
        </div>
      )}
    </div>
  );
};

export default AddressesPage;