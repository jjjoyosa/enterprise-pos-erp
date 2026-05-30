import React, { useState, useEffect } from 'react';

import { X, Package, Tag, Hash, DollarSign, CheckSquare, Loader2, Wand2, FolderOpen, Plus, Image as ImageIcon, UploadCloud, Layers, Truck } from 'lucide-react';
import { useCreateProduct, useUpdateProduct } from '../api/useProducts'; 
import type { Product } from '../api/useProducts';
import { useCategories, useCreateCategory } from '../api/useCategories'; 

import { useSuppliers } from '../../../hooks/useSuppliers';

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  productToEdit?: Product | null;
}

export const ProductForm: React.FC<ProductFormProps> = ({ isOpen, onClose, productToEdit }) => {
  const isEditMode = !!productToEdit;
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  
  const { data: categories = [], isLoading: isCatLoading } = useCategories();
  
  const { data: suppliers = [], isLoading: isSupLoading } = useSuppliers();
  
  const createCategoryMutation = useCreateCategory();
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false); 

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    basePrice: '',
    costPrice: '',
    trackInventory: true,
    categoryId: '',
    imageUrl: '',
    type: 'STANDARD' as 'STANDARD' | 'RAW_MATERIAL', 
    isSellable: true,
    supplierId: '' 
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
          : (productToEdit.categoryId || ''),
        imageUrl: productToEdit.imageUrl || '',
        type: productToEdit.type || 'STANDARD', 
        isSellable: productToEdit.isSellable ?? true,
        
        supplierId: (typeof productToEdit.supplierId === 'object' && productToEdit.supplierId !== null)
          ? productToEdit.supplierId._id 
          : (productToEdit.supplierId || '') 
      });
    } else {
      setFormData({ name: '', sku: '', basePrice: '', costPrice: '', trackInventory: true, categoryId: '', imageUrl: '', type: 'STANDARD', isSellable: true, supplierId: '' });
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

  const handleSaveNewCategory = async () => {
    if (!newCategoryName.trim()) return;
    const newCat = await createCategoryMutation.mutateAsync({ name: newCategoryName });
    
    if (newCat && newCat._id) {
      setFormData({ ...formData, categoryId: newCat._id });
    }
    
    setIsAddingCategory(false);
    setNewCategoryName('');
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'pos_products'); 
    
    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/dwnkryz7g/image/upload`, {
        method: 'POST',
        body: data
      });
      const fileData = await res.json();
      setFormData({ ...formData, imageUrl: fileData.secure_url });
    } catch (error) {
      console.error("Image upload failed", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: formData.name,
      sku: formData.sku,
      basePrice: Number(formData.basePrice),
      costPrice: Number(formData.costPrice),
      trackInventory: formData.trackInventory,
      categoryId: formData.categoryId,
      imageUrl: formData.imageUrl,
      type: formData.type, 
      isSellable: formData.isSellable,
supplierId: formData.supplierId === '' ? undefined : formData.supplierId    };

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
  if (isCatLoading || isSupLoading) return <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60"><Loader2 size={48} className="animate-spin text-white" /></div>;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        
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

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col md:flex-row gap-8">
          
          {/* LEFT COLUMN: IMAGE UPLOAD */}
          <div className="w-full md:w-1/3 space-y-4">
            <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <ImageIcon size={16} className="text-gray-400" /> Product Image
            </label>
            <div className="relative group w-full aspect-square border-2 border-dashed border-gray-300 rounded-2xl overflow-hidden flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
              {formData.imageUrl ? (
                <>
                  <img src={formData.imageUrl} alt="Product" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white font-bold text-sm flex items-center gap-2">
                      <UploadCloud size={18} /> Change Image
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-center p-4">
                  {isUploadingImage ? (
                    <Loader2 size={32} className="mx-auto text-blue-600 animate-spin mb-2" />
                  ) : (
                    <>
                      <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500 font-medium">Click to upload</span>
                    </>
                  )}
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={uploadImage}
                disabled={isUploadingImage}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            {formData.imageUrl && (
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, imageUrl: '' })}
                className="w-full py-2 text-sm text-red-600 hover:bg-red-50 font-bold rounded-lg transition-colors"
              >
                Remove Image
              </button>
            )}
          </div>

          {/* RIGHT COLUMN: DETAILS */}
          <div className="w-full md:w-2/3 space-y-6">
            
            {/* CATALOG CONFIGURATION */}
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-3">
              <label className="text-sm font-bold text-blue-900 flex items-center gap-2">
                <Layers size={16} className="text-blue-500" /> Catalog Configuration
              </label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'STANDARD', isSellable: true })}
                  className={`p-3 text-sm font-bold rounded-lg border transition-all ${
                    formData.type === 'STANDARD' 
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Finished Good
                  <div className={`text-xs mt-1 font-medium ${formData.type === 'STANDARD' ? 'text-blue-100' : 'text-gray-400'}`}>
                    Sellable on POS
                  </div>
                </button>
                
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'RAW_MATERIAL', isSellable: false })}
                  className={`p-3 text-sm font-bold rounded-lg border transition-all ${
                    formData.type === 'RAW_MATERIAL' 
                      ? 'bg-purple-600 text-white border-purple-600 shadow-md' 
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  Raw Material
                  <div className={`text-xs mt-1 font-medium ${formData.type === 'RAW_MATERIAL' ? 'text-purple-100' : 'text-gray-400'}`}>
                    Hidden from POS
                  </div>
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
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
                      <Plus size={14} /> Quick Add
                    </button>
                  )}
                </div>

                {isAddingCategory ? (
                  <div className="flex items-center gap-2 bg-blue-50 p-2 rounded-lg border border-blue-100">
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
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

              {/* --- NEW SUPPLIER DROPDOWN --- */}
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Truck size={16} className="text-gray-400" /> Default Supplier
                </label>
                <select 
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  value={formData.supplierId} 
                  onChange={e => setFormData({...formData, supplierId: e.target.value})}
                >
                  <option value="">No supplier assigned</option>
                  {suppliers.map((sup: any) => (
                    <option key={sup._id} value={sup._id}>{sup.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
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

            <div className="grid grid-cols-2 gap-4">
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
            </div>

            <div className="space-y-1.5 pt-2">
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

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  checked={formData.isSellable}
                  onChange={e => setFormData({...formData, isSellable: e.target.checked})}
                />
                <div>
                  <div className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    <CheckSquare size={16} className="text-gray-400" /> Available on POS
                  </div>
                  <div className="text-xs text-gray-500 font-medium mt-0.5">
                    Uncheck to hide this item from cashiers
                  </div>
                </div>
              </label>
            </div>
          </div>
          
        </form>
        
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
          <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">Cancel</button>
          <button type="button" onClick={handleSubmit} disabled={isUploadingImage || createProductMutation.isPending || updateProductMutation.isPending} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 rounded-xl shadow-sm transition-colors">
            {createProductMutation.isPending || updateProductMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : 'Save Product'}
          </button>
        </div>
      </div>
    </div>
  );
};