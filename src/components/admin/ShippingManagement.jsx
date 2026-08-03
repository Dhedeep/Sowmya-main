import React, { useState } from 'react';
import { Truck, X, Plus, Shield, MapPin, Package, Edit } from 'lucide-react';
import CreateShipmentModal from './CreateShipmentModal';
import AddPickupLocationModal from './AddPickupLocationModal';
import EditAddressModal from './EditAddressModal';

const ShippingManagement = ({
  shiprocketData,
  orders,
  onShiprocketAuth,
  onShiprocketLogout,
  onFetchShiprocketOrders,
  onCreateShipment,
  onAddPickupLocation
}) => {
  const [isCreateShipmentModalOpen, setIsCreateShipmentModalOpen] = useState(false);
  const [isAddPickupLocationModalOpen, setIsAddPickupLocationModalOpen] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [selectedEcommerceOrder, setSelectedEcommerceOrder] = useState(null);
  const [editedAddress, setEditedAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const {
    shiprocketAuthenticated,
    shiprocketOrders,
    isAuthenticating,
    pickupLocations
  } = shiprocketData;

  const getStatusClass = (status) => {
    return status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' :
      status === 'shipped' ? 'bg-brand-secondary/10 text-brand-secondary' :
        status === 'processing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100' :
          'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  const handleCreateShipment = () => {
    setIsCreateShipmentModalOpen(true);
  };

  const handleCloseCreateShipmentModal = () => {
    setIsCreateShipmentModalOpen(false);
    setSelectedEcommerceOrder(null);
  };

  const handleAddPickupLocation = () => {
    setIsAddPickupLocationModalOpen(true);
  };

  const handleCloseAddPickupLocationModal = () => {
    setIsAddPickupLocationModalOpen(false);
  };

  const handleEditAddress = (order) => {
    setSelectedEcommerceOrder(order);
    setEditedAddress({
      name: order.customerName || order.shippingAddress?.name || '',
      address: order.shippingAddress?.address || '',
      city: order.shippingAddress?.city || '',
      state: order.shippingAddress?.state || '',
      pincode: order.shippingAddress?.pincode || '',
      phone: order.shippingAddress?.phone || ''
    });
    setIsEditAddressModalOpen(true);
  };

  const handleCloseEditAddressModal = () => {
    setIsEditAddressModalOpen(false);
    setEditedAddress({
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    });
  };

  const handleSaveEditedAddress = (address) => {
    setSelectedEcommerceOrder({
      ...selectedEcommerceOrder,
      shippingAddress: {
        ...selectedEcommerceOrder.shippingAddress,
        ...address
      },
      customerName: address.name
    });
    setIsEditAddressModalOpen(false);
  };

  const handleShipmentCreated = (shipmentData) => {
    // Update order status to 'shipped' in the main component
    // This will be handled by the parent component
    handleCloseCreateShipmentModal();
  };

  if (!shiprocketAuthenticated) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-700 dark:border-gray-700">
        <div className="p-8">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <Truck className="mx-auto text-brand-primary mb-4" size={48} />
              <h2 className="text-2xl font-bold dark:text-white mb-2">Shiprocket Authentication</h2>
              <p className="text-gray-600 dark:text-gray-400">
                Please authenticate with your Shiprocket account to access shipping features
              </p>
            </div>

            <ShiprocketAuthForm onAuth={onShiprocketAuth} isAuthenticating={isAuthenticating} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold dark:text-white">Shipping Management</h2>
            <div className="flex gap-3">
              <button
                onClick={handleCreateShipment}
                className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors"
              >
                <Plus size={20} />
                Create Shipment
              </button>
              <button
                onClick={onShiprocketLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <X size={20} />
                Logout
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">

                Shiprocket Orders
              </h3>
              <div className="space-y-3">
                {shiprocketOrders.length > 0 ? (
                  shiprocketOrders.slice(0, 5).map((order, index) => (
                    <div key={`shiprocket-order-${order.id || 'no-id'}-${index}`} className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded">
                      <div>
                        <p className="font-medium dark:text-white">#{order.id}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{order.customer_name}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No Shiprocket orders found
                  </p>
                )}
              </div>
              <button
                onClick={onFetchShiprocketOrders}
                className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white"
              >
                Refresh Orders
              </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                <MapPin size={20} />
                Pickup Locations
              </h3>
              <div className="mb-4 flex justify-end">
                <button
                  onClick={handleAddPickupLocation}
                  className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-1"
                >
                  <Plus size={14} />
                  Add Location
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {pickupLocations.length > 0 ? (
                  pickupLocations.slice(0, 3).map((location, index) => (
                    <div key={`pickup-location-${location.pickup_code || 'no-code'}-${index}`} className="p-3 bg-white dark:bg-gray-800 rounded">
                      <p className="font-medium dark:text-white">{location.pickup_code}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{location.address}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{location.city}, {location.state}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                    No pickup locations found
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CreateShipmentModal
        isOpen={isCreateShipmentModalOpen}
        onClose={handleCloseCreateShipmentModal}
        orders={orders}
        pickupLocations={pickupLocations}
        onCreateShipment={onCreateShipment}
        onEditAddress={handleEditAddress}
        onShipmentCreated={handleShipmentCreated}
        calculateShippingRates={shiprocketData.calculateShippingRates}
      />

      <AddPickupLocationModal
        isOpen={isAddPickupLocationModalOpen}
        onClose={handleCloseAddPickupLocationModal}
        onAddPickupLocation={onAddPickupLocation}
      />

      <EditAddressModal
        isOpen={isEditAddressModalOpen}
        onClose={handleCloseEditAddressModal}
        address={editedAddress}
        onSaveAddress={handleSaveEditedAddress}
      />
    </>
  );
};

// Shiprocket Auth Form Component
const ShiprocketAuthForm = ({ onAuth, isAuthenticating }) => {
  const [credentials, setCredentials] = useState({ email: '', password: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    onAuth(credentials.email, credentials.password);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">Email</label>
        <input
          type="email"
          required
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="your@email.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 dark:text-white">Password</label>
        <input
          type="password"
          required
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
          placeholder="Your password"
        />
      </div>

      <button
        type="submit"
        disabled={isAuthenticating}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isAuthenticating ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            Authenticating...
          </>
        ) : (
          <>
            <Shield size={16} />
            Authenticate
          </>
        )}
      </button>
    </form>
  );
};

export default ShippingManagement;