import React, { useState } from 'react';
import { useProducts } from '../api/useProducts'; 
import { Edit, Trash2, Search, AlertCircle, CheckCircle2, XCircle } from 'lucide-react';

interface ProductTableProps {
  onOpenForm: () => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ onOpenForm }) => {
  const { data: products, isLoading } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');

  // Safely filter based ONLY on the properties available in your new Product interface
  const filteredProducts = products?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.sku.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm text-sm"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white border-b border-gray-100 text-xs uppercase text-gray-400 font-bold tracking-wider">
              <th className="p-4 pl-6">Product Details</th>
              <th className="p-4">SKU</th>
              <th className="p-4 text-right">Pricing (Base / Cost)</th>
              <th className="p-4 text-center">Inventory Tracking</th>
              <th className="p-4 pr-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {isLoading ? (
              <tr>
                <td colSpan={5} className="text-center p-12 text-gray-400">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  Loading catalog...
                </td>
              </tr>
            ) : filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-12 text-gray-400">
                  <AlertCircle size={32} className="mx-auto mb-3 opacity-30" />
                  <p>No products found matching "{searchQuery}"</p>
                </td>
              </tr>
            ) : (
              filteredProducts.map((product) => (
                <tr key={product._id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-gray-900">{product.name}</div>
                    {/* Safely rendering the nested category object */}
                    <div className="text-xs text-gray-500 mt-0.5">
                      {product.categoryId?.name || 'Uncategorized'}
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm text-gray-800 font-medium">
                    {product.sku}
                  </td>
                  <td className="p-4 text-right">
                    <div className="font-bold text-blue-600">
                      ₱{product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      Cost: ₱{product.costPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    {/* Visual badge for the boolean trackInventory field */}
                    {product.trackInventory ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200">
                        <CheckCircle2 size={12} /> Tracked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-500 border border-gray-200">
                        <XCircle size={12} /> Unmonitored
                      </span>
                    )}
                  </td>
                  <td className="p-4 pr-6">
                    <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-white hover:shadow-sm rounded-lg transition-all border border-transparent hover:border-gray-200">
                        <Trash2 size={16} />
                      </button>
                    </div>
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