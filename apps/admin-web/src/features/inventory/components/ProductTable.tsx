import React from 'react';
import { useProducts } from '../api/useProducts';
import { Package, Loader2 } from 'lucide-react';

export const ProductTable = () => {
  const { data: products, isLoading, isError } = useProducts();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-brand-600" size={32} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-md">
        Failed to load product catalog. Ensure the API is running.
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 sm:rounded-xl">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">Product Name</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">SKU</th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Category</th>
            <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">Price</th>
            <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {products?.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-10 text-center text-sm text-gray-500">
                <Package className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                No products found.
              </td>
            </tr>
          ) : (
            products?.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                  {product.name}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 font-mono">
                  {product.sku}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                  {product.categoryId?.name || 'Uncategorized'}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900 text-right font-medium">
                  ₱{product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </td>
                <td className="whitespace-nowrap px-3 py-4 text-sm text-center">
                  <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                    Active
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};