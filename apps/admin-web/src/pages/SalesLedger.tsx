import React, { useState } from 'react';
import { Search, FileText, X, Printer, TrendingUp, CreditCard, Banknote } from 'lucide-react';
// Corrected relative imports based on your folder structure
import { useSalesLedger } from '../features/sales/api/useSales';
import type { SaleRecord } from '../features/sales/api/useSales';

export const SalesLedger = () => {
  const { data: sales = [], isLoading, isError } = useSalesLedger();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<SaleRecord | null>(null);

  if (isLoading) return <div className="p-8 text-gray-500 font-medium animate-pulse">Loading ledger data...</div>;
  if (isError) return <div className="p-8 text-red-500 font-medium">Failed to load sales history.</div>;

  // Filter sales by receipt number or cashier name
  const filteredSales = sales.filter(sale => {
    const query = searchQuery.toLowerCase();
    const cashierName = sale.cashierId?.name?.toLowerCase() || '';
    return sale.receiptNumber.toLowerCase().includes(query) || cashierName.includes(query);
  });

  // Calculate total revenue for the displayed data
  const totalRevenue = filteredSales.reduce((sum, sale) => sum + (sale.total || 0), 0);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales Ledger</h1>
          <p className="text-sm text-gray-500 mt-1">Real-time view of all POS transactions across your network.</p>
        </div>
        
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <TrendingUp size={24} />
          </div>
          <div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">Filtered Revenue</div>
            <div className="text-2xl font-black text-gray-900">₱{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-t-xl border-b border-gray-100 shadow-sm flex gap-4 items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by Receipt Number or Cashier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white shadow-sm rounded-b-xl border border-gray-100 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Receipt No.</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Cashier</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Method</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
              <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredSales.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-gray-500">No transactions found.</td></tr>
            ) : (
              filteredSales.map((sale) => (
                <tr key={sale._id} className="hover:bg-gray-50 transition-colors group">
                  <td className="p-4 text-sm text-gray-600">
                    {new Date(sale.createdAt).toLocaleString()}
                  </td>
                  <td className="p-4 text-sm font-mono font-medium text-gray-900">
                    {sale.receiptNumber}
                  </td>
                  <td className="p-4 text-sm text-gray-700 capitalize">
                    {sale.cashierId?.name || 'Unknown'}
                  </td>
                  <td className="p-4 text-sm">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${
                      sale.paymentMethod === 'CASH' ? 'bg-green-100 text-green-700' : 
                      sale.paymentMethod === 'CARD' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                    }`}>
                      {sale.paymentMethod === 'CASH' ? <Banknote size={12} /> : <CreditCard size={12} />}
                      {sale.paymentMethod}
                    </span>
                  </td>
                  <td className="p-4 text-right font-bold text-gray-900">
                    ₱{sale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => setSelectedSale(sale)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-colors"
                    >
                      <FileText size={14} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Receipt Viewer Modal */}
      {selectedSale && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50 shrink-0">
              <h3 className="font-bold text-gray-800">Transaction Details</h3>
              <button onClick={() => setSelectedSale(null)} className="text-gray-400 hover:text-gray-600 p-1 bg-gray-200/50 rounded-full"><X size={20}/></button>
            </div>
            
            <div className="p-8 overflow-y-auto flex-1 font-mono text-sm bg-white">
              <div className="text-center mb-6 border-b border-dashed border-gray-300 pb-6">
                <h2 className="text-xl font-black uppercase tracking-widest mb-1">Receipt</h2>
                <p className="text-gray-500">#{selectedSale.receiptNumber}</p>
                <p className="text-gray-500 mt-2">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                <p className="text-gray-500">Cashier: {selectedSale.cashierId?.name || 'Unknown'}</p>
              </div>

              <div className="space-y-4 mb-6 border-b border-dashed border-gray-300 pb-6">
                {selectedSale.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-start">
                    <div className="flex-1 pr-4">
                      <p className="font-bold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x ₱{item.unitPrice.toLocaleString()}</p>
                    </div>
                    <span className="font-bold">₱{item.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between"><span>Subtotal</span><span>₱{selectedSale.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span>Discount</span><span className="text-red-500">-₱{selectedSale.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
                <div className="flex justify-between"><span>VAT (12%)</span><span>₱{selectedSale.tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span></div>
              </div>

              <div className="flex justify-between items-center mt-4 pt-4 border-t border-dashed border-gray-300 text-lg font-black text-gray-900">
                <span>TOTAL</span>
                <span>₱{selectedSale.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>

              <div className="mt-6 bg-gray-50 p-4 rounded-lg space-y-1 text-xs font-bold text-gray-500">
                <div className="flex justify-between"><span>PAYMENT METHOD</span><span className="text-gray-900">{selectedSale.paymentMethod}</span></div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 shrink-0">
               <button 
                 onClick={() => window.print()}
                 className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors"
               >
                 <Printer size={18} /> Print Copy
               </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};