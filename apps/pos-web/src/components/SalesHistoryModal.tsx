import React, { useState } from 'react';
import { useSalesHistory } from '../hooks/useSalesHistory';
import { ReceiptTemplate } from './ReceiptTemplate';
import { X, Receipt, Printer, Calendar, CreditCard, ChevronDown, ChevronUp, Package, Loader2, RotateCcw, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api'; 

interface SalesHistoryModalProps {
  onClose: () => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ onClose }) => {
  const { data: sales, isLoading } = useSalesHistory() as any; 
  
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [saleToPrint, setSaleToPrint] = useState<any>(null);
  
  
  const [confirmRefundId, setConfirmRefundId] = useState<string | null>(null);
  const [localRefundedIds, setLocalRefundedIds] = useState<string[]>([]); 
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handlePrint = (sale: any) => {
    setSaleToPrint(sale);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000); 
  };

  
  const executeRefund = async (sale: any) => {
    setIsProcessing(true);
    setToast(null);

    try {
      const itemsToRefund = sale.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      await api.post(`/sales/${sale._id}/refund`, {
        refundReason: "Full transaction void via POS",
        itemsToRefund
      });

      showToast('success', `Receipt #${sale.receiptNumber} was successfully voided.`);
      
      
      setLocalRefundedIds(prev => [...prev, sale._id]);
      setConfirmRefundId(null); 

    } catch (error: any) {
      console.error(error);
      showToast('error', error.response?.data?.error || "Failed to process refund");
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedSaleId(prev => prev === id ? null : id);
    setConfirmRefundId(null); 
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
              <Receipt size={24} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Transaction Ledger</h2>
              <p className="text-xs text-gray-500 font-medium">Viewing recent company sales</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-gray-200/50 hover:bg-gray-200 p-2 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* In-Modal Notification Toast */}
        {toast && (
          <div className={`p-4 text-sm font-bold flex items-center gap-2 ${toast.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-100' : 'bg-red-50 text-red-700 border-b border-red-100'}`}>
            {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            {toast.message}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-2 bg-gray-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Loader2 className="animate-spin mb-4" size={32} />
              <p>Loading transaction history...</p>
            </div>
          ) : !sales || sales.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-400">
              <Receipt className="mb-4 opacity-30" size={48} />
              <p>No sales found for this location.</p>
            </div>
          ) : (
            <div className="space-y-2 p-2">
              {sales.map((sale: any) => {
                const isExpanded = expandedSaleId === sale._id;
                
                
                const displayStatus = localRefundedIds.includes(sale._id) ? 'REFUNDED' : sale.status;
                const isRefunded = displayStatus === 'REFUNDED' || displayStatus === 'PARTIALLY_REFUNDED';
                
                const date = new Date(sale.createdAt).toLocaleString(undefined, { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });

                return (
                  <div key={sale._id} className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-colors ${isRefunded ? 'border-red-100 bg-red-50/20' : 'border-gray-200 hover:border-blue-200'}`}>
                    
                    {/* Collapsed Row */}
                    <button 
                      onClick={() => toggleExpand(sale._id)}
                      className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                    >
                      <div className="flex items-center gap-6 w-2/3">
                        <div className="flex items-center gap-2 text-gray-500 w-32 shrink-0">
                          <Calendar size={16} />
                          <span className="text-sm font-medium">{date}</span>
                        </div>
                        <div className={`font-mono text-sm font-bold w-40 shrink-0 ${isRefunded ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                          {sale.receiptNumber}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          <CreditCard size={12} />
                          {sale.paymentMethod}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        {isRefunded && (
                           <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-1 rounded border border-red-200 uppercase tracking-wider">
                             Voided
                           </span>
                        )}
                        <span className={`text-lg font-bold ${isRefunded ? 'text-gray-400' : 'text-blue-600'}`}>
                          ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Expanded Items Area */}
                    {isExpanded && (
                      <div className={`p-4 border-t animate-fadeIn ${isRefunded ? 'bg-red-50/40 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package size={14} /> Purchased Items
                        </h4>
                        
                        {/* INLINE CONFIRMATION UI */}
                        {confirmRefundId === sale._id ? (
                          <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg w-full mb-4 animate-fadeIn">
                            <div className="flex items-center gap-2 text-red-800">
                              <AlertTriangle size={18} className="text-red-600" />
                              <span className="text-sm font-medium">Confirm void and restock inventory?</span>
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setConfirmRefundId(null)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs font-bold text-gray-600 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => executeRefund(sale)}
                                disabled={isProcessing}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-red-600 rounded hover:bg-red-700 flex items-center gap-2 transition-colors disabled:opacity-50"
                              >
                                {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} 
                                {isProcessing ? 'Processing...' : 'Yes, Void Receipt'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Standard Action Buttons */
                          <div className="flex gap-2 mb-4">
                            <button 
                              onClick={() => handlePrint(sale)}
                              className="flex items-center gap-2 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                            >
                              <Printer size={14} /> Print Receipt
                            </button>
                            
                            {!isRefunded && (
                              <button 
                                onClick={() => setConfirmRefundId(sale._id)}
                                className="flex items-center gap-2 text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-50 hover:border-red-300 transition-colors ml-auto shadow-sm"
                              >
                                <RotateCcw size={14} /> Void Transaction
                              </button>
                            )}
                            {isRefunded && (
                              <span className="ml-auto text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded border border-red-100">
                                {displayStatus.replace('_', ' ')}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="space-y-2">
                          {sale.items.map((item: any, idx: number) => (
                            <div key={idx} className={`flex justify-between items-center text-sm ${isRefunded ? 'opacity-60' : ''}`}>
                              <span className="text-gray-700 font-medium">
                                <span className="text-gray-400 mr-2">{item.quantity}x</span> 
                                Product ID: {item.productId.slice(-6)}
                              </span>
                              <span className="text-gray-600 font-mono">
                                ₱{item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Receipt Math Summary */}
                        <div className={`mt-4 pt-3 border-t border-dashed space-y-1 ${isRefunded ? 'border-red-200' : 'border-gray-200'}`}>
                          <div className="flex justify-end gap-4 text-sm text-gray-500">
                            <span>Subtotal:</span>
                            <span className="font-mono w-24 text-right">₱{sale.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          <div className="flex justify-end gap-4 text-sm text-gray-500">
                            <span>Tax (12%):</span>
                            <span className="font-mono w-24 text-right">₱{sale.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                          {sale.discount > 0 && (
                            <div className="flex justify-end gap-4 text-sm text-red-500">
                              <span>Discount:</span>
                              <span className="font-mono w-24 text-right">-₱{sale.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <ReceiptTemplate sale={saleToPrint} />
      </div>
    </div>
  );
};