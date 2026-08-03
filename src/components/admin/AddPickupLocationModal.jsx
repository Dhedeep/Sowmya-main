import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

const AddPickupLocationModal = ({ isOpen, onClose, onAddPickupLocation }) => {
  const [newPickupLocation, setNewPickupLocation] = useState({
    pickup_code: '',
    pickup_location: '',
    name: '',
    address: '',
    city: '',
    state: '',
    pin_code: '',
    phone: '',
    email: ''
  });

  React.useEffect(() => {
    if (isOpen) {
      setNewPickupLocation({
        pickup_code: '',
        pickup_location: '',
        name: '',
        address: '',
        city: '',
        state: '',
        pin_code: '',
        phone: '',
        email: ''
      });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddPickupLocation(newPickupLocation);
    handleClose();
  };

  const handleClose = () => {
    setNewPickupLocation({
      pickup_code: '',
      pickup_location: '',
      name: '',
      address: '',
      city: '',
      state: '',
      pin_code: '',
      phone: '',
      email: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">Add Pickup Location</h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Pickup Code</label>
                <input
                  type="text"
                  required
                  value={newPickupLocation.pickup_code}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, pickup_code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="WHSE001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Location Name</label>
                <input
                  type="text"
                  required
                  value={newPickupLocation.name}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Main Warehouse"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-2 dark:text-white">Address</label>
                <input
                  type="text"
                  required
                  value={newPickupLocation.address}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="123 Main Street"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">City</label>
                <input
                  type="text"
                  required
                  value={newPickupLocation.city}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Mumbai"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">State</label>
                <input
                  type="text"
                  required
                  value={newPickupLocation.state}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, state: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="Maharashtra"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">PIN Code</label>
                <input
                  type="text"
                  required
                  value={newPickupLocation.pin_code}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, pin_code: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="400001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Phone</label>
                <input
                  type="tel"
                  required
                  value={newPickupLocation.phone}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="+91 9876543210"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Email</label>
                <input
                  type="email"
                  required
                  value={newPickupLocation.email}
                  onChange={(e) => setNewPickupLocation({ ...newPickupLocation, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  placeholder="warehouse@example.com"
                />
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
                Add Location
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPickupLocationModal;