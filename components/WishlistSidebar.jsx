import React from 'react';
import { Product } from '../types';
import { X, Trash2 } from 'lucide-react';

const WishlistSidebar = ({ isOpen, onClose, wishlistItems, toggleWishlist, viewProduct }) => {
  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={onClose}
      />
      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-gray-900 shadow-lg z-50 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Wishlist</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>
          
          {wishlistItems.length === 0 ? (
            <div className="flex-grow flex flex-col items-center justify-center text-center p-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Your wishlist is empty</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Add items you love to your wishlist to see them here.</p>
              <button onClick={onClose} className="mt-6 bg-gray-900 text-white font-bold py-2 px-6 rounded-md hover:bg-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {wishlistItems.map(item => (
                <div key={item.id} className="flex items-center space-x-4">
                  <img src={item.images[0]} alt={item.name} className="w-20 h-20 object-cover rounded-md cursor-pointer" onClick={() => viewProduct(item)}/>
                  <div className="flex-grow">
                    <h4 className="font-semibold text-gray-800 dark:text-gray-200 cursor-pointer" onClick={() => viewProduct(item)}>{item.name}</h4>
                    <p className="text-gray-700 dark:text-gray-300 font-bold">₹{item.price}</p>
                  </div>
                  <button onClick={() => toggleWishlist(item)} className="p-2 text-gray-500 hover:text-red-500 dark:hover:text-red-400">
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WishlistSidebar;