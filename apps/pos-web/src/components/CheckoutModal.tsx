import React, { useState } from 'react';
import { useProcessSale } from '../hooks/useSales';
import { useCartStore } from '../store/useCartStore';
import { Loader2, X, CheckCircle2 } from 'lucide-react';

interface CheckoutModalProps {
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose }) => {
  const { items, total, discount, clearCart } = useCartStore();
  const { mutate: submitSale, isPending, isSuccess, data: saleData } = useProcessSale();
  
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH' | 'CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>(total.toString());
  const [error, setError] = useState<string | null>(null);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (paymentMethod === 'CASH' && Number(amountTendered) < total) {
      setError('Amount tendered cannot be less than the total.');
      return;
    }

    
    const formattedItems = items.map(item => ({
      productId: item.productId,
      quantity: item.quantity
    }));

    submitSale({
      paymentMethod,
      discount,
      items: formattedItems
    });
  };

  const handleCloseAndClear = () => {
    if (isSuccess) clearCart();
    onClose();
  };

  
  if (isSuccess) {
    const isOffline = saleData?.isOffline;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 text-center transform transition-all">
          <CheckCircle2 className={`mx-auto h-16 w-16 mb-4 ${isOffline ? 'text-amber-500' : 'text-green-500'}`} />
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {isOffline ? 'Saved Offline' : 'Sale Complete!'}
          </h2>
          
          <p className="text-gray-500 mb-2">Receipt No: <span className="font-mono font-medium text-gray-900">{saleData?.sale?.receiptNumber}</span></p>
          
          {isOffline && (
            <p className="text-xs text-amber-600 font-medium bg-amber-50 rounded p-2 mb-4">
              Internet disconnected. Transaction saved securely to device and will sync later.
            </p>
          )}
          
          {paymentMethod === 'CASH' && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 border border-gray-100">
              <div className="text-sm text-gray-600 font-medium">Change Due</div>
              <div className="text-3xl font-bold text-gray-900">
                ₱{(Number(amountTendered) - total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          )}

          <button 
            onClick={handleCloseAndClear}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors"
          >
            New Order
          </button>
        </div>
      </div>
    );
  }

  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-xl font-bold text-gray-900">Process Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleCheckout} className="p-6 flex-1 overflow-y-auto">
          <div className="text-center mb-8">
            <div className="text-sm text-gray-500 font-medium mb-1">Total Amount Due</div>
            <div className="text-4xl font-bold text-blue-600">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>

          {error && <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">{error}</div>}

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {['CASH', 'GCASH', 'CARD'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method as any)}
                    className={`py-3 px-4 rounded-xl font-semibold border-2 transition-all ${
                      paymentMethod === method 
                        ? 'border-blue-600 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {paymentMethod === 'CASH' && (
              <div className="animate-fadeIn">
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount Tendered (₱)</label>
                <input 
                  type="number" 
                  min={total}
                  step="0.01"
                  required
                  className="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-blue-600 outline-none transition-colors"
                  value={amountTendered}
                  onChange={(e) => setAmountTendered(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="mt-8">
            <button 
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white text-lg font-bold py-4 rounded-xl flex justify-center items-center transition-colors"
            >
              {isPending ? <Loader2 className="animate-spin" size={24} /> : 'Complete Transaction'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};