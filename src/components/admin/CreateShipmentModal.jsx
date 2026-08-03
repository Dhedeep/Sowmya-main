import React, { useState } from 'react';
import { X, Plus, Search, ShoppingCart, MapPin, Truck, Package, Edit } from 'lucide-react';
import EditAddressModal from './EditAddressModal';

const CreateShipmentModal = ({
  isOpen,
  onClose,
  orders,
  pickupLocations,
  onCreateShipment,
  onEditAddress,
  onShipmentCreated,
  calculateShippingRates
}) => {
  const [orderSearchTerm, setOrderSearchTerm] = useState('');
  const [selectedEcommerceOrder, setSelectedEcommerceOrder] = useState(null);
  const [selectedPickupLocation, setSelectedPickupLocation] = useState(null);
  const [selectedCourier, setSelectedCourier] = useState(null);
  const [shippingRates, setShippingRates] = useState([]);
  const [isFetchingRates, setIsFetchingRates] = useState(false);
  const [isCreatingShipment, setIsCreatingShipment] = useState(false);
  const [isEditAddressModalOpen, setIsEditAddressModalOpen] = useState(false);
  const [editedAddress, setEditedAddress] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  });

  const handleEditAddress = () => {
    if (!selectedEcommerceOrder) return;

    setEditedAddress({
      name: selectedEcommerceOrder.customerName || selectedEcommerceOrder.shippingAddress?.name || '',
      address: selectedEcommerceOrder.shippingAddress?.address || '',
      city: selectedEcommerceOrder.shippingAddress?.city || '',
      state: selectedEcommerceOrder.shippingAddress?.state || '',
      pincode: selectedEcommerceOrder.shippingAddress?.pincode || '',
      phone: selectedEcommerceOrder.shippingAddress?.phone || ''
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

  const handleCreateShipment = async () => {
    if (!selectedEcommerceOrder || !selectedPickupLocation || !selectedCourier) {
      alert('Please select an order, pickup location, and courier');
      return;
    }

    setIsCreatingShipment(true);
    try {
      const result = await onCreateShipment(selectedEcommerceOrder, selectedPickupLocation, selectedCourier);
      if (result.success) {
        onShipmentCreated(result.data);
        alert('Shipment created successfully!');
        handleClose();
      } else {
        alert('Failed to create shipment: ' + result.error);
      }
    } finally {
      setIsCreatingShipment(false);
    }
  };

  const fetchShippingRates = async () => {
    if (!selectedEcommerceOrder || !selectedPickupLocation) {
      alert('Please select an order and pickup location first');
      return;
    }

    setIsFetchingRates(true);
    try {
      // Use the calculateShippingRates function passed as a prop
      const result = await calculateShippingRates(selectedEcommerceOrder, selectedPickupLocation);

      if (result.success) {
        // Transform the API response to match our component's expected format
        const couriers = result.data.map(courier => ({
          courier_id: courier.courier_company_id,
          courier_name: courier.courier_name,
          rate: courier.rate,
          etd: courier.etd || `${courier.estimated_delivery_days} days`,
          courier_surface: courier.courier_surface || false,
          rating: courier.rating || 'N/A'
        }));

        setShippingRates(couriers);
      } else {
        throw new Error(result.error || 'Failed to fetch courier serviceability');
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      alert('Failed to fetch shipping rates: ' + error.message);
    } finally {
      setIsFetchingRates(false);
    }
  };

  const handleClose = () => {
    setSelectedEcommerceOrder(null);
    setSelectedPickupLocation(null);
    setSelectedCourier(null);
    setShippingRates([]);
    setIsFetchingRates(false);
    onClose();
  };

  const filteredOrders = orders.filter(order =>
    order.status === 'processing' && (
      order.id.toLowerCase().includes(orderSearchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(orderSearchTerm.toLowerCase())) ||
      (order.shippingAddress?.name && order.shippingAddress.name.toLowerCase().includes(orderSearchTerm.toLowerCase()))
    )
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold dark:text-white">Create Shipment</h2>
              <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                <X size={24} />
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Order Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                  <ShoppingCart size={20} />
                  Select Order
                </h3>
                <div className="mb-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search orders by ID, customer name..."
                      value={orderSearchTerm}
                      onChange={(e) => setOrderSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                    />
                  </div>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map(order => (
                      <div
                        key={order.id}
                        onClick={() => {
                          setSelectedEcommerceOrder(order);
                          setSelectedCourier(null);
                          setShippingRates([]);
                        }}
                        className={`p-3 rounded cursor-pointer transition-colors ${selectedEcommerceOrder?.id === order.id
                            ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-2 border-brand-primary'
                            : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium dark:text-white">{order.id}</p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.customerName || order.shippingAddress?.name}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.shippingAddress?.city}, {order.shippingAddress?.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold dark:text-white">₹{order.total?.toFixed(2) || '0.00'}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {order.items?.length || 0} items
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No processing orders available for shipment
                    </p>
                  )}
                </div>
              </div>

              {/* Pickup Location Selection */}
              <div>
                <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">
                  <MapPin size={20} />
                  Pickup Location
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {pickupLocations.length > 0 ? (
                    pickupLocations.map(location => (
                      <div
                        key={location.pickup_code}
                        onClick={() => {
                          setSelectedPickupLocation(location);
                          setSelectedCourier(null);
                          setShippingRates([]);
                        }}
                        className={`p-3 rounded cursor-pointer transition-colors ${selectedPickupLocation?.pickup_code === location.pickup_code
                            ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-2 border-brand-primary'
                            : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                          }`}
                      >
                        <p className="font-medium dark:text-white">{location.pickup_code}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{location.address}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {location.city}, {location.state} - {location.pin_code}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                      No pickup locations available
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Fetch Couriers Button */}
            {selectedEcommerceOrder && selectedPickupLocation && shippingRates.length === 0 && (
              <div className="mt-6">
                <button
                  onClick={fetchShippingRates}
                  disabled={isFetchingRates}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isFetchingRates ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Fetching Available Couriers...
                    </>
                  ) : (
                    <>
                      <Truck size={16} />
                      Fetch Available Couriers
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Available Couriers */}
            {shippingRates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold mb-4 dark:text-white flex items-center gap-2">

                  Available Couriers
                </h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {shippingRates.map((courier, index) => (
                    <div
                      key={`${courier.courier_id}-${index}`}
                      onClick={() => setSelectedCourier(courier)}
                      className={`p-3 rounded cursor-pointer transition-colors ${selectedCourier?.courier_id === courier.courier_id
                          ? 'bg-brand-primary/10 dark:bg-brand-primary/20 border-2 border-brand-primary'
                          : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium dark:text-white">{courier.courier_name}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Est. Delivery: {courier.etd || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Rating: {courier.rating || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold dark:text-white">₹{courier.rate || 'N/A'}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {courier.courier_surface ? 'Surface' : 'Express'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Create Shipment Button */}
            {selectedEcommerceOrder && selectedPickupLocation && selectedCourier && (
              <div className="mt-6">
                <button
                  onClick={handleCreateShipment}
                  disabled={isCreatingShipment}
                  className="w-full px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCreatingShipment ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating Shipment...
                    </>
                  ) : (
                    <>
                      <Package size={16} />
                      Create Shipment
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Order Summary */}
            {selectedEcommerceOrder && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold dark:text-white">Order Summary</h4>
                  <button
                    onClick={handleEditAddress}
                    className="px-3 py-1 bg-brand-primary text-white rounded text-sm hover:opacity-90 transition-colors flex items-center gap-1"
                  >
                    <Edit size={14} />
                    Edit Address
                  </button>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                    <span className="dark:text-white">{selectedEcommerceOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Customer:</span>
                    <span className="dark:text-white">{selectedEcommerceOrder.customerName || selectedEcommerceOrder.shippingAddress?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Delivery Address:</span>
                    <span className="dark:text-white">
                      {selectedEcommerceOrder.shippingAddress?.address}, {selectedEcommerceOrder.shippingAddress?.city}, {selectedEcommerceOrder.shippingAddress?.state} - {selectedEcommerceOrder.shippingAddress?.pincode}
                    </span>
                  </div>
                  {selectedCourier && (
                    <>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Courier:</span>
                        <span className="dark:text-white">{selectedCourier.courier_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Shipping Cost:</span>
                        <span className="dark:text-white">₹{selectedCourier.rate}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditAddressModal
        isOpen={isEditAddressModalOpen}
        onClose={handleCloseEditAddressModal}
        address={editedAddress}
        onSaveAddress={handleSaveEditedAddress}
      />
    </>
  );
};

export default CreateShipmentModal;