import React, { useState, useMemo, useEffect } from 'react';
import { useProducts } from './hooks/useProducts';
import { useBarcodeScanner } from './hooks/useBarcodeScanner';
import { useCartStore } from './store/useCartStore';
import { CheckoutModal } from './components/CheckoutModal';
import { useCurrentShift } from './hooks/useShift';
import { ShiftGuard } from './components/ShiftGuard';
import { CloseShiftModal } from './components/CloseShiftModal';
import { Login } from './components/Login';
import { logout } from './hooks/useAuth';
import { useSyncOfflineSales } from './hooks/useSync';
import { getPendingSales } from './services/db';
import { useSalesHistory } from './hooks/useSalesHistory';
import { SalesHistoryModal } from './components/SalesHistoryModal';
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, Search, 
  Wifi, WifiOff, RefreshCw, LogOut, UserMinus, CloudOff,
  History 
} from 'lucide-react';

function App() {
  // --- 1. AUTHENTICATION ---
  const isAuthenticated = !!localStorage.getItem('erp_token');
  if (!isAuthenticated) {
    return <Login />;
  }

  // --- 2. GLOBAL STATE & HOOKS ---
  const { data: products, isLoading } = useProducts();
  const { items, total, addItem, updateQuantity, removeItem, clearCart } = useCartStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { data: currentShift, isLoading: isShiftLoading } = useCurrentShift();
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  
  useBarcodeScanner(products);

  // --- 3. SYNC ENGINE LOGIC (Action 27) ---
  const [offlineCount, setOfflineCount] = useState(0);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { mutate: syncSales, isPending: isSyncingSales } = useSyncOfflineSales();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);


  useEffect(() => {
    const checkPending = async () => {
      const sales = await getPendingSales();
      setOfflineCount(sales.length);
    };
    checkPending();

    const handleOnline = () => {
      setIsOnline(true);
      checkPending(); // Re-check local storage when internet returns
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleSync = () => {
    syncSales(undefined, {
      onSuccess: () => setOfflineCount(0)
    });
  };

  // --- 4. CATALOG FILTERING ---
  const filteredProducts = useMemo(() => {
    if (!products) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return products;
    
    return products.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query) || 
      p.barcode?.toLowerCase().includes(query)
    );
  }, [products, searchQuery]);

  // --- 5. RENDER UI ---
  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden text-gray-900">
      
      {/* LEFT PANE: Product Grid & Controls */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
        {/* Responsive Header */}
        <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 shrink-0 z-10 gap-4">
          <div className="flex items-center gap-2 font-bold text-xl text-gray-800 tracking-tight shrink-0">
            Enterprise POS
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentShift && (
              <button 
                onClick={() => setIsCloseShiftOpen(true)}
                className="flex items-center gap-2 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 hover:border-red-200"
              >
                <LogOut size={14} /> Close Register
              </button>
            )}

            <button 
              onClick={logout}
              className="flex items-center gap-2 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-gray-200 px-3 py-1.5 rounded-lg transition-colors border border-gray-200"
            >
              <UserMinus size={14} /> Logout
            </button>

            <button 
           onClick={() => setIsHistoryOpen(true)}
           className="flex items-center gap-2 text-xs font-semibold bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600 px-3 py-1.5 rounded-lg transition-colors border border-gray-200 hover:border-blue-200"
         >
           <History size={14} /> History
         </button>
          </div>
          
          {/* Real-time Search Input Box */}
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search product name, SKU, or barcode..."
              className="w-full bg-gray-50 border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm outline-none focus:bg-white focus:border-blue-500 transition-all shadow-inner"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Network & Sync Status Area */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* THE NEW YELLOW SYNC BUTTON */}
            {offlineCount > 0 && (
              <button 
                onClick={handleSync}
                disabled={isSyncingSales}
                className="flex items-center gap-2 text-xs font-bold bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-md hover:bg-yellow-200 transition-colors border border-yellow-200 shadow-sm"
              >
                {isSyncingSales ? <RefreshCw className="animate-spin" size={14} /> : <CloudOff size={14} />}
                Sync {offlineCount} Pending
              </button>
            )}

            {/* Dynamic Network Badge */}
            <div className={`flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border transition-colors ${
              !isOnline 
                ? 'bg-red-50 text-red-600 border-red-100'
                : 'bg-green-50 text-green-600 border-green-100'
            }`}>
              {!isOnline ? (
                <><WifiOff size={14} /> Offline Mode</>
              ) : (
                <><Wifi size={14} /> Connected</>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Catalog Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <button
                  key={product._id}
                  onClick={() => addItem(product)}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 active:bg-blue-50 transition-all text-left h-32 flex flex-col justify-between group"
                >
                  <div>
                    <span className="font-medium text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">{product.name}</span>
                    <span className="text-[10px] text-gray-400 font-mono block mt-1">{product.sku}</span>
                  </div>
                  <span className="text-blue-600 font-bold">₱{product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </button>
              ))}

              {filteredProducts.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500">
                  No matching items found in the catalog.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* RIGHT PANE: Cart Panel */}
      <div className="w-[400px] bg-white shadow-xl h-full flex flex-col shrink-0 z-20 border-l border-gray-200">
        
        {/* Cart Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <ShoppingBag size={20} /> Current Order
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-red-500 hover:text-red-700 p-2 transition-colors">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-50 text-gray-300" />
              <p className="text-sm font-medium">Scan barcodes or select items</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100 animate-fadeIn">
                <div className="flex-1 truncate pr-2">
                  <div className="font-medium truncate text-sm">{item.name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">₱{item.unitPrice.toLocaleString()} each</div>
                </div>
                
                <div className="flex items-center gap-2 bg-white rounded-md border border-gray-200 p-1">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                    <Minus size={14} />
                  </button>
                  <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded text-gray-500 transition-colors">
                    <Plus size={14} />
                  </button>
                  <button onClick={() => removeItem(item.productId)} className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded ml-1 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Footer */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-4 text-xl font-bold">
            <span className="text-gray-700 font-medium text-base">Total Due</span>
            <span className="text-blue-600 text-2xl">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
          
          <button 
            onClick={() => setIsCheckoutOpen(true)}
            disabled={items.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors shadow-sm cursor-pointer"
          >
            <CreditCard size={22} /> Process Checkout
          </button>
        </div>
      </div>

      {/* MODALS & GUARDS */}
      {!isShiftLoading && !currentShift && (
        <ShiftGuard />
      )}

      {isCloseShiftOpen && (
        <CloseShiftModal onClose={() => setIsCloseShiftOpen(false)} />
      )}

      {isCheckoutOpen && (
        <CheckoutModal onClose={() => setIsCheckoutOpen(false)} />
      )}

      {isHistoryOpen && (
        <SalesHistoryModal onClose={() => setIsHistoryOpen(false)} />
      )}
    </div>
  );
}

export default App;