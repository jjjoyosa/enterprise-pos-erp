import React from 'react';
import { useProducts } from './hooks/useProducts';
import { useCartStore } from './store/useCartStore';
import { ShoppingBag, Trash2, Plus, Minus, CreditCard } from 'lucide-react';

function App() {
  const { data: products, isLoading } = useProducts();
  const { items, total, addItem, updateQuantity, removeItem, clearCart } = useCartStore();

  return (
    <div className="h-screen w-screen flex bg-gray-100 overflow-hidden text-gray-900">
      
      {/* LEFT PANE: Product Grid */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6 shrink-0 z-10">
          <h1 className="text-xl font-bold text-gray-800">Enterprise POS</h1>
        </header>

        {/* Product Grid Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products?.map((product) => (
                <button
                  key={product._id}
                  onClick={() => addItem(product)}
                  className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md border border-gray-100 active:bg-blue-50 transition-all text-left h-32 flex flex-col justify-between"
                >
                  <span className="font-medium text-gray-800 line-clamp-2">{product.name}</span>
                  <span className="text-blue-600 font-bold">₱{product.basePrice.toLocaleString()}</span>
                </button>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* RIGHT PANE: Cart & Checkout */}
      <div className="w-[400px] bg-white shadow-xl h-full flex flex-col shrink-0 z-20 border-l border-gray-200">
        
        {/* Cart Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2 font-semibold text-lg">
            <ShoppingBag size={20} /> Current Order
          </div>
          {items.length > 0 && (
            <button onClick={clearCart} className="text-red-500 hover:text-red-700 p-2">
              <Trash2 size={20} />
            </button>
          )}
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <ShoppingBag size={48} className="mb-4 opacity-50" />
              <p>Cart is empty</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex-1 truncate pr-2">
                  <div className="font-medium truncate">{item.name}</div>
                  <div className="text-sm text-gray-500">₱{item.unitPrice.toLocaleString()}</div>
                </div>
                
                <div className="flex items-center gap-3 bg-white rounded-md border border-gray-200 p-1">
                  <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-1 hover:bg-gray-100 rounded">
                    <Minus size={16} />
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-1 hover:bg-gray-100 rounded">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Pay Button */}
        <div className="bg-gray-50 p-6 border-t border-gray-200 shrink-0">
          <div className="flex justify-between items-center mb-4 text-xl font-bold">
            <span>Total</span>
            <span className="text-blue-600">₱{total.toLocaleString()}</span>
          </div>
          
          <button 
            disabled={items.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-lg font-bold py-4 rounded-xl flex justify-center items-center gap-2 transition-colors"
          >
            <CreditCard size={24} /> Pay Now
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;