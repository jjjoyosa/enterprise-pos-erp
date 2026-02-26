import React, { useState, useEffect } from 'react';
import { X, Package, Tag, Hash, DollarSign, CheckSquare, Loader2, Wand2, FolderOpen, Plus } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../api/useProducts'; 
import type { Product } from '../api/useProducts';
import { useCategories, useCreateCategory } from '../api/useCategories'; 

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, productToEdit }) => {
  const isEditMode = !!productToEdit;
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { data: categories = [], isLoading } = useCategories();
  
  // --- NEW FEATURE: Quick Add Category State ---
  const createCategoryMutation = useCreateCategory();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    basePrice: '',
    costPrice: '',
    trackInventory: true,
    categoryId: '' 
  });

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        basePrice: productToEdit.basePrice?.toString() || '',
        costPrice: productToEdit.costPrice?.toString() || '',
        trackInventory: productToEdit.trackInventory ?? true,
        categoryId: (typeof productToEdit.categoryId === 'object' && productToEdit.categoryId !== null)
          ? productToEdit.categoryId._id 
          : (productToEdit.categoryId || '')
      });
    } else {
      setFormData({ name: '', sku: '', basePrice: '', costPrice: '', trackInventory: true, categoryId: '' });
    }
  }, [productToEdit, isOpen]);

  const generateSKU = () => {
    if (!formData.name) {
      alert("Please enter a product name first!");
      return;
    }
    const prefix = formData.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, sku: `${prefix}-${randomNum}` });
  };

  // --- NEW FEATURE: Handle Quick Save ---
  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    const newCat = await createCategoryMutation.mutateAsync({ name: newCategoryName });
    
    // Auto-select the newly created category in the dropdown!
    if (newCat && newCat._id) {
      setFormData({ ...formData, categoryId: newCat._id });
    }
    
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sku: formData.sku,
      basePrice: Number(formData.basePrice),
      costPrice: Number(formData.costPrice),
      trackInventory: formData.trackInventory,
      categoryId: formData.categoryId 
    };

    try {
      if (isEditMode) {
        await updateProductMutation.mutateAsync({ id: productToEdit!._id, data: payload });
      } else {
        await createProductMutation.mutateAsync(payload);
      }
      onClose();
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  if (!isOpen) return null;
  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {isEditMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              <p className="text-xs text-gray-500 font-medium">
                {isEditMode ? 'Update catalog details' : 'Create a new SKU in the master catalog'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Tag size={16} className="text-gray-400" /> Product Name
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g., Acme Mechanical Keyboard"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* --- NEW FEATURE: The Category Block --- */}
            <div className="space-y-1.5 md:col-span-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <FolderOpen size={16} className="text-gray-400" /> Category
                </label>
                
                {!isAddingCategory && (
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCategory(true)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                  >
                    <Plus size={14} /> Quick Add Category
                  </button>
                )}
              </div>

              {isAddingCategory ? (
                <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100 mt-2">
                  <input 
                    type="text" 
                    placeholder="New Category Name..." 
                    className="flex-1 px-3 py-1.5 rounded outline-none border border-blue-200 focus:border-blue-400 text-sm"
                    value={newCategoryName}
                    onChange={e => setNewCategoryName(e.target.value)}
                    autoFocus
                  />
                  <button 
                    type="button" 
                    onClick={handleSaveNewCategory}
                    disabled={createCategoryMutation.isPending || !newCategoryName.trim()}
                    className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-bold hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {createCategoryMutation.isPending ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setIsAddingCategory(false)}
                    className="text-gray-500 px-2 hover:text-gray-700"
                  >
                    <X size={18} />
                  </button>
                </div>
              ) : (
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white mt-2"
                  value={formData.categoryId}
                  onChange={e => setFormData({...formData, categoryId: e.target.value})}
                >
                  <option value="" disabled>Select a Category...</option>
                  {categories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                <span className="flex items-center gap-2"><Hash size={16} className="text-gray-400" /> SKU</span>
                {!isEditMode && (
                  <button type="button" onClick={generateSKU} className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold">
                    <Wand2 size={12} /> Auto-Generate
                  </button>
                )}
              </label>
              <input 
                required
                disabled={isEditMode}
                type="text" 
                placeholder="e.g., ACME-KB-01"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 font-mono text-sm outline-none ${isEditMode ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : 'border-gray-200'}`}
                value={formData.sku}
                onChange={e => setFormData({...formData, sku: e.target.value.toUpperCase()})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" /> Base Price (₱)
              </label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.basePrice}
                onChange={e => setFormData({...formData, basePrice: e.target.value})}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <DollarSign size={16} className="text-gray-400" /> Cost Price (₱)
              </label>
              <input 
                required
                type="number" 
                step="0.01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={formData.costPrice}
                onChange={e => setFormData({...formData, costPrice: e.target.value})}
              />
            </div>

            <div className="space-y-1.5 md:col-span-2 mt-2">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={formData.trackInventory}
                  onChange={e => setFormData({...formData, trackInventory: e.target.checked})}
                />
                <div>
                  <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CheckSquare size={16} className="text-gray-400" /> Track Inventory Levels
                  </div>
                </div>
              </label>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 mt-8">
            <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm">
              {createProductMutation.isPending || updateProductMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};