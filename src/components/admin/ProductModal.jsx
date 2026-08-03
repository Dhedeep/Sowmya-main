import React, { useState, useEffect } from 'react';
import { X, Upload, Save } from 'lucide-react';
import { getMainCategories, getSubcategoriesByParentId } from '../../firebase/services/categoryService';

const initialProductState = {
  name: '',
  category: '',
  subcategory: '',
  price: '',
  originalPrice: '',
  sizes: [],
  colors: [],
  description: '',
  fabricDetails: '',
  stock: 10,
  images: []
};

const ProductModal = ({ isOpen, onClose, onSubmit, editingProduct, isSubmitting }) => {
  const [productFormData, setProductFormData] = useState(initialProductState);
  const [imageFiles, setImageFiles] = useState([]);
  const [mainCategories, setMainCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loadingMainCategories, setLoadingMainCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setProductFormData({
        name: editingProduct.name,
        category: editingProduct.category || '',
        subcategory: editingProduct.subcategory || '',
        price: editingProduct.price,
        originalPrice: editingProduct.originalPrice,
        sizes: editingProduct.sizes,
        colors: editingProduct.colors,
        description: editingProduct.description,
        fabricDetails: editingProduct.fabricDetails,
        stock: editingProduct.stock || 10,
        images: editingProduct.images
      });

      // Load subcategories if category is selected
      if (editingProduct.category) {
        loadSubcategories(editingProduct.category);
      }
    } else {
      setProductFormData(initialProductState);
    }
    setImageFiles([]);
  }, [editingProduct, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchMainCategories();
    }
  }, [isOpen]);

  const fetchMainCategories = async () => {
    try {
      setLoadingMainCategories(true);
      const categories = await getMainCategories();
      setMainCategories(categories);
    } catch (error) {
      console.error('Error fetching main categories:', error);
    } finally {
      setLoadingMainCategories(false);
    }
  };

  const loadSubcategories = async (categoryId) => {
    try {
      setLoadingSubcategories(true);
      const subcats = await getSubcategoriesByParentId(categoryId);
      setSubcategories(subcats);
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      setSubcategories([]);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  const handleCategoryChange = (e) => {
    const categoryId = e.target.value;
    setProductFormData({
      ...productFormData,
      category: categoryId,
      subcategory: '' // Reset subcategory when category changes
    });

    if (categoryId) {
      loadSubcategories(categoryId);
    } else {
      setSubcategories([]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) {
      e.stopPropagation();
      return;
    }

    // Create a copy of the form data
    const formDataToSubmit = {
      ...productFormData,
      // Ensure sizes and colors are arrays
      sizes: Array.isArray(productFormData.sizes) ? productFormData.sizes : productFormData.sizes.split(',').map(s => s.trim()).filter(s => s),
      colors: Array.isArray(productFormData.colors) ? productFormData.colors : productFormData.colors.split(',').map(c => c.trim()).filter(c => c)
    };

    onSubmit(formDataToSubmit, imageFiles, editingProduct?.id);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    setProductFormData(initialProductState);
    setImageFiles([]);
    setSubcategories([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 dark:border-gray-700">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold dark:text-white">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <button onClick={handleClose} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Product Name</label>
                <input
                  type="text"
                  required
                  value={productFormData.name}
                  onChange={(e) => setProductFormData({ ...productFormData, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Category</label>
                <select
                  value={productFormData.category}
                  onChange={handleCategoryChange}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  required
                >
                  <option value="">Select a category</option>
                  {loadingMainCategories && mainCategories.length === 0 ? (
                    <option>Loading categories...</option>
                  ) : (
                    mainCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Subcategory</label>
                <select
                  value={productFormData.subcategory}
                  onChange={(e) => setProductFormData({ ...productFormData, subcategory: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                  disabled={!productFormData.category}
                >
                  <option value="">
                    {productFormData.category ? 'Select a subcategory (optional)' : 'Select a category first'}
                  </option>
                  {productFormData.category && (
                    <option value="new-arrivals">New Arrivals</option>
                  )}
                  {loadingSubcategories ? (
                    <option disabled>Loading subcategories...</option>
                  ) : (
                    subcategories.map(subcat => (
                      <option key={subcat.id} value={subcat.id}>
                        {subcat.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Price</label>
                <input
                  type="number"
                  required
                  value={productFormData.price}
                  onChange={(e) => setProductFormData({ ...productFormData, price: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Original Price</label>
                <input
                  type="number"
                  value={productFormData.originalPrice}
                  onChange={(e) => setProductFormData({ ...productFormData, originalPrice: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Sizes (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(productFormData.sizes) ? productFormData.sizes.join(', ') : productFormData.sizes || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, sizes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 dark:text-white">Colors (comma-separated)</label>
                <input
                  type="text"
                  value={Array.isArray(productFormData.colors) ? productFormData.colors.join(', ') : productFormData.colors || ''}
                  onChange={(e) => setProductFormData({ ...productFormData, colors: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 dark:text-white">Stock Quantity</label>
              <input
                type="number"
                min="0"
                value={productFormData.stock}
                onChange={(e) => setProductFormData({ ...productFormData, stock: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Description</label>
              <textarea
                required
                value={productFormData.description}
                onChange={(e) => setProductFormData({ ...productFormData, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 dark:text-white">Product Specifications / Fabric Details</label>
              <p className="text-xs text-gray-500 mb-2 dark:text-gray-400">Use "Heading: Detail, Heading: Detail" format (e.g., Fabric: Silk, Craft: Ajrakh)</p>
              <textarea
                value={productFormData.fabricDetails}
                onChange={(e) => setProductFormData({ ...productFormData, fabricDetails: e.target.value })}
                rows={2}
                placeholder="Fabric: Premium Silk, Craft: Hand Print, ..."
                className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
              />
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 dark:text-white">Product Images</label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Click to upload images
                  </span>
                </label>
              </div>

              {/* Existing images */}
              {productFormData.images && productFormData.images.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 dark:text-white">Current Images</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {productFormData.images.map((image, index) => (
                      <div key={`existing-${index}`} className="relative">
                        <img
                          src={image}
                          alt={`Current image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New images being uploaded */}
              {imageFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium mb-2 dark:text-white">New Images</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {imageFiles.map((file, index) => (
                      <div key={`new-${index}-${file.name}`} className="relative">
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New image ${index + 1}`}
                          className="w-full h-20 object-cover rounded"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
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
                    {editingProduct ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    {editingProduct ? 'Update Product' : 'Add Product'}
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

export default ProductModal;