import React, { useState } from 'react';
import { useStockMovement } from '../api/useInventory';
import type { InventoryLevel } from '../api/useInventory';

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

  // State to hold validation evaluation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Strict Form Evaluation Logic
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.quantity <= 0 || isNaN(formData.quantity)) {
      newErrors.quantity = "Quantity must be a valid number greater than zero.";
    }

    // Prevent negative stock logic
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
    
    // Return true if no errors exist
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return; // Stop submission if evaluation fails
    
    mutation.mutate({
      productId: inventoryItem.productId._id,
      warehouseId: inventoryItem.warehouseId._id,
      type: formData.type,
      quantity: Number(formData.quantity),
      reference: formData.reference,
      notes: formData.notes
    }, {
      onSuccess: () => {
        onClose(); 
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <h3 className="text-xl font-bold mb-4 border-b pb-2">
          Adjust Stock: {inventoryItem.productId.name}
        </h3>
        
        <div className="mb-6 flex justify-between items-center bg-gray-50 p-3 rounded border">
          <span className="text-sm text-gray-600 font-medium">Current Available Stock:</span>
          <strong className="text-xl text-blue-700">{inventoryItem.quantity}</strong>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Movement Type</label>
              <select 
                value={formData.type}
                onChange={(e) => {
                  setFormData({...formData, type: e.target.value as 'IN' | 'OUT'});
                  setErrors({...errors, quantity: '', notes: ''}); // Clear specific errors on type change
                }}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="IN">Receive (IN)</option>
                <option value="OUT">Deduct (OUT)</option>
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
              <input 
                type="number" 
                value={formData.quantity}
                onChange={(e) => {
                  setFormData({...formData, quantity: parseInt(e.target.value) || 0});
                  if (errors.quantity) setErrors({...errors, quantity: ''});
                }}
                className={`w-full border rounded-md p-2 outline-none focus:ring-2 ${errors.quantity ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              />
            </div>
          </div>
          {/* Quantity Error Render */}
          {errors.quantity && <p className="text-red-500 text-xs mt-1 font-medium">{errors.quantity}</p>}

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Reference ID <span className="text-red-500">*</span></label>
            <input 
              type="text" 
              value={formData.reference}
              onChange={(e) => {
                setFormData({...formData, reference: e.target.value});
                if (errors.reference) setErrors({...errors, reference: ''});
              }}
              className={`w-full border rounded-md p-2 outline-none focus:ring-2 ${errors.reference ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              placeholder="e.g., PO-2026-041 or INV-8892"
            />
            {errors.reference && <p className="text-red-500 text-xs mt-1 font-medium">{errors.reference}</p>}
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
              className={`w-full border rounded-md p-2 outline-none focus:ring-2 ${errors.notes ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'}`}
              rows={3}
              placeholder={formData.type === 'OUT' ? "Explain why stock is being deducted (e.g., Damaged, Shrinkage)" : "Optional details"}
            />
            {errors.notes && <p className="text-red-500 text-xs mt-1 font-medium">{errors.notes}</p>}
          </div>

          {mutation.isError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded text-sm">
              Failed to process movement. Please try again.
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6 pt-4 border-t">
            <button 
              type="button" 
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 border rounded text-gray-600 hover:bg-gray-100 font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={mutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium disabled:opacity-50 flex items-center justify-center min-w-[120px]"
            >
              {mutation.isPending ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};