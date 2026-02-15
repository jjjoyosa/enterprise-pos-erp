import React, { useState } from 'react';
import { X, Package, Tag, Hash, DollarSign, CheckSquare, Loader2, Wand2, FolderOpen } from 'lucide-react';
import { useCreateProduct } from '../api/useProducts'; 

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose }) => {
  const createProductMutation = useCreateProduct();

  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    basePrice: '',
    costPrice: '',
    trackInventory: true,
    categoryId: '' 
  });

  if (!isOpen) return null;

  
  const generateSKU = () => {
    if (!formData.name) {
      alert("Please enter a product name first!");
      return;
    }
    
    const prefix = formData.name.replace(/[^a-zA-Z]/g, '').substring(0, 3).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, sku: `${prefix}-${randomNum}` });
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
      await createProductMutation.mutateAsync(payload);
      setFormData({ name: '', sku: '', basePrice: '', costPrice: '', trackInventory: true, categoryId: '' });
      onClose();
    } catch (error) {
      console.error("Failed to create product:", error);
      alert("Failed to save product. Check the console for details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Package size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
              <p className="text-xs text-gray-500 font-medium">Create a new SKU in the master catalog</p>
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
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>

            {/* NEW: Category Dropdown */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FolderOpen size={16} className="text-gray-400" /> Category
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={formData.categoryId}
                onChange={e => setFormData({...formData, categoryId: e.target.value})}
              >
                <option value="" disabled>Select a Category...</option>
                {/* Temporary valid Mongo ObjectIds so the backend doesn't crash. 
                    You will replace these with real categories later! */}
                <option value="65a1b2c3d4e5f6a7b8c9d0e1">Electronics</option>
                <option value="65a1b2c3d4e5f6a7b8c9d0e2">Peripherals</option>
                <option value="65a1b2c3d4e5f6a7b8c9d0e3">Office Supplies</option>
              </select>
            </div>

            {/* UPDATED: SKU Field with Auto-Generate Button */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex justify-between items-center">
                <span className="flex items-center gap-2"><Hash size={16} className="text-gray-400" /> Stock Keeping Unit (SKU)</span>
                <button 
                  type="button" 
                  onClick={generateSKU}
                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-bold"
                >
                  <Wand2 size={12} /> Auto-Generate
                </button>
              </label>
              <input 
                required
                type="text" 
                placeholder="e.g., ACME-KB-01"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm outline-none"
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
                min="0"
                step="0.01"
                placeholder="0.00"
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
                min="0"
                step="0.01"
                placeholder="0.00"
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
                  <p className="text-xs text-gray-500 mt-0.5">Enable this to monitor stock and receive critical low-stock alerts.</p>
                </div>
              </label>
            </div>

          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3 mt-8">
            <button 
              type="button" 
              onClick={onClose}
              disabled={createProductMutation.isPending}
              className="px-5 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={createProductMutation.isPending}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
            >
              {createProductMutation.isPending ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Saving...
                </>
              ) : (
                'Save Product'
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};