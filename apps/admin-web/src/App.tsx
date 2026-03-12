import { useState } from 'react';
import { LogOut, Activity, TrendingUp, Database, Package, Plus, Boxes, Users, ReceiptText, Truck, ClipboardList } from 'lucide-react'; 
import { Dashboard } from './pages/Dashboard'; 
import { ProductTable } from './features/inventory/components/ProductTable';
import { ProductForm } from './features/inventory/components/ProductForm';
import { InventoryList } from './features/inventory/components/InventoryList';
import type { Product } from './features/inventory/api/useProducts';
import { StockMovementLedger } from './features/inventory/components/StockMovementLedger';
import { StaffManagement } from './features/staff/components/StaffManagement';
import { Login } from './pages/Login';
import { useAuth } from './hooks/useAuth';
import { SalesLedger } from './features/sales/components/SalesLedger';

import { SupplierManagement } from './pages/SupplierManagement'; 

import { PurchaseOrderManagement } from './pages/PurchaseOrderManagement'; 

function App() {
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const isAuthenticated = !!localStorage.getItem('erp_token');

  if (!isAuthenticated) {
    return <Login />;
  }

  const [currentView, setCurrentView] = useState('dashboard'); 
  const [stockTab, setStockTab] = useState<'levels' | 'ledger'>('levels');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { logout } = useAuth();

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

            <button 
              onClick={() => setCurrentView('staff')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'staff' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Users size={16} /> Staff
            </button>

            <button 
              onClick={() => setCurrentView('sales')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'sales' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ReceiptText size={16} /> Ledger
            </button>

            <button 
              onClick={() => setCurrentView('suppliers')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'suppliers' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Truck size={16} /> Suppliers
            </button>

            {/* ADDED: Purchasing Navigation Button */}
            <button 
              onClick={() => setCurrentView('purchasing')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-bold transition-all ${currentView === 'purchasing' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <ClipboardList size={16} /> Purchasing
            </button>
          </nav>
          
          <div className="text-sm font-bold text-blue-800 bg-blue-100 px-4 py-2 rounded-full border border-blue-200">
            Admin
          </div>
        </div>
        
        <div className="flex w-full">
          <button 
            onClick={logout} 
            className="ml-auto flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={10} />
            <span className="font-bold">Logout</span>
          </button>
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

        {/* VIEW 3: Stock Control (Warehouse Levels & Ledger) */}
        {currentView === 'stock' && (
          <div className="animate-fadeIn space-y-6">
            <div className="flex justify-between items-end mb-2">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                <p className="text-gray-500 text-sm mt-1">Monitor real-time stock levels and track historical movements.</p>
              </div>
            </div>

            {/* Sub-Navigation Tabs */}
            <div className="flex border-b border-gray-200">
              <button 
                onClick={() => setStockTab('levels')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                  stockTab === 'levels' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Current Stock Levels
              </button>
              <button 
                onClick={() => setStockTab('ledger')}
                className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors ${
                  stockTab === 'ledger' 
                    ? 'border-blue-600 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}
              >
                Movement Ledger
              </button>
            </div>

            {/* Tab Content */}
            <div className="pt-2">
              {stockTab === 'levels' ? <InventoryList /> : <StockMovementLedger />}
            </div>
          </div>
        )}

        {/* VIEW 4: Staff & Employee Management */}
        {currentView === 'staff' && <StaffManagement />}

        {/* VIEW 5: Sales & Transactions Ledger */}
        {currentView === 'sales' && <SalesLedger />}

        {/* VIEW 6: Supplier Management */}
        {currentView === 'suppliers' && <SupplierManagement />}

        {/* ADDED: VIEW 7: Purchase Order Management */}
        {currentView === 'purchasing' && <PurchaseOrderManagement />}
        
      </main>
    </div>
  );
}

export default App;