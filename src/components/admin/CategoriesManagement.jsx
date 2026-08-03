import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, ToggleLeft, ToggleRight, ChevronDown, ChevronRight } from 'lucide-react';
import CategoryModal from './CategoryModal';
import { useCategoryContext } from '../../contexts/CategoryContext';

const CategoriesManagement = ({
  categories,
  searchTerm,
  setSearchTerm,
  onEditCategory,
  onDeleteCategory,
  onToggleCategoryStatus,
  deletingCategoryId,
  updatingCategoryId,
  onAddCategory,
  isSubmitting,
  editingCategory,
  isCategoryModalOpen,
  onOpenCategoryModal,
  onCloseCategoryModal,
  handleCategorySubmit
}) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const { categoriesWithSubcategories, loading: loadingCategories, refreshCategoriesWithSubcategories } = useCategoryContext();

  const toggleCategoryExpansion = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };
  const getStatusClass = (isActive) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100';
  };

  const getStatusText = (isActive) => {
    return isActive ? 'Active' : 'Inactive';
  };

  const filterCategories = (categories, searchTerm) => {
    if (!searchTerm) return categories;

    return categories.filter(category => {
      const matchesMain = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.description?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesSubcategories = category.subcategories?.some(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return matchesMain || matchesSubcategories;
    });
  };

  const filteredCategories = filterCategories(categoriesWithSubcategories, searchTerm);

  const renderCategoryRow = (category, isSubcategory = false, level = 0) => {
    const isExpanded = expandedCategories.has(category.id);
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;

    return (
      <React.Fragment key={category.id}>
        <tr className={`border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${isSubcategory ? 'bg-gray-50 dark:bg-gray-750' : ''}`}>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2" style={{ paddingLeft: `${level * 20}px` }}>
              {!isSubcategory && hasSubcategories && (
                <button
                  onClick={() => toggleCategoryExpansion(category.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                </button>
              )}
              {!isSubcategory && !hasSubcategories && <div className="w-6" />}
              <div>
                <div className="font-medium dark:text-white">{category.name}</div>
                {category.description && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">{category.description}</div>
                )}
              </div>
            </div>
          </td>
          <td className="py-3 px-4 dark:text-white">
            {isSubcategory ? 'Subcategory' : 'Main Category'}
          </td>
          <td className="py-3 px-4">
            <span className={`px-2 py-1 rounded-full text-xs ${getStatusClass(category.isActive)}`}>
              {getStatusText(category.isActive)}
            </span>
          </td>
          <td className="py-3 px-4 dark:text-white">
            {category.subcategories?.length || 0}
          </td>
          <td className="py-3 px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleCategoryStatus(category.id)}
                disabled={updatingCategoryId === category.id}
                className="p-1 text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded disabled:opacity-50"
                title={category.isActive ? 'Deactivate' : 'Activate'}
              >
                {updatingCategoryId === category.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-primary"></div>
                ) : category.isActive ? (
                  <ToggleRight size={16} />
                ) : (
                  <ToggleLeft size={16} />
                )}
              </button>
              <button
                onClick={() => onEditCategory(category)}
                className="p-1 text-brand-primary hover:bg-brand-primary/10 dark:hover:bg-brand-primary/20 rounded"
              >
                <Edit size={16} />
              </button>
              <button
                onClick={() => onDeleteCategory(category.id)}
                disabled={deletingCategoryId === category.id}
                className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deletingCategoryId === category.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>
                ) : (
                  <Trash2 size={16} />
                )}
              </button>
            </div>
          </td>
        </tr>

        {/* Render subcategories if expanded */}
        {!isSubcategory && isExpanded && category.subcategories?.map(subcategory =>
          renderCategoryRow(subcategory, true, level + 1)
        )}
      </React.Fragment>
    );
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
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-primary"
                />
              </div>
            </div>
            <button
              onClick={onOpenCategoryModal}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding category...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Category
                </>
              )}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="text-left py-3 px-4 dark:text-gray-300">Category</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Type</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Subcategories</th>
                <th className="text-left py-3 px-4 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingCategories ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 dark:text-white">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-brand-primary"></div>
                      Loading categories...
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No categories found matching your search.' : 'No categories found.'}
                  </td>
                </tr>
              ) : (
                filteredCategories.map(category => renderCategoryRow(category))
              )}
            </tbody>
          </table>
        </div>
      </div>

     <CategoryModal
    isOpen={isCategoryModalOpen}
    onClose={onCloseCategoryModal}
    onSubmit={handleCategorySubmit}
    category={editingCategory}
    isSubmitting={isSubmitting}
/>
    </>
  );
};

export default CategoriesManagement;