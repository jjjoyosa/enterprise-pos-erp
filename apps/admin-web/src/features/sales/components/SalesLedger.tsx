import React, { useState } from 'react';
import { useSalesLedger, useRefundSale } from '../api/useSales';
import type { SaleRecord } from '../api/useSales';
import { Search, ReceiptText, Calendar, CreditCard, X, RotateCcw, AlertTriangle } from 'lucide-react';

export const SalesLedger = () => {
  const { data: sales = [], isLoading } = useSalesLedger();
  const { mutate: processRefund, isPending: isRefunding } = useRefundSale();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<SaleRecord | null>(null);
  
  // Refund Flow State
  const [refundSale, setRefundSale] = useState<SaleRecord | null>(null);
  const [refundReason, setRefundReason] = useState('');
  const [refundItems, setRefundItems] = useState<Record<string, number>>({});

  const filteredSales = sales.filter(s => 
    s.receiptNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.cashierId?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // --- Refund Handlers ---
  const openRefundModal = (sale: SaleRecord) => {
    setSelectedReceipt(null); // Close the view modal first
    setRefundSale(sale);
    setRefundReason('');
    
    // Initialize quantities to 0
    const initialItems: Record<string, number> = {};
    sale.items.forEach(item => {
      initialItems[item.productId] = 0;
    });
    setRefundItems(initialItems);
  };

  const handleRefundQuantityChange = (productId: string, quantity: number, maxAllowed: number) => {
    if (quantity < 0 || quantity > maxAllowed) return;
    setRefundItems(prev => ({ ...prev, [productId]: quantity }));
  };

  const submitRefund = () => {
    if (!refundSale) return;

    const itemsToRefund = Object.entries(refundItems)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity]) => ({ productId, quantity }));

    if (itemsToRefund.length === 0) {
      alert("Please select at least one item to refund.");
      return;
    }

    if (!refundReason.trim()) {
      alert("Please provide a reason for this return.");
      return;
    }

    processRefund({
      saleId: refundSale._id,
      refundReason,
      itemsToRefund
    }, {
      onSuccess: () => {
        setRefundSale(null); // Close modal on success
      }
    });
  };

  return (
    <div className="animate-fadeIn space-y-6">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Transactions Ledger</h2>
          <p className="text-gray-500 text-sm mt-1">Audit historical sales, view receipts, and monitor cash flow.</p>
        </div>
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search Receipt # or Cashier..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500 font-bold">
              <th className="p-4 pl-6">Date & Time</th>
              <th className="p-4">Receipt No.</th>
              <th className="p-4">Cashier</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Payment</th>
              <th className="p-4 text-right pr-6">Total Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">Loading ledger...</td></tr>
            ) : filteredSales.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-400">No transactions found.</td></tr>
            ) : (
              filteredSales.map((sale) => (
                <tr 
                  key={sale._id} 
                  onClick={() => setSelectedReceipt(sale)}
                  className="hover:bg-blue-50/50 transition-colors text-sm cursor-pointer group"
                >
                  <td className="p-4 pl-6 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-gray-400" />
                      {new Date(sale.createdAt).toLocaleString(undefined, { 
                        month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-blue-600 font-medium group-hover:underline">
                    {sale.receiptNumber}
                  </td>
                  <td className="p-4 text-gray-700 font-medium">
                    {sale.cashierId?.name || 'System Admin'}
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                      sale.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : 
                      sale.status === 'REFUNDED' ? 'bg-red-100 text-red-700' :
                      sale.status === 'PARTIALLY_REFUNDED' ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {sale.status || 'COMPLETED'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 justify-end w-max ml-auto">
                      <CreditCard size={12} /> {sale.paymentMethod}
                    </span>
                  </td>
                  <td className={`p-4 pr-6 text-right font-bold text-base ${sale.status === 'REFUNDED' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                    ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- View Receipt Details Modal --- */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col animate-fadeIn">
            
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ReceiptText className="text-blue-600" /> Receipt Details
              </h2>
              <button onClick={() => setSelectedReceipt(null)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 font-mono text-sm bg-gray-50 max-h-[60vh] overflow-y-auto">
              <div className="text-center mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                <div className="font-bold text-lg mb-1">ENTERPRISE POS</div>
                <div className="text-xs text-gray-500">Receipt: {selectedReceipt.receiptNumber}</div>
                <div className="text-xs text-gray-500">
                  {new Date(selectedReceipt.createdAt).toLocaleString()}
                </div>
              </div>

              {selectedReceipt.notes && (
                <div className="mb-4 bg-red-50 text-red-700 p-3 rounded text-xs font-sans">
                  <strong>Status Notes:</strong> {selectedReceipt.notes}
                </div>
              )}

              <div className="space-y-3 mb-6 border-b-2 border-dashed border-gray-300 pb-4">
                {selectedReceipt.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between">
                    <div>
                      <div className={`font-bold ${selectedReceipt.status === 'REFUNDED' ? 'text-gray-400 line-through' : 'text-gray-800'}`}>{item.name}</div>
                      <div className="text-xs text-gray-500">{item.quantity} x ₱{(item.subtotal/item.quantity).toLocaleString()}</div>
                    </div>
                    <div className="font-bold text-gray-800">
                      ₱{item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-1 text-gray-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>₱{selectedReceipt.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (12%):</span>
                  <span>₱{selectedReceipt.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                {selectedReceipt.discount > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Discount:</span>
                    <span>-₱{selectedReceipt.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg text-gray-900 mt-2 pt-2 border-t border-gray-300">
                  <span>Total:</span>
                  <span>₱{selectedReceipt.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span>Method:</span>
                  <span>{selectedReceipt.paymentMethod}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
              {selectedReceipt.status !== 'REFUNDED' && (
                <button 
                  onClick={() => openRefundModal(selectedReceipt)}
                  className="flex-1 bg-red-50 text-red-600 font-bold py-2.5 rounded-xl hover:bg-red-100 transition-colors"
                >
                  Issue Refund
                </button>
              )}
              <button 
                onClick={() => setSelectedReceipt(null)}
                className="flex-1 bg-gray-900 text-white font-bold py-2.5 rounded-xl hover:bg-black transition-colors"
              >
                Close Viewer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Process Return Modal --- */}
      {refundSale && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-red-50 text-red-700">
              <h3 className="font-bold flex items-center gap-2"><RotateCcw size={18}/> Process Return</h3>
              <button onClick={() => setRefundSale(null)} className="hover:text-red-900 p-1"><X size={20}/></button>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <p className="text-sm font-bold text-gray-500">RECEIPT NUMBER</p>
                <p className="font-mono font-medium">{refundSale.receiptNumber}</p>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 mb-3">SELECT ITEMS TO RETURN</p>
                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {refundSale.items.map(item => (
                    <div key={item.productId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <div className="flex-1">
                        <p className="font-bold text-sm text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-500">Bought: {item.quantity} x ₱{(item.subtotal/item.quantity).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-gray-400">Return Qty:</span>
                        <input 
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={refundItems[item.productId] || 0}
                          onChange={(e) => handleRefundQuantityChange(item.productId, parseInt(e.target.value) || 0, item.quantity)}
                          className="w-16 p-1 border border-gray-300 rounded text-center font-bold"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-bold text-gray-500 mb-1">REASON FOR RETURN (Required)</p>
                <textarea 
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  placeholder="e.g., Customer changed mind, Defective product..."
                  className="w-full p-3 border border-gray-200 rounded-lg text-sm outline-none focus:border-red-500"
                  rows={2}
                />
              </div>

              <div className="bg-orange-50 text-orange-800 p-3 rounded-lg flex gap-3 text-sm">
                <AlertTriangle size={18} className="shrink-0" />
                <p>Confirming this refund will automatically return the selected items back into your active warehouse inventory.</p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
              <button onClick={() => setRefundSale(null)} className="px-5 py-2 text-gray-600 font-bold hover:bg-gray-200 rounded-lg">Cancel</button>
              <button 
                onClick={submitRefund} 
                disabled={isRefunding}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors flex items-center gap-2"
              >
                {isRefunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};