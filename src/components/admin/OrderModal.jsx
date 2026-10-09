import React from 'react';
import { X, Printer } from 'lucide-react';

const OrderModal = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const handlePrint = () => {
    window.print();
  };

  const numberOfItems = order.items?.length || 0;
  const totalQuantity = order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <style>{`
  @media print {

    @page {
      size: 4in 6in;
      margin: 0;
    }
    html,
    body {
       margin: 0 !important;
       padding: 0 !important;
       height: 6in !important;
      
    }
     body * {
        visibility: hidden;
}
    
    .shipping-label-print,
    .shipping-label-print * {
      visibility: visible;
    }

   .shipping-label-print {
  position: relative !important;

   top: 0 !important;
   left: 0 !important;

  width: 3.8in !important;
  min-height: 6in !important;

  margin: 0 auto !important;
  padding: 0.08in 0.15in 0.15in !important;

  box-sizing: border-box !important;

  page-break-inside: avoid;
  break-inside: avoid;
}

    .print-hidden {
      display: none !important;
    }
  }
`}</style>
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="px-6 pt-3 pb-6 printable-content shipping-label-print">
          <div className="flex justify-end items-center mb-0 gap-4 print-hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 text-gray-700 rounded-md transition-colors"
            >
              <Printer size={18} />
              <span className="text-sm font-medium">Print</span>
            </button>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          {/* Logo */}
          <div className="text-center mb-3">
  <h1 className="text-2xl font-extrabold tracking-wide">
    SOWMYA SELECTIONS
  </h1>
</div>ord

<hr className="border-t border-gray-300 mb-4" />

          {/* Ship To */}
          <div className="mb-3">
            <h3 className="text-x1 font-semibold mb-4 dark:text-white">SHIPPING ADDRESS</h3>
            {order.shippingAddress ? (
              <div className="space-y-2 dark:text-white">
                <p className="text-xl font-bold leading-tight break-words uppercase">{order.shippingAddress.fullName}</p>
                <p className="text-x1 font-bold tracking-wide">{order.shippingAddress.phone}</p>
                <p className="text-sm">{order.shippingAddress.address}</p>
                <p className="text-base">
                  {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No shipping address available</p>
            )}
          </div>

          <hr className="border-t-2 border-gray-300 dark:border-gray-600 mb-6" />

          {/* Order Details */}
          <div className="mb-3">
            <h3 className="text-x1 font-semibold mb-4 dark:text-white">ORDER DETAILS</h3>
            <div className="space-y-2 text-lg dark:text-white">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                <span className="font-semibold">{order.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Number of Items:</span>
                <span className="font-semibold">{numberOfItems}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Total Quantity:</span>
                <span className="font-semibold">{totalQuantity}</span>
              </div>
            </div>
          </div>

          <hr className="border-t-2 border-gray-300 dark:border-gray-600 mb-6" />
          {/* Product Details */}

<hr className="border-t-2 border-gray-300 mb-3" />

<div className="mb-3">
  <h3 className="text-x1 font-semibold mb-4 dark:text-white">
    PRODUCTS
  </h3>

  <div className="space-y-2">
    {order.items?.map((item, index) => (
      <div
        key={index}
        className="flex items-center gap-2"
      >
        <img
          src={item.image}
          alt={item.name}
          className="w-14 h-14 object-cover rounded border"
        />

        
<div className="flex-1">
  <p className="text-sm font-medium">
    {item.name}
  </p>
<p className="text-sm text-gray-600">
  Colour: {item.color || 'Not specified'}
</p>
  <p className="text-sm text-gray-600">
    Qty : {item.quantity}
  </p>
</div>

      </div>
    ))}
  </div>
</div>

          {/* From */}
          <div>
            <h3 className="text-x1 font-semibold mb-0 dark:text-white">FROM</h3>
            <div className="space-y-0  dark:text-white">
              <p className="text-lg font-semibold">SOWMYA SELECTIONS</p>
              <p className="text-sm">Phone: 9121006787</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderModal;