import React, { useState } from 'react';
import { useCreateProduct } from '../api/useProducts';
import { Loader2, X } from 'lucide-react';

interface ProductFormProps {
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ onClose }) => {
  const { mutate: createProduct, isPending, isError } = useCreateProduct();
  
  const [formData, setFormData] = useState({
    name: '',
    basePrice: '',
    costPrice: '',
    trackInventory: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // We use a dummy category ID for Phase 1. 
    // In Phase 2, this will be a dropdown selecting from your actual categories.
    createProduct({
      categoryId: '6a13ef25a686547665c727e9' as any, 
      name: formData.name,
      basePrice: Number(formData.basePrice),
      costPrice: Number(formData.costPrice),
      trackInventory: formData.trackInventory
    }, {
      onSuccess: () => {
        onClose(); // Close the modal on success
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">Add New Product</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {isError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md">
              Failed to create product. Please try again.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input 
              required
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 outline-none"
              placeholder="e.g. Wireless Mouse"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (₱)</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 outline-none"
                value={formData.basePrice}
                onChange={(e) => setFormData({...formData, basePrice: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (₱)</label>
              <input 
                required
                type="number" 
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-brand-500 focus:border-brand-500 outline-none"
                value={formData.costPrice}
                onChange={(e) => setFormData({...formData, costPrice: e.target.value})}
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input 
              type="checkbox" 
              id="trackInventory"
              className="h-4 w-4 text-brand-600 rounded border-gray-300 focus:ring-brand-500 cursor-pointer"
              checked={formData.trackInventory}
              onChange={(e) => setFormData({...formData, trackInventory: e.target.checked})}
            />
            <label htmlFor="trackInventory" className="ml-2 block text-sm text-gray-900 cursor-pointer">
              Track Inventory
            </label>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isPending}
              className="flex-1 flex justify-center items-center px-4 py-2 text-white bg-blue-600 hover:bg-brand-700 rounded-md font-medium transition-colors disabled:opacity-70"
            >
              {isPending ? <Loader2 className="animate-spin" size={20} /> : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};