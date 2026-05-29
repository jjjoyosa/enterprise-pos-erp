import React, { useState } from 'react';
import { X, ArrowLeftRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface SupplierReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventoryItem: any | null; 
}

export const SupplierReturnModal: React.FC<SupplierReturnModalProps> = ({ isOpen, onClose, inventoryItem }) => {
  const [quantity, setQuantity] = useState<number | ''>('');
  const [reason, setReason] = useState('');
  const [managerName, setManagerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inventoryItem || !quantity || quantity <= 0) return;
    
    if (quantity > inventoryItem.quantity) {
      setErrorMessage("You cannot return more stock than you currently have.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const token = localStorage.getItem('erp_token');
      const response = await fetch('http://localhost:5000/api/v1/inventory/returns', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: inventoryItem.productId._id,
          warehouseId: inventoryItem.warehouseId._id,
          quantity: Number(quantity),
          reason,
          managerName
        })
      });

      if (!response.ok) throw new Error('Failed to process return');

      const data = await response.json();
      setSuccessMessage(`Success! Reference: ${data.reference}`);
      queryClient.invalidateQueries({ queryKey: ['inventory-levels'] });
      queryClient.invalidateQueries({ queryKey: ['stock-movements'] });

      setTimeout(() => {
        onClose();
        setQuantity('');
        setReason('');
        setManagerName('');
        setSuccessMessage(null);
      }, 1500);

    } catch (error) {
      setErrorMessage('Failed to process supplier return.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !inventoryItem) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-red-50 text-red-900">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-lg text-red-600">
              <ArrowLeftRight size={24} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Return to Supplier</h2>
              <p className="text-xs opacity-80">Process RMA for damaged/expired stock</p>
            </div>
          </div>
          <button onClick={onClose} className="text-red-400 hover:text-red-700 hover:bg-red-100 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {successMessage && (
          <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle2 className="text-green-600" size={20} />
            <p className="text-sm font-bold text-green-800">{successMessage}</p>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
            <AlertCircle className="text-red-600" size={20} />
            <p className="text-sm font-bold text-red-800">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleReturn} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Product</label>
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-600">
              {inventoryItem.productId.name} (Current Stock: {inventoryItem.quantity})
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Return Quantity</label>
            <input 
              type="number" 
              required min="1" max={inventoryItem.quantity}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value ? Number(e.target.value) : '')}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="e.g., 5"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Reason for Return</label>
            <input 
              type="text" 
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="e.g., Spoiled batch, Damaged packaging"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">Authorized By (Manager Name)</label>
            <input 
              type="text" 
              required
              value={managerName}
              onChange={(e) => setManagerName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Your Name"
            />
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-colors">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={isLoading || successMessage !== null}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Processing...' : 'Process Return'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};