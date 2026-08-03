import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import ProductModal from './ProductModal';
import { useCategoryContext } from '../../contexts/CategoryContext';

const ProductsManagement = ({
  products,
  searchTerm,
  setSearchTerm,
  onEditProduct,
  onDeleteProduct,
  deletingProductId,
  onAddProduct
}) => {
  const { categories, loading: loadingCategories, getCategoryName } = useCategoryContext();

  const getSubcategoryName = (subcategoryId) => {
    if (!subcategoryId) return '';
    return getCategoryName(subcategoryId);
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Create a unique key for each product to avoid React key conflicts
  const getUniqueProductKey = (product, index) => {
    // Use combination of product ID and index to ensure uniqueness
    return `${product.id || 'no-id'}-${index}`;
  };

  const getStockStatusClass = (stock) => {
    if (stock === 0) return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
    if (stock < 5) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100';
    return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100';
  };

  const getStockStatusText = (stock) => {
    if (stock === 0) return 'Out of Stock';
    if (stock < 5) return `Low Stock (${stock})`;
    return `In Stock (${stock})`;
  };

  const handleAddProduct = () => {
    onAddProduct();
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
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            <button
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors"
            >
              <Plus size={20} />
              Add Product
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 dark:text-gray-300">Product</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Category</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Subcategory</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Price</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Stock</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product, index) => (
                <tr key={getUniqueProductKey(product, index)} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={product.images?.[0] || 'https://picsum.photos/seed/product/40/40'}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                      />
                      <span className="dark:text-white">{product.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 dark:text-white">
                    {loadingCategories ? 'Loading...' : getCategoryName(product.category)}
                  </td>
                  <td className="py-3 px-4 dark:text-white">
                    {loadingCategories ? 'Loading...' : getSubcategoryName(product.subcategory) || '-'}
                  </td>
                  <td className="py-3 px-4 dark:text-white">₹{product.price}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${getStockStatusClass(product.stock || 0)}`}>
                      {getStockStatusText(product.stock || 0)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onEditProduct(product)}
                        className="p-1 text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => onDeleteProduct(product.id)}
                        disabled={deletingProductId === product.id}
                        className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {deletingProductId === product.id ? (
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
    </>
  );
};

export default ProductsManagement;