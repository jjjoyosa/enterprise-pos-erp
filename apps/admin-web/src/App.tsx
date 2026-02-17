import React, { useState } from 'react';
import { Activity, TrendingUp, Database, Package, Plus, Lock, Boxes } from 'lucide-react'; 
import { Dashboard } from './pages/Dashboard'; 
import { ProductTable } from './features/inventory/components/ProductTable';
import { ProductForm } from './features/inventory/components/ProductForm';
import { InventoryList } from './features/inventory/components/InventoryList';
import type { Product } from './features/inventory/api/useProducts';

function App() {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const isAuthenticated = !!localStorage.getItem('erp_token');

  // Authentication Check
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-gray-900 animate-fadeIn p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center max-w-md text-center">
          <div className="bg-red-100 p-4 rounded-full text-red-600 mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-2xl font-bold mb-2">Admin Access Restricted</h1>
          <p className="text-gray-500 mb-6 text-sm">You must be authenticated through the POS terminal to access the executive dashboard.</p>
        </div>
      </div>
    );
  }

  // State Management
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans animate-fadeIn">
      
      {/* Top Navigation */}
      <header className="bg-white border-b border-gray-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Activity className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Enterprise ERP</h1>
          </div>
          
          <nav className="flex gap-2 bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setCurrentView('dashboard')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'dashboard' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <TrendingUp size={16} /> Analytics
            </button>
            
            <button 
              onClick={() => setCurrentView('inventory')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'inventory' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Database size={16} /> Catalog
            </button>

            <button 
              onClick={() => setCurrentView('stock')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'stock' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Boxes size={16} /> Stock Control
            </button>
          </nav>
        </div>

        <div className="text-sm font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
          Admin Profile
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        
        {/* VIEW 1: Dashboard */}
        {currentView === 'dashboard' && <Dashboard />}

        {/* VIEW 2: Product Catalog (Master Data) */}
        {currentView === 'inventory' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Package className="text-blue-600" /> Product Catalog
                </h2>
                <p className="text-gray-500 text-sm mt-1">Manage your catalog, pricing, and master data.</p>
              </div>
              
              <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm transition-colors"
              >
                <Plus size={18} /> Add New Product
              </button>
            </div>

            <ProductTable onOpenForm={(product: Product) => {
              setProductToEdit(product);
              setIsModalOpen(true);
            }} />
            
            <ProductForm 
              isOpen={isModalOpen} 
              onClose={() => {
                setProductToEdit(null); 
                setIsModalOpen(false);
              }} 
              productToEdit={productToEdit} 
            />
          </div>
        )}

        {/* VIEW 3: Stock Control (Warehouse Levels) */}
        {currentView === 'stock' && (
          <div className="animate-fadeIn">
            <InventoryList />
          </div>
        )}
        
      </main>
    </div>
  );
}

export default App;