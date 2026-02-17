import React, { useState } from 'react';
import { useInventoryLevels } from '../api/useInventory';
import type { InventoryLevel } from '../api/useInventory';
import { AdjustStockModal } from './AdjustStockModal';

export const InventoryList = () => {
  const { data: inventory = [], isLoading, isError } = useInventoryLevels();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<InventoryLevel | null>(null);

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
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              inventory.map((item) => (
                <tr key={item._id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{item.productId?.name || 'Unknown Product'}</td>
                  <td className="p-4 text-sm text-gray-500">{item.productId?.sku}</td>
                  <td className="p-4 text-sm text-gray-500">{item.warehouseId?.name}</td>
                  <td className="p-4 text-right font-bold text-lg">
                    <span className={item.quantity <= 10 ? "text-red-600" : "text-green-600"}>
                      {item.quantity}
                    </span>
                  </td>
                  <td className="p-4 text-center">
                    <button 
                      onClick={() => handleAdjustClick(item)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))
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