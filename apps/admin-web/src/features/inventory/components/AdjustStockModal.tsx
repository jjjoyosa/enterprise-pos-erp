import React, { useState } from 'react';
import { useStockMovement } from '../api/useInventory';
import type { InventoryLevel } from '../api/useInventory';
import { X, PackageSearch, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

interface Props {
  inventoryItem: InventoryLevel;
  onClose: () => void;
}

export const AdjustStockModal = ({ inventoryItem, onClose }: Props) => {
  const mutation = useStockMovement();
  
  const [formData, setFormData] = useState({
    type: 'IN' as 'IN' | 'OUT',
    quantity: 1,
    reference: '',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.quantity <= 0 || isNaN(formData.quantity)) {
      newErrors.quantity = "Quantity must be a valid number greater than zero.";
    }
    
    if (formData.type === 'OUT' && formData.quantity > inventoryItem.quantity) {
      newErrors.quantity = `Cannot deduct ${formData.quantity}. Only ${inventoryItem.quantity} in stock.`;
    }

    if (!formData.reference.trim()) {
      newErrors.reference = "A reference document (PO/Invoice/Ticket) is required.";
    }

    if (formData.type === 'OUT' && !formData.notes.trim()) {
      newErrors.notes = "A reason must be provided when deducting stock.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return; 
    
    setSuccessMessage(null);

    mutation.mutate({
      productId: inventoryItem.productId._id,
      warehouseId: inventoryItem.warehouseId._id,
      type: formData.type,
      quantity: Number(formData.quantity),
      reference: formData.reference,
      notes: formData.notes
    }, {
      onSuccess: () => {
        // Show the success banner
        setSuccessMessage('Stock adjustment processed successfully!');
        
        // Wait 1.5 seconds, then close the modal automatically
        setTimeout(() => {
          onClose(); 
        }, 1500);
      }
    });
  };

  if (!inventoryItem) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-blue-50">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <PackageSearch size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Adjust Stock</h2>
              <p className="text-xs font-medium text-blue-600">{inventoryItem.productId.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-white/50 hover:bg-white p-2 rounded-full transition-colors shadow-sm">
            <X size={20} />
          </button>
        </div>

        {/* --- INLINE SUCCESS FEEDBACK --- */}
        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3 animate-fadeIn">
            <CheckCircle2 className="text-green-600" size={20} />
            <p className="text-sm font-bold text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Current Stock Banner */}
        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
          <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Current Available Stock</span>
          <span className="text-xl font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
            {inventoryItem.quantity}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Movement Type</label>
              <select 
                value={formData.type}
                onChange={(e) => {
                  setFormData({...formData, type: e.target.value as 'IN' | 'OUT'});
                  setErrors({...errors, quantity: '', notes: ''}); 
                }}
                className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium bg-white"
                disabled={successMessage !== null}
              >
                <option value="IN">Receive (IN)</option>
                <option value="OUT">Deduct (OUT)</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                min="1"
                value={formData.quantity || ''}
                onChange={(e) => {
                  setFormData({...formData, quantity: parseInt(e.target.value) || 0});
                  if (errors.quantity) setErrors({...errors, quantity: ''});
                }}
                disabled={successMessage !== null}
                className={`w-full border rounded-xl p-3 outline-none text-sm focus:ring-2 ${errors.quantity ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
          </div>
          {errors.quantity && <p className="text-red-500 text-xs font-bold flex items-center gap-1"><AlertCircle size={12}/> {errors.quantity}</p>}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Reference ID <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.reference}
              onChange={(e) => {
                setFormData({...formData, reference: e.target.value});
                if (errors.reference) setErrors({...errors, reference: ''});
              }}
              disabled={successMessage !== null}
              className={`w-full border rounded-xl p-3 outline-none text-sm focus:ring-2 ${errors.reference ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="e.g., PO-2026-041 or INV-8892"
            />
            {errors.reference && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.reference}</p>}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Notes / Reason {formData.type === 'OUT' && <span className="text-red-500">*</span>}
            </label>
            <textarea 
              value={formData.notes}
              onChange={(e) => {
                setFormData({...formData, notes: e.target.value});
                if (errors.notes) setErrors({...errors, notes: ''});
              }}
              disabled={successMessage !== null}
              className={`w-full border rounded-xl p-3 outline-none text-sm focus:ring-2 resize-none ${errors.notes ? 'border-red-300 focus:ring-red-500 bg-red-50' : 'border-gray-300 focus:ring-blue-500'}`}
              rows={3}
              placeholder={formData.type === 'OUT' ? "Explain why stock is being deducted (e.g., Damaged, Shrinkage)" : "Optional details (e.g., Restock from Main Warehouse)"}
            />
            {errors.notes && <p className="text-red-500 text-xs font-bold mt-1 flex items-center gap-1"><AlertCircle size={12}/> {errors.notes}</p>}
          </div>

          {mutation.isError && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} />
              Failed to process movement. Please try again.
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            disabled={mutation.isPending || successMessage !== null}
            className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={mutation.isPending || successMessage !== null}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors disabled:opacity-50"
          >
            <Save size={18} /> {mutation.isPending ? 'Processing...' : 'Confirm Adjustment'}
          </button>
        </div>

      </div>
    </div>
  );
};