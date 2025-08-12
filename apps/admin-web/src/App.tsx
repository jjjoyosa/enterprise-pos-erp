import React, { useState } from 'react';
import { ProductTable } from './features/inventory/components/ProductTable';
import { ProductForm } from './features/inventory/components/ProductForm';
import { LayoutGrid, Plus } from 'lucide-react';

function App() {
  const [isFormOpen, setIsFormOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-brand-900 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <LayoutGrid className="text-white" size={24} />
              <span className="text-xl font-bold text-white tracking-tight">Enterprise ERP</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center mb-8">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-semibold leading-6 text-gray-900">Product Catalog</h1>
            <p className="mt-2 text-sm text-gray-700">
              A complete list of all items available for sale, including SKUs and pricing.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 rounded-md bg-brand-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-brand-500 transition-colors"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>
        
        <ProductTable />
      </main>

      {/* Product Form Modal */}
      {isFormOpen && (
        <ProductForm onClose={() => setIsFormOpen(false)} />
      )}
    </div>
  );
}

export default App;