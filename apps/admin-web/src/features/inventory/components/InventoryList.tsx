import React, { useState, useMemo } from 'react';
import { useInventoryLevels } from '../api/useInventory';
import type { InventoryLevel } from '../api/useInventory';
import { AdjustStockModal } from './AdjustStockModal';

export const InventoryList = () => {
  const { data: inventory = [], isLoading, isError } = useInventoryLevels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryLevel | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Process inventory: Group duplicates and apply search filter
  const processedInventory = useMemo(() => {
    if (!inventory) return [];

    const aggregatedMap = new Map();

    inventory.forEach((item) => {
      const product = item.productId;
      if (!product) return;

      if (aggregatedMap.has(product._id)) {
        // Sum stock for items in multiple warehouses
        const existingItem = aggregatedMap.get(product._id);
        existingItem.quantity += (item.quantity || 0);
        
        if (existingItem.warehouseId && item.warehouseId && existingItem.warehouseId._id !== item.warehouseId._id) {
          existingItem.warehouseId.name = "Multiple Warehouses";
        }
      } else {
        // First time seeing product
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

    return aggregatedList.filter((item) => {
      const product = item.productId;
      return (
        product?.name.toLowerCase().includes(query) || 
        product?.sku.toLowerCase().includes(query)
      );
    });
  }, [inventory, searchQuery]);

  if (isLoading) return <div className="p-4">Loading inventory levels...</div>;
  if (isError) return <div className="p-4 text-red-500">Failed to load inventory.</div>;

  const handleAdjustClick = (item: InventoryLevel) => {
    setSelectedInventory(item);
    setIsModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventory Management</h2>
        
        {/* Search Bar */}
        <div className="relative w-72">
          <input
            type="text"
            placeholder="Search SKU or Product Name..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b">
              <th className="p-4 font-semibold">Product Name</th>
              <th className="p-4 font-semibold">SKU</th>
              <th className="p-4 font-semibold">Warehouse</th>
              <th className="p-4 font-semibold text-right">Current Stock</th>
              <th className="p-4 font-semibold text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {processedInventory.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500 py-12">
                  No matching inventory records found.
                </td>
              </tr>
            ) : (
              processedInventory.map((item) => {
                // Check if the product is soft-deleted
                const isArchived = (item.productId as any)?.isActive === false;

                return (
                  <tr 
                    key={item.productId?._id || item._id} 
                    className={`border-b transition-colors ${isArchived ? 'bg-gray-50 opacity-60' : 'hover:bg-gray-50'}`}
                  >
                    <td className="p-4 font-medium">
                      <div className="flex items-center gap-2">
                        <span className={isArchived ? 'text-gray-500' : 'text-gray-900'}>
                          {item.productId?.name || 'Unknown Product'}
                        </span>
                        {/* ARCHIVED BADGE */}
                        {isArchived && (
                          <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wider">
                            Archived
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-500 font-mono">{item.productId?.sku}</td>
                    <td className="p-4 text-sm text-gray-500">
                      <span className={item.warehouseId?.name === 'Multiple Warehouses' ? 'bg-gray-200 px-2 py-1 rounded text-xs font-bold' : ''}>
                        {item.warehouseId?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="p-4 text-right font-bold text-lg">
                      <span className={item.quantity <= 10 ? "text-red-600 bg-red-50 px-2 py-1 rounded-md" : "text-green-600 bg-green-50 px-2 py-1 rounded-md"}>
                        {item.quantity}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <button 
                        onClick={() => handleAdjustClick(item)}
                        disabled={isArchived}
                        className="px-4 py-1.5 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Adjust Stock
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedInventory && (
        <AdjustStockModal 
          inventoryItem={selectedInventory} 
          onClose={() => {
            setIsModalOpen(false);
            setSelectedInventory(null);
          }} 
        />
      )}
    </div>
  );
};