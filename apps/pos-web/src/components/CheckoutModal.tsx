import React, { useState, useEffect } from 'react';
import { useProcessSale } from '../hooks/useSales';
import { useCartStore } from '../store/useCartStore';
import { useCurrentShift } from '../hooks/useShift'; 
import { Loader2, X, CheckCircle2, Printer } from 'lucide-react';
import { ReceiptTemplate } from './ReceiptTemplate';

interface CheckoutModalProps {
  onClose: () => void;
  onClearCustomer: () => void;
  customerId?: string | null;
  availablePoints?: number; 
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ onClose, onClearCustomer, customerId, availablePoints = 0 }) => {
  const { items, total, subtotal, tax, discount, clearCart } = useCartStore();
  const { data: currentShift } = useCurrentShift(); 
  const { mutate: submitSale, isPending, isSuccess, data: saleData } = useProcessSale();
  
  
  const [usePoints, setUsePoints] = useState(false);
  const maxPointsToRedeem = Math.min(availablePoints, total);
  const pointsRedeemed = usePoints ? maxPointsToRedeem : 0;
  const finalTotalDue = total - pointsRedeemed; 

  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'GCASH' | 'CARD'>('CASH');
  const [amountTendered, setAmountTendered] = useState<string>(finalTotalDue.toString());
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    setAmountTendered(finalTotalDue.toString());
  }, [finalTotalDue]);

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const tenderedNum = Number(amountTendered) || 0;

    if (paymentMethod === 'CASH' && tenderedNum < finalTotalDue) {
      setError('Amount tendered cannot be less than the total due.');
      return;
    }
    
    const formattedItems = items.map(item => ({
      productId: item.productId,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      subtotal: item.unitPrice * item.quantity
    }));

    submitSale({
      shiftId: currentShift?._id,
      paymentMethod,
      discount,
      pointsRedeemed, 
      customerId,
      subtotal,
      tax,
      totalAmount: finalTotalDue, 
      amountTendered: paymentMethod === 'CASH' ? tenderedNum : finalTotalDue,
      changeDue: paymentMethod === 'CASH' ? tenderedNum - finalTotalDue : 0,
      items: formattedItems
    });
  };

  const handleCloseAndClear = () => {
    if (isSuccess) clearCart();
    onClearCustomer();
    onClose();
  };
  
  if (isSuccess && saleData) {
    const isOffline = saleData.isOffline;
    const changeDue = paymentMethod === 'CASH' ? Number(amountTendered) - finalTotalDue : 0;
    const saleRecord = saleData.sale || saleData;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 text-center flex flex-col items-center my-8 max-h-[90vh]">
          <CheckCircle2 className={`h-12 w-12 mb-2 ${isOffline ? 'text-amber-500' : 'text-green-500'}`} />
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            {isOffline ? 'Saved Offline' : 'Sale Complete!'}
          </h2>
          
          {isOffline && (
            <p className="text-xs text-amber-600 font-medium bg-amber-50 rounded p-2 mb-4 w-full">
              Internet disconnected. Transaction saved securely to device and will sync later.
            </p>
          )}

          <div className="w-full text-left border border-dashed border-gray-300 p-4 rounded-lg bg-gray-50 overflow-y-auto mb-6 flex-1 min-h-300px">
             <ReceiptTemplate 
               sale={saleRecord} 
               change={changeDue} 
               amountTendered={Number(amountTendered)} 
             />
          </div>

          <div className="flex w-full gap-3 mt-auto">
            <button onClick={() => window.print()} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-colors flex justify-center items-center gap-2">
              <Printer size={20} /> Print
            </button>
            <button onClick={handleCloseAndClear} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors shadow-sm">
              New Order
            </button>
          </div>
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
          
          {/* Points Toggle UI */}
          {availablePoints > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl flex items-center justify-between shadow-sm">
              <div>
                <div className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  Use Loyalty Points
                </div>
                <div className="text-xs text-amber-700 font-medium mt-0.5">
                  Available: {availablePoints} pts (₱{availablePoints.toLocaleString(undefined, { minimumFractionDigits: 2 })})
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={usePoints}
                  onChange={() => setUsePoints(!usePoints)}
                />
                <div className="w-11 h-6 bg-amber-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          )}

          <div className="text-center mb-6 bg-gray-50 py-4 rounded-xl border border-gray-100">
            <div className="text-sm text-gray-500 font-medium mb-1">Total Amount Due</div>
            <div className="text-4xl font-bold text-blue-600">₱{finalTotalDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            {usePoints && (
              <div className="text-sm font-semibold text-amber-600 mt-2">
                (-₱{pointsRedeemed.toLocaleString(undefined, { minimumFractionDigits: 2 })} points applied)
              </div>
            )}
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
                  min={finalTotalDue}
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
              disabled={isPending || finalTotalDue < 0 || (finalTotalDue === 0 && !usePoints)}
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