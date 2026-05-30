import React, { useState, useMemo } from 'react';
import { useInventoryLevels } from '../api/useInventory';
import type { InventoryLevel } from '../api/useInventory';
import { AdjustStockModal } from './AdjustStockModal';
import { SupplierReturnModal } from './SupplierReturnModal'; 
import { Search, AlertTriangle, ArrowLeftRight } from 'lucide-react';

export const InventoryList = () => {
  const { data: inventory = [], isLoading, isError } = useInventoryLevels();
  
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryLevel | null>(null);
  
  
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedForReturn, setSelectedForReturn] = useState<InventoryLevel | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');

  const processedInventory = useMemo(() => {
    if (!inventory) return [];
    const aggregatedMap = new Map();

    inventory.forEach((item) => {
      const product = item.productId;
      if (!product) return;

      if (aggregatedMap.has(product._id)) {
        const existingItem = aggregatedMap.get(product._id);
        existingItem.quantity += (item.quantity || 0);
        if (existingItem.warehouseId && item.warehouseId && existingItem.warehouseId._id !== item.warehouseId._id) {
          existingItem.warehouseId.name = "Multiple Warehouses";
        }
      } else {
        aggregatedMap.set(product._id, { 
          ...item, 
          quantity: item.quantity || 0,
          warehouseId: item.warehouseId ? { ...item.warehouseId } : undefined
        });
      }
    });

    const aggregatedList = Array.from(aggregatedMap.values());
    const query = searchQuery.toLowerCase().trim();
    if (!query) return aggregatedList;

    return aggregatedList.filter((item) => 
      item.productId?.name.toLowerCase().includes(query) || 
      item.productId?.sku.toLowerCase().includes(query)
    );
  }, [inventory, searchQuery]);

  const handleAdjustClick = (item: InventoryLevel) => {
    setSelectedInventory(item);
    setIsModalOpen(true);
  };

  const handleReturnClick = (item: InventoryLevel) => {
    setSelectedForReturn(item);
    setIsReturnModalOpen(true);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Inventory Management</h3>
          <p className="text-sm text-gray-500 mt-1">Current stock levels and warehouse distribution.</p>
        </div>
        
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search SKU or Product Name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm text-sm bg-white"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400 font-bold">
              <th className="p-4 pl-6">Product Details</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Warehouse</th>
              <th className="p-4 text-center">Current Stock</th>
              <th className="p-4 pr-6 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr><td colSpan={5} className="p-12 text-center text-gray-400">Loading inventory...</td></tr>
            ) : isError ? (
              <tr><td colSpan={5} className="p-12 text-center text-red-500">Failed to load inventory.</td></tr>
            ) : processedInventory.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-gray-400">No matching records found.</td></tr>
            ) : (
              processedInventory.map((item) => {
                const isArchived = (item.productId as any)?.isActive === false;
                const hasNoStock = item.quantity <= 0;
                
                return (
                  <tr key={item.productId?._id || item._id} className={`transition-colors text-sm ${isArchived ? 'bg-gray-50 opacity-60' : 'hover:bg-blue-50/50'}`}>
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className={`font-bold ${isArchived ? 'text-gray-500' : 'text-gray-900'}`}>
                            {item.productId?.name || 'Unknown Product'}
                          </div>
                          {isArchived && <span className="text-[10px] font-bold text-gray-400 uppercase">Archived</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600 font-mono font-medium">{item.productId?.sku}</td>
                    <td className="p-4 text-gray-600">
                      {item.warehouseId?.name === 'Multiple Warehouses' ? (
                        <span className="flex items-center gap-1 text-orange-600 font-bold text-xs bg-orange-50 px-2 py-1 rounded">
                          <AlertTriangle size={12} /> Multi-loc
                        </span>
                      ) : item.warehouseId?.name || 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-md text-xs font-bold border ${item.quantity <= 15 ? "text-red-700 bg-red-50 border-red-100" : "text-green-700 bg-green-50 border-green-100"}`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-center gap-2">
                        {/* RMA BUTTON */}
                        <button 
                          onClick={() => handleReturnClick(item)}
                          disabled={isArchived || hasNoStock}
                          title="Return to Supplier (RMA)"
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 border border-red-100 rounded-lg text-xs font-bold hover:bg-red-100 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ArrowLeftRight size={14} /> RMA
                        </button>

                        {/* ADJUST BUTTON */}
                        <button 
                          onClick={() => handleAdjustClick(item)}
                          disabled={isArchived}
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Adjust
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ADJUST STOCK MODAL */}
      {isModalOpen && selectedInventory && (
        <AdjustStockModal 
          inventoryItem={selectedInventory} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInventory(null);
          }} 
        />
      )}

      {/* SUPPLIER RETURN MODAL */}
      <SupplierReturnModal 
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedForReturn(null);
        }}
        inventoryItem={selectedForReturn}
      />

    </div>
  );
};