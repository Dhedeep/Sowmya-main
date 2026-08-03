import { useState, useEffect } from 'react';
import {
  authenticateShiprocket,
  isShiprocketAuthenticated,
  logoutShiprocket,
  getShiprocketOrders,
  createShiprocketOrder,
  checkCourierServiceability,
  createShipment
} from '../../firebase/services/shiprocketService';

export const useShiprocket = () => {
  const [shiprocketAuthenticated, setShiprocketAuthenticated] = useState(false);
  const [shiprocketOrders, setShiprocketOrders] = useState([]);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pickupLocations, setPickupLocations] = useState([
    {
      id: '1',
      pickup_code: 'DEFAULT001',
      pickup_location: 'Default Warehouse',
      name: 'Main Warehouse',
      address: '123 Storage Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      pin_code: '400001',
      phone: '+91 9876543210',
      email: 'warehouse@example.com'
    }
  ]);

  useEffect(() => {
    setShiprocketAuthenticated(isShiprocketAuthenticated());
  }, []);

  const handleShiprocketAuth = async (email, password) => {
    setIsAuthenticating(true);
    try {
      await authenticateShiprocket(email, password);
      setShiprocketAuthenticated(true);
      await fetchShiprocketOrders();
      return { success: true };
    } catch (error) {
      console.error('Shiprocket authentication error:', error);
      return { success: false, error: error.message };
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleShiprocketLogout = () => {
    logoutShiprocket();
    setShiprocketAuthenticated(false);
    setShiprocketOrders([]);
  };

  const fetchShiprocketOrders = async () => {
    try {
      const ordersData = await getShiprocketOrders();
      setShiprocketOrders(ordersData.data || []);
      return { success: true };
    } catch (error) {
      console.error('Error fetching Shiprocket orders:', error);
      return { success: false, error: error.message };
    }
  };

  const calculateShippingRates = async (selectedEcommerceOrder, selectedPickupLocation) => {
    if (!selectedEcommerceOrder || !selectedPickupLocation) {
      return { success: false, error: 'Missing order or pickup location' };
    }
    
    // Validate pincode before making API call
    const deliveryPincode = selectedEcommerceOrder.shippingAddress?.pincode;
    const pickupPincode = selectedPickupLocation.pin_code;
    
    if (!deliveryPincode || deliveryPincode.length < 3) {
      return { success: false, error: 'Invalid delivery pincode' };
    }
    
    if (!pickupPincode || pickupPincode.length < 3) {
      return { success: false, error: 'Invalid pickup location pincode' };
    }
    
    try {
      // Calculate weight from order items
      const totalWeight = selectedEcommerceOrder.items?.reduce((sum, item) => {
        return sum + (item.weight || 0.5) * (item.quantity || 1); // Default 0.5kg per item if not specified
      }, 0);
      
      const params = {
        pickup_postcode: pickupPincode,
        delivery_postcode: deliveryPincode,
        cod: 0, // Assuming prepaid orders
        weight: totalWeight
      };
      
      const response = await checkCourierServiceability(params);
      if (response.data && response.data.available_courier_companies) {
        return { success: true, data: response.data.available_courier_companies };
      }
      return { success: false, error: 'No couriers available' };
    } catch (error) {
      console.error('Error calculating shipping rates:', error);
      return { success: false, error: error.message };
    }
  };

  const handleCreateShipment = async (selectedEcommerceOrder, selectedPickupLocation, selectedCourier) => {
    if (!selectedEcommerceOrder || !selectedPickupLocation || !selectedCourier) {
      return { success: false, error: 'Missing required information' };
    }
    
    try {
      // Format order data according to Shiprocket API specification
      const orderData = {
        order_id: `ECOM_${selectedEcommerceOrder.id}_${Date.now()}`, // Unique order ID
        order_date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        pickup_location: selectedPickupLocation.pickup_code,
        billing_customer_name: selectedEcommerceOrder.customerName || selectedEcommerceOrder.shippingAddress?.name || '',
        billing_last_name: '', // Optional
        billing_address: selectedEcommerceOrder.billingAddress?.address || selectedEcommerceOrder.shippingAddress?.address || '',
        billing_address_2: selectedEcommerceOrder.billingAddress?.address_2 || '',
        billing_city: selectedEcommerceOrder.billingAddress?.city || selectedEcommerceOrder.shippingAddress?.city || '',
        billing_state: selectedEcommerceOrder.billingAddress?.state || selectedEcommerceOrder.shippingAddress?.state || '',
        billing_country: selectedEcommerceOrder.billingAddress?.country || selectedEcommerceOrder.shippingAddress?.country || 'India',
        billing_pincode: selectedEcommerceOrder.billingAddress?.pincode || selectedEcommerceOrder.shippingAddress?.pincode || '',
        billing_email: selectedEcommerceOrder.customerEmail || '',
        billing_phone: selectedEcommerceOrder.billingAddress?.phone || selectedEcommerceOrder.shippingAddress?.phone || '',
        billing_alternate_phone: '', // Optional
        shipping_is_billing: false, // Shipping is different from billing
        shipping_customer_name: selectedEcommerceOrder.shippingAddress?.name || selectedEcommerceOrder.customerName || '',
        shipping_last_name: '', // Optional
        shipping_address: selectedEcommerceOrder.shippingAddress?.address || '',
        shipping_address_2: selectedEcommerceOrder.shippingAddress?.address_2 || '',
        shipping_city: selectedEcommerceOrder.shippingAddress?.city || '',
        shipping_state: selectedEcommerceOrder.shippingAddress?.state || '',
        shipping_country: selectedEcommerceOrder.shippingAddress?.country || 'India',
        shipping_pincode: selectedEcommerceOrder.shippingAddress?.pincode || '',
        shipping_email: selectedEcommerceOrder.customerEmail || '',
        shipping_phone: selectedEcommerceOrder.shippingAddress?.phone || '',
        order_items: selectedEcommerceOrder.items?.map(item => ({
          name: item.name,
          sku: item.sku || `SKU_${item.id}`,
          units: item.quantity || 1,
          selling_price: item.price || 0,
          discount: item.discount || 0,
          tax: item.tax || 0,
          hsn: item.hsn || '' // Optional
        })) || [],
        payment_method: selectedEcommerceOrder.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
        shipping_charges: selectedCourier.rate || 0,
        giftwrap_charges: 0,
        transaction_charges: 0,
        total_discount: selectedEcommerceOrder.discount || 0,
        sub_total: selectedEcommerceOrder.subtotal || selectedEcommerceOrder.total || 0,
        length: 10, // Default dimensions
        breadth: 10,
        height: 5,
        weight: selectedEcommerceOrder.items?.reduce((sum, item) => sum + (item.weight || 0.5) * (item.quantity || 1), 0) || 1,
        ewaybill_no: '', // Optional
        customer_gstin: '', // Optional
        invoice_number: '', // Optional
        order_type: '' // Optional
      };
      
      // Create order first
      const orderResponse = await createShiprocketOrder(orderData);
      
      if (orderResponse.data && orderResponse.data.order_id) {
        // Then create shipment for the order with selected courier
        const shipmentResponse = await createShipment(orderResponse.data.order_id, selectedCourier.courier_id);
        
        if (shipmentResponse.data) {
          return {
            success: true,
            data: {
              orderResponse: orderResponse.data,
              shipmentResponse: shipmentResponse.data
            }
          };
        }
      }
      return { success: false, error: 'Failed to create shipment' };
    } catch (error) {
      console.error('Error creating shipment:', error);
      return { success: false, error: error.message };
    }
  };

  const addPickupLocation = (newLocation) => {
    const locationWithId = {
      id: Date.now().toString(),
      ...newLocation,
      pickup_location: newLocation.pickup_code || newLocation.pickup_location
    };
    setPickupLocations([...pickupLocations, locationWithId]);
    return { success: true };
  };

  return {
    shiprocketAuthenticated,
    shiprocketOrders,
    isAuthenticating,
    pickupLocations,
    handleShiprocketAuth,
    handleShiprocketLogout,
    fetchShiprocketOrders,
    calculateShippingRates,
    handleCreateShipment,
    addPickupLocation
  };
};