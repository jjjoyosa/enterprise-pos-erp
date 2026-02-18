import React, { useState, useMemo, useEffect } from 'react';
import { useInventory } from './hooks/useInventory';
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
import { SalesHistoryModal } from './components/SalesHistoryModal';
import { 
  ShoppingBag, Trash2, Plus, Minus, CreditCard, Search, 
  Wifi, WifiOff, RefreshCw, LogOut, UserMinus, CloudOff,
  History 
} from 'lucide-react';

function App() {
  const isAuthenticated = !!localStorage.getItem('erp_token');
  if (!isAuthenticated) {
    return <Login />;
  }

  // Use local POS inventory hook
  const { data: inventory = [], isLoading } = useInventory();

  const { 
    items, total, subtotal, tax, discount, 
    addItem, updateQuantity, removeItem, clearCart, setDiscount 
  } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  const { data: currentShift, isLoading: isShiftLoading } = useCurrentShift();
  const [isCloseShiftOpen, setIsCloseShiftOpen] = useState(false);
  
  // Point scanner to the inventory array
  useBarcodeScanner(inventory);

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
      checkPending(); 
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

  // Safely filter nested inventory data
  const filteredInventory = useMemo(() => {
    if (!inventory) return [];
    const query = searchQuery.toLowerCase().trim();
    if (!query) return inventory;
    
    return inventory.filter(item => {
      const product = item.productId;
      if (!product) return false;
      return (
        product.name.toLowerCase().includes(query) || 
        product.sku.toLowerCase().includes(query) || 
        product.barcode?.toLowerCase().includes(query)
      );
    });
  }, [inventory, searchQuery]);

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden text-gray-900">
      
      {/* LEFT PANE: Product Grid & Controls */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        
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

          <div className="flex items-center gap-3 shrink-0">
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

        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredInventory.map((item) => {
                const product = item.productId;
                if (!product) return null; // Safety check

                const currentStock = item.quantity ?? 0;
                const isOutOfStock = currentStock <= 0;

                return (
                  <button
                    key={item._id}
                    onClick={() => addItem({
                      _id: product._id,
                      name: product.name,
                      basePrice: product.basePrice,
                      stock: currentStock
                    })}
                    disabled={isOutOfStock}
                    className={`p-4 rounded-xl shadow-sm border text-left h-32 flex flex-col justify-between transition-all group ${
                      isOutOfStock 
                        ? 'bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed' 
                        : 'bg-white border-gray-100 hover:shadow-md hover:border-blue-300 active:bg-blue-50'
                    }`}
                  >
                    <div className="w-full">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-gray-800 line-clamp-1 group-hover:text-blue-600 transition-colors w-[70%]">
                          {product.name}
                        </span>
                        
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap ${
                          currentStock > 10 ? 'bg-green-100 text-green-700' : 
                          currentStock > 0 ? 'bg-orange-100 text-orange-700' : 
                          'bg-red-100 text-red-700'
                        }`}>
                          {currentStock} left
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-mono block mt-1">{product.sku}</span>
                    </div>
                    <span className="text-blue-600 font-bold">₱{product.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </button>
                );
              })}

              {filteredInventory.length === 0 && (
                <div className="col-span-full py-20 text-center text-gray-500">
                  No matching items found in the current inventory.
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* RIGHT PANE: Cart Panel */}
      <div className="w-[400px] bg-white shadow-xl h-full flex flex-col shrink-0 z-20 border-l border-gray-200">
        
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

        <div className="bg-gray-50 p-6 border-t border-gray-200 shrink-0">
          
          <div className="space-y-3 mb-6 border-b border-gray-200 pb-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-gray-800">₱{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            
            <div className="flex justify-between items-center text-sm group">
              <span className="text-gray-500">Discount (₱)</span>
              <input 
                type="number"
                min="0"
                max={subtotal}
                value={discount === 0 ? '' : discount}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="w-24 text-right border-b border-dashed border-gray-300 outline-none focus:border-blue-500 text-red-500 font-bold bg-transparent transition-colors"
              />
            </div>

            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-500">VAT (12% inc.)</span>
              <span className="text-gray-500">₱{tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex justify-between items-end mb-4">
            <span className="text-gray-700 font-medium text-base">Total Due</span>
            <span className="text-blue-600 text-3xl font-bold leading-none">₱{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
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