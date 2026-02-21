import React, { useState } from 'react';
import { useStockMovementHistory } from '../api/useInventory';
import { Search, ArrowDownRight, ArrowUpRight, RefreshCw, ShoppingCart } from 'lucide-react';

export const StockMovementLedger = () => {
  const { data: movements = [], isLoading } = useStockMovementHistory();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMovements = movements.filter(m => 
    m.productId?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.productId?.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.reference?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMovementIcon = (type: string) => {
    switch(type) {
      case 'IN': return <ArrowDownRight className="text-green-500" size={18} />;
      case 'OUT': return <ArrowUpRight className="text-orange-500" size={18} />;
      case 'SALE': return <ShoppingCart className="text-blue-500" size={18} />;
      case 'ADJUST': return <RefreshCw className="text-purple-500" size={18} />;
      default: return <RefreshCw className="text-gray-500" size={18} />;
    }
  };

  const getMovementBadge = (type: string, qty: number) => {
    const isPositive = qty > 0;
    const color = isPositive ? 'text-green-700 bg-green-50 border-green-200' : 'text-orange-700 bg-orange-50 border-orange-200';
    return (
      <span className={`px-2 py-1 rounded-md text-xs font-bold border ${color}`}>
        {isPositive ? '+' : ''}{qty}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Audit Trail</h3>
          <p className="text-sm text-gray-500 mt-1">Chronological history of all inventory changes.</p>
        </div>
        
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search SKU, Product, or Ref..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm text-sm bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
              <th className="p-4 pl-6">Date & Time</th>
              <th className="p-4">Type</th>
              <th className="p-4">Product Details</th>
              <th className="p-4 text-center">Change</th>
              <th className="p-4 pr-6 text-right">Reference / Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="p-12 text-center text-gray-400">Loading ledger...</td></tr>
            ) : filteredMovements.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-gray-400">No movements found.</td></tr>
            ) : (
              filteredMovements.map((record) => (
                <tr key={record._id} className="hover:bg-blue-50/50 transition-colors text-sm">
                  <td className="p-4 pl-6 text-gray-600 whitespace-nowrap">
                    {new Date(record.createdAt).toLocaleString(undefined, { 
                      month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                    })}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      {getMovementIcon(record.type)}
                      <span className="font-bold text-gray-700">{record.type}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-gray-900">{record.productId?.name || 'Unknown'}</div>
                    <div className="text-xs text-gray-500 font-mono mt-0.5">{record.productId?.sku}</div>
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex flex-col items-center">
                      {getMovementBadge(record.type, record.quantity)}
                      <span className="text-[10px] text-gray-400 mt-1 font-medium">
                        {record.previousStock} → {record.newStock}
                      </span>
                    </div>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="font-mono text-xs text-gray-600 font-medium">{record.reference || '-'}</div>
                    {record.notes && <div className="text-xs text-gray-400 mt-1 italic max-w-[200px] truncate ml-auto">{record.notes}</div>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};