import React, { useState } from 'react';
import { useSalesHistory } from '../hooks/useSalesHistory';
import { ReceiptTemplate } from './ReceiptTemplate';
import { X, Receipt,Printer, Calendar, CreditCard, ChevronDown, ChevronUp, Package, Loader2 } from 'lucide-react';

interface SalesHistoryModalProps {
  onClose: () => void;
}

export const SalesHistoryModal: React.FC<SalesHistoryModalProps> = ({ onClose }) => {
  const { data: sales, isLoading } = useSalesHistory();
  const [expandedSaleId, setExpandedSaleId] = useState<string | null>(null);
  const [saleToPrint, setSaleToPrint] = useState<any>(null);

  const handlePrint = (sale: any) => {
  setSaleToPrint(sale);
  
  setTimeout(() => {
    window.print();
    
    
  }, 100);
};

  const toggleExpand = (id: string) => {
    setExpandedSaleId(prev => prev === id ? null : id);
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
                const date = new Date(sale.createdAt).toLocaleString(undefined, { 
                  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
                });

                return (
                  <div key={sale._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:border-blue-200 transition-colors">
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
                        <div className="font-mono text-sm font-bold text-gray-700 w-40 shrink-0">
                          {sale.receiptNumber}
                        </div>
                        <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          <CreditCard size={12} />
                          {sale.paymentMethod}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className="text-lg font-bold text-blue-600">
                          ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        {isExpanded ? <ChevronUp size={20} className="text-gray-400" /> : <ChevronDown size={20} className="text-gray-400" />}
                      </div>
                    </button>

                    {/* Expanded Items Area */}
                    {isExpanded && (
                      <div className="bg-gray-50 p-4 border-t border-gray-100 animate-fadeIn">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                          <Package size={14} /> Purchased Items
                        </h4>
                        <button 
                        onClick={() => handlePrint(sale)}
                        className="flex items-center gap-2 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded hover:bg-blue-200 transition-colors"
                      >
                        <Printer size={14} /> Print Receipt
                      </button>
                        <div className="space-y-2">
                          {sale.items.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700 font-medium">
                                <span className="text-gray-400 mr-2">{item.quantity}x</span> 
                                Product ID: {item.productId.slice(-6)} {/* Fallback if name isn't populated */}
                              </span>
                              <span className="text-gray-600 font-mono">
                                ₱{item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Receipt Math Summary */}
                        <div className="mt-4 pt-3 border-t border-gray-200 border-dashed space-y-1">
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